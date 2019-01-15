/// <amd-module name="Types/_entity/Record" />
/**
 * Запись - обертка над данными, которые представлены в виде строки таблицы (объект с набором полей и их значений).
 *
 * Основные аспекты записи:
 * <ul>
 *    <li>одинаковый интерфейс доступа к данным в различных форматах (так называемые {@link rawData "сырые данные"}), например таких как JSON, СБИС-JSON или XML. За определение аспекта отвечает интерфейс {@link Types/Entity/IObject};</li>
 *    <li>одинаковый интерфейс доступа к набору полей. За определение аспекта отвечает интерфейс {@link Types/Collection/IEnumerable};</li>
 *    <li>манипуляции с форматом полей. За реализацию аспекта отвечает примесь {@link Types/Entity/FormattableMixin};</li>
 *    <li>манипуляции с сырыми данными посредством адаптера. За реализацию аспекта отвечает примесь {@link Types/Entity/FormattableMixin}.</li>
 * </ul>
 *
 * Создадим запись, в которой в качестве сырых данных используется plain JSON (адаптер для данных в таком формате используется по умолчанию):
 * <pre>
 *    require(['Types/Entity/Record'], function (Record) {
 *       var employee = new Record({
 *          rawData: {
 *             id: 1,
 *             firstName: 'John',
 *             lastName: 'Smith'
 *          }
 *       });
 *       employee.get('id');//1
 *       employee.get('firstName');//John
 *    });
 * </pre>
 * Создадим запись, в которой в качестве сырых данных используется ответ БЛ СБИС (адаптер для данных в таком формате укажем явно):
 * <pre>
 *    require([
 *       'Types/Entity/Record',
 *       'Types/Source/SbisService'
 *    ], function (Record, SbisService) {
 *       var source = new SbisService({endpoint: 'Employee'});
 *       source.call('read', {login: 'root'}).addCallback(function(response) {
 *          var employee = new Record({
 *             rawData: response.getRawData(),
 *             adapter: response.getAdapter()
 *          });
 *          console.log(employee.get('id'));
 *          console.log(employee.get('firstName'));
 *       });
 *    });
 * </pre>
 * @class Types/Entity/Record
 * @mixes Types/Entity/DestroyableMixin
 * @implements Types/Entity/IObject
 * @implements Types/Entity/IObjectNotify
 * @implements Types/Entity/ICloneable
 * @implements Types/Entity/IProducible
 * @implements Types/Entity/IEquatable
 * @implements Types/Collection/IEnumerable
 * @implements Types/Mediator/IReceiver
 * @implements Types/Entity/IVersionable
 * @mixes Types/Entity/OptionsMixin
 * @mixes Types/Entity/ObservableMixin
 * @mixes Types/Entity/SerializableMixin
 * @mixes Types/Entity/CloneableMixin
 * @mixes Types/Entity/ManyToManyMixin
 * @mixes Types/Entity/ReadWriteMixin
 * @mixes Types/Entity/FormattableMixin
 * @mixes Types/Entity/VersionableMixin
 * @ignoreOptions owner cloneChanged
 * @ignoreMethods detach
 * @public
 * @author Мальцев А.А.
 */

import {protect} from '../util';
import IObject from './IObject';
import IObservableObject from './IObservableObject';
import ICloneable from './ICloneable';
import IProducible from './IProducible';
import IEquatable from './IEquatable';
import IVersionable from './IVersionable';
import DestroyableMixin from './DestroyableMixin';
import OptionsToPropertyMixin from './OptionsToPropertyMixin';
import ObservableMixin from './ObservableMixin';
import SerializableMixin from './SerializableMixin';
import CloneableMixin from './CloneableMixin';
import ManyToManyMixin from './ManyToManyMixin';
import ReadWriteMixin from './ReadWriteMixin';
import FormattableMixin from './FormattableMixin';
import VersionableMixin from './VersionableMixin';
import Factory from './factory';
import {IReceiver} from './relation';
import {IAdapter} from './adapter';
import {IEnumerable} from '../collection';
import {resolve, register} from '../di';
import {mixin} from '../util';
import {Map} from '../shim';
import {logger} from '../util';
//@ts-ignore
import coreExtend = require('Core/core-extend');

interface IOptions {
   adapter?: IAdapter,
   rawData?: any
}

/**
 * Возвращает признак примитивного значения (не объекта)
 * @param {*} value
 * @return {Boolean}
 */
function isPrimitive(value) {
   return value && typeof value === 'object' ? false : true;
}

