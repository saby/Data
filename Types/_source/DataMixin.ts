import DataSet, {IOptions as IDataSetOptions} from './DataSet';
import {ReadWriteMixin, adapter, Model} from '../entity';
import {create} from '../di';

export interface IOptions {
   adapter?: string | adapter.IAdapter;
   model?: string | Function;
   listModule?: string | Function;
   idProperty?: string;
   dataSetMetaProperty?: string;
}

/**
 * Миксин, позволяющий реализовать интерфейс {@link Types/_source/IData}.
 * @mixin Types/_source/DataMixin
 * @public
 * @author Мальцев А.А.
 */
const DataMixin = /** @lends Types/_source/DataMixin.prototype */{
   '[Types/_source/DataMixin]': true,

   /**
    * @cfg {String|Types/_entity/adapter/IAdapter} Адаптер для работы с форматом данных, выдаваемых источником.
    * По умолчанию {@link Types/_entity/adapter/Json}.
    * @name Types/_source/DataMixin#adapter
    * @see getAdapter
    * @see Types/_entity/adapter/IAdapter
    * @see Types/di
    * @example
    * Адаптер для данных в формате БЛ СБИС:
    * <pre>
    *    require([
    *       'Types/source',
    *       'Types/entity'
    *    ], function (source, entity) {
    *       new source.SbisService({
    *          endpoint: 'Employee'
    *       })
    *       .call('getList', {department: 'Management'})
    *       .addCallbacks(function(data) {
    *          var dataSource = new source.Memory({
    *             adapter: new entity.adapter.Sbis(),
    *             data: data
    *          });
    *       }, function(error) {
    *          console.error('Can\'t call "Employee.getList()"', error);
    *       });
    *    });
    * </pre>
    */
   _$adapter: 'Types/entity:adapter.Json',

   /**
    * @cfg {String|Function} Конструктор записей, порождаемых источником данных.
    * По умолчанию {@link Types/_entity/Model}.
    * @name Types/_source/DataMixin#model
    * @see getModel
    * @see Types/_entity/Model
    * @see Types/di
    * @example
    * Конструктор пользовательской модели, внедренный в виде класса:
    * <pre>
    *    var User = Model.extend({
    *       identify: function(login, password) {
    *       }
    *    });
    *    //...
    *    var dataSource = new MemorySource({
    *       model: User
    *    });
    * </pre>
    * Конструктор пользовательской модели, внедренный в виде названия зарегистрированной зависимости:
    * <pre>
    *    var User = Model.extend({
    *       identify: function(login, password) {
    *       }
    *    });
    *    Di.register('app.model.user', User);
    *    //...
    *    var dataSource = new MemorySource({
    *       model: 'app.model.user'
    *    });
    * </pre>
    */
   _$model: 'Types/entity:Model',

   /**
    * @cfg {String|Function} Конструктор рекордсетов, порождаемых источником данных.
    * По умолчанию {@link Types/_collection/RecordSet}.
    * @name Types/_source/DataMixin#listModule
    * @see getListModule
    * @see Types/_collection/RecordSet
    * @see Types/di
    * @example
    * Конструктор рекордсета, внедренный в виде класса:
    * <pre>
    *    var Users = RecordSet.extend({
    *       getAdministrators: function() {
    *       }
    *    });
    *    //...
    *    var dataSource = new MemorySource({
    *       listModule: Users
    *    });
    * </pre>
    * Конструктор рекордсета, внедренный в виде названия зарегистрированной зависимости:
    * <pre>
    *    var Users = RecordSet.extend({
    *       getAdministrators: function() {
    *       }
    *    });
    *    Di.register('app.collections.users', Users);
    *    //...
    *    var dataSource = new MemorySource({
    *       listModule: 'app.collections.users'
    *    });
    * </pre>
    */
   _$listModule: 'Types/collection:RecordSet',

   /**
    * @cfg {String} Название свойства записи, содержащего первичный ключ.
    * @name Types/_source/DataMixin#idProperty
    * @see getIdProperty
    * @see Types/_entity/Model#idProperty
    * @example
    * Установим свойство 'primaryId' в качестве первичного ключа:
    * <pre>
    *    var dataSource = new MemorySource({
    *       idProperty: 'primaryId'
    *    });
    * </pre>
    */
   _$idProperty: '',

   /**
    * @member {String|Function} Конструктор модуля, реализующего DataSet
    */
   _dataSetModule: 'Types/source:DataSet',

   /**
    * @member {String} Свойство данных, в котором лежит основная выборка
    */
   _dataSetItemsProperty: '',

   /**
    * @member {String} Свойство данных, в котором лежит общее кол-во строк, выбранных запросом
    */
   _dataSetMetaProperty: '',

   _writable: ReadWriteMixin.prototype.writable,

   constructor(options?: IOptions): void {
      options = options || {};

      if (options.dataSetMetaProperty) {
         this._dataSetMetaProperty = options.dataSetMetaProperty;
      }
   },

   // region Public methods

   getAdapter(): adapter.IAdapter {
      if (typeof this._$adapter === 'string') {
         this._$adapter = create(this._$adapter);
      }
      return this._$adapter;
   },

   getModel(): Function | string {
      return this._$model;
   },

   setModel(model: Function | string): void {
      this._$model = model;
   },

   getListModule(): Function | string {
      return this._$listModule;
   },

   setListModule(listModule: Function | string): void {
      this._$listModule = listModule;
   },

   getIdProperty(): string {
      return this._$idProperty;
   },

   setIdProperty(name: string): void {
      this._$idProperty = name;
   },

   // endregion

   // region Protected methods

   /**
    * Определяет название свойства с первичным ключом по данным
    * @param {*} data Сырые данные
    * @return {String}
    * @protected
    */
   _getIdPropertyByData(data: any): string {
      return this.getAdapter().getKeyField(data) || '';
   },

   /**
    * Создает новый экземпляр модели
    * @param {*} data Данные модели
    * @return {Types/_entity/Model}
    * @protected
    */
   _getModelInstance(data: any): Model {
      return create(this._$model, {
         writable: this._writable,
         rawData: data,
         adapter: this.getAdapter(),
         idProperty: this.getIdProperty()
      });
   },

   /**
    * Создает новый экземпляр DataSet
    * @param {Object} cfg Опции конструктора
    * @return {Types/_source/DataSet}
    * @protected
    */
   _getDataSetInstance(cfg: IDataSetOptions): DataSet {
      return create(// eslint-disable-line new-cap
         this._dataSetModule,
         {
            writable: this._writable,
            adapter: this.getAdapter(),
            model: this.getModel(),
            listModule: this.getListModule(),
            idProperty: this.getIdProperty() || this._getIdPropertyByData(cfg.rawData || null),
            ...cfg
         }
      );
   },

   /**
    * Оборачивает данные в DataSet
    * @param {Object} data Данные
    * @return {Types/_source/DataSet}
    * @protected
    */
   _wrapToDataSet(data: any): DataSet {
      return this._getDataSetInstance({
         rawData: data,
         itemsProperty: this._dataSetItemsProperty,
         metaProperty: this._dataSetMetaProperty
      });
   },

   /**
    * Перебирает все записи выборки
    * @param {*} data Выборка
    * @param {Function} callback Ф-я обратного вызова для каждой записи
    * @param {Object} context Конекст
    * @protected
    */
   _each(data: any, callback: Function, context: object): void {
      const tableAdapter = this.getAdapter().forTable(data);
      for (let index = 0, count = tableAdapter.getCount(); index < count; index++) {
         callback.call(context || this, tableAdapter.at(index), index);
      }
   },

   // endregion Protected methods

   // region Statics

   /**
    * Проверяет, что это экземпляр модели
    * @param {*} instance Экземпляр модели
    * @return {Boolean}
    * @static
    */
   isModelInstance(instance: any): boolean {
      return instance &&
         instance['[Types/_entity/IObject]'] &&
         instance['[Types/_entity/FormattableMixin]'];
   },

   /**
    * Проверяет, что это экземпляр списка
    * @param {*} instance Экземпляр списка
    * @return {Boolean}
    * @static
    */
   isListInstance(instance: any): boolean {
      return instance &&
         instance['[Types/_collection/IList]'] &&
         instance['[Types/_entity/FormattableMixin]'];
   }

   // endregion Statics
};

export default DataMixin;
