import Record, {IOptions as IRecordOptions, ISerializableState as IRecordSerializableState} from './Record';
import InstantiableMixin from './InstantiableMixin';
import {IState as IDefaultSerializableState} from './SerializableMixin';
import {IAdapter} from './adapter';
import {Compute} from './functor';
import {enumerator, EnumeratorCallback} from '../collection';
import {create, register} from '../di';
import {deprecateExtend, logger, mixin} from '../util';
import {Map, Set} from '../shim';

/**
 * Separator for path in object
 */
const ROUTE_SEPARATOR = '.';

interface IGetter extends Function {
    get: (name: string) => any;
    properties: string[];
}

interface ISetter extends Function {
    set: (name: string, value: any) => any;
    properties: string[];
}

interface IProperty {
    get: IGetter;
    set?: ISetter;
    default?: (name: string) => any;
}

// tslint:disable-next-line:no-empty-interface
interface IProperties<T> {
}

interface IOptions extends IRecordOptions {
   properties?: IProperties<IProperty>;
   keyProperty?: string;
}

interface ISerializableState extends IRecordSerializableState {
    $options: IOptions;
    _instanceId: string;
    _isDeleted: boolean;
    _defaultPropertiesValues: object;
}

/**
 * Абстрактная модель.
 * Модели обеспечивают доступ к данным и поведению объектов предметной области (сущностям).
 * Такими сущностями могут быть, например, товары, пользователи, документы - и другие предметы окружающего мира, которые вы моделируете в своем приложении.
 * @remark
 * В основе абстрактной модели лежит {@link Types/_entity/Record запись}.
 * Основные аспекты модели (дополнительно к аспектам записи):
 * <ul>
 *    <li>определение {@link Types/_entity/Model#properties собственных свойств} сущности;</li>
 *    <li>{@link Types/_entity/Model#keyProperty уникальный идентификатор сущности} среди ей подобных.</li>
 * </ul>
 *
 * Поведенческие аспекты каждой сущности реализуются ее прикладным модулем в виде публичных методов.
 * Прикладные модели могут внедряться в порождающие их объекты, такие как {@link Types/_source/Base#model источники данных} или {@link Types/_collection/RecordSet#model рекордсеты}.
 *
 * Для реализации конкретной модели используется наследование от абстрактной либо промежуточной.
 *
 * Для корректной сериализации и клонирования моделей необходимо выносить их в отдельные модули и указывать имя модуля в свойстве _moduleName каждого наследника:
 * <pre>
 *     //My/Awesome/Model.ts
 *     import {Model} from 'Types/entity';
 *     export default class AwesomeModel extends Model {
 *         protected _moduleName: string = 'My/Awesome/Model';
 *         //...
 *     });
 *
 *     return AwesomeModel;
 * </pre>
 *
 * Определим модель пользователя:
 * <pre>
 *     //My/Awesome/Model.ts
 *     import {Salt} from 'Application/Lib';
 *     import {Model} from 'Types/entity';
 *
 *    export default class User extends Model{
 *       protected _$format: object[] = [
 *          {name: 'login', type: 'string'},
 *          {name: 'salt', type: 'string'}
 *       ];
 *       protected _$keyProperty: string = 'login';
 *       authenticate(password: string): boolean {
 *          return Salt.encode(this.get('login') + ':' + password) === this.get('salt');
 *       }
 *     });
 * </pre>
 * Создадим модель пользователя:
 * <pre>
 *     //Application/Controller/Test/Auth.ts
 *     import User from 'Application/Model/User';
 *
 *     const user = new User();
 *     user.set({
 *         login: 'i.c.wiener',
 *         salt: 'grhS2Nys345fsSW3mL9'
 *     });
 *     const testOk = user.authenticate('its pizza time!');
 * </pre>
 *
 * Модели могут объединяться по принципу "матрёшки" - сырыми данными одной модели является другая модель. Для организации такой структуры следует использовать {@link Types/_entity/adapter/RecordSet адаптер рекордсета}:
 * <pre>
 *     import {Model, adapter} from 'Types/entity';
 *
 *     class MyEngine extends Model {
 *         protected _$properties = {
 *             fuelType: {
 *                 get() {
 *                     return 'Diesel';
 *                 }
 *             }
 *         }
 *     }
 *
 *     class MyTransmission extends Model {
 *         protected _$properties = {
 *             transmissionType: {
 *                 get() {
 *                     return 'Manual';
 *                 }
 *             }
 *         }
 *     }
 *
 *     const myCar = new MyEngine({
 *         rawData: new MyTransmission({
 *             rawData: {
 *                 color: 'Red',
 *                 fuelType: '',
 *                 transmissionType: ''
 *             }
 *         }),
 *         adapter: new adapter.RecordSet()
 *     });
 *
 *     console.log(myCar.get('fuelType')); // 'Diesel'
 *     console.log(myCar.get('transmissionType')); // 'Manual'
 *     console.log(myCar.get('color')); // 'Red'
 * </pre>
 * @class Types/_entity/Model
 * @extends Types/_entity/Record
 * @mixes Types/_entity/InstantiableMixin
 * @public
 * @ignoreMethods getDefault
 * @author Мальцев А.А.
 */