/**
 * Возвращает valueOf от объекта, либо value если это не объект
 * @param {*} value
 * @return {*}
 */
function getValueOf(value) {
   if (value && typeof value === 'object' && value !== value.valueOf()) {
      return value.valueOf();
   }
   return value;
}

/**
 * Возвращает признак эквивалентности значений с учетом того, что каждоое из них может являться объектов, оборачивающим примитивное значение
 * @param {*} first
 * @param {*} second
 * @return {Boolean}
 */
function isEqualValues(first, second) {
   return getValueOf(first) === getValueOf(second);
}

/**
 * Возвращает тип значения
 * @param {*} value Значение
 * @return {String|Object}
 */
function getValueType(value) {
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
            if (value.hasOwnProperty('_serializeMode')) {
               value = <ExtendDate>value;
               switch (value.getSQLSerializationMode()) {
                  case (<ExtendDateConstructor>Date).SQL_SERIALIZE_MODE_DATE:
                     return 'date';
                  case (<ExtendDateConstructor>Date).SQL_SERIALIZE_MODE_TIME:
                     return 'time';
               }
            }
            return 'datetime';
         } else if (value instanceof Array) {
            return {
               type: 'array',
               kind: getValueType(value.find((item) => {
                  return item !== null && item !== undefined;
               }))
            };
         }
         return 'object';

      default:
         return 'string';
   }
}

/**
 * Свойство, хранящее кэш полей
 */
let $fieldsCache = protect('fieldsCache');

/**
 * Свойство, хранящее клоны полей
 */
let $fieldsClone = protect('fieldsClone');

/**
 * Свойство, хранящее измененные полй
 */
let $changedFields = protect('changedFields');

/**
 * Возможные состояния записи
 */
