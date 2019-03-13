/**
 * Интерфейс источника данных, поддерживающиего абстракцию работы с данными.
 *
 * @interface Types/_source/IData
 * @public
 * @author Мальцев А.А.
 */

import {adapter} from '../entity';

export default interface IData /** @lends Types/_source/IData.prototype */{
   readonly '[Types/_source/IData]': boolean;

   /**
    * Возвращает адаптер для работы с данными.
    * @return {Types/_entity/adapter/IAdapter}
    * @see adapter
    * @see Types/_entity/adapter/IAdapter
    * @example
    * Получим адаптер источника, используемый по умолчанию:
    * <pre>
    *    require(['Types/source', 'Types/entity'], function(source, entity) {
    *       var dataSource = new source.MemorySource();
    *       console.assert(dataSource.getAdapter() instanceof entity.adapter.Json);//correct
    *    });
    * </pre>
    */
   getAdapter(): adapter.IAdapter;

   /**
    * Возвращает конструктор записей, порождаемых источником данных.
    * @return {String|Function}
    * @see model
    * @see Types/_entity/Model
    * @see Types/di
    * @example
    * Получим конструктор записей, используемый по умолчанию:
    * <pre>
    *    require(['Types/source'], function(source) {
    *       var dataSource = new source.MemorySource();
    *       console.assert(dataSource.getModel() === 'Types/entity:Model');//correct
    *    });
    * </pre>
    */
   getModel(): Function | string;

   setModel(model: Function): void;

   /**
    * Возвращает конструктор рекордсетов, порождаемых источником данных.
    * @return {String|Function}
    * @see listModule
    * @example
    * Получим конструктор рекордсетов, используемый по умолчанию:
    * <pre>
    *    require(['Types/source'], function(source) {
    *       var dataSource = new source.MemorySource();
    *       console.assert(dataSource.getListModule() === 'Types/collection:RecordSet');//correct
    *    });
    * </pre>
    */
   getListModule(): Function | string;

   setListModule(listModule: Function | string): void;

   /**
    * Возвращает название свойства записи, содержащего первичный ключ
    * @return {String}
    * @see idProperty
    * @see Types/_entity/Model#idProperty
    * @example
    * Получим название свойства записи, содержащего первичный ключ:
    * <pre>
    *    require(['Types/source'], function(source) {
    *       var dataSource = new source.Memory({
    *          idProperty: 'id'
    *       });
    *       console.log(dataSource.getIdProperty());//'id'
    *    });
    * </pre>
    */
   getIdProperty(): string;

   setIdProperty(name: string): void;
}
