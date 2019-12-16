/* tslint:disable:member-ordering */

import IObject from './IObject';
import IObservableObject from './IObservableObject';
import IProducible from './IProducible';
import IEquatable from './IEquatable';
import DateTime from './DateTime';
import DestroyableMixin from './DestroyableMixin';
import factory from './factory';
import OptionsToPropertyMixin from './OptionsToPropertyMixin';
import ObservableMixin, {IOptions as IObservableMixinOptions} from './ObservableMixin';
import SerializableMixin, {IState as IDefaultSerializableState} from './SerializableMixin';
import CloneableMixin from './CloneableMixin';
import ManyToManyMixin from './ManyToManyMixin';
import ReadWriteMixin, {IOptions as IReadWriteMixinOptions} from './ReadWriteMixin';
import FormattableMixin, {
    ISerializableState as IFormattableSerializableState,
    IOptions as IFormattableOptions
} from './FormattableMixin';
import VersionableMixin, {IOptions as IVersionableMixinOptions} from './VersionableMixin';
import TheDate from './Date';
import Time from './Time';
import {IReceiver} from './relation';
import {IAdapter, IRecord, ITable} from './adapter';
import {Field, IFieldDeclaration, UniversalField} from './format';
import {IEnumerable, EnumeratorCallback, enumerator, RecordSet, format} from '../collection';
import {register, create} from '../di';
import {protect, mixin, deprecateExtend} from '../util';
import {Map} from '../shim';
import {ExtendDate, IExtendDateConstructor} from '../_declarations';

/**
 * Свойство, хранящее кэш полей
 */
const $fieldsCache = protect('fieldsCache');

/**
 * Свойство, хранящее клоны полей
 */
const $fieldsClone = protect('fieldsClone');

/**
 * Свойство, хранящее измененные полй
 */
const $changedFields = protect('changedFields');

/**
 * Возможные состояния записи
 */
type State = 'Added' | 'Deleted' | 'Changed' | 'Unchanged' | 'Detached';
interface IStatesHash {
    [key: string]: State;
}
const STATES: IStatesHash = {
    ADDED: 'Added',
    DELETED: 'Deleted',
    CHANGED: 'Changed',
    UNCHANGED: 'Unchanged',
    DETACHED: 'Detached'
};

/**
 * Префикс названий отношений для полей
 */
const FIELD_RELATION_PREFIX = 'field.';

/**
 * Режим кэширования: только объекты
 */
const CACHE_MODE_OBJECTS = protect('objects');

/**
 * Режим кэширования: все значения
 */
const CACHE_MODE_ALL = protect('all');

type pairsTuple = [string, any, any, boolean];

export interface IOptions extends IObservableMixinOptions,
    IFormattableOptions,
    IVersionableMixinOptions,
    IReadWriteMixinOptions {
    cacheMode?: string | symbol;
    cloneChanged?: boolean;
    owner?: RecordSet;
    state?: State;
}

export interface ISerializableState extends IDefaultSerializableState, IFormattableSerializableState {
    $options: IOptions;
    _format: format.Format;
    _changedFields: string[];
}

/**
 * Возвращает признак примитивного значения (не объекта)
 */
function isPrimitive(value: any): boolean {
    return value && typeof value === 'object' ? false : true;
}

/**
 * Возвращает valueOf от объекта, либо value если это не объект
 */
function getValueOf(value: any): any {
    if (value && typeof value === 'object' && value !== value.valueOf()) {
        return value.valueOf();
    }
    return value;
}

/**
 * Возвращает признак эквивалентности значений с учетом того, что каждоое из них может являться объектов, оборачивающим примитивное значение
 */
function isEqualValues(first: any, second: any): boolean {
    return getValueOf(first) === getValueOf(second);
}

/**
 * Возвращает тип значения
 */
function getValueType(value: any): string | IFieldDeclaration {
    switch (typeof value) {
        case 'boolean':
            return 'boolean';

        case 'number':
            if (value % 1 === 0) {
                return 'integer';
            }
            return 'real';

        case 'object':
            if (value === null) {
                return 'string';
            } else if (value instanceof Record) {
                return 'record';
            } else if (value && value['[Types/_collection/RecordSet]']) {
                return 'recordset';
            } else if (value instanceof Date) {
                if (value instanceof TheDate) {
                     return 'date';
                }
                if (value instanceof Time) {
                     return 'time';
                }
                if (value instanceof DateTime) {
                     return 'datetime';
                }
                if (value.hasOwnProperty('_serializeMode')) {
                    switch ((value as ExtendDate).getSQLSerializationMode()) {
                        case (Date as IExtendDateConstructor).SQL_SERIALIZE_MODE_DATE:
                            return 'date';
                        case (Date as IExtendDateConstructor).SQL_SERIALIZE_MODE_TIME:
                            return 'time';
                    }
                }
                return 'datetime';
            } else if (value instanceof Array) {
                const filteredValue = value.filter((item) => item === null ? false : true);
                const maxIndex = filteredValue.length - 1;
                return {
                    type: 'array',
                    kind: getValueType(
                        filteredValue.find((item, index) => {
                            if (item === undefined) {
                                return false;
                            } else if (typeof item === 'number') {
                                 // For numbers should seek for any element with type 'real' until the end because it's
                                 // impossible to find out exact type by first element only
                                 const itemType = getValueType(item);
                                 if (itemType === 'integer' && index < maxIndex) {
                                      return false;
                                 }
                            }
                            return true;
                        })
                    )
                } as IFieldDeclaration;
            }
            return 'object';

        default:
            return 'string';
    }
}