const STATES = {
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

export default class Record extends mixin(
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
   ICloneable,
   IProducible,
   IEquatable,
   IEnumerable<any>,
   IReceiver,
   IVersionable
/** @lends Types/Entity/Record.prototype */{

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
    * @name Types/Entity/Record#state
    * @see getState
    * @see setState
    * @see getOwner
    */
   _$state: string;

   /**
    * @cfg {String} Режим кеширования
    */
   _$cacheMode: string | symbol;

   /**
    * @cfg {Boolean} Клонировать значения полей, поддерживающих интерфейс {@link Types/Entity/ICloneable}, и при вызове rejectChages восстанавливать клонированные значения.
    * @name Types/Entity/Record#cloneChanged
    * @see rejectChanges
    */
   _$cloneChanged: boolean;

   /**
    * @cfg {Types/Collection/RecordSet} Рекордсет, которому принадлежит запись
    * @name Types/Entity/Record#owner
    */
   _$owner: any;

   /**
    * @property {RecordState} Состояние записи после последнего вызова {@link acceptChanges}
    */
   _acceptedState: string;

   /**
    * @property {Map} Объект содержащий закэшированные значения полей
    */
   get _fieldsCache(): Map<string, any> {
      // @ts-ignore
      return this[$fieldsCache] || (this[$fieldsCache] = new Map());
   }

   /**
    * @property {Map} Объект содержащий клонированные значения полей
    */
   get _fieldsClone(): Map<string, any> {
      // @ts-ignore
      return this[$fieldsClone] || (this[$fieldsClone] = new Map());
   }

   /**
    * @property {Object} Данные об измененных полях
    */
   get _changedFields(): Object {
      let result = {};
      // @ts-ignore
      let changedFields = this[$changedFields];

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

         //Check record state if it's changed by link
         if (value && byLink && value['[Types/_entity/Record]'] && !value.isChanged()) {
            return;
         }
         result[field] = this._haveToClone(value) && this._fieldsClone.has(field) ? this._fieldsClone.get(field) : value;
      });

      return result;
   }

   constructor(options) {
      if (options && options.owner && !options.owner['[Types/_collection/RecordSet]']) {
         throw new TypeError('Records owner should be an instance of Types/collection:RecordSet');
      }
      super(options);
      OptionsToPropertyMixin.call(this, options);
      SerializableMixin.constructor.call(this);
      FormattableMixin.constructor.call(this, options);
      ReadWriteMixin.constructor.call(this, options);

      this._publish('onPropertyChange');
      this._clearChangedFields();
      this._acceptedState = this._$state;
   }

   destroy() {
      // @ts-ignore
      this[$changedFields] = null;
      this._clearFieldsCache();

      ReadWriteMixin.destroy.call(this);
      DestroyableMixin.prototype.destroy.call(this);
   }

   //region IObject

   readonly '[Types/_entity/IObject]': boolean;

   get(name) {
      if (this._fieldsCache.has(name)) {
         return this._fieldsCache.get(name);
      }

      let value = this._getRawDataValue(name);
      if (this._isFieldValueCacheable(value)) {
         this._addChild(value, this._getRelationNameForField(name));
         this._fieldsCache.set(name, value);
         if (this._haveToClone(value)) {
            this._fieldsClone.set(name, value.clone());
         }
      }

      return value;
   }

   set(name, value?) {
      let map = this._getHashMap(name, value);
      let errors = [];

      let changed = this._setPairs(Object.keys(map).map((key) => {
         return [key, map[key], this.get(key)];
      }), errors);

      if (changed) {
         this._notifyChange(changed);
      }

      this._checkErrors(errors);
   }

   has(name) {
      return this._getRawDataFields().indexOf(name) > -1;
   }

   /**
    * Устанавливает значения полей из пар "новое значение => старое значение"
    * @param {Array} pairs Массив элементов вида [имя поля, новое значение, старое значение]
    * @param {Array} errors Ошибки установки значений по полям
    * @return {Object|null} Изменившиеся значения
    * @protected
    */
   _setPairs(pairs, errors) {
      let changed = null;

      pairs.forEach((item) => {
         let [key, value, oldValue] = item;

         //Check if value changed
         if (isEqualValues(value, oldValue)) {
            //Update raw data by link if same Object has been set
            if (typeof value === 'object') {
               this._setRawDataValue(key, value);
            }
         } else {
            //Try to set every field
            try {
               //Work with relations
               this._removeChild(oldValue);

               //Save value to rawData
               if (isPrimitive(value)) {
                  value = this._setRawDataValue(key, value);
               } else {
                  this._setRawDataValue(key, value);
               }

               //Work with relations
               this._addChild(value, this._getRelationNameForField(key));

               //Compare once again because value can change the type during Factory converting
               if (value !== oldValue) {
                  if (!this.has(key)) {
                     this._addRawDataField(key);
                  }

                  if (!changed) {
                     changed = {};
                  }
                  changed[key] = value;

                  //Compare new value with initial value
                  if (
                     this._hasChangedField(key) &&
                     getValueOf(this._getChangedFieldValue(key)) === getValueOf(value)
                  ) {
                     //Revert changed if new value is equal initial value
                     this._unsetChangedField(key);
                  } else {
                     //Set changed if new value is not equal initial value
                     this._setChangedField(key, oldValue);
                  }

                  //Cache value if necessary
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
               //Collecting errors for every field
               errors.push(err);
            }
         }
      });

      return changed;
   }

   //endregion

   //region IObservableObject

   readonly '[Types/_entity/IObservableObject]': boolean;

   //endregion

   //region IEnumerable

   readonly '[Types/_collection/IEnumerable]': boolean;

   /**
    * Возвращает энумератор для перебора названий полей записи
    * @return {Types/Collection/ArrayEnumerator}
    * @example
    * Переберем все поля записи:
    * <pre>
    *    var user = new Record({
    *          rawData: {
    *             id: 1,
    *             login: 'dummy',
    *             group_id: 7
    *          }
    *       }),
    *       enumerator = user.getEnumerator(),
    *       fields = [];
    *
    *    while (enumerator.moveNext()) {
    *       fields.push(enumerator.getCurrent());
    *    }
    *    fields.join(', ');//'id, login, group_id'
    * </pre>
    */
   getEnumerator() {
      const ArrayEnumerator = resolve('Types/collection:enumerator.Arraywise');
      return new ArrayEnumerator(this._getRawDataFields());
   }

   /**
    * Перебирает все поля записи
    * @param {Function(String, *)} callback Ф-я обратного вызова для каждого поля. Первым аргументом придет название поля, вторым - его значение.
    * @param {Object} [context] Контекст вызова callback.
    * @example
    * Переберем все поля записи:
    * <pre>
    *    var user = new Record({
    *          rawData: {
    *             id: 1,
    *             login: 'dummy',
    *             group_id: 7
    *          }
    *       }),
    *       fields = [];
    *
    *    user.each(function(field) {
    *       fields.push(field);
    *    });
    *    fields.join(', ');//'id, login, group_id'
    * </pre>
    */
   each(callback, context?: Object) {
      let enumerator = this.getEnumerator();
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

   //endregion

   //region IEquatable

   readonly '[Types/_entity/IEquatable]': boolean;

   isEqual(to) {
      if (to === this) {
         return true;
      }
      if (!to) {
         return false;
      }
      if (!(to instanceof Record)) {
         return false;
      }

      //TODO: compare using formats
      return JSON.stringify(this._getRawData()) === JSON.stringify(to.getRawData(true));
   }

   //endregion

   //region IReceiver

   readonly '[Types/_entity/relation/IReceiver]': boolean;

   relationChanged(which: any, route: Array<string>): any {
      let checkRawData = (fieldName, target) => {
         let map = {};
         let adapter = this._getRawDataAdapter();
         let hasInRawData = adapter.has(fieldName);

         // Apply child's raw data to the self raw data if necessary
         if (hasInRawData) {
            this._setRawDataValue(fieldName, target, true);
         }

         this._setChangedField(fieldName, target, true);
         map[fieldName] = target;
         this._notify('onPropertyChange', map);

         return map;
      };
      let name = route[0];
      let fieldName = this._getFieldFromRelationName(name);
      let target = which.target;

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
               let map = checkRawData(fieldName, target);

               // Set which data to field name => value
               return {
                  target: target,
                  data: map
               };
            }
      }
   }

   //endregion

   //region IProducible

   readonly '[Types/_entity/IProducible]': boolean;

   static produceInstance(data?: any, options?: any): any {
      let instanceOptions: IOptions = {
         rawData: data
      };
      if (options && options.adapter) {
         instanceOptions.adapter = options.adapter;
      }
      return new this(instanceOptions);
   }

   //endregion

   //region ICloneable

   readonly '[Types/_entity/ICloneable]': boolean;

   clone: (shallow?: boolean) => Object;

   //endregion

   //region IVersionable

   readonly '[Types/_entity/IVersionable]': boolean;

   getVersion: () => number;

   //endregion

   //region SerializableMixin

   _getSerializableState(state) {
      state = SerializableMixin.prototype._getSerializableState.call(this, state);
      state = FormattableMixin._getSerializableState.call(this, state);
      // @ts-ignore
      state._changedFields = this[$changedFields];

      //keep format if record has owner with format
      if (state.$options.owner && state.$options.owner._hasFormat()) {
         state._format = state.$options.owner.getFormat();
      }

      delete state.$options.owner;

      return state;
   }

   _setSerializableState(state) {
      let fromSerializableMixin = SerializableMixin.prototype._setSerializableState(state);
      let fromFormattableMixin = FormattableMixin._setSerializableState(state);
      return function() {
         fromSerializableMixin.call(this);
         fromFormattableMixin.call(this);

         this[$changedFields] = state._changedFields;
         if (state._format) {
            this._$format = state._format;
         }
      };
   }

   //endregion

   //region FormattableMixin

   setRawData(rawData) {
      FormattableMixin.setRawData.call(this, rawData);
      this._nextVersion();
      this._clearFieldsCache();
      this._notifyChange();
   }

   addField(format, at?, value?) {
      this._checkFormatIsWritable();
      format = this._buildField(format);
      FormattableMixin.addField.call(this, format, at);
      if (value !== undefined) {
         this.set(format.getName(), value);
      }
      this._childChanged(Record.prototype.addField);
      this._nextVersion();
   }

   removeField(name) {
      this._checkFormatIsWritable();
      this._nextVersion();

      this._fieldsCache.delete(name);
      this._fieldsClone.delete(name);

      FormattableMixin.removeField.call(this, name);
      this._childChanged(Record.prototype.removeField);
   }

   removeFieldAt(at) {
      this._checkFormatIsWritable();
      this._nextVersion();

      let field = this._getFormat(true).at(at);
      if (field) {
         this._fieldsCache.delete(field.getName());
         this._fieldsClone.delete(field.getName());
      }

      FormattableMixin.removeFieldAt.call(this, at);
      this._childChanged(Record.prototype.removeFieldAt);
   }

   protected _hasFormat() {
      let owner = this.getOwner();
      if (owner) {
         return owner._hasFormat();
      } else {
         return FormattableMixin._hasFormat.call(this);
      }
   }

   protected _getFormat(build) {
      let owner = this.getOwner();
      if (owner) {
         return owner._getFormat(build);
      } else {
         return FormattableMixin._getFormat.call(this, build);
      }
   }

   protected _getFieldFormat(name, adapter) {
      let owner = this.getOwner();
      if (owner) {
         return owner._getFieldFormat(name, adapter);
      } else {
         return FormattableMixin._getFieldFormat.call(this, name, adapter);
      }
   }

   /**
    * Создает адаптер для сырых данных
    * @return {Types/Adapter/IRecord}
    * @protected
    */
   protected _createRawDataAdapter() {
      return this._getAdapter().forRecord(this._getRawData(true));
   }

   /**
    * Проверяет, что формат записи доступен для записи
    * @protected
    */
   protected _checkFormatIsWritable() {
      let owner = this.getOwner();
      if (owner) {
         throw new Error('Record format has read only access if record belongs to recordset. You should change recordset format instead.');
      }
   }

   //endregion

   //region Public methods

   /**
    * Возвращает признак, что поле с указанным именем было изменено.
    * Если name не передано, то проверяет, что изменено хотя бы одно поле.
    * @param {String} [name] Имя поля
    * @return {Boolean}
    * @example
    * Проверим изменилось ли поле title:
    * <pre>
    *    var article = new Record({
    *       rawData: {
    *          id: 1,
    *          title: 'Initial Title'
    *       }
    *    });
    *    article.isChanged('title');//false
    *    article.set('title', 'New Title');
    *    article.isChanged('title');//true
    * </pre>
    * Проверим изменилось ли какое-нибудь поле:
    * <pre>
    *    var article = new Record({
    *       rawData: {
    *          id: 1,
    *          title: 'Initial Title'
    *       }
    *    });
    *    article.isChanged();//false
    *    article.set('title', 'New Title');
    *    article.isChanged();//true
    * </pre>
    */
   isChanged(name) {
      return name
         ? this._hasChangedField(name)
         : this.getChanged().length > 0;
   }

   /**
    * Возвращает рекордсет, которому принадлежит запись. Может не принадлежать рекордсету.
    * @return {Types/Collection/RecordSet|null}
    * @example
    * Проверим владельца записи до и после вставки в рекордсет:
    * <pre>
    *    var record = new Record(),
    *       rs1 = new RecordSet(),
    *       rs2 = new RecordSet();
    *
    *    record.getOwner();//null
    *
    *    rs1.add(record);
    *    record.getOwner() === null;//true
    *    rs1.at(0) === record;//false
    *    rs1.at(0).getOwner() === rs1;//true
    *
    *    rs2.add(record);
    *    record.getOwner() === null;//true
    *    rs2.at(0).getOwner() === rs2;//true
    * </pre>
    */
   getOwner() {
      return this._$owner;
   }

   /**
    * Отвязывает запись от рекордсета: сбрасывает ссылку на владельца и устанавливает состояние detached.
    */
   detach() {
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
    *    var record = new Record(),
    *       RecordState = Record.RecordState,
    *       rs = new RecordSet();
    *
    *    record.getState() === RecordState.DETACHED;//true
    *
    *    rs.add(record);
    *    record.getState() === RecordState.ADDED;//true
    *
    *    rs.remove(record);
    *    record.getState() === RecordState.DETACHED;//true
    * </pre>
    */
   getState() {
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
    *    var record = new Record();
    *    record.setState(Record.RecordState.DELETED);
    * </pre>
    */
   setState(state) {
      this._$state = state;
   }

   /**
    * Возвращает массив названий измененных полей.
    * @return {Array}
    * @example
    * Получим список изменненых полей статьи:
    * <pre>
    *    var article = new Record({
    *       rawData: {
    *          id: 1,
    *          date: new Date(2012, 12, 12),
    *          title: 'Initial Title'
    *       }
    *    });
    *
    *    article.getChanged();//[]
    *
    *    article.set({
    *       date: new Date(),
    *       title: 'New Title'
    *    });
    *    article.getChanged();//['date', 'title']
    * </pre>
    */
   getChanged() {
      return Object.keys(this._changedFields);
   }

   /**
    * Подтверждает изменения состояния записи с момента предыдущего вызова acceptChanges():
    * <ul>
    *    <li>Сбрасывает признак изменения для всех измененных полей;
    *    <li>Меняет {@link state} следующим образом:
    *       <ul>
    *          <li>Added или Changed становится Unchanged;</li>
    *          <li>Deleted становится Detached;</li>
    *          <li>остальные не меняются.</li>
    *       </ul>
    *    </li>
    * </ul>
    * Если передан аргумент fields, то подтверждаются изменения только указанного набора полей. {@link state State} в этом случае меняется только если fields включает в себя весь набор измененных полей.
    * @param {Array.<String>} [fields] Поля, в которых подтвердить изменения.
    * @param {Boolean} [spread=false] Распространять изменения по иерархии родителей. При включениии будут вызваны acceptChanges всех владельцев.
    * @example
    * Подтвердим изменения в записи:
    * <pre>
    *    var article = new Record({
    *       rawData: {
    *          id: 1,
    *          title: 'Initial Title'
    *       }
    *    });
    *
    *    article.set('title', 'New Title');
    *    article.getChanged();//['title']
    *    article.setState(Record.RecordState.DELETED);
    *
    *    article.acceptChanges();
    *    article.getChanged();//[]
    *    article.getState() === RecordState.DETACHED;//true
    * </pre>
    * Подтвердим изменение поля password:
    * <pre>
    *    var account = new Record({
    *       rawData: {
    *          id: 1,
    *          login: 'root'
    *          password: '123'
    *       }
    *    });
    *
    *    article.set({
    *       login: 'admin',
    *       password: '321'
    *    });
    *
    *    article.acceptChanges(['password']);
    *    article.getChanged();//['login']
    *    article.getState() === RecordState.CHANGED;//true
    * </pre>
    */
   acceptChanges(fields?: Array<string>, spread?: false) {
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
    *    <li>Отменяются изменения всех полей;
    *    <li>{@link state State} возвращается к состоянию, в котором он был сразу после вызова acceptChanges.</li>
    * </ul>
    * Если передан аргумент fields, то откатываются изменения только указанного набора полей. {@link state State} в этом случае меняется только если fields включает в себя весь набор измененных полей.
    * @param {Array.<String>} [fields] Поля, в которых подтвердить изменения.
    * @param {Boolean} [spread=false] Распространять изменения по иерархии родителей. При включениии будут вызваны acceptChanges всех владельцев.
    * @example
    * Отменим изменения в записи:
    * <pre>
    *    var article = new Record({
    *       rawData: {
    *          id: 1,
    *          title: 'Initial Title'
    *       }
    *    });
    *
    *    article.set('title', 'New Title');
    *    article.getChanged();//['title']
    *    article.setState(Record.RecordState.DELETED);
    *
    *    article.rejectChanges();
    *    article.getChanged();//[]
    *    article.getState() === RecordState.DETACHED;//true
    *    article.get('title');//'Initial Title'
    * </pre>
    * Отменим изменение поля password:
    * <pre>
    *    var account = new Record({
    *       rawData: {
    *          id: 1,
    *          login: 'root'
    *          password: '123'
    *       }
    *    });
    *
    *    article.set({
    *       login: 'admin',
    *       password: '321'
    *    });
    *
    *    article.rejectChanges(['password']);
    *    article.getChanged();//['login']
    *    article.get('login');//'admin'
    *    article.get('password');//'123'
    * </pre>
    */
   rejectChanges(fields?: Array<string>, spread?: false) {
      if (spread === undefined && typeof fields === 'boolean') {
         spread = fields;
         fields = undefined;
      }

      let toSet = {};
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
      for (let name in toSet) {
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
    *    var article = new Model({
    *       rawData: {id: 1, title: 'Article 1'}
    *    });
    *    article.toString();//'{"id": 1, "title": "Article 1"}'
    * </pre>
    */
   toString(): string {
      let result = {};
      this.each((key, value) => {
         result[key] = value;
      });
      return JSON.stringify(result);
   }

   //endregion

   //region Protected methods

   protected _getRelationNameForField(name) {
      return FIELD_RELATION_PREFIX + name;
   }

   protected _getFieldFromRelationName(name) {
      name += '';
      if (name.substr(0, FIELD_RELATION_PREFIX.length) === FIELD_RELATION_PREFIX) {
         return name.substr(FIELD_RELATION_PREFIX.length);
      }
   }

   /**
    * Проверяет наличие ошибок
    * @param {Array.<Error>} errors Массив ошибок
    * @protected
    */
   protected _checkErrors(errors) {
      if (errors.length) {
         //Looking for simple Error (use compare by >) that has priority to show.
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
    * @param {String|Object} name Название поля или набор полей
    * @param {String} [value] Значение поля
    * @return {Object}
    * @protected
    */
   protected _getHashMap(name, value) {
      let map = name;
      if (!(map instanceof Object)) {
         map = {};
         map[name] = value;
      }
      return map;
   }

   /**
    * Обнуляет кэш значений полей
    * @protected
    */
   protected _clearFieldsCache() {
      // @ts-ignore
      this[$fieldsCache] = null;
      // @ts-ignore
      this[$fieldsClone] = null;
   }

   /**
    * Возвращает признак, что значение поля кэшируемое
    * @return {Boolean}
    * @protected
    */
   protected _isFieldValueCacheable(value): boolean {
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
    * @param {*} value Значение поля
    * @return {Boolean}
    */
   protected _haveToClone(value): boolean {
      return this._$cloneChanged && value && value['[Types/_entity/ICloneable]'];
   }

   /**
    * Возвращает значение поля из "сырых" данных, прогнанное через фабрику
    * @param {String} name Название поля
    * @return {*}
    * @protected
    */
   protected _getRawDataValue(name) {
      let adapter = this._getRawDataAdapter();
      if (!adapter.has(name)) {
         return;
      }

      let value = adapter.get(name);
      let format = this._getFieldFormat(name, adapter);

      return Factory.cast(
         value,
         this._getFieldType(format),
         {
            format: format,
            adapter: this._getAdapter()
         }
      );
   }

   /**
    * Конвертирует значение поля через фабрику и сохраняет его в "сырых" данных
    * @param {String} name Название поля
    * @param {*} value Значение поля
    * @param {Boolean} [compatible=false] Значение поля совместимо по типу
    * @return {*} Значение поля, сконвертированное фабрикой
    * @protected
    */
   protected _setRawDataValue(name, value, compatible?: boolean) {
      if (!compatible &&
         value &&
         value['[Types/_entity/FormattableMixin]']
      ) {
         this._checkAdapterCompatibility(value.getAdapter());
      }

      let adapter = this._getRawDataAdapter();

      value = Factory.serialize(value, {
         format: this._getFieldFormat(name, adapter),
         adapter: this.getAdapter()
      });

      adapter.set(name, value);

      return value;
   }

   /**
    * Уведомляет об изменении полей записи
    * @param {Object} [map] Измененные поля
    * @protected
    */
   protected _notifyChange(map?: Object) {
      map = map || {};
      this._childChanged(map);
      this._nextVersion();
      this._notify('onPropertyChange', map);
   }

   /**
    * Очищает информацию об измененных полях
    * @protected
    */
   protected _clearChangedFields() {
      // @ts-ignore
      this[$changedFields] = {};
   }

   /**
    * Возвращает признак наличия изменений в поле
    * @param {String} name Название поля
    * @return {Boolean}
    * @protected
    */
   protected _hasChangedField(name) {
      return this._changedFields.hasOwnProperty(name);
   }

   /**
    * Возвращает оригинальное значение измененного поля
    * @param {String} name Название поля
    * @return {*}
    * @protected
    */
   protected _getChangedFieldValue(name) {
      return this._changedFields[name];
   }

   /**
    * Устанавливает признак изменения поля
    * @param {String} name Название поля
    * @param {*} value Старое значение поля
    * @param {Boolean} byLink Значение изменилось по ссылке
    * @protected
    */
   protected _setChangedField(name, value, byLink?: boolean) {
      // @ts-ignore
      if (!this[$changedFields].hasOwnProperty(name)) {
         // @ts-ignore
         this[$changedFields][name] = [value, Boolean(byLink)];
      }
      switch (this._$state) {
         case STATES.UNCHANGED:
            this._$state = STATES.CHANGED;
            break;
      }
   }

   /**
    * Снимает признак изменения поля
    * @param {String} name Название поля
    * @protected
    */
   protected _unsetChangedField(name) {
      // @ts-ignore
      delete this[$changedFields][name];
   }

   //endregion

   //region Statics

   static get RecordState() {
      return STATES;
   }

   static get CACHE_MODE_OBJECTS() {
      return CACHE_MODE_OBJECTS;
   }

   static get CACHE_MODE_ALL() {
      return CACHE_MODE_ALL;
   }

   /**
    * @name Types/Entity/Record#addFieldTo
    * @function
    * Добавляет поле в запись. Если формат не указан, то он строится по типу значения поля.
    * @param {Types/Entity/Record} record Запись
    * @param {String} name Имя поля
    * @param {*} value Значение поля
    * @param {Object} [format] Формат поля
    * @static
    */
   static addFieldTo(record: Record, name: string, value: any, format?) {
      if (!format) {
         format = getValueType(value);
         if (!(format instanceof Object)) {
            format = {type: format};
         }
         format.name = name;
      }

      record.addField(format, undefined, value);
   }

   /**
    * @name Types/Entity/Record#fromObject
    * @function
    * Создает запись по объекту c учетом типов значений полей. Поля добавляются в запись в алфавитном порядке.
    * @example
    * <pre>
    * var record = Record.fromObject({
    *       id: 1,
    *       title: 'title'
    *    }, 'Types/entity:adapter.Json'),
    *    format = record.getFormat();
    * format.each(function(field) {
    *    console.log(field.getName() + ': ' + field.getType());
    * });
    * //output: 'id: Integer', 'title: String'
    * </pre>
    * @param {Object} data Объект вида "имя поля" -> "значение поля"
    * @param {String|Types/Adapter/IAdapter} [adapter='Types/entity:adapter.Json'] Адаптер для сырых данных
    * @return {Types/Entity/Record}
    * @static
    */
   static fromObject(data, adapter?) {
      if (data === null) {
         return data;
      }
      if (data && (data instanceof Record)) {
         return data;
      }

      let record = new Record({
         adapter: adapter || 'Types/entity:adapter.Json',
         format: []
      });

      let sortNames = [];
      for (let name in data) {
         if (data.hasOwnProperty(name)) {
            sortNames.push(name);
         }
      }
      sortNames = sortNames.sort();

      for (let i = 0, len = sortNames.length; i < len; i++) {
         let name = sortNames[i];
         let value = data[name];

         if (value === undefined) {
            continue;
         }

         Record.addFieldTo(record, name, value);
      }

      return record;
   }

   /**
    * @name Types/Entity/Record#filter
    * @function
    * Создает запись c набором полей, ограниченным фильтром.
    * @param {Types/Entity/Record} record Исходная запись
    * @param {Function(String, *): Boolean} callback Функция фильтрации полей, аргументами приходят имя поля и его значение. Должна вернуть boolean - прошло ли поле фильтр.
    * @return {Types/Entity/Record}
    * @static
    */
   static filter(record, callback) {
      let result = new Record({
         adapter: record.getAdapter()
      });
      let format = record.getFormat();

      format.each((field) => {
         let name = field.getName();
         let value = record.get(name);
         if (!callback || callback(name, value)) {
            result.addField(field);
            result.set(name, value);
         }
      });

      result.acceptChanges();

      return result;
   }

   /**
    * @name Types/Entity/Record#filterFields
    * @function
    * Создает запись c указанным набором полей
    * @param {Types/Entity/Record} record Исходная запись
    * @param {Array.<String>} fields Набор полей, которые следует оставить в записи
    * @return {Types/Entity/Record}
    * @static
    */
   static filterFields(record, fields) {
      if (!(fields instanceof Array)) {
         throw new TypeError('Argument "fields" should be an instance of Array');
      }

      return Record.filter(record, (name) => {
         return fields.indexOf(name) > -1;
      });
   }

   //endregion

   //region Deprecated

   /**
    * @deprecated
    */
   static extend(mixinsList:any, classExtender:any) {
      logger.error('Types/entity:Record', 'Method extend is deprecated, use ES6 extends or Core/core-extend');
      return coreExtend(this, mixinsList, classExtender);
   }

   //endregion
}

Record.prototype['[Types/_entity/Record]'] = true;
// @ts-ignore
Record.prototype['[Types/_collection/IEnumerable]'] = true;
// @ts-ignore
Record.prototype['[Types/_entity/ICloneable]'] = true;
// @ts-ignore
Record.prototype['[Types/_entity/IEquatable]'] = true;
// @ts-ignore
Record.prototype['[Types/_entity/IObject]'] = true;
// @ts-ignore
Record.prototype['[Types/_entity/IObservableObject]'] = true;
// @ts-ignore
Record.prototype['[Types/_entity/IProducible]'] = true;
// @ts-ignore
Record.prototype['[Types/_entity/IVersionable]'] = true;
// @ts-ignore
Record.prototype['[Types/_entity/relation/IReceiver]'] = true;
Record.prototype._moduleName = 'Types/entity:Record';

/**
 * {Object} Измененные поля и оригинальные значения
 */
// @ts-ignore
Record.prototype[$changedFields] = null;

Record.prototype._$state = STATES.DETACHED;
Record.prototype._$cacheMode = CACHE_MODE_OBJECTS;
Record.prototype._$cloneChanged = false;
Record.prototype._$owner = null;
Record.prototype._acceptedState = undefined;

//FIXME: backward compatibility for check via Core/core-instance::instanceOfModule()
Record.prototype['[WS.Data/Entity/Record]'] = true;
//FIXME: backward compatibility for check via Core/core-instance::instanceOfMixin()
Record.prototype['[WS.Data/Collection/IEnumerable]'] = true;
Record.prototype['[WS.Data/Entity/ICloneable]'] = true;

register('Types/entity:Record', Record, {instantiate: false});
