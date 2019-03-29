/* tslint:disable:max-line-length member-ordering */

import {EnumeratorCallback} from './IEnumerable';
import IObservable from './IObservable';
import ObservableList from './ObservableList';
import {IOptions as IListOptions} from './List';
import {Format} from './format';
import Arraywise from './enumerator/Arraywise';
import Indexer from './Indexer';
import {
   FormattableMixin,
   IFormattableOptions,
   IObservableObject,
   IInstantiable,
   IProducible,
   InstantiableMixin,
   ISerializableState as IDefaultSerializableState,
   IFormattableSerializableState,
   factory,
   format,
   Record,
   adapter
} from '../entity';
import {create, register} from '../di';
import {mixin, logger} from '../util';
import {isEqual} from '../object';

const DEFAULT_MODEL = 'Types/entity:Model';
const RECORD_STATE = Record.RecordState;
const developerMode = false;

interface IOptions extends IListOptions<Record>, IFormattableOptions {
   model?: Function | string;
   idProperty?: string;
   meta?: any;
}

interface ISerializableOptions extends IOptions, IFormattableOptions {
}

interface ISerializableState extends IDefaultSerializableState, IFormattableSerializableState {
   $options: ISerializableOptions;
   _instanceId: string;
}

/**
 *
 */
function checkNullId(value: any, idProperty: string): void {
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

/**
 * Рекордсет - список записей, имеющих общий формат полей.
 * @remark
 * Основные аспекты рекордсета (дополнительно к аспектам {@link Types/_collection/ObservableList}):
 * <ul>
 *    <li>манипуляции с форматом полей. За реализацию аспекта отвечает примесь {@link Types/_entity/FormattableMixin};
 *    </li>
 *    <li>манипуляции с сырыми данными посредством адаптера. За реализацию аспекта отвечает примесь
 *        {@link Types/_entity/FormattableMixin}.
 *    </li>
 * </ul>
 * Элементами рекордсета могут быть только {@link Types/_entity/Record записи}, причем формат полей всех записей должен
 * совпадать.
 *
 * Создадим рекордсет, в котором в качестве сырых данных используется JSON (адаптер для данных в таком формате
 * используется по умолчанию):
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
 * Создадим рекордсет, в котором в качестве сырых данных используется ответ БЛ СБИС (адаптер для данных в таком формате
 * укажем явно):
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
 * @implements Types/_entity/IObservableObject
 * @implements Types/_entity/IInstantiable
 * @implements Types/_entity/IProducible
 * @mixes Types/_entity/FormattableMixin
 * @mixes Types/_entity/InstantiableMixin
 * @ignoreOptions items
 * @author Мальцев А.А.
 * @public
 */
export default class RecordSet<T = Record> extends mixin<
   ObservableList<any>,
   FormattableMixin,
   InstantiableMixin
>(
   ObservableList,
   FormattableMixin,
   InstantiableMixin
) implements IObservableObject, IInstantiable, IProducible {
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
    * <li>results - строка итогов, возвращается как {@link Types/_entity/Record}. Подробнее о конфигурации списков для
    *     отображения строки итогов читайте в {@link https://wi.sbis.ru/doc/platform/developmentapl/interfacedev/components/list/list-settings/list-visual-display/results/ этом разделе};
    * </li>
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
    * @cfg {Types/_entity/format/Format|Array.<Types/_entity/format/FieldsFactory/FieldDeclaration.typedef>} Формат всех
    * полей метаданных.
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

   constructor(options?: IOptions) {
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

      // Model can have it's own format. Inherit that format if RecordSet's format is not defined.
      // FIXME: It only works with model's constructor injection not string alias
      if (!this._$format && this._$model && typeof this._$model === 'function' && this._$model.prototype._$format) {
         this._$format = this._$model.prototype._$format;
      }

      FormattableMixin.call(this, options);

      if (!this._$idProperty) {
         this._$idProperty = (this._getAdapter() as adapter.IAdapter).getKeyField(this._getRawData());
      }

      if (this._$rawData) {
         this._assignRawData(this._getRawData(true), true);
         this._initByRawData();
      }

      this._publish('onPropertyChange');
   }

   destroy(): void {
      this._$model = '';
      this._$metaData = null;
      this._metaData = null;

      super.destroy();
   }

   // region IEnumerable

   /**
    * Возвращает энумератор для перебора записей рекордсета.
    * Пример использования можно посмотреть в модуле {@link Types/_collection/IEnumerable}.
    * @param {Types/_entity/Record/RecordState.typedef} [state] Состояние записей, которые требуется перебрать
    * (по умолчанию перебираются все записи)
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
   getEnumerator(state?: string): Arraywise<T> {
      const enumerator = new Arraywise<T>(this._$items);

      enumerator.setResolver((index) => this.at(index));

      if (state) {
         enumerator.setFilter((record) => record instanceof Record ? record.getState() === state : true);
      }

      return enumerator;
   }

   /**
    * Перебирает записи рекордсета.
    * @param {Function(Types/_entity/Record, Number)} callback Функция обратного вызова, аргументами будут переданы
    * запись и ее позиция.
    * @param {Types/_entity/Record/RecordState.typedef} [state] Состояние записей, которые требуется перебрать
    * (по умолчанию перебираются все записи)
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
   each(callback: EnumeratorCallback<T>, state?: any, context?: object): void {
      if (state instanceof Object) {
         context = state;
         state = undefined;
      }
      context = context || this;

      const length = this.getCount();
      let index = 0;
      for (let i = 0; i < length; i++) {
         const record = this.at(i);
         let isMatching = true;
         if (state) {
            isMatching = record instanceof Record ? record.getState() === state : true;
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

   // endregion

   // region List

   clear(): void {
      let item;
      for (let i = 0, count = this._$items.length; i < count; i++) {
         item = this._$items[i];
         if (item) {
            item.detach();
         }
      }
      (this._getRawDataAdapter() as adapter.ITable).clear();
      super.clear();
   }

   /**
    * Добавляет запись в рекордсет путем создания новой записи, в качестве сырых данных для которой будут взяты сырые
    * данные аргумента item.
    * Если формат созданной записи не совпадает с форматом рекордсета, то он будет приведен к нему принудительно:
    * лишние поля будут отброшены, недостающие - проинициализированы значениями по умолчанию.
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
   add(item: any, at?: number): T {
      item = this._normalizeItems([item], RECORD_STATE.ADDED)[0];
      (this._getRawDataAdapter() as adapter.ITable).add(item.getRawData(true), at);
      super.add(item, at);

      return item;
   }

   at(index: number): T {
      return this._getRecord(index);
   }

   remove(item: T): boolean {
      this._checkItem(item);
      return super.remove(item);
   }

   removeAt(index: number): T {
      (this._getRawDataAdapter() as adapter.ITable).remove(index);

      const item = this._$items[index];
      const result = super.removeAt(index);

      if (item) {
         item.detach();
      }

      return result;
   }

   /**
    * Заменяет запись в указанной позиции через создание новой записи, в качестве сырых данных для которой будут взяты
    * сырые данные аргумента item.
    * Если формат созданной записи не совпадает с форматом рекордсета, то он будет приведен к нему принудительно: лишние
    * поля будут отброшены, недостающие - проинициализированы значениями по умолчанию.
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
   replace(item: any, at: number): T {
      item = this._normalizeItems([item], RECORD_STATE.CHANGED)[0];
      (this._getRawDataAdapter() as adapter.ITable).replace(item.getRawData(true), at);
      const oldItem = this._$items[at];
      super.replace(item, at);
      if (oldItem) {
         oldItem.detach();
      }

      return item;
   }

   move(from: number, to: number): void {
      this._getRecord(from); // force create record instance
      (this._getRawDataAdapter() as adapter.ITable).move(from, to);
      super.move(from, to);
   }

   /**
    * Заменяет записи рекордсета копиями записей другой коллекции.
    * Если формат созданных копий не совпадает с форматом рекордсета, то он будет приведен к нему принудительно: лишние
    * поля будут отброшены, недостающие - проинициализированы значениями по умолчанию.
    * @param {Types/_collection/IEnumerable.<Types/_entity/Record>|Array.<Types/_entity/Record>} [items] Коллекция с
    * записями для замены
    * @return {Array.<Types/_entity/Record>} Добавленные записи
    * @see Types/_collection/ObservableList#assign
    */
   assign(items: any): T[] {
      if (items === this) {
         return [];
      }

      const oldItems = this._$items.slice();
      let result;

      if (items instanceof RecordSet) {
         this._$adapter = items.getAdapter();
         this._assignRawData(items.getRawData(), this.hasDecalredFormat());
         result = new Array(items.getCount());
         super.assign(result);
      } else {
         items = this._itemsToArray(items);
         if (items.length && items[0] && items[0]['[Types/_entity/Record]']) {
            this._$adapter = items[0].getAdapter();
         }
         items = this._normalizeItems(items, RECORD_STATE.ADDED);
         this._assignRawData(null, this.hasDecalredFormat());
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
    * Если формат созданных копий не совпадает с форматом рекордсета, то он будет приведен к нему принудительно: лишние
    * поля будут отброшены, недостающие - проинициализированы значениями по умолчанию.
    * @param {Types/_collection/IEnumerable.<Types/_entity/Record>|Array.<Types/_entity/Record>} [items] Коллекция с
    * записями для добавления
    * @return {Array.<Types/_entity/Record>} Добавленные записи
    * @see Types/_collection/ObservableList#append
    */
   append(items: any): T[] {
      items = this._itemsToArray(items);
      items = this._normalizeItems(items, RECORD_STATE.ADDED);
      items = this._addItemsToRawData(items);
      super.append(items);

      return items;
   }

   /**
    * Добавляет копии записей другой коллекции в начало рекордсета.
    * Если формат созданных копий не совпадает с форматом рекордсета, то он будет приведен к нему принудительно:
    * лишние поля будут отброшены, недостающие - проинициализированы значениями по умолчанию.
    * @param {Types/_collection/IEnumerable.<Types/_entity/Record>|Array.<Types/_entity/Record>} [items] Коллекция с
    * записями для добавления
    * @return {Array.<Types/_entity/Record>} Добавленные записи
    * @see Types/_collection/ObservableList#prepend
    */
   prepend(items: any): T[] {
      items = this._itemsToArray(items);
      items = this._normalizeItems(items, RECORD_STATE.ADDED);
      items = this._addItemsToRawData(items, 0);
      super.prepend(items);

      return items;
   }

   /**
    * Возвращает индексатор коллекции
    * @protected
    */
   protected _getIndexer(): Indexer<T[]> {
      if (this._indexer) {
         return this._indexer;
      }

      let indexer;

      // Custom model possible has different properties collection, this cause switch to the slow not lazy mode
      if (this._$model === this._defaultModel) {
         // Fast mode: indexing without record instances
         const adapter = this._getAdapter() as adapter.IAdapter;
         const tableAdapter = this._getRawDataAdapter() as adapter.ITable;

         indexer = new Indexer<T[]>(
            this._getRawData(),
            () => tableAdapter.getCount(),
            (items, at) => tableAdapter.at(at),
            (item, property) => adapter.forRecord(item).get(property)
         );
      } else {
         // Slow mode: indexing use record instances
         indexer = new Indexer<T[]>(
            this._$items,
            (items) => items.length,
            (items, at) => this.at(at),
            (item, property) => item.get(property)
         );
      }

      this._indexer = indexer;
      return indexer;
   }

   // endregion

   // region ObservableList

   protected _itemsSlice(begin?: number, end?: number): T[] {
      if (this._isNeedNotifyCollectionChange()) {
         if (begin === undefined) {
            begin = 0;
         }
         if (end === undefined) {
            end = this._$items.length;
         }

         // Force create records for event handler
         for (let i = begin; i < end; i++) {
            this._getRecord(i);
         }
      }

      return super._itemsSlice(begin, end);
   }

   // endregion

   // region SerializableMixin

   _getSerializableState(state: IDefaultSerializableState): ISerializableState {
      let resultState = ObservableList.prototype._getSerializableState.call(this, state) as ISerializableState;
      resultState = FormattableMixin.prototype._getSerializableState.call(this, resultState);
      resultState._instanceId = this.getInstanceId();
      delete resultState.$options.items;
      return resultState;
   }

   _setSerializableState(state: ISerializableState): Function {
      const fromSuper = super._setSerializableState(state);
      const fromFormattableMixin = FormattableMixin.prototype._setSerializableState(state as IFormattableSerializableState);
      return function(): void {
         fromSuper.call(this);
         fromFormattableMixin.call(this);
         this._instanceId = state._instanceId;
      };
   }

   // endregion

   // region FormattableMixin

   setRawData(data: any): void {
      const oldItems = this._$items.slice();
      const eventsWasRaised = this._eventRaising;

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

   addField(format: format.Field, at: number, value?: any): void {
      format = this._buildField(format);
      FormattableMixin.prototype.addField.call(this, format, at);

      this._parentChanged(Record.prototype.addField);

      if (value !== undefined) {
         const name = format.getName();
         this.each((record) => {
            if (record instanceof Record) {
               record.set(name, value);
            }
         });
      }
      this._nextVersion();
   }

   removeField(name: string): void {
      FormattableMixin.prototype.removeField.call(this, name);
      this._nextVersion();
      this._parentChanged(Record.prototype.removeField);
   }

   removeFieldAt(at: number): void {
      FormattableMixin.prototype.removeFieldAt.call(this, at);
      this._nextVersion();
      this._parentChanged(Record.prototype.removeFieldAt);
   }

   protected _getRawDataAdapter: () => adapter.ITable | adapter.IDecorator | adapter.IMetaData;

   protected _createRawDataAdapter(): adapter.ITable {
      return (this._getAdapter() as adapter.IAdapter).forTable(
         this._getRawData(true)
      );
   }

   /**
    * Переустанавливает сырые данные
    * @param data Данные в "сыром" виде
    * @param [keepFormat=false] Сохранить формат
    * @protected
    */
   protected _assignRawData(data: any, keepFormat?: boolean): void {
      FormattableMixin.prototype.setRawData.call(this, data);
      this._clearIndexer();
      if (!keepFormat) {
         this._clearFormat();
      }
      this._nextVersion();
   }

   // endregion

   // region IObservableObject

   readonly '[Types/_entity/IObservableObject]': boolean;

   // endregion

   // region IProducible

   readonly '[Types/_entity/IProducible]': boolean;

   static produceInstance(data: any, options: IOptions): RecordSet {
      const instanceOptions: any = {
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

   // endregion

   // region IReceiver

   relationChanged(which: any, route: string[]): any {
      const index = this.getIndex(which.target);
      if (index > -1) {
         // Apply record's raw data to the self raw data if necessary
         const adapter = this._getRawDataAdapter() as adapter.ITable;
         const selfData = adapter.at(index);
         const recordData = which.target.getRawData(true);
         if (selfData !== recordData) {
            adapter.replace(
               recordData,
               index
            );
         }
      }

      return super.relationChanged(which, route);
   }

   // endregion

   // region ICloneable

   clone<U = this>(shallow?: boolean): U {
      const clone = super.clone<RecordSet>(shallow);
      if (shallow) {
         clone._$items = this._$items.slice();
      }
      return clone as any;
   }

   // endregion

   // region IEquatable

   isEqual(to: any): boolean {
      if (to === this) {
         return true;
      }
      if (!to) {
         return false;
      }
      if (!(to instanceof RecordSet)) {
         return false;
      }

      // TODO: compare using formats
      return isEqual(
         this._getRawData(),
         to.getRawData(true)
      );
   }

   // endregion

   // region Public methods

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
   getModel(): Function | string {
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
   acceptChanges(spread?: boolean): void {
      const toRemove = [];
      this.each((record, index) => {
         if (record instanceof Record) {
            if (record.getState() === RECORD_STATE.DELETED) {
               toRemove.push(index);
            }
            record.acceptChanges();
         }
      });

      for (let index = toRemove.length - 1; index >= 0; index--) {
         this.removeAt(toRemove[index]);
      }

      if (spread) {
         this._childChanged(Record.prototype.acceptChanges);
      }
   }

   isChanged(): boolean {
      let changed = false;
      const items = this._$items;
      const count = items.length;

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
   getIdProperty(): string {
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
   setIdProperty(name: string): void {
      if (this._$idProperty === name) {
         return;
      }

      this._$idProperty = name;
      this.each((record: any) => {
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
   getRecordById(id: string | number): T {
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
   getMetaData(): any {
      if (this._metaData) {
         return this._metaData;
      }

      const cast = (value, format) => {
         return factory.cast(
            value,
            format,
            {
               format,
               adapter: this._getAdapter(),
               idProperty: this._$idProperty
            }
         );
      };
      const metaFormat = this._$metaFormat ? super._buildFormat(this._$metaFormat) : null;
      let metaData = {};

      if (this._$metaData) {
         if (this._$metaData instanceof Object && Object.getPrototypeOf(this._$metaData) === Object.prototype) {
            Object.keys(this._$metaData).forEach((fieldName) => {
               let fieldValue = this._$metaData[fieldName];
               if (metaFormat) {
                  let fieldFormat;
                  const fieldIndex = metaFormat.getFieldIndex(fieldName);
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

         // Unwrap if needed
         if (adapter['[Types/_entity/adapter/IDecorator]']) {
            adapter = (adapter as adapter.IDecorator).getOriginal() as adapter.ITable;
         }

         if (adapter['[Types/_entity/adapter/IMetaData]']) {
            (adapter as adapter.IMetaData).getMetaDataDescriptor().forEach((format) => {
               const fieldName = format.getName();
               let fieldFormat;
               if (metaFormat) {
                  const fieldIndex = metaFormat.getFieldIndex(fieldName);
                  if (fieldIndex > -1) {
                     fieldFormat = metaFormat.at(fieldIndex);
                  }
               }

               metaData[fieldName] = cast(
                  (adapter as adapter.IMetaData).getMetaData(fieldName),
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
   setMetaData(meta: any): void {
      this._metaData = this._$metaData = meta;

      if (meta instanceof Object) {
         const adapter = this._getRawDataAdapter() as adapter.IMetaData;
         if (adapter['[Types/_entity/adapter/IMetaData]']) {
            adapter.getMetaDataDescriptor().forEach((format) => {
               const name = format.getName();
               const value = factory.serialize(
                  meta[name],
                  {
                     format,
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
   merge(recordSet: RecordSet, options?: any): void {
      // Backward compatibility for 'merge'
      if (options instanceof Object && options.hasOwnProperty('merge') && !options.hasOwnProperty('replace')) {
         options.replace = options.merge;
      }

      options = {
         add: true,
         remove: true,
         replace: true,
         inject: false, ...(options || {})};

      const count = recordSet.getCount();
      const idProperty = this._$idProperty;
      const existsIdMap = {};
      const newIdMap = {};
      const toAdd = [];
      const toReplace = [];
      const toInject = [];
      let record;
      let id;
      let index;

      this.each((record, index) => {
         if (record instanceof Record) {
            existsIdMap[record.get(idProperty)] = index;
         }
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
         const toRemove = [];
         this.each((record, index) => {
            if (record instanceof Record && !newIdMap.hasOwnProperty(record.get(idProperty))) {
               toRemove.push(index);
            }
         });

         for (let i = toRemove.length - 1; i >= 0; i--) {
            this.removeAt(toRemove[i]);
         }
      }
   }

   // endregion

   // region Protected methods

   /**
    * Вставляет сырые данные записей в сырые данные рекордсета
    * @param items Коллекция записей
    * @param [at] Позиция вставки
    * @protected
    */
   protected _addItemsToRawData(items: T[], at?: number): T[] {
      const adapter = this._getRawDataAdapter() as adapter.ITable;
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
    * @param items Записи
    * @param {RecordState} [state] С каким состояним создать
    * @protected
    */
   protected _normalizeItems(items: T[], state?: string): T[] {
      const formatDefined = this.hasDecalredFormat();
      let format;
      const result = [];
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
    * @param item Запись
    * @param format Формат, к которому следует привести данные
    * @protected
    */
   protected _normalizeItemData(item: any, format: Format): T[] {
      const itemFormat = item.getFormat(true);
      let result;

      if (format.isEqual(itemFormat)) {
         result = this._buildRecord(
            item.getRawData()
         );
      } else {
         const adapter = this.getAdapter().forRecord(null, this._getRawData());
         const itemAdapter = item.getAdapter().forRecord(item.getRawData(true));

         format.each((field, index) => {
            const name = field.getName();
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
    * @param item Запись
    * @protected
    */
   protected _checkItem(item: any): void {
      if (!item || !item['[Types/_entity/Record]']) {
         throw new TypeError('Item should be an instance of Types/entity:Record');
      }
      checkNullId(item, this.getIdProperty());
      this._checkAdapterCompatibility(item.getAdapter());
   }

   /**
    * Создает новый экземпляр модели
    * @param data Данные модели
    * @protected
    */
   protected _buildRecord(data: any): T {
      const record = create<T>(this._$model, {
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
    * @param at Индекс
    * @protected
    */
   protected _getRecord(at: number): T {
      if (at < 0 || at >= this._$items.length) {
         return undefined;
      }

      let record = this._$items[at];
      if (!record) {
         const adapter = this._getRawDataAdapter() as adapter.ITable;
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
    * @protected
    */
   protected _initByRawData(): void {
      const adapter = this._getRawDataAdapter() as adapter.ITable;
      this._$items.length = 0;
      this._$items.length = adapter.getCount();
   }

   // endregion

   // region Statics

   /**
    * Создает из рекордсета патч - запись с измененными, добавленными записями и ключами удаленных записей.
    * @param items Исходный рекордсет
    * @param [names] Имена полей результирующей записи, по умолчанию ['changed', 'added', 'removed']
    */
   static patch(items: RecordSet, names?: string[]): Record {
      names = names || ['changed', 'added', 'removed'];

      const filter = (state) => {
         const result = new RecordSet({
            adapter: items.getAdapter(),
            idProperty: items.getIdProperty()
         });

         items.each((item) => {
            result.add(item);
         }, state);

         return result;
      };

      const getIds = (items) => {
         const result = [];
         const idProperty = items.getIdProperty();

         items.each((item) => {
            result.push(item.get(idProperty));
         });

         return result;
      };

      const result = new Record({
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

   // endregion
}

Object.assign(RecordSet.prototype, {
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

// Aliases
RecordSet.prototype.forEach = RecordSet.prototype.each;

// FIXME: backward compatibility for check via Core/core-instance::instanceOfModule()
RecordSet.prototype['[WS.Data/Collection/RecordSet]'] = true;

register('Types/collection:RecordSet', RecordSet, {instantiate: false});
