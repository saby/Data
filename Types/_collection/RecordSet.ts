/// <amd-module name="Types/_collection/RecordSet" />
/**
 * Рекордсет - список записей, имеющих общий формат полей.
 *
 * Основные аспекты рекордсета (дополнительно к аспектам {@link Types/_collection/ObservableList}):
 * <ul>
 *    <li>манипуляции с форматом полей. За реализацию аспекта отвечает примесь {@link Types/_entity/FormattableMixin};</li>
 *    <li>манипуляции с сырыми данными посредством адаптера. За реализацию аспекта отвечает примесь {@link Types/_entity/FormattableMixin}.</li>
 * </ul>
 * Элементами рекордсета могут быть только {@link Types/_entity/Record записи}, причем формат полей всех записей должен совпадать.
 *
 * Создадим рекордсет, в котором в качестве сырых данных используется JSON (адаптер для данных в таком формате используется по умолчанию):
 * <pre>
 *    require(['Types/collection'], function (collection) {
 *       var characters = new collection.RecordSet({
 *          rawData: [{
 *             id: 1,
 *             firstName: 'Tom',
 *             lastName: 'Sawyer'
 *          }, {
 *             id: 2,
 *             firstName: 'Huckleberry',
 *             lastName: 'Finn'
 *          }]
 *       });
 *       characters.at(0).get('firstName');//'Tom'
 *       characters.at(1).get('firstName');//'Huckleberry'
 *    });
 * </pre>
 * Создадим рекордсет, в котором в качестве сырых данных используется ответ БЛ СБИС (адаптер для данных в таком формате укажем явно):
 * <pre>
 *    require([
 *       'Types/collection',
 *       'Types/source'
 *    ], function (collection, source) {
 *       var ds = new source.SbisService({endpoint: 'Employee'});
 *       ds.call('list', {department: 'designers'}).addCallback(function(response) {
 *          var designers = new collection.RecordSet({
 *             rawData: response.getRawData(),
 *             adapter: response.getAdapter()
 *          });
 *          console.log(designers.getCount());
 *       });
 *    });
 * </pre>
 * @class Types/_collection/RecordSet
 * @extends Types/_collection/ObservableList
 * @implements Types/_entity/IObjectNotify
 * @implements Types/_entity/IInstantiable
 * @implements Types/_entity/IProducible
 * @mixes Types/_entity/FormattableMixin
 * @mixes Types/_entity/InstantiableMixin
 * @ignoreOptions items
 * @author Мальцев А.А.
 * @public
 */

import IObservable from './IObservable';
import ObservableList from './ObservableList';
import Arraywise from './enumerator/Arraywise';
import Indexer from './Indexer';
import {
   FormattableMixin,
   IObservableObject,
   IInstantiable,
   IProducible,
   InstantiableMixin,
   factory,
   Record
} from '../entity';
import {create, register} from '../di';
import {mixin, logger} from '../util';
import {isEqual} from '../object';

const DEFAULT_MODEL = 'Types/entity:Model';
const RECORD_STATE = Record.RecordState;
let developerMode = false;

/**
 *
 * @param value
 * @param idProperty
 */
function checkNullId(value, idProperty) {
   if (developerMode && idProperty) {
      if (value && value['[Types/_entity/Record]'] && value.get(idProperty) === null) {
         logger.info('Types/_collection/RecordSet: Id propery must not be null');
      } else if (value instanceof RecordSet) {
         value.each((item) => {
            checkNullId(item, idProperty);
         });
      }
   }
}