export default class Model extends mixin<
    Record, InstantiableMixin
>(
   Record, InstantiableMixin
) {
   /**
    * @typedef {Object} Property
    * @property {*|Function} [def] Значение по умолчанию (используется, если свойства нет в сырых данных).
    * @property {Function} [get] Метод, возвращающий значение свойства. Первым аргументом придет значение свойства в сырых данных (если оно там есть).
    * @property {Function} [set] Метод, устанавливающий значение свойства. Если метод вернет значение, отличное от undefined, то будет осуществлена попытка сохранить его в сырых данных.
    */

    /**
     * @cfg {Object.<Property>} Описание собственных свойств модели. Дополняет/уточняет свойства, уже существующие в сырых данных.
     * @name Types/_entity/Model#properties
     * @see Property
     * @see getProperties
     * @example
     * Создадим модель пользователя со свойствами:
     * <ul>
     *     <li>id (чтение/запись, динамическая конвертация, хранится в сырых данных)</li>
     *     <li>group (чтение/запись, хранится в защищенном свойстве)</li>
     *     <li>guid (только чтение, значение по умолчанию генерируется динамически)</li>
     * </ul>
     * <pre>
     *     import {Model} from 'Types/entity';
     *
     *     interface IGroup {
     *         id: sting
     *         name: sting
     *     }
     *
     *     export default class User extends Model {
     *         protected _$properties: object = {
     *             id: {
     *                 get(value) {
     *                     return '№' + value;
     *                 },
     *                 set(value) {
     *                     return (value + '')[0] === '№' ? value.substr(1) : value;
     *                 }
     *             },
     *             group: {
     *                 get() {
     *                     return this._group;
     *                 },
     *                 set(value) {
     *                     this._group = value;
     *                 }
     *             },
     *             guid: {
     *                 def() {
     *                     return Math.random() * 999999999999999;
     *                 },
     *                 get(value) {
     *                     return value;
     *                 }
     *             }
     *         },
     *         protected _group: IGroup = null
     *     }
     *
     *     const user = new User({
     *         rawData: {
     *             id: 5,
     *             login: 'Keanu',
     *             firstName: 'Johnny',
     *             lastName: 'Mnemonic',
     *             job: 'Memory stick'
     *         }
     *     });
     *
     *     console.log(user.get('id'));//№5
     *     console.log(user.get('group'));//null
     *     console.log(user.get('guid'));//010a151c-1160-d31d-11b3-18189155cc13
     *     console.log(user.get('job'));//Memory stick
     *     console.log(user.get('uptime'));//undefined
     *
     *     user.set('id', '№6');
     *     console.log(user.getRawData().id);//6
     *
     *     user.set('group', {id: 1, name: 'The One'});
     *     console.log(user.get('group'));//{id: 1, name: 'The One'}
     *
     *     user.set('guid', 'new-one');//ReferenceError 'Model::set(): property "guid" is read only'
     * </pre>
     * Создадим модель пользователя со свойством displayName, которое вычисляется с использованием значений других свойств:
     * <pre>
     *     import {Model} from 'Types/entity';
     *
     *     export default class User extends {
     *         protected _$properties: Object = {
     *             displayName: {
     *                 get() {
     *                    return this.get('firstName') + ' a.k.a "' + this.get('login') + '" ' + this.get('lastName');
     *                 }
     *             }
     *         }
     *     });
     *
     *     const user = new User({
     *         rawData: {
     *             login: 'Keanu',
     *             firstName: 'Johnny',
     *             lastName: 'Mnemonic'
     *         }
     *     });
     *     console.log(user.get('displayName'));//Johnny a.k.a "Keanu" Mnemonic
     * </pre>
     * Можно явно указать список свойств, от которых зависит другое свойство. В этом случае для свойств-объектов будет сбрасываться кэш, хранящий результат предыдущего вычисления:
     * <pre>
     *     import {Model, functor} from 'Types/entity';
     *
     *     export default class User extends {
     *         protected _$properties: object = {
     *             birthDay: {
     *                 get: new functor.Compute(function() {
     *                     return this.get('facebookBirthDay') || this.get('linkedInBirthDay');
     *                 }, ['facebookBirthDay', 'linkedInBirthDay'])
     *             }
     *         }
     *     }
     *
     *     const user = new User();
     *     user.set('linkedInBirthDay', new Date(2010, 1, 2));
     *     console.log(user.get('birthDay'));//Tue Feb 02 2010 00:00:00
     *
     *     user.set('facebookBirthDay', new Date(2011, 3, 4));
     *     console.log(user.get('birthDay'));//Mon Apr 04 2011 00:00:00
     * </pre>
     */
    protected _$properties: IProperties<IProperty>;

   /**
    * @cfg {String} Название свойства, содержащего первичный ключ
    * @name Types/_entity/Model#keyProperty
    * @see getKeyProperty
    * @see setKeyProperty
    * @see getId
    * @example
    * Зададим первичным ключом модели свойство с названием id:
    * <pre>
    *    var article = new Model({
    *       keyProperty: 'id',
    *       rawData: {
    *          id: 1,
    *          title: 'How to make a Model'
    *       }
    *    });
    *    article.getId();//1
    * </pre>
    */
   protected _$keyProperty: string;

    /**
     * The model is deleted in data source which it's taken from
     */
    protected _isDeleted: boolean;

    /**
     * The model is changed
     */
    protected _isChanged: boolean;

    /**
     * Default values of calculated properties
     */
    protected _defaultPropertiesValues: object;

    /**
     * Properties dependency map like 'property name' -> ['property names that depend of that one']
     */
    protected _propertiesDependency: Map<string, Set<string>>;

    /**
     * Property name which now gathering dependencies for
     */
    protected _propertiesDependencyGathering: string;

    /**
     * Properties injected via constructor options
     */
    protected _propertiesInjected: boolean;

    /**
     * Properties names which calculating right now
     */
    protected _calculatingProperties: Set<string>;

    /**
     * Properties names and values which affected during the recurseve set() calls
     */
    protected _deepChangedProperties: object;

    constructor(options?: IOptions) {
        super(options);

        // TODO: don't allow to inject properties through constructor
        this._propertiesInjected = options && 'properties' in options;

        // Support deprecated  option 'idProperty'
        if (!this._$keyProperty && options && (options as any).idProperty) {
            this._$keyProperty = (options as any).idProperty;
        }

        // FIXME: backward compatibility for _options
        if (this._options) {
            // for _$properties
            if (this._options.properties) {
                const properties = {};
                Object.assign(properties, this._$properties);
                Object.assign(properties, this._options.properties);
                this._$properties = properties;
            }

            // for _$keyProperty get from deprecated option 'idProperty'
            if (!this._$keyProperty && this._options.idProperty) {
                this._$keyProperty = this._options.idProperty;
            }
        }

        if (!this._$keyProperty) {
            this._$keyProperty = (this._getAdapter() as IAdapter).getKeyField(this._getRawData()) || '';
        }
   }

    destroy(): void {
        this._defaultPropertiesValues = null;
        this._propertiesDependency = null;
        this._calculatingProperties = null;
        this._deepChangedProperties = null;

        super.destroy();
    }

    // region IObject

    get(name: string): any {
        this._pushDependency(name);

        if (this._fieldsCache.has(name)) {
            return this._fieldsCache.get(name);
        }

        const property = this._$properties && this._$properties[name];

        const superValue = super.get(name);
        if (!property) {
            return superValue;
        }

        let preValue = superValue;
        if ('def' in property && !this._getRawDataAdapter().has(name)) {
            preValue = this.getDefault(name);
        }

        if (!property.get) {
            return preValue;
        }

        const value = this._processCalculatedValue(name, preValue, property, true);

        if (value !== superValue) {
            this._removeChild(superValue);
            this._addChild(value, this._getRelationNameForField(name));
        }

        if (this._isFieldValueCacheable(value)) {
            this._fieldsCache.set(name, value);
        } else if (this._fieldsCache.has(name)) {
            this._fieldsCache.delete(name);
        }

        return value;
    }

    set(name: string | object, value?: any): void {
        if (!this._$properties) {
            super.set(name, value);
            return;
        }

        const map = this._getHashMap(name, value);
        const pairs = [];
        const propertiesErrors = [];
        const isCalculating = this._calculatingProperties ? this._calculatingProperties.size > 0 : false;

        Object.keys(map).forEach((key) => {
            this._deleteDependencyCache(key);

            // Try to set every property
            let value = map[key];
            try {
                const property = this._$properties && this._$properties[key];
                if (property) {
                    if (property.set) {
                        // Remove cached value
                        if (this._fieldsCache.has(key)) {
                            this._removeChild(
                                this._fieldsCache.get(key)
                            );
                            this._fieldsCache.delete(key);
                        }

                        value = this._processCalculatedValue(key, value, property, false);
                        if (value === undefined) {
                            return;
                        }
                    } else if (property.get) {
                        propertiesErrors.push(new ReferenceError(`Property "${key}" is read only`));
                        return;
                    }
                }

                pairs.push([key, value, Record.prototype.get.call(this, key)]);
            } catch (err) {
                // Collecting errors for every property
                propertiesErrors.push(err);
            }
        });

        // Collect pairs of properties
        const pairsErrors = [];
        let changedProperties = super._setPairs(pairs, pairsErrors);
        if (isCalculating && changedProperties) {
            // Here is the set() that recursive calls from another set() so just accumulate the changes
            this._deepChangedProperties = this._deepChangedProperties || {};
            Object.assign(this._deepChangedProperties, changedProperties);
        } else if (!isCalculating && this._deepChangedProperties) {
            // Here is the top level set() so do merge with accumulated changes
            if (changedProperties) {
                Object.assign(this._deepChangedProperties, changedProperties);
            }
            changedProperties = this._deepChangedProperties;
            this._deepChangedProperties = null;
        }

        // It's top level set() so notify changes if have some
        if (!isCalculating && changedProperties) {
            const changed = Object.keys(changedProperties).reduce((memo, key) => {
                memo[key] = this.get(key);
                return memo;
            }, {});
            this._notifyChange(changed);
        }

        this._checkErrors([...propertiesErrors, ...pairsErrors]);
    }

    has(name: string): boolean {
        return (this._$properties && this._$properties.hasOwnProperty(name)) || super.has(name);
    }

    // endregion

    // region IEnumerable

    /**
     * Возвращает энумератор для перебора названий свойств модели
     * @return {Types/_collection/ArrayEnumerator}
     * @example
     * Смотри пример {@link Types/_entity/Record#getEnumerator для записи}:
     */
    getEnumerator(): enumerator.Arraywise<any> {
        return create<enumerator.Arraywise<any>>('Types/collection:enumerator.Arraywise', this._getAllProperties());
    }

    /**
     * Перебирает все свойства модели (включая имеющиеся в "сырых" данных)
     * @param {Function(String, *)} callback Ф-я обратного вызова для каждого свойства. Первым аргументом придет название свойства, вторым - его значение.
     * @param {Object} [context] Контекст вызова callback.
     * @example
     * Смотри пример {@link Types/_entity/Record#each для записи}:
     */
    each(callback: EnumeratorCallback<any>, context?: object): void {
        return super.each(callback, context);
    }

    // endregion

    // region IReceiver

    relationChanged(which: any, route: string[]): any {
        // Delete cache for properties related of changed one use in-deep route
        const curr = [];
        const routeLastIndex = route.length - 1;
        route.forEach((name, index) => {
            const fieldName = this._getFieldFromRelationName(name);
            curr.push(fieldName);
            if (fieldName) {
                this._deleteDependencyCache(curr.join(ROUTE_SEPARATOR));

                if (index === routeLastIndex && which.data instanceof Object) {
                    Object.keys(which.data).forEach((key) => {
                        this._deleteDependencyCache(curr.concat([key]).join(ROUTE_SEPARATOR));
                    });
                }
            }
        });

        return super.relationChanged(which, route);
    }

    // endregion

    // region SerializableMixin

    _getSerializableState(state: IDefaultSerializableState): ISerializableState {
        const resultState = super._getSerializableState(state) as ISerializableState;

        // Properties are owned by class, not by instance
        if (!this._propertiesInjected) {
            delete resultState.$options.properties;
        }

        resultState._instanceId = this.getInstanceId();
        resultState._isDeleted = this._isDeleted;
        if (this._defaultPropertiesValues) {
            resultState._defaultPropertiesValues = this._defaultPropertiesValues;
        }

        return resultState;
    }

    _setSerializableState(state: ISerializableState): Function {
        const fromSuper = super._setSerializableState(state);
        return function(): void {
            fromSuper.call(this);

            this._instanceId = state._instanceId;
            this._isDeleted = state._isDeleted;
            if (state._defaultPropertiesValues) {
                this._defaultPropertiesValues = state._defaultPropertiesValues;
            }
        };
    }

    // endregion

    // region Record

    rejectChanges(fields: string[], spread?: boolean): void {
        super.rejectChanges(fields, spread);
        if (!(fields instanceof Array)) {
            this._isChanged = false;
        }
    }

    acceptChanges(fields: string[], spread?: boolean): void {
        super.acceptChanges(fields, spread);
        if (!(fields instanceof Array)) {
            this._isChanged = false;
        }
    }

    isChanged(name?: string): boolean {
        if (!name && this._isChanged) {
            return true;
        }
        return super.isChanged(name);
    }

    // endregion

    // region Public methods

    /**
     * Возвращает описание свойств модели.
     * @return {Object.<Property>}
     * @see properties
     * @see Property
     * @example
     * Получим описание свойств модели:
     * <pre>
     *     import {Model} from 'Types/entity';
     *
     *     class User extends Model {
     *         protected _$properties = {
     *             id: {
     *                 get() {
     *                     return this._id;
     *                 },
     *                 set(value) {
     *                     this._id = value;
     *                 }
     *             },
     *             group: {
     *                 get() {
     *                     return this._group;
     *                 }
     *             }
     *         },
     *         protected _id: 0
     *         protected _group: null
     *     }
     *
     *     const user = new User();
     *
     *     console.log(user.getProperties()); // {id: {get: Function, set: Function}, group: {get: Function}}
     * </pre>
     */
    getProperties(): IProperties<IProperty> {
        return this._$properties;
    }

    /**
     * Возвращает значение свойства по умолчанию
     * @param {String} name Название свойства
     * @return {*}
     * @example
     * Получим дефолтное значение свойства id:
     * <pre>
     *     import {Model} from 'Types/entity';
     *
     *     class User extends Model {
     *         protected _$properties = {
     *             id: {
     *                 get() {
     *                     this._id;
     *                 },
     *                 def(value) {
     *                     return Date.now();
     *                 }
     *             }
     *         },
     *         protected _id: 0
     *     }
     *
     *     const user = new User();
     *     console.log(user.getDefault('id')); // 1466419984715
     *     setTimeout(function(){
     *         console.log(user.getDefault('id')); // still 1466419984715
     *     }, 1000);
     * </pre>
     */
    getDefault(name: string): any {
        let defaultPropertiesValues = this._defaultPropertiesValues;
        if (!defaultPropertiesValues) {
            defaultPropertiesValues = this._defaultPropertiesValues = {};
        }

        if (!defaultPropertiesValues.hasOwnProperty(name)) {
            const property = this._$properties[name];
            if (property && 'def' in property) {
                defaultPropertiesValues[name] = [
                    property.def instanceof Function ? property.def.call(this) : property.def
                ];
            } else {
                defaultPropertiesValues[name] = [];
            }
        }
        return defaultPropertiesValues[name][0];
    }

    /**
     * Объединяет модель с данными другой модели
     * @param {Types/_entity/Model} model Модель, с которой будет произведено объединение
     * @example
     * Объединим модели пользователя и группы пользователей:
     * <pre>
     *     var user = new Model({
     *             rawData: {
     *                 id: 1,
     *                 login: 'user1',
     *                 group_id: 3
     *             }
     *         }),
     *         userGroup = new Model({
     *             rawData: {
     *                 group_id: 3,
     *                 group_name: 'Domain Users',
     *                 group_members: 126
     *             }
     *         });
     *
     *     user.merge(userGroup);
     *     user.get('id');//1
     *     user.get('group_id');//3
     *     user.get('group_name');//'Domain Users'
     * </pre>
     */
    merge(model: Model): void {
        if (model === this) {
            return;
        }
        try {
            const modelData = {};
            model.each((key, val) => {
                modelData[key] = val;
            });
            this.set(modelData);
        } catch (e) {
            if (e instanceof ReferenceError) {
                logger.info(this._moduleName + '::merge(): ' + e.toString());
            } else {
                throw e;
            }
        }
    }

   /**
    * Возвращает значение первичного ключа модели
    * @return {*}
    * @see keyProperty
    * @see getKeyProperty
    * @see setKeyProperty
    * @example
    * Получим значение первичного ключа статьи:
    * <pre>
    *    var article = new Model({
    *       keyProperty: 'id',
    *       rawData: {
    *          id: 1,
    *          title: 'How to make a Model'
    *       }
    *    });
    *    article.getId();//1
    * </pre>
    */
   getId(): any {
      const keyProperty = this.getKeyProperty();
      if (!keyProperty) {
         logger.info(this._moduleName + '::getId(): keyProperty is not defined');
         return undefined;
      }
      return this.get(keyProperty);
   }

   /**
    * Возвращает название свойства, в котором хранится первичный ключ модели
    * @return {String}
    * @see keyProperty
    * @see setKeyProperty
    * @see getId
    * @example
    * Получим название свойства первичного ключа:
    * <pre>
    *    var article = new Model({
    *       keyProperty: 'id',
    *       rawData: {
    *          id: 1,
    *          title: 'How to make a Model'
    *       }
    *    });
    *    article.getKeyProperty();//'id'
    * </pre>
    */
   getKeyProperty(): string {
      return this._$keyProperty;
   }

   /**
    * Устанавливает название свойства, в котором хранится первичный ключ модели
    * @param {String} keyProperty Название свойства для первичного ключа модели.
    * @see keyProperty
    * @see getKeyProperty
    * @see getId
    * @example
    * Зададим название свойства первичного ключа:
    * <pre>
    *    var article = new Model({
    *       rawData: {
    *          id: 1,
    *          title: 'How to make a Model'
    *       }
    *    });
    *    article.setKeyProperty('id');
    *    article.getId();//1
    * </pre>
    */
   setKeyProperty(keyProperty: string): void {
      if (keyProperty && !this.has(keyProperty)) {
         logger.info(this._moduleName + '::setKeyProperty(): property "' + keyProperty + '" is not defined');
         return;
      }
      this._$keyProperty = keyProperty;
   }

    // endregion

    // region Protected methods

    /**
     * Возвращает массив названий всех свойств (включая свойства в "сырых" данных)
     * @protected
     */
    protected _getAllProperties(): string[] {
        const fields = this._getRawDataFields();
        if (!this._$properties) {
            return fields;
        }

        const objProps = this._$properties;
        const props = Object.keys(objProps);
        return props.concat(fields.filter((field) => {
            return !objProps.hasOwnProperty(field);
        }));
    }

    /**
     * Вычисляет/записывает значение свойства
     * @param name Имя свойства
     * @param value Значение свойства
     * @param property Описание свойства
     * @param isReading Вычисление или запись
     * @protected
     */
    protected _processCalculatedValue(name: string, value: any, property: IProperty, isReading?: boolean): any {
        // Check for recursive calculating
        let calculatingProperties = this._calculatingProperties;
        if (!calculatingProperties) {
            calculatingProperties = this._calculatingProperties = new Set();
        }
        const checkKey = name + '|' + isReading;
        if (calculatingProperties.has(checkKey)) {
            throw new Error(`Recursive value ${isReading ? 'reading' : 'writing'} detected for property "${name}"`);
        }

        // Initial conditions
        const method = isReading ? property.get : property.set;
        const isFunctor = isReading && Compute.isFunctor(method);
        const doGathering = isReading && !isFunctor;

        // Automatic dependencies gathering
        let prevGathering;
        if (isReading) {
            prevGathering = this._propertiesDependencyGathering;
            this._propertiesDependencyGathering = doGathering ? name : '';
        }

        // Save user defined dependencies
        if (isFunctor) {
            method.properties.forEach((dependFor) => {
                this._pushDependencyFor(dependFor, name);
            });
        }

        // Get or set property value
        try {
            calculatingProperties.add(checkKey);
            value = method.call(this, value);
        } finally {
            if (isReading) {
                this._propertiesDependencyGathering = prevGathering;
            }
            calculatingProperties.delete(checkKey);
        }

        return value;
    }

    /**
     * Добавляет зависимое свойство для текущего рассчитываемого
     * @param name Название свойства.
     * @protected
     */
    protected _pushDependency(name: string): void {
        if (this._propertiesDependencyGathering && this._propertiesDependencyGathering !== name) {
            this._pushDependencyFor(name, this._propertiesDependencyGathering);
        }
    }

    /**
     * Добавляет зависимое свойство
     * @param name Название свойства.
     * @param dependFor Название свойства, котороое зависит от name
     * @protected
     */
    protected _pushDependencyFor(name: string, dependFor: string): void {
        let propertiesDependency = this._propertiesDependency;
        if (!propertiesDependency) {
            propertiesDependency = this._propertiesDependency = new Map();
        }

        let data;
        if (propertiesDependency.has(name)) {
            data = propertiesDependency.get(name);
        } else {
            data = new Set();
            propertiesDependency.set(name, data);
        }
        if (!data.has(dependFor)) {
            data.add(dependFor);
        }
    }

    /**
     * Удаляет закешированное значение для свойства и всех от него зависимых свойств
     * @param name Название свойства.
     * @protected
     */
    protected _deleteDependencyCache(name: string): void {
        const propertiesDependency = this._propertiesDependency;

        if (propertiesDependency && propertiesDependency.has(name)) {
            propertiesDependency.get(name).forEach((related) => {
                this._removeChild(this._fieldsCache.get(related));
                const wasCached = this._fieldsCache.delete(related);
                this._fieldsClone.delete(related);
                // If cached property cleared that means it's not changed.
                if (wasCached) {
                     this._unsetChangedField(related);
                }

                this._deleteDependencyCache(related);
            });
        }
    }

    // endregion

    // region Statics

    static fromObject(data: any, adapter: IAdapter): Model | null {
        const record = Record.fromObject(data, adapter);
        if (!record) {
            return null;
        }
        return new Model({
            rawData: record.getRawData(true),
            adapter: record.getAdapter(),
            //@ts-ignore
            format: record._getFormat(true)// "Anakin, I Am Your Son"
        });
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
              'Types/_entity/Model'
         );
    }

    // endregion
}

Object.assign(Model.prototype, {
   '[Types/_entity/Model]': true,
   _moduleName: 'Types/entity:Model',
   _instancePrefix: 'model-',
   _$properties: null,
   _$keyProperty: '',
   _isDeleted: false,
   _defaultPropertiesValues: null,
   _propertiesDependency: null,
   _propertiesDependencyGathering: '',
   _calculatingProperties: null,
   _deepChangedProperties: null,
   getIdProperty: Model.prototype.getKeyProperty,
   setIdProperty: Model.prototype.setKeyProperty
});

// FIXME: backward compatibility for Core/core-extend: Model should have exactly its own property 'produceInstance'
// @ts-ignore
Model.produceInstance = Record.produceInstance;

register('Types/entity:Model', Model, {instantiate: false});
// FIXME: deprecated
register('entity.model', Model);