/**
 * Запись - обертка над данными, которые представлены в виде строки таблицы (объект с набором полей и их значений).
 * @remark
 * Основные аспекты записи:
 * <ul>
 *     <li>одинаковый интерфейс доступа к данным в различных форматах (так называемые {@link rawData "сырые данные"}), например таких как JSON, СБИС-JSON или XML. За определение аспекта отвечает интерфейс {@link Types/_entity/IObject};</li>
 *     <li>одинаковый интерфейс доступа к набору полей. За определение аспекта отвечает интерфейс {@link Types/_collection/IEnumerable};</li>
 *     <li>манипуляции с форматом полей. За реализацию аспекта отвечает примесь {@link Types/_entity/FormattableMixin};</li>
 *     <li>манипуляции с сырыми данными посредством адаптера. За реализацию аспекта отвечает примесь {@link Types/_entity/FormattableMixin}.</li>
 * </ul>
 *
 * Создадим запись, в которой в качестве сырых данных используется plain JSON (адаптер для данных в таком формате используется по умолчанию):
 * <pre>
 *     require(['Types/entity'], function (entity) {
 *         var employee = new entity.Record({
 *             rawData: {
 *                 id: 1,
 *                 firstName: 'John',
 *                 lastName: 'Smith'
 *             }
 *         });
 *         employee.get('id');//1
 *         employee.get('firstName');//John
 *     });
 * </pre>
 * Создадим запись, в которой в качестве сырых данных используется ответ БЛ СБИС (адаптер для данных в таком формате укажем явно):
 * <pre>
 *     require([
 *         'Types/entity',
 *         'Types/source'
 *     ], function (entity, source) {
 *         var source = new source.SbisService({endpoint: 'Employee'});
 *         source.call('read', {login: 'root'}).addCallback(function(response) {
 *             var employee = new entity.Record({
 *                 rawData: response.getRawData(),
 *                 adapter: response.getAdapter()
 *             });
 *             console.log(employee.get('id'));
 *             console.log(employee.get('firstName'));
 *         });
 *     });
 * </pre>
 * @class Types/_entity/Record
 * @mixes Types/_entity/DestroyableMixin
 * @implements Types/_entity/IObject
 * @implements Types/_entity/IObservableObject
 * @implements Types/_entity/IProducible
 * @implements Types/_entity/IEquatable
 * @implements Types/_collection/IEnumerable
 * @implements Types/_entity/relation/IReceiver
 * @mixes Types/_entity/OptionsMixin
 * @mixes Types/_entity/ObservableMixin
 * @mixes Types/_entity/SerializableMixin
 * @mixes Types/_entity/CloneableMixin
 * @mixes Types/_entity/ManyToManyMixin
 * @mixes Types/_entity/ReadWriteMixin
 * @mixes Types/_entity/FormattableMixin
 * @mixes Types/_entity/VersionableMixin
 * @ignoreOptions owner cloneChanged
 * @ignoreMethods detach
 * @public
 * @author Мальцев А.А.
 */
export default class Record extends mixin<
    DestroyableMixin,
    OptionsToPropertyMixin,
    ObservableMixin,
    SerializableMixin,
    CloneableMixin,
    ManyToManyMixin,
    ReadWriteMixin,
    FormattableMixin,
    VersionableMixin