export default class RecordSet<Record> extends mixin(
   ObservableList,
   FormattableMixin,
   InstantiableMixin,
) implements IObservableObject, IInstantiable, IProducible /** @lends Types/_collection/RecordSet.prototype */{

   /**
    * @typedef {Object} MergeOptions
    * @property {Boolean} [add=true] Добавлять новые записи.
    * @property {Boolean} [remove=true] Удалять отсутствующие записи.
    * @property {Boolean} [replace=true] Заменять одинаковые записи.
    * @property {Boolean} [inject=false] Заменять данные одинаковых записей.
    */

   /**
    * @cfg {String|Function} Конструктор записей, порождаемых рекордсетом. По умолчанию {@link Types/_entity/Model}.
    * @name Types/_collection/RecordSet#model
    * @see getModel
    * @see Types/_entity/Record
    * @see Types/_entity/Model
    * @see Types/di
    * @example
    * Внедрим конструктор пользовательской модели:
    * <pre>
    *    //App/Models/User.js
    *    import {Model} from 'Types/entity';
    *    export default class User extends Model {
    *       identify(login: string, password: string): boolean {
    *          //...some logic here
    *       }
    *    }
    *
    *    //App/Models/UsersList.js
    *    import User from './User';
    *    import {RecordSet} from 'Types/collection';
    *    const users = new RecordSet({
    *       model: User,
    *       rawData: [{
    *          id: 1,
    *          login: 'editor',
    *          salt: '1fhj46hF'
    *          password: 'dfyTEv4thDD343hIIdS'
    *       }]
    *    });
    *    users.at(0).identify('editor', 'L1keABo$$');
    * </pre>
    */
   protected _$model: Function | string;

   /**
    * @cfg {String} Название свойства записи, содержащего первичный ключ.
    * @name Types/_collection/RecordSet#idProperty
    * @see getIdProperty
    * @example
    * Создадим рекордсет, получим запись по первичному ключу:
    * <pre>
    *    require(['Types/collection'], function (collection) {
    *       var users = new collection.RecordSet({
    *          idProperty: 'id'
    *          rawData: [{
    *             id: 134,
    *             login: 'editor'
    *          }, {
    *             id: 257,
    *             login: 'shell'
    *          }]
    *       });
    *       users.getRecordById(257).get('login');//'shell'
    *    });
    * </pre>
    */
   protected _$idProperty: string;

   /**
    * @cfg {Object} Метаданные
    * @remark
    * Метаданные - это дополнительная информация, не связанная с RecordSet'ом напрямую.
    * Она используется механизмами списков для построения строки итогов, "хлебных крошек" и постраничной навигации.
    * Существуют три служебных поля в метаданных:
    * <ul>
    * <li>path - путь для "хлебных крошек", возвращается как {@link Types/_collection/RecordSet};</li>
    * <li>results - строка итогов, возвращается как {@link Types/_entity/Record}. Подробнее о конфигурации списков для отображения строки итогов читайте в {@link https://wi.sbis.ru/doc/platform/developmentapl/interfacedev/components/list/list-settings/list-visual-display/results/ этом разделе};</li>
    * <li>more - Boolean - есть ли есть записи для подгрузки (используется для постраничной навигации).</li>
    * </ul>
    * @name Types/_collection/RecordSet#metaData
    * @see getMetaData
    * @see setMetaData
    * @example
    * Создадим рекордсет c "хлебными крошками":
    * <pre>
    *    require(['Types/_collection/RecordSet'], function (RecordSet) {
    *       var rs = new RecordSet({
    *          metaData: {
    *             crumbs: [{
    *                id: 1,
    *                name: 'Home'
    *             }, {
    *                id: 2,
    *                name: 'Catalogue'
    *             }]
    *          },
    *       });
    *
    *       var crumbs = rs.getMetaData().crumbs;
    *       console.log(crumbs[0].name);//'Home'
    *    });
    * </pre>
    */
   protected _$metaData: any;

   /**
    * @cfg {Types/_entity/format/Format|Array.<Types/_entity/format/FieldsFactory/FieldDeclaration.typedef>} Формат всех полей метаданных.
    * @name Types/_collection/RecordSet#metaFormat
    * @example
    * Создадим рекордсет с метаданным, поле created которых имеет тип Date
    * <pre>
    *    require(['Types/collection'], function(collection) {
    *       var events = new collection.RecordSet({
    *          metaData: {
    *             created: '2001-09-11'
    *          },
    *          metaFormat: [{
    *             name: 'created',
    *             type: Date
    *          }]
    *       });
    *
    *       console.log(events.getMetaData().created instanceof Date);//true
    *    });
    * </pre>
    */
   protected _$metaFormat: any;

   /**
    * Модель по умолчанию
    */
   protected _defaultModel: string;

   /**
    * Метаданные - локальная обработанная копия _$metaData
    */
   protected _metaData: any;

   constructor(options?) {
      if (options) {
         if ('items' in options) {
            logger.stack('Types/_collection/RecordSet: option "items" give no effect, use "rawData" instead', 1);
         }
      }

      super(options);

      if (options) {
         if ('meta' in options) {
            this._$metaData = options.meta;
         }
      }

      //Model can have it's own format. Inherit that format if RecordSet's format is not defined.
      //FIXME: It only works with model's constructor injection not string alias
      if (!this._$format && this._$model && typeof this._$model === 'function' && this._$model.prototype._$format) {
         this._$format = this._$model.prototype._$format;
      }

      FormattableMixin.constructor.call(this, options);

      if (!this._$idProperty) {
         this._$idProperty = this._getAdapter().getKeyField(this._getRawData());
      }

      if (this._$rawData) {
         this._assignRawData(this._getRawData(true), true);
         this._initByRawData();
      }

      this._publish('onPropertyChange');
   }

   destroy() {
      this._$model = '';
      this._$metaData = null;
      this._metaData = null;

      super.destroy();
   }

   //region IReceiver

   relationChanged(which: any, route: Array<string>): any {
      let index = this.getIndex(which.target);
      if (index > -1) {
         // Apply record's raw data to the self raw data if necessary
         let adapter = this._getRawDataAdapter();
         let selfData = adapter.at(index);
         let recordData = which.target.getRawData(true);
         if (selfData !== recordData) {
            this._getRawDataAdapter().replace(
               recordData,
               index
            );
         }
      }

      return super.relationChanged(which, route);
   }

   //endregion IReceiver

   //region IInstantiable

   readonly '[Types/_entity/IInstantiable]': boolean;

   getInstanceId: () => string;

   //endregion IInstantiable

   //region IObservableObject

   readonly '[Types/_entity/IObservableObject]': boolean;

   //endregion IObservableObject

   //region ICloneable

   clone(shallow) {
      let clone = super.clone(shallow);
      if (shallow) {
         clone._$items = this._$items.slice();
      }
      return clone;
   }

   //endregion ICloneable

   //region IProducible

   readonly '[Types/_entity/IProducible]': boolean;

   static produceInstance(data, options) {
      let instanceOptions: any = {
         rawData: data
      };
      if (options) {
         if (options.adapter) {
            instanceOptions.adapter = options.adapter;
         }
         if (options.model) {
            instanceOptions.model = options.model;
         }
      }
      return new this(instanceOptions);
   }

   //endregion IProducible

   //region IEquatable

   isEqual(to) {
      if (to === this) {
         return true;
      }
      if (!to) {
         return false;
      }
      if (!(to instanceof RecordSet)) {
         return false;
      }

      //TODO: compare using formats
      return isEqual(
         this._getRawData(),
         to.getRawData(true)
      );
   }

   //endregion IEquatable

   //region IEnumerable

   /**
    * Возвращает энумератор для перебора записей рекордсета.
    * Пример использования можно посмотреть в модуле {@link Types/_collection/IEnumerable}.
    * @param {Types/_entity/Record/RecordState.typedef} [state] Состояние записей, которые требуется перебрать (по умолчанию перебираются все записи)
    * @return {Types/_collection/ArrayEnumerator.<Types/_entity/Record>}
    * @example
    * Получим сначала все, а затем - измененные записи:
    * <pre>
    *    require(['Types/_entity/Record'], function(Record) {
    *       var fruits = new RecordSet({
    *             rawData: [
    *                {name: 'Apple'},
    *                {name: 'Banana'},
    *                {name: 'Orange'},
    *                {name: 'Strawberry'}
    *             ]
    *          }),
    *          fruit,
    *          enumerator;
    *
    *       fruits.at(0).set('name', 'Pineapple');
    *       fruits.at(2).set('name', 'Grapefruit');
    *
    *       enumerator = fruits.getEnumerator();
    *       while(enumerator.moveNext()) {
    *          fruit = enumerator.getCurrent();
    *          console.log(fruit.get('name'));
    *       }
    *       //output: 'Pineapple', 'Banana', 'Grapefruit', 'Strawberry'
    *
    *       enumerator = fruits.getEnumerator(Record.RecordState.CHANGED);
    *       while(enumerator.moveNext()) {
    *          fruit = enumerator.getCurrent();
    *          console.log(fruit.get('name'));
    *       }
    *       //output: 'Pineapple', 'Grapefruit'
    *    });
    * </pre>
    */
   getEnumerator(state) {
      let enumerator = new Arraywise(this._$items);

      enumerator.setResolver((index) => this.at(index));

      if (state) {
         enumerator.setFilter((record) => record.getState() === state);
      }

      return enumerator;
   }

   /**
    * Перебирает записи рекордсета.
    * @param {Function(Types/_entity/Record, Number)} callback Функция обратного вызова, аргументами будут переданы запись и ее позиция.
    * @param {Types/_entity/Record/RecordState.typedef} [state] Состояние записей, которые требуется перебрать (по умолчанию перебираются все записи)
    * @param {Object} [context] Контекст вызова callback
    * @example
    * Получим сначала все, а затем - измененные записи:
    * <pre>
    *    require([
    *       'Types/collection',
    *       'Types/entity'
    *    ], function(collection, entity) {
    *       var fruits = new collection.RecordSet({
    *          rawData: [
    *             {name: 'Apple'},
    *             {name: 'Banana'},
    *             {name: 'Orange'},
    *             {name: 'Strawberry'}
    *          ]
    *       });
    *
    *       fruits.at(0).set('name', 'Pineapple');
    *       fruits.at(2).set('name', 'Grapefruit');
    *
    *       fruits.each(function(fruit) {
    *          console.log(fruit.get('name'));
    *       });
    *       //output: 'Pineapple', 'Banana', 'Grapefruit', 'Strawberry'
    *
    *       fruits.each(function(fruit) {
    *          console.log(fruit.get('name'));
    *       }, entity.Record.RecordState.CHANGED);
    *       //output: 'Pineapple', 'Grapefruit'
    *    });
    * </pre>
    */
   each(callback, state?, context?) {
      if (state instanceof Object) {
         context = state;
         state = undefined;
      }
      context = context || this;

      let length = this.getCount();
      let index = 0;
      let isMatching;
      let record;
      for (let i = 0; i < length; i++) {
         record = this.at(i);
         if (state) {
            isMatching = record.getState() === state;
         } else {
            isMatching = true;
         }
         if (isMatching) {
            callback.call(
               context,
               record,
               index++,
               this
            );
         }
      }
   }

   //endregion IEnumerable

   //region List

   clear() {
      let item;
      for (let i = 0, count = this._$items.length; i < count; i++) {
         item = this._$items[i];
         if (item) {
            item.detach();
         }
      }
      this._getRawDataAdapter().clear();
      super.clear();
   }

   /**
    * Добавляет запись в рекордсет путем создания новой записи, в качестве сырых данных для которой будут взяты сырые данные аргумента item.
    * Если формат созданной записи не совпадает с форматом рекордсета, то он будет приведен к нему принудительно: лишние поля будут отброшены, недостающие - проинициализированы значениями по умолчанию.
    * При недопустимом at генерируется исключение.
    * @param {Types/_entity/Record} item Запись, из которой будут извлечены сырые данные.
    * @param {Number} [at] Позиция, в которую добавляется запись (по умолчанию - в конец)
    * @return {Types/_entity/Record} Добавленная запись.
    * @see Types/_collection/ObservableList#add
    * @example
    * Добавим запись в рекордсет:
    * <pre>
    *    require(['Types/collection', 'Types/entity'], function(collection, entity) {
    *       var rs = new collection.RecordSet();
    *       var source = new entity.Record({
    *          rawData: {foo: 'bar'}
    *       });
    *       var result = rs.add(source);
    *
    *       console.log(result === source);//false
    *       console.log(result.get('foo') === source.get('foo'));//true
    *
    *       console.log(source.getOwner() === rs);//false
    *       console.log(result.getOwner() === rs);//true
    *    });
    * </pre>
    */
   add(item, at?) {
      item = this._normalizeItems([item], RECORD_STATE.ADDED)[0];
      this._getRawDataAdapter().add(item.getRawData(true), at);
      super.add(item, at);

      return item;
   }

   at(index) {
      return this._getRecord(index);
   }

   remove(item) {
      this._checkItem(item);
      return super.remove(item);
   }

   removeAt(index) {
      this._getRawDataAdapter().remove(index);

      let item = this._$items[index];
      let result = super.removeAt(index);

      if (item) {
         item.detach();
      }

      return result;
   }

   /**
    * Заменяет запись в указанной позиции через создание новой записи, в качестве сырых данных для которой будут взяты сырые данные аргумента item.
    * Если формат созданной записи не совпадает с форматом рекордсета, то он будет приведен к нему принудительно: лишние поля будут отброшены, недостающие - проинициализированы значениями по умолчанию.
    * При недопустимом at генерируется исключение.
    * @param {Types/_entity/Record} item Заменяющая запись, из которой будут извлечены сырые данные.
    * @param {Number} at Позиция, в которой будет произведена замена
    * @return {Array.<Types/_entity/Record>} Добавленная запись
    * @see Types/_collection/ObservableList#replace
    * @example
    * Заменим вторую запись:
    * <pre>
    *    require(['Types/collection', 'Types/entity'], function(collection, entity) {
    *       var rs = new collection.RecordSet({
    *          rawData: [{
    *             id: 1,
    *             title: 'Water'
    *          }, {
    *             id: 2,
    *             title: 'Ice'
    *          }]
    *       });
    *       var source = new entity.Record({
    *          rawData: {
    *             id: 3,
    *             title: 'Snow'
    *          }
    *       });
    *
    *       rs.replace(source, 1);
    *       var result = rs.at(1);
    *
    *       console.log(result === source);//false
    *       console.log(result.get('title') === source.get('title'));//true
    *
    *       console.log(source.getOwner() === rs);//false
    *       console.log(result.getOwner() === rs);//true
    *    });
    * </pre>
    */
   replace(item, at) {
      item = this._normalizeItems([item], RECORD_STATE.CHANGED)[0];
      this._getRawDataAdapter().replace(item.getRawData(true), at);
      let oldItem = this._$items[at];
      super.replace(item, at);
      if (oldItem) {
         oldItem.detach();
      }

      return item;
   }

   move(from, to) {
      this._getRecord(from);//force create record instance
      this._getRawDataAdapter().move(from, to);
      super.move(from, to);
   }

   /**
    * Заменяет записи рекордсета копиями записей другой коллекции.
    * Если формат созданных копий не совпадает с форматом рекордсета, то он будет приведен к нему принудительно: лишние поля будут отброшены, недостающие - проинициализированы значениями по умолчанию.
    * @param {Types/_collection/IEnumerable.<Types/_entity/Record>|Array.<Types/_entity/Record>} [items] Коллекция с записями для замены
    * @return {Array.<Types/_entity/Record>} Добавленные записи
    * @see Types/_collection/ObservableList#assign
    */
   assign(items) {
      if (items === this) {
         return [];
      }

      let oldItems = this._$items.slice();
      let result;

      if (items instanceof RecordSet) {
         this._$adapter = items.getAdapter();
         this._assignRawData(items.getRawData(), this._hasFormat());
         result = new Array(items.getCount());
         super.assign(result);
      } else {
         items = this._itemsToArray(items);
         if (items.length && items[0] && items[0]['[Types/_entity/Record]']) {
            this._$adapter = items[0].getAdapter();
         }
         items = this._normalizeItems(items, RECORD_STATE.ADDED);
         this._assignRawData(null, this._hasFormat());
         items = this._addItemsToRawData(items);
         super.assign(items);
         result = items;
      }

      let item;
      for (let i = 0, count = oldItems.length; i < count; i++) {
         item = oldItems[i];
         if (item) {
            item.detach();
         }
      }

      return result;
   }

   /**
    * Добавляет копии записей другой коллекции в конец рекордсета.
    * Если формат созданных копий не совпадает с форматом рекордсета, то он будет приведен к нему принудительно: лишние поля будут отброшены, недостающие - проинициализированы значениями по умолчанию.
    * @param {Types/_collection/IEnumerable.<Types/_entity/Record>|Array.<Types/_entity/Record>} [items] Коллекция с записями для добавления
    * @return {Array.<Types/_entity/Record>} Добавленные записи
    * @see Types/_collection/ObservableList#append
    */
   append(items) {
      items = this._itemsToArray(items);
      items = this._normalizeItems(items, RECORD_STATE.ADDED);
      items = this._addItemsToRawData(items);
      super.append(items);

      return items;
   }

   /**
    * Добавляет копии записей другой коллекции в начало рекордсета.
    * Если формат созданных копий не совпадает с форматом рекордсета, то он будет приведен к нему принудительно: лишние поля будут отброшены, недостающие - проинициализированы значениями по умолчанию.
    * @param {Types/_collection/IEnumerable.<Types/_entity/Record>|Array.<Types/_entity/Record>} [items] Коллекция с записями для добавления
    * @return {Array.<Types/_entity/Record>} Добавленные записи
    * @see Types/_collection/ObservableList#prepend
    */
   prepend(items) {
      items = this._itemsToArray(items);
      items = this._normalizeItems(items, RECORD_STATE.ADDED);
      items = this._addItemsToRawData(items, 0);
      super.prepend(items);

      return items;
   }

   /**
    * Возвращает индексатор коллекции
    * @return {Types/_collection/Indexer}
    * @protected
    */
   _getIndexer() {
      if (this._indexer) {
         return this._indexer;
      }

      let indexer;

      //Custom model possible has different properties collection, this cause switch to the slow not lazy mode
      if (this._$model === this._defaultModel) {
         //Fast mode: indexing without record instances
         let adapter = this._getAdapter();
         let tableAdapter = this._getRawDataAdapter();

         indexer = new Indexer(
            this._getRawData(),
            () => tableAdapter.getCount(),
            (items, at) => tableAdapter.at(at),
            (item, property) => adapter.forRecord(item).get(property)
         );
      } else {
         //Slow mode: indexing use record instances
         indexer = new Indexer(
            this._$items,
            (items) => items.length,
            (items, at) => this.at(at),
            (item, property) => item.get(property)
         );
      }

      this._indexer = indexer;
      return indexer;
   }

   //endregion List

   //endregion ObservableList

   _itemsSlice(begin, end) {
      if (this._isNeedNotifyCollectionChange()) {
         if (begin === undefined) {
            begin = 0;
         }
         if (end === undefined) {
            end = this._$items.length;
         }

         //Force create records for event handler
         for (let i = begin; i < end; i++) {
            this._getRecord(i);
         }
      }

      return super._itemsSlice(begin, end);
   }

   //endregion ObservableList

   //region SerializableMixin

   _getSerializableState(state) {
      state = ObservableList.prototype._getSerializableState.call(this, state);
      state = FormattableMixin._getSerializableState.call(this, state);
      state._instanceId = this.getInstanceId();
      delete state.$options.items;
      return state;
   }

   _setSerializableState(state) {
      let fromSuper = super._setSerializableState(state);
      let fromFormattableMixin = FormattableMixin._setSerializableState(state);
      return function() {
         fromSuper.call(this);
         fromFormattableMixin.call(this);
         this._instanceId = state._instanceId;
      };
   }

   //endregion SerializableMixin

   //region FormattableMixin

   setRawData(data) {
      let oldItems = this._$items.slice();
      let eventsWasRaised = this._eventRaising;

      this._eventRaising = false;
      this.clear();
      this._eventRaising = eventsWasRaised;

      this._assignRawData(data);
      this._initByRawData();
      this._notifyCollectionChange(
         IObservable.ACTION_RESET,
         this._$items,
         0,
         oldItems,
         0
      );
   }

   addField(format, at, value?) {
      format = this._buildField(format);
      FormattableMixin.addField.call(this, format, at);

      this._parentChanged(Record.prototype.addField);

      if (value !== undefined) {
         let name = format.getName();
         this.each((record) => {
            record.set(name, value);
         });
      }
      this._nextVersion();
   }

   removeField(name) {
      FormattableMixin.removeField.call(this, name);
      this._nextVersion();
      this._parentChanged(Record.prototype.removeField);
   }

   removeFieldAt(at) {
      FormattableMixin.removeFieldAt.call(this, at);
      this._nextVersion();
      this._parentChanged(Record.prototype.removeFieldAt);
   }

   /**
    * Создает адаптер для сырых данных
    * @return {Types/_entity/adapter/ITable}
    * @protected
    */
   _createRawDataAdapter() {
      return this._getAdapter().forTable(this._getRawData(true));
   }

   /**
    * Переустанавливает сырые данные
    * @param {Object} data Данные в "сыром" виде
    * @param {Boolean} [keepFormat=false] Сохранить формат
    * @protected
    */
   _assignRawData(data, keepFormat?: boolean) {
      FormattableMixin.setRawData.call(this, data);
      this._clearIndexer();
      if (!keepFormat) {
         this._clearFormat();
      }
      this._nextVersion();
   }

   //endregion FormattableMixin

   //region Public methods

   /**
    * Возвращает конструктор записей, порождаемых рекордсетом.
    * @return {String|Function}
    * @see model
    * @see Types/_entity/Model
    * @see Types/di
    * @example
    * Получим конструктор записепй, внедренный в рекордсет в виде названия зарегистрированной зависимости:
    * <pre>
    *    var User = Model.extend({});
    *    Di.register('model.user', User);
    *    //...
    *    var users = new RecordSet({
    *       model: 'model.user'
    *    });
    *    users.getModel() === 'model.user';//true
    * </pre>
    * Получим конструктор записепй, внедренный в рекордсет в виде класса:
    * <pre>
    *    var User = Model.extend({});
    *    //...
    *    var users = new RecordSet({
    *       model: User
    *    });
    *    users.getModel() === User;//true
    * </pre>
    */
   getModel() {
      return this._$model;
   }

   /**
    * Подтверждает изменения всех записей с момента предыдущего вызова acceptChanges().
    * Обрабатывает {@link state} записей следующим образом:
    * <ul>
    *    <li>Changed и Added - меняют state на Unchanged;</li>
    *    <li>Deleted - удаляются из рекордсета, а их state становится Detached;</li>
    *    <li>остальные не меняются.</li>
    * </ul>
    * @param {Boolean} [spread=false] Распространять изменения по иерархии родителей (будут вызваны acceptChanges
    * всех владельцев).
    * @example
    * Подтвердим измененную запись:
    * <pre>
    *    require(['Types/collection', 'Types/entity'], function(collection, entity) {
    *       var fruits = new collection.RecordSet({
    *          rawData: [
    *             {name: 'Apple'},
    *             {name: 'Banana'}
    *          ]
    *       });
    *       var RecordState = entity.Record.RecordState;
    *
    *       var apple = fruits.at(0);
    *       apple.set('name', 'Pineapple');
    *       apple.getState() === RecordState.CHANGED;//true
    *
    *       fruits.acceptChanges();
    *       apple.getState() === RecordState.UNCHANGED;//true
    *    });
    * </pre>
    * Подтвердим добавленную запись:
    * <pre>
    *    require(['Types/collection', 'Types/entity'], function(collection, entity) {
    *       var fruits = new collection.RecordSet({
    *          rawData: [
    *             {name: 'Apple'}
    *          ]
    *       });
    *       var RecordState = entity.Record.RecordState;
    *       var banana = new entity.Record({
    *          rawData: {name: 'Banana'}
    *       });
    *
    *       fruits.add(banana);
    *       banana.getState() === RecordState.ADDED;//true
    *
    *       fruits.acceptChanges();
    *       banana.getState() === RecordState.UNCHANGED;//true
    *    });
    * </pre>
    * Подтвердим удаленную запись:
    * <pre>
    *    require(['Types/collection', 'Types/entity'], function(collection, entity) {
    *       var fruits = new collection.RecordSet({
    *          rawData: [
    *             {name: 'Apple'},
    *             {name: 'Banana'}
    *          ]
    *       });
    *       var RecordState = entity.Record.RecordState;
    *
    *       var apple = fruits.at(0);
    *       apple.setState(RecordState.DELETED);
    *       fruits.getCount();//2
    *       fruits.at(0).get('name');//'Apple'
    *
    *       fruits.acceptChanges();
    *       apple.getState() === RecordState.DETACHED;//true
    *       fruits.getCount();//1
    *       fruits.at(0).get('name');//'Banana'
    *    });
    * </pre>
    */
   acceptChanges(spread) {
      let toRemove = [];
      this.each((record, index) => {
         if (record.getState() === RECORD_STATE.DELETED) {
            toRemove.push(index);
         }
         record.acceptChanges();
      });

      for (let index = toRemove.length - 1; index >= 0; index--) {
         this.removeAt(toRemove[index]);
      }

      if (spread) {
         this._childChanged(Record.prototype.acceptChanges);
      }
   }

   isChanged() {
      let changed = false;
      let items = this._$items;
      let count = items.length;

      for (let i = 0; i < count; i++) {
         if (items[i].isChanged()) {
            changed = true;
            break;
         }
      }

      return changed;
   }

   /**
    * Возвращает название свойства записи, содержащего первичный ключ
    * @return {String}
    * @see setIdProperty
    * @see idProperty
    * @example
    * Получим название свойства, содержащего первичный ключ:
    * <pre>
    *    var users = new RecordSet({
    *       idProperty: 'id'
    *    });
    *    users.getIdProperty();//'id'
    * </pre>
    */
   getIdProperty() {
      return this._$idProperty;
   }

   /**
    * Устанавливает название свойства записи, содержащего первичный ключ
    * @param {String} name
    * @see getIdProperty
    * @see idProperty
    * @example
    * Установим название свойства, содержащего первичный ключ:
    * <pre>
    *    var users = new RecordSet({
    *       rawData: [{
    *          id: 134,
    *          login: 'editor',
    *       }, {
    *          id: 257,
    *          login: 'shell',
    *       }]
    *    });
    *    users.setIdProperty('id');
    *    users.getRecordById(257).get('login');//'shell'
    * </pre>
    */
   setIdProperty(name) {
      if (this._$idProperty === name) {
         return;
      }

      this._$idProperty = name;
      this.each((record) => {
         if (record.setIdProperty) {
            record.setIdProperty(name);
         }
      });
      this._notify('onPropertyChange', {idProperty: this._$idProperty});
   }

   /**
    * Возвращает запись по ключу.
    * Если записи с таким ключом нет - возвращает undefined.
    * @param {String|Number} id Значение первичного ключа.
    * @return {Types/_entity/Record}
    * @example
    * Создадим рекордсет, получим запись по первичному ключу:
    * <pre>
    *    var users = new RecordSet({
    *       idProperty: 'id'
    *       rawData: [{
    *          id: 134,
    *          login: 'editor',
    *       }, {
    *          id: 257,
    *          login: 'shell',
    *       }]
    *    });
    *    users.getRecordById(257).get('login');//'shell'
    * </pre>
    */
   getRecordById(id) {
      return this.at(
         this.getIndexByValue(this._$idProperty, id)
      );
   }

   /**
    * Возвращает метаданные RecordSet'а.
    * Подробнее о метаданных смотрите в описании опции {@link metaData}.
    * @return {Object} Метаданные.
    * @see metaData
    * @see setMetaData
    */
   getMetaData() {
      if (this._metaData) {
         return this._metaData;
      }

      let cast = (value, format) => {
         return factory.cast(
            value,
            format,
            {
               format: format,
               adapter: this._getAdapter(),
               idProperty: this._$idProperty
            }
         );
      };
      let metaFormat = this._$metaFormat ? FormattableMixin._buildFormat(this._$metaFormat) : null;
      let metaData = {};

      if (this._$metaData) {
         if (this._$metaData instanceof Object && Object.getPrototypeOf(this._$metaData) === Object.prototype) {
            Object.keys(this._$metaData).forEach((fieldName) => {
               let fieldValue = this._$metaData[fieldName];
               if (metaFormat) {
                  let fieldFormat = undefined;
                  let fieldIndex = metaFormat.getFieldIndex(fieldName);
                  if (fieldIndex > -1) {
                     fieldFormat = metaFormat.at(fieldIndex);
                     fieldValue = cast(
                        fieldValue,
                        fieldFormat.getType()
                     );
                  }
               }
               metaData[fieldName] = fieldValue;
            });
         } else {
            metaData = this._$metaData;
         }
      } else {
         let adapter = this._getRawDataAdapter();

         //Unwrap if needed
         if (adapter['[Types/_entity/adapter/IDecorator]']) {
            adapter = adapter.getOriginal();
         }

         if (adapter['[Types/_entity/adapter/IMetaData]']) {
            adapter.getMetaDataDescriptor().forEach((format) => {
               let fieldName = format.getName();
               let fieldFormat = undefined;
               if (metaFormat) {
                  let fieldIndex = metaFormat.getFieldIndex(fieldName);
                  if (fieldIndex > -1) {
                     fieldFormat = metaFormat.at(fieldIndex);
                  }
               }

               metaData[fieldName] = cast(
                  adapter.getMetaData(fieldName),
                  fieldFormat ? fieldFormat.getType() : this._getFieldType(format)
               );
            });
         }
      }

      this._metaData = metaData;
      return this._metaData;
   }

   /**
    * Устанавливает метаданные RecordSet'а.
    * Подробнее о метаданных смотрите в описании опции {@link metaData}.
    * <ul>
    * <li>path - путь для хлебных крошек, возвращается как {@link Types/_collection/RecordSet};</li>
    * <li>results - строка итогов, возвращается как {@link Types/_entity/Record}. Подробнее о конфигурации списков для отображения строки итогов читайте в {@link https://wi.sbis.ru/doc/platform/developmentapl/interfacedev/components/list/list-settings/list-visual-display/results/ этом разделе};</li>
    * <li>more - Boolean - есть ли есть записи для подгрузки (используется для постраничной навигации).</li>
    * </ul>
    * @param {Object} meta Метаданные.
    * @see metaData
    * @see getMetaData
    */
   setMetaData(meta) {
      this._metaData = this._$metaData = meta;

      if (meta instanceof Object) {
         let adapter = this._getRawDataAdapter();
         if (adapter['[Types/_entity/adapter/IMetaData]']) {
            adapter.getMetaDataDescriptor().forEach((format) => {
               let name = format.getName();
               let value = factory.serialize(
                  meta[name],
                  {
                     format: format,
                     adapter: this.getAdapter()
                  }
               );
               adapter.setMetaData(name, value);
            });
         }
      }

      this._notify('onPropertyChange', {metaData: meta});
   }

   /**
    * Объединяет два рекордсета.
    * @param {Types/_collection/RecordSet} recordSet Рекордсет, с которым объединить
    * @param {MergeOptions} options Опции операций
    * @see assign
    * @see append
    * @see prepend
    * @see add
    * @see replace
    * @see remove
    */
   merge(recordSet, options) {
      //Backward compatibility for 'merge'
      if (options instanceof Object && options.hasOwnProperty('merge') && !options.hasOwnProperty('replace')) {
         options.replace = options.merge;
      }

      options = Object.assign({
         add: true,
         remove: true,
         replace: true,
         inject: false
      }, options || {});

      let count = recordSet.getCount();
      let idProperty = this._$idProperty;
      let existsIdMap = {};
      let newIdMap = {};
      let toAdd = [];
      let toReplace = [];
      let toInject = [];
      let record;
      let id;
      let index;

      this.each((record, index) => {
         existsIdMap[record.get(idProperty)] = index;
      });

      for (let i = 0; i < count; i++) {
         record = recordSet.at(i);
         id = record.get(idProperty);

         if (i === 0) {
            this._checkItem(record);
         }

         if (existsIdMap.hasOwnProperty(id)) {
            if (options.inject) {
               index = existsIdMap[id];
               if (!record.isEqual(this.at(index))) {
                  toInject.push([record, index]);
               }
            } else if (options.replace) {
               index = existsIdMap[id];
               if (!record.isEqual(this.at(index))) {
                  toReplace.push([record, index]);
               }
            }
         } else {
            if (options.add) {
               toAdd.push(record);
            }
         }

         if (options.remove) {
            newIdMap[id] = true;
         }
      }

      if (toReplace.length) {
         for (let i = 0; i < toReplace.length; i++) {
            this.replace(toReplace[i][0], toReplace[i][1]);
         }
      }

      if (toInject.length) {
         for (let i = 0; i < toInject.length; i++) {
            record = this.at(toInject[i][1]);
            record.setRawData(toInject[i][0].getRawData());
         }
      }

      if (toAdd.length) {
         this.append(toAdd);
      }

      if (options.remove) {
         let toRemove = [];
         this.each((record, index) => {
            if (!newIdMap.hasOwnProperty(record.get(idProperty))) {
               toRemove.push(index);
            }
         });

         for (let i = toRemove.length - 1; i >= 0; i--) {
            this.removeAt(toRemove[i]);
         }
      }
   }

   //endregion Public methods

   //region Protected methods

   /**
    * Вставляет сырые данные записей в сырые данные рекордсета
    * @param {Types/_collection/IEnumerable|Array} items Коллекция записей
    * @param {Number} [at] Позиция вставки
    * @return {Array}
    * @protected
    */
   _addItemsToRawData(items, at?: number) {
      let adapter = this._getRawDataAdapter();
      items = this._itemsToArray(items);

      let item;
      for (let i = 0, len = items.length; i < len; i++) {
         item = items[i];
         adapter.add(
            item.getRawData(true),
            at === undefined ? undefined : at + i
         );
      }

      return items;
   }

   /**
    * Нормализует записи при добавлении в рекордсет: клонирует и приводит к формату рекордсета
    * @param {Array.<Types/_entity/Record>} items Записи
    * @param {RecordState} [state] С каким состояним создать
    * @return {Array.<Types/_entity/Record>}
    * @protected
    */
   _normalizeItems(items, state) {
      let formatDefined = this._hasFormat();
      let format;
      let result = [];
      let resultItem;
      let item;
      for (let i = 0; i < items.length; i++) {
         item = items[i];
         this._checkItem(item);

         if (!formatDefined && this.getCount() === 0) {
            format = item.getFormat(true);
            this._clearFormat();
            this._resetRawDataFields();
         } else if (!format) {
            format = this._getFormat(true);
         }
         resultItem = this._normalizeItemData(item, format);

         if (state) {
            resultItem.setState(state);
         }

         result.push(resultItem);
      }

      return result;
   }

   /**
    * Возращает копию записи с сырыми данными, приведенными к нужному формату
    * @param {Array.<Types/_entity/Record>} item Запись
    * @param {Types/_entity/format/Format} format Формат, к которому следует привести данные
    * @return {Array.<Types/_entity/Record>}
    * @protected
    */
   _normalizeItemData(item, format) {
      let itemFormat = item.getFormat(true);
      let result;

      if (format.isEqual(itemFormat)) {
         result = this._buildRecord(
            item.getRawData()
         );
      } else {
         let adapter = this.getAdapter().forRecord(null, this._getRawData());
         let itemAdapter = item.getAdapter().forRecord(item.getRawData(true));

         format.each((field, index) => {
            let name = field.getName();
            adapter.addField(field, index);
            adapter.set(name, itemAdapter.get(name));
         });
         result = this._buildRecord(
            adapter.getData()
         );
      }

      return result;
   }

   /**
    * Проверяет, что переданный элемент - это запись с идентичным форматом
    * @param {*} item Запись
    * @protected
    */
   _checkItem(item) {
      if (!item || !item['[Types/_entity/Record]']) {
         throw new TypeError('Item should be an instance of Types/entity:Record');
      }
      checkNullId(item, this.getIdProperty());
      this._checkAdapterCompatibility(item.getAdapter());
   }

   /**
    * Создает новый экземпляр модели
    * @param {*} data Данные модели
    * @return {Types/_entity/Record}
    * @protected
    */
   _buildRecord(data) {
      let record = create(this._$model, {
         owner: this,
         writable: this.writable,
         state: RECORD_STATE.UNCHANGED,
         adapter: this.getAdapter(),
         rawData: data,
         idProperty: this._$idProperty
      });

      return record;
   }

   /**
    * Возвращает запись по индексу
    * @param {Number} at Индекс
    * @return {Types/_entity/Record}
    * @protected
    */
   _getRecord(at) {
      if (at < 0 || at >= this._$items.length) {
         return undefined;
      }

      let record = this._$items[at];
      if (!record) {
         let adapter = this._getRawDataAdapter();
         record = this._$items[at] = this._buildRecord(() => {
            return adapter.at(record ? this.getIndex(record) : at);
         });
         this._addChild(record);
         checkNullId(record, this.getIdProperty());
      }

      return record;
   }

   /**
    * Пересоздает элементы из сырых данных
    * @param {Object} data Сырые данные
    * @protected
    */
   _initByRawData() {
      let adapter = this._getRawDataAdapter();
      this._$items.length = 0;
      this._$items.length = adapter.getCount();
   }

   //endregion Protected methods

   //region Statics

   /**
    * Создает из рекордсета патч - запись с измененными, добавленными записями и ключами удаленных записей.
    * @param {Types/_collection/RecordSet} items Исходный рекордсет
    * @param {Array.<String>} [names] Имена полей результирующей записи, по умолчанию ['changed', 'added', 'removed']
    * @return {Types/_entity/Record} Патч
    */
   static patch(items: RecordSet<any>, names?: string[]) {
      names = names || ['changed', 'added', 'removed'];

      let filter = (state) => {
         let result = new RecordSet({
            adapter: items.getAdapter(),
            idProperty: items.getIdProperty()
         });

         items.each((item) => {
            result.add(item);
         }, state);

         return result;
      };

      let getIds = (items) => {
         let result = [];
         let idProperty = items.getIdProperty();

         items.each((item) => {
            result.push(item.get(idProperty));
         });

         return result;
      };

      let result = new Record({
         format: [
            {name: names[0], type: 'recordset'},
            {name: names[1], type: 'recordset'},
            {name: names[2], type: 'array', kind: 'string'}
         ],
         adapter: items.getAdapter()
      });

      result.set(names[0], filter(RECORD_STATE.CHANGED));
      result.set(names[1], filter(RECORD_STATE.ADDED));
      result.set(names[2], getIds(filter(RECORD_STATE.DELETED)));
      result.acceptChanges();

      return result;
   }

   //endregion Statics
}

Object.assign(RecordSet.prototype,{
   '[Types/_collection/RecordSet]': true,
   '[Types/_entity/IInstantiable]': true,
   '[Types/_entity/IObservableObject]': true,
   '[Types/_entity/IProducible]': true,
   _moduleName: 'Types/collection:RecordSet',
   _instancePrefix: 'recordset-',
   _defaultModel: DEFAULT_MODEL,
   _$model: DEFAULT_MODEL,
   _$idProperty: '',
   _$metaData: null,
   _$metaFormat: null,
   _metaData: null
});

//Aliases
RecordSet.prototype.forEach = RecordSet.prototype.each;

//FIXME: backward compatibility for check via Core/core-instance::instanceOfModule()
RecordSet.prototype['[WS.Data/Collection/RecordSet]'] = true;

register('Types/collection:RecordSet', RecordSet, {instantiate: false});