>(
    DestroyableMixin,
    OptionsToPropertyMixin,
    ObservableMixin,
    SerializableMixin,
    CloneableMixin,
    ManyToManyMixin,
    ReadWriteMixin,
    FormattableMixin,
    VersionableMixin
) implements
    IObject,
    IObservableObject,
    IProducible,
    IEquatable,
    IEnumerable<any>,
    IReceiver {

    /**
     * Объект содержащий закэшированные значения полей
     */
    protected get _fieldsCache(): Map<string, any> {
        return this[$fieldsCache as string] || (this[$fieldsCache as string] = new Map());
    }

    /**
     * Объект содержащий клонированные значения полей
     */
    protected get _fieldsClone(): Map<string, any> {
        return this[$fieldsClone as string] || (this[$fieldsClone as string] = new Map());
    }

    /**
     * Данные об измененных полях
     */
    protected get _changedFields(): object {
        const result = {};
        const changedFields = this[$changedFields as string];

        if (!changedFields) {
            return result;
        }

        let data;
        let byLink;
        let value;
        Object.keys(changedFields).forEach((field) => {
            data = changedFields[field];
            value = data[0];
            byLink = data[1];

            // Check record state if it's changed by link
            if (value && byLink && value['[Types/_entity/Record]'] && !value.isChanged()) {
                return;
            }
            result[field] = this._haveToClone(value) && this._fieldsClone.has(field)
                ? this._fieldsClone.get(field)
                : value;
        });

        return result;
    }

    /**
     * Состояние записи после последнего вызова {@link acceptChanges}
     */
    protected _acceptedState: State;

    /**
     * @typedef {String} RecordState
     * @variant Added Запись была добавлена в рекордсет, но метод {@link acceptChanges} не был вызыван.
     * @variant Deleted Запись была отмечена удаленной с использованием метода {@link setState}, но метод {@link acceptChanges} не был вызван.
     * @variant Changed Запись была изменена, но метод {@link acceptChanges} не был вызван. Автоматически переходит в это состояние при изменении любого поля, если до этого состояние было Unchanged.
     * @variant Unchanged С момента последнего вызова {@link acceptChanges} запись не была изменена.
     * @variant Detached Запись не была вставлена ни в один рекордсет, либо запись была удалена из рекордсета.
     */

    /**
     * @cfg {RecordState} Текущее состояние записи по отношению к рекордсету: отражает факт принадлежности записи к рекордсету и сценарий, в результате которого эта принадлежность была сформирована.
     * @name Types/_entity/Record#state
     * @see getState
     * @see setState
     * @see getOwner
     */
    protected _$state: State;

    /**
     * @cfg {String} Режим кеширования
     */
    protected _$cacheMode: string | symbol;

    /**
     * @cfg {Boolean} Клонировать значения полей, поддерживающих интерфейс {@link Types/_entity/ICloneable}, и при вызове rejectChages восстанавливать клонированные значения.
     * @name Types/_entity/Record#cloneChanged
     * @see rejectChanges
     */
    protected _$cloneChanged: boolean;

   /**
    * @cfg {Types/_collection/RecordSet} Рекордсет, которому принадлежит запись
    * @name Types/_entity/Record#owner
    */
   protected _$owner: RecordSet;

    constructor(options?: IOptions) {
        if (options && options.owner && !options.owner['[Types/_collection/RecordSet]']) {
            throw new TypeError('Records owner should be an instance of Types/collection:RecordSet');
        }

        super(options);
        OptionsToPropertyMixin.call(this, options);
        SerializableMixin.call(this);
        FormattableMixin.call(this, options);
        ReadWriteMixin.call(this, options);

        this._publish('onPropertyChange');
        this._clearChangedFields();
        this._acceptedState = this._$state;
    }

    destroy(): void {
        this[$changedFields as string] = null;
        this._clearFieldsCache();

        ReadWriteMixin.prototype.destroy.call(this);
        DestroyableMixin.prototype.destroy.call(this);
    }

    // region IObject

    readonly '[Types/_entity/IObject]': boolean;

    get(name: string): any {
        const cache = this._fieldsCache;
        if (cache.has(name)) {
            return cache.get(name);
        }

        const value = this._getRawDataValue(name);
        if (this._isFieldValueCacheable(value)) {
            this._addChild(value, this._getRelationNameForField(name));
            cache.set(name, value);
            if (this._haveToClone(value)) {
                this._fieldsClone.set(name, value.clone());
            }
        }

        return value;
    }

    set(name: string | object, value?: any): void {
        const map = this._getHashMap(name, value);
        const errors = [];

        const changed = this._setPairs(
            Object.keys(map).map((key) => [key, map[key], this.get(key), true] as pairsTuple),
            errors
        );

        if (changed) {
            this._notifyChange(changed);
        }

        this._checkErrors(errors);
    }

    has(name: string): boolean {
        return this._getRawDataFields().indexOf(name) > -1;
    }

    /**
     * Устанавливает значения полей из пар "новое значение => старое значение"
     * @param pairs Массив элементов вида [имя поля, новое значение, старое значение]
     * @param errors Ошибки установки значений по полям
     * @return Изменившиеся значения
     * @protected
     */
    protected _setPairs(pairs: pairsTuple[], errors: string[]): object {
        let changed = null;

        pairs.forEach((item) => {
            const [key, newValue, oldValue, saveInRawData]: pairsTuple = item;
            let value = newValue;

            // Check if value changed
            if (isEqualValues(value, oldValue)) {
                // Update raw data by link if same Object has been set
                if (typeof value === 'object' && saveInRawData) {
                    this._setRawDataValue(key, value);
                }
            } else {
                // Try to set every field
                try {
                    // Work with relations
                    this._removeChild(oldValue);

                    // Save value to rawData
                    if (saveInRawData) {
                        if (isPrimitive(value)) {
                            value = this._setRawDataValue(key, value);
                        } else {
                            this._setRawDataValue(key, value);
                        }
                    }

                    // Work with relations
                    this._addChild(value, this._getRelationNameForField(key));

                    // Compare once again because value can change the type during Factory converting
                    if (value !== oldValue) {
                        if (!this.has(key)) {
                            this._addRawDataField(key);
                        }

                        if (!changed) {
                            changed = {};
                        }
                        changed[key] = value;

                        // Compare new value with initial value
                        if (
                            this._hasChangedField(key) &&
                            getValueOf(this._getChangedFieldValue(key)) === getValueOf(value)
                        ) {
                            // Revert changed if new value is equal initial value
                            this._unsetChangedField(key);
                        } else {
                            // Set changed if new value is not equal initial value
                            this._setChangedField(key, oldValue);
                        }

                        // Cache value if necessary
                        if (this._isFieldValueCacheable(value)) {
                            this._fieldsCache.set(key, value);
                            if (this._haveToClone(value)) {
                                this._fieldsClone.set(key, value.clone());
                            }
                        } else {
                            this._fieldsCache.delete(key);
                            this._fieldsClone.delete(key);
                        }
                    }
                } catch (err) {
                    // Collecting errors for every field
                    errors.push(err);
                }
            }
        });

        return changed;
    }

    // endregion

    // region IEnumerable

    readonly '[Types/_collection/IEnumerable]': boolean;

    /**
     * Возвращает энумератор для перебора названий полей записи
     * @return {Types/_collection/ArrayEnumerator}
     * @example
     * Переберем все поля записи:
     * <pre>
     *     var user = new Record({
     *             rawData: {
     *                 id: 1,
     *                 login: 'dummy',
     *                 group_id: 7
     *             }
     *         }),
     *         enumerator = user.getEnumerator(),
     *         fields = [];
     *
     *     while (enumerator.moveNext()) {
     *         fields.push(enumerator.getCurrent());
     *     }
     *     fields.join(', ');//'id, login, group_id'
     * </pre>
     */
    getEnumerator(): enumerator.Arraywise<any> {
        return create<enumerator.Arraywise<any>>(
            'Types/collection:enumerator.Arraywise',
            this._getRawDataFields()
        );
    }

    /**
     * Перебирает все поля записи
     * @param {Function(String, *)} callback Ф-я обратного вызова для каждого поля. Первым аргументом придет название поля, вторым - его значение.
     * @param {Object} [context] Контекст вызова callback.
     * @example
     * Переберем все поля записи:
     * <pre>
     *     var user = new Record({
     *             rawData: {
     *                 id: 1,
     *                 login: 'dummy',
     *                 group_id: 7
     *             }
     *         }),
     *         fields = [];
     *
     *     user.each(function(field) {
     *         fields.push(field);
     *     });
     *     fields.join(', ');//'id, login, group_id'
     * </pre>
     */
    each(callback: EnumeratorCallback<any>, context?: object): void {
        const enumerator = this.getEnumerator();
        let name;
        while (enumerator.moveNext()) {
            name = enumerator.getCurrent();
            callback.call(
                context || this,
                name,
                this.get(name)
            );
        }
    }

    // endregion

    // region IObservableObject

    readonly '[Types/_entity/IObservableObject]': boolean;

    // endregion

    // region IEquatable

    readonly '[Types/_entity/IEquatable]': boolean;

    isEqual(to: Record): boolean {
        if (to === this) {
            return true;
        }

        if (!to || !(to instanceof Record)) {
            return false;
        }

        const rawData = this._getRawData();
        const toRawData = to.getRawData(true);

        // Check that if we have nested records here
        if (rawData instanceof Record) {
            return rawData.isEqual(toRawData);
        }

        return JSON.stringify(rawData) === JSON.stringify(toRawData);
    }

    // endregion

    // region Types/_entity/ICloneable

    clone: <T = this>(shallow?: boolean) => T;

    // endregion

    // region IReceiver

    readonly '[Types/_entity/relation/IReceiver]': boolean;

    relationChanged(which: any, route: string[]): any {
        const checkRawData = (fieldName, target) => {
            const map = {};
            const adapter = this._getRawDataAdapter();
            const hasInRawData = adapter.has(fieldName);

            // Apply child's raw data to the self raw data if necessary
            if (hasInRawData) {
                this._setRawDataValue(fieldName, target, true);
            }

            this._setChangedField(fieldName, target, true);
            map[fieldName] = target;
            this._notifyChange(map, false);

            return map;
        };
        const name = route[0];
        const fieldName = this._getFieldFromRelationName(name);
        const target = which.target;

        switch (which.original) {
            case Record.prototype.acceptChanges:
                if (fieldName && (
                    (target['[Types/_entity/Record]'] && !target.isChanged()) ||
                    (target['[Types/_collection/RecordSet]'] && !target.isChanged())
                )) {
                    this.acceptChanges([fieldName]);
                }
                break;

            case Record.prototype.rejectChanges:
                if (fieldName && (
                    (target['[Types/_entity/Record]'] && !target.isChanged()) ||
                    (target['[Types/_collection/RecordSet]'] && !target.isChanged())
                )) {
                    this.rejectChanges([fieldName]);
                }
                break;

            case Record.prototype.addField:
            case Record.prototype.removeField:
            case Record.prototype.removeFieldAt:
                this._resetRawDataAdapter();
                this._resetRawDataFields();
                if (fieldName) {
                    checkRawData(fieldName, target);
                }
                break;

            default:
                if (fieldName) {
                    const map = checkRawData(fieldName, target);

                    // Set which data to field name => value
                    return {
                        target,
                        data: map
                    };
                }
        }
    }

    protected _getRelationNameForField(name: string): string {
        return FIELD_RELATION_PREFIX + name;
    }

    protected _getFieldFromRelationName(name: string): string {
        name += '';
        if (name.substr(0, FIELD_RELATION_PREFIX.length) === FIELD_RELATION_PREFIX) {
            return name.substr(FIELD_RELATION_PREFIX.length);
        }
    }

    // endregion

    // region IProducible

    readonly '[Types/_entity/IProducible]': boolean;

   static produceInstance(data?: any, options?: any): any {
      const instanceOptions: IOptions = {
         rawData: data
      };
      if (options && options.adapter) {
         instanceOptions.adapter = options.adapter;
      }
      if (options && options.formatController) {
         instanceOptions.formatController = options.formatController;
      }
      return new this(instanceOptions);
   }

    // endregion

    // region SerializableMixin

    _getSerializableState(state: IDefaultSerializableState): ISerializableState {
        let resultState: ISerializableState = SerializableMixin.prototype._getSerializableState.call(this, state);
        resultState = FormattableMixin.prototype._getSerializableState.call(this, resultState);
        resultState._changedFields = this[$changedFields as string];

        // Keep format if record has owner with format
        if (resultState.$options.owner && resultState.$options.owner.hasDeclaredFormat()) {
            resultState._format = resultState.$options.owner.getFormat();
        }

        delete resultState.$options.owner;

        return resultState;
    }

    _setSerializableState(state: ISerializableState): Function {
        const fromSerializableMixin = SerializableMixin.prototype._setSerializableState(state);
        const fromFormattableMixin = FormattableMixin.prototype._setSerializableState(state);

        return function(): void {
            fromSerializableMixin.call(this);
            fromFormattableMixin.call(this);

            this[$changedFields] = state._changedFields;
            if (state._format) {
                this._$format = state._format;
            }
        };
    }

    // endregion

    // region FormattableMixin

    setRawData(rawData: any): void {
        super.setRawData(rawData);
        this._nextVersion();
        this._clearFieldsCache();
        this._notifyChange();
    }

     hasDeclaredFormat(): boolean {
        const owner = this.getOwner();
        if (owner) {
            return owner.hasDeclaredFormat();
        } else {
            return super.hasDeclaredFormat();
        }
    }

    addField(format: Field | IFieldDeclaration, at?: number, value?: any): void {
        this._checkFormatIsWritable();
        format = this._buildField(format);

        super.addField(format, at);

        const name = format.getName();
        if (value !== undefined) {
            this.set(name, value);
        } else {
             this._notifyChange({
                  [name]: format.getDefaultValue()
             }, false);
        }
        this._childChanged(Record.prototype.addField);
        this._nextVersion();
    }

    removeField(name: string): void {
        this._checkFormatIsWritable();

        this._fieldsCache.delete(name);
        this._fieldsClone.delete(name);
        this._unsetChangedField(name);

        super.removeField(name);

        this._notifyChange({
             [name]: undefined
        }, false);
        this._childChanged(Record.prototype.removeField);
        this._nextVersion();
    }

    removeFieldAt(at: number): void {
        this._checkFormatIsWritable();

        const field = this._getFormat(true).at(at);
        let name;
        if (field) {
            name = field.getName();
            this._fieldsCache.delete(name);
            this._fieldsClone.delete(name);
            this._unsetChangedField(name);
        }

        super.removeFieldAt(at);

        if (field) {
            this._notifyChange({
                [name]: undefined
            }, false);
        }
        this._childChanged(Record.prototype.removeFieldAt);
        this._nextVersion();
    }

   protected _getFormat(build: boolean): format.Format {
      const owner = this.getOwner();
      if (owner) {
         return (owner as any)._getFormat(build);
      } else {
         return super._getFormat.call(this, build);
      }
   }

   protected _getFieldFormat(name: string, adapter: ITable | IRecord): Field | UniversalField {
      const owner = this.getOwner();
      if (owner) {
         return (owner as any)._getFieldFormat(name, adapter);
      } else {
         return super._getFieldFormat.call(this, name, adapter);
      }
   }

    protected _getRawDataAdapter: () => IRecord;

    /**
     * Создает адаптер для сырых данных
     * @protected
     */
    protected _createRawDataAdapter(): IRecord {
        return (this._getAdapter() as IAdapter).forRecord(this._getRawData(true));
    }

    /**
     * Проверяет, что формат записи доступен для записи
     * @protected
     */
    protected _checkFormatIsWritable(): void {
        const owner = this.getOwner();
        if (owner) {
            throw new Error(
                'Record format has read only access if record belongs to recordset. ' +
                'You should change recordset format instead.'
            );
        }
    }

    // endregion

    // region Public methods

    /**
     * Возвращает признак, что поле с указанным именем было изменено.
     * Если name не передано, то проверяет, что изменено хотя бы одно поле.
     * @param {String} [name] Имя поля
     * @return {Boolean}
     * @example
     * Проверим изменилось ли поле title:
     * <pre>
     *     var article = new Record({
     *         rawData: {
     *             id: 1,
     *             title: 'Initial Title'
     *         }
     *     });
     *     article.isChanged('title');//false
     *     article.set('title', 'New Title');
     *     article.isChanged('title');//true
     * </pre>
     * Проверим изменилось ли какое-нибудь поле:
     * <pre>
     *     var article = new Record({
     *         rawData: {
     *             id: 1,
     *             title: 'Initial Title'
     *         }
     *     });
     *     article.isChanged();//false
     *     article.set('title', 'New Title');
     *     article.isChanged();//true
     * </pre>
     */
    isChanged(name?: string): boolean {
        return name
            ? this._hasChangedField(name)
            : this.getChanged().length > 0;
    }

    /**
     * Возвращает рекордсет, которому принадлежит запись. Может не принадлежать рекордсету.
     * @return {Types/_collection/RecordSet|null}
     * @example
     * Проверим владельца записи до и после вставки в рекордсет:
     * <pre>
     *     var record = new Record(),
     *         rs1 = new RecordSet(),
     *         rs2 = new RecordSet();
     *
     *     record.getOwner();//null
     *
     *     rs1.add(record);
     *     record.getOwner() === null;//true
     *     rs1.at(0) === record;//false
     *     rs1.at(0).getOwner() === rs1;//true
     *
     *     rs2.add(record);
     *     record.getOwner() === null;//true
     *     rs2.at(0).getOwner() === rs2;//true
     * </pre>
     */
    getOwner(): RecordSet {
        return this._$owner;
    }

    /**
     * Отвязывает запись от рекордсета: сбрасывает ссылку на владельца и устанавливает состояние detached.
     */
    detach(): void {
        this._$owner = null;
        this.setState(STATES.DETACHED);
    }

    /**
     * Возвращает текущее состояние записи.
     * @return {RecordState}
     * @see state
     * @see setState
     * @example
     * Проверим состояние записи до и после вставки в рекордсет, а также после удаления из рекордсета:
     * <pre>
     *     var record = new Record(),
     *         RecordState = Record.RecordState,
     *         rs = new RecordSet();
     *
     *     record.getState() === RecordState.DETACHED;//true
     *
     *     rs.add(record);
     *     record.getState() === RecordState.ADDED;//true
     *
     *     rs.remove(record);
     *     record.getState() === RecordState.DETACHED;//true
     * </pre>
     */
    getState(): State {
        return this._$state;
    }

    /**
     * Устанавливает текущее состояние записи.
     * @param {RecordState} state Новое состояние записи.
     * @see state
     * @see getState
     * @example
     * Пометитм запись, как удаленную:
     * <pre>
     *     var record = new Record();
     *     record.setState(Record.RecordState.DELETED);
     * </pre>
     */
    setState(state: State): void {
        this._$state = state;
    }

    /**
     * Возвращает массив названий измененных полей.
     * @return {Array}
     * @example
     * Получим список изменненых полей статьи:
     * <pre>
     *     var article = new Record({
     *         rawData: {
     *             id: 1,
     *             date: new Date(2012, 12, 12),
     *             title: 'Initial Title'
     *         }
     *     });
     *
     *     article.getChanged();//[]
     *
     *     article.set({
     *         date: new Date(),
     *         title: 'New Title'
     *     });
     *     article.getChanged();//['date', 'title']
     * </pre>
     */
    getChanged(): string[] {
        return Object.keys(this._changedFields);
    }

    /**
     * Подтверждает изменения состояния записи с момента предыдущего вызова acceptChanges():
     * <ul>
     *     <li>Сбрасывает признак изменения для всех измененных полей;
     *     <li>Меняет {@link state} следующим образом:
     *         <ul>
     *             <li>Added или Changed становится Unchanged;</li>
     *             <li>Deleted становится Detached;</li>
     *             <li>остальные не меняются.</li>
     *         </ul>
     *     </li>
     * </ul>
     * Если передан аргумент fields, то подтверждаются изменения только указанного набора полей. {@link state State} в этом случае меняется только если fields включает в себя весь набор измененных полей.
     * @param [fields] Поля, в которых подтвердить изменения.
     * @param [spread=false] Распространять изменения по иерархии родителей. При включениии будут вызваны acceptChanges всех владельцев.
     * @example
     * Подтвердим изменения в записи:
     * <pre>
     *     var article = new Record({
     *         rawData: {
     *             id: 1,
     *             title: 'Initial Title'
     *         }
     *     });
     *
     *     article.set('title', 'New Title');
     *     article.getChanged();//['title']
     *     article.setState(Record.RecordState.DELETED);
     *
     *     article.acceptChanges();
     *     article.getChanged();//[]
     *     article.getState() === RecordState.DETACHED;//true
     * </pre>
     * Подтвердим изменение поля password:
     * <pre>
     *     var account = new Record({
     *         rawData: {
     *             id: 1,
     *             login: 'root'
     *             password: '123'
     *         }
     *     });
     *
     *     article.set({
     *         login: 'admin',
     *         password: '321'
     *     });
     *
     *     article.acceptChanges(['password']);
     *     article.getChanged();//['login']
     *     article.getState() === RecordState.CHANGED;//true
     * </pre>
     */
    acceptChanges(fields?: string[] | boolean, spread?: boolean): void {
        if (spread === undefined && typeof fields === 'boolean') {
            spread = fields;
            fields = undefined;
        }

        if (fields === undefined) {
            this._clearChangedFields();
        } else {
            if (!(fields instanceof Array)) {
                throw new TypeError('Argument "fields" should be an instance of Array');
            }
            fields.forEach((field) => {
                this._unsetChangedField(field);
            });
        }

        if (this.getChanged().length === 0) {
            switch (this._$state) {
                case STATES.ADDED:
                case STATES.CHANGED:
                    this._$state = STATES.UNCHANGED;
                    break;
                case STATES.DELETED:
                    this._$state = STATES.DETACHED;
                    break;
            }
        }

        this._acceptedState = this._$state;

        if (spread) {
            this._childChanged(Record.prototype.acceptChanges);
        }
    }

    /**
     * Возвращает запись к состоянию, в котором она была с момента последнего вызова acceptChanges:
     * <ul>
     *     <li>Отменяются изменения всех полей;
     *     <li>{@link state State} возвращается к состоянию, в котором он был сразу после вызова acceptChanges.</li>
     * </ul>
     * Если передан аргумент fields, то откатываются изменения только указанного набора полей. {@link state State} в этом случае меняется только если fields включает в себя весь набор измененных полей.
     * @param [fields] Поля, в которых подтвердить изменения.
     * @param [spread=false] Распространять изменения по иерархии родителей. При включениии будут вызваны acceptChanges всех владельцев.
     * @example
     * Отменим изменения в записи:
     * <pre>
     *     var article = new Record({
     *         rawData: {
     *             id: 1,
     *             title: 'Initial Title'
     *         }
     *     });
     *
     *     article.set('title', 'New Title');
     *     article.getChanged();//['title']
     *     article.setState(Record.RecordState.DELETED);
     *
     *     article.rejectChanges();
     *     article.getChanged();//[]
     *     article.getState() === RecordState.DETACHED;//true
     *     article.get('title');//'Initial Title'
     * </pre>
     * Отменим изменение поля password:
     * <pre>
     *     var account = new Record({
     *         rawData: {
     *             id: 1,
     *             login: 'root'
     *             password: '123'
     *         }
     *     });
     *
     *     article.set({
     *         login: 'admin',
     *         password: '321'
     *     });
     *
     *     article.rejectChanges(['password']);
     *     article.getChanged();//['login']
     *     article.get('login');//'admin'
     *     article.get('password');//'123'
     * </pre>
     */
    rejectChanges(fields?: string[] | boolean, spread?: boolean): void {
        if (spread === undefined && typeof fields === 'boolean') {
            spread = fields;
            fields = undefined;
        }

        const toSet = {};
        if (fields === undefined) {
            fields = this.getChanged();
        } else if (!(fields instanceof Array)) {
            throw new TypeError('Argument "fields" should be an instance of Array');
        }
        fields.forEach((name) => {
            if (this._hasChangedField(name)) {
                toSet[name] = this._getChangedFieldValue(name);
            }
        });

        this.set(toSet);
        for (const name in toSet) {
            if (toSet.hasOwnProperty(name)) {
                this._unsetChangedField(name);
            }
        }

        if (this.getChanged().length === 0) {
            this._$state = this._acceptedState;
        }

        if (spread) {
            this._childChanged(Record.prototype.rejectChanges);
        }
    }

    /**
     * Возвращает значения всех свойств в виде строки формата json
     * @return {String}
     * @example
     * Получим значения всех свойств в виде строки:
     * <pre>
     *     var article = new Model({
     *         rawData: {id: 1, title: 'Article 1'}
     *     });
     *     article.toString();//'{"id": 1, "title": "Article 1"}'
     * </pre>
     */
    toString(): string {
        const result = {};
        this.each((key, value) => {
            result[key] = value;
        });
        return JSON.stringify(result);
    }

    // endregion

    // region Proteted methods

    /**
     * Проверяет наличие ошибок
     * @param errors Массив ошибок
     * @protected
     */
    protected _checkErrors(errors: Error[]): void {
        if (errors.length) {
            // Looking for simple Error (use compare by >) that has priority to show.
            let error = errors[0];
            for (let i = errors.length; i > 0; i--) {
                if (error > errors[i]) {
                    error = errors[i];
                }
            }
            throw error;
        }
    }

    /**
     * Возвращает hash map
     * @param name Название поля или набор полей
     * @param [value] Значение поля
     * @protected
     */
    protected _getHashMap(name: string | object, value?: any): string | object {
        let map = name;
        if (!(map instanceof Object)) {
            map = {};
            map[name as string] = value;
        }
        return map;
    }

    /**
     * Обнуляет кэш значений полей
     * @protected
     */
    protected _clearFieldsCache(): void {
        this[$fieldsCache as string] = null;
        this[$fieldsClone as string] = null;
    }

    /**
     * Возвращает признак, что значение поля кэшируемое
     * @protected
     */
    protected _isFieldValueCacheable(value: any): boolean {
        switch (this._$cacheMode) {
            case CACHE_MODE_OBJECTS:
                return value instanceof Object;
            case CACHE_MODE_ALL:
                return true;
        }
        return false;
    }

    /**
     * Возвращает режим работы с клонами значений, поддреживающих клонирование
     * @param value Значение поля
     * @protected
     */
    protected _haveToClone(value: any): boolean {
        return this._$cloneChanged && value && value['[Types/_entity/ICloneable]'];
    }

    /**
     * Возвращает значение поля из "сырых" данных, прогнанное через фабрику
     * @param name Название поля
     * @protected
     */
    protected _getRawDataValue(name: string): any {
        const adapter = this._getRawDataAdapter();
        if (!adapter.has(name)) {
            return;
        }

        const value = adapter.get(name);
        const format = this._getFieldFormat(name, adapter);

        return factory.cast(
            value,
            this._getFieldType(format),
            {
                format,
                adapter: this._getAdapter(),
                formatController: this._$formatController
            }
        );
    }

    /**
     * Конвертирует значение поля через фабрику и сохраняет его в "сырых" данных
     * @param name Название поля
     * @param value Значение поля
     * @param [compatible=false] Значение поля совместимо по типу
     * @protected
     */
    protected _setRawDataValue(name: string, value: any, compatible?: boolean): void {
        if (!compatible &&
            value &&
            value['[Types/_entity/FormattableMixin]']
        ) {
            this._checkAdapterCompatibility(value.getAdapter());
        }

        const adapter = this._getRawDataAdapter();

        value = factory.serialize(value, {
            format: this._getFieldFormat(name, adapter),
            adapter: this.getAdapter()
        });

        adapter.set(name, value);

        return value;
    }

    /**
     * Уведомляет об изменении полей записи
     * @param [map] Измененные поля
     * @param [spread=true] Распространить по иерархии родителей
     * @protected
     */
    protected _notifyChange(map?: object, spread?: boolean): void {
        map = map || {};
        if (spread === undefined || spread === true) {
            this._childChanged(map);
        }
        this._nextVersion();
        this._notify('onPropertyChange', map);
    }

    /**
     * Очищает информацию об измененных полях
     * @protected
     */
    protected _clearChangedFields(): void {
        this[$changedFields as string] = {};
    }

    /**
     * Возвращает признак наличия изменений в поле
     * @param name Название поля
     * @protected
     */
    protected _hasChangedField(name: string): boolean {
        return this._changedFields.hasOwnProperty(name);
    }

    /**
     * Возвращает оригинальное значение измененного поля
     * @param name Название поля
     * @protected
     */
    protected _getChangedFieldValue(name: string): any {
        return this._changedFields[name];
    }

    /**
     * Устанавливает признак изменения поля
     * @param name Название поля
     * @param value Старое значение поля
     * @param byLink Значение изменилось по ссылке
     * @protected
     */
    protected _setChangedField(name: string, value: any, byLink?: boolean): void {
        if (!this[$changedFields as string].hasOwnProperty(name)) {
            this[$changedFields as string][name] = [value, Boolean(byLink)];
        }
        switch (this._$state) {
            case STATES.UNCHANGED:
                this._$state = STATES.CHANGED;
                break;
        }
    }

    /**
     * Снимает признак изменения поля
     * @param name Название поля
     * @protected
     */
    protected _unsetChangedField(name: string): void {
        delete this[$changedFields as string][name];
    }

    // endregion

    // region Deprecated

    /**
     * @deprecated
     */
    static extend(mixinsList: any, classExtender: any): Function {
         return deprecateExtend(
              this,
              classExtender,
              mixinsList,
              'Types/_entity/Record'
         );
    }

    // endregion

    // region Statics

    static get RecordState(): IStatesHash {
        return STATES;
    }

    static get CACHE_MODE_OBJECTS(): symbol | string {
        return CACHE_MODE_OBJECTS;
    }

    static get CACHE_MODE_ALL(): symbol | string {
        return CACHE_MODE_ALL;
    }

    /**
     * Создает запись по объекту c учетом типов значений полей. Поля добавляются в запись в алфавитном порядке.
     * @example
     * <pre>
     * var record = Record.fromObject({
     *         id: 1,
     *         title: 'title'
     *     }, 'Types/entity:adapter.Json'),
     *     format = record.getFormat();
     * format.each(function(field) {
     *     console.log(field.getName() + ': ' + field.getType());
     * });
     * //output: 'id: Integer', 'title: String'
     * </pre>
     * @param data Объект вида "имя поля" -> "значение поля"
     * @param [adapter='Types/entity:adapter.Json'] Адаптер для сырых данных
     * @static
     */
    static fromObject(data: any, adapter?: IAdapter | string): Record | null {
        if (data === null) {
            return data;
        }
        if (data && (data instanceof Record)) {
            return data;
        }

        const record = new Record({
            adapter: adapter || 'Types/entity:adapter.Json',
            format: []
        });

        let sortNames = [];
        for (const name in data) {
            if (data.hasOwnProperty(name)) {
                sortNames.push(name);
            }
        }
        sortNames = sortNames.sort();

        for (let i = 0, len = sortNames.length; i < len; i++) {
            const name = sortNames[i];
            const value = data[name];

            if (value === undefined) {
                continue;
            }

            Record.addFieldTo(record, name, value);
        }

        return record;
    }

    /**
     * Создает запись c набором полей, ограниченным фильтром.
     * @param record Исходная запись
     * @param callback Функция фильтрации полей, аргументами приходят имя поля и его значение. Должна вернуть boolean - прошло ли поле фильтр.
     * @static
     */
    static filter(record: Record, callback: (name: string, value: any) => boolean): Record {
        const result = new Record({
            adapter: record.getAdapter()
        });

        record.getFormat().each((field) => {
            const name = field.getName();
            const value = record.get(name);
            if (!callback || callback(name, value)) {
                result.addField(field);
                result.set(name, value);
            }
        });

        result.acceptChanges();

        return result;
    }

    /**
     * Добавляет поле в запись. Если формат не указан, то он строится по типу значения поля.
     * @param record Запись
     * @param name Имя поля
     * @param value Значение поля
     * @param [format] Формат поля
     * @static
     */
    protected static addFieldTo(record: Record, name: string, value: any, format?: IFieldDeclaration): void {
        if (!format) {
            let detectedFormat = getValueType(value);
            if (typeof detectedFormat === 'string') {
                detectedFormat = {name: '', type: detectedFormat};
            }
            detectedFormat.name = name;
            format = detectedFormat;
        }

        record.addField(format, undefined, value);
    }

    /**
     * Создает запись c указанным набором полей
     * @param record Исходная запись
     * @param fields Набор полей, которые следует оставить в записи
     * @static
     */
    protected static filterFields(record: Record, fields: string[]): Record {
        if (!(fields instanceof Array)) {
            throw new TypeError('Argument "fields" should be an instance of Array');
        }

        return Record.filter(record, (name) => {
            return fields.indexOf(name) > -1;
        });
    }

    // endregion
}

Object.assign(Record.prototype, {
   '[Types/_entity/Record]': true,
   '[Types/_collection/IEnumerable]': true,
   '[Types/_entity/IEquatable]': true,
   '[Types/_entity/IObject]': true,
   '[Types/_entity/IObservableObject]': true,
   '[Types/_entity/IProducible]': true,
   '[Types/_entity/relation/IReceiver]': true,
   _moduleName: 'Types/entity:Record',
   _$state: STATES.DETACHED,
   _$cacheMode: CACHE_MODE_OBJECTS,
   _$cloneChanged: false,
   _$owner: null,
   _acceptedState: undefined
});

/**
 * Измененные поля и оригинальные значения
 */
Record.prototype[$changedFields as string] = null;

register('Types/entity:Record', Record, {instantiate: false});
