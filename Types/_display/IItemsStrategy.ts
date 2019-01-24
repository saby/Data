/// <amd-module name="Types/_display/IItemsStrategy" />
/**
 * Интерфейс стратегии получения элементов проекции.
 * @interface Types/_display/IItemsStrategy
 * @public
 * @author Мальцев А.А.
 */

import Abstract from './Abstract';
import CollectionItem from './CollectionItem';

export interface IOptions {
   display: Abstract;
}

export default interface IItemsStrategy /** @lends Types/_display/IItemsStrategy.prototype */ {
   readonly '[Types/_display/IItemsStrategy]': boolean;

   /**
    * Возвращает опции конструктора
    */
   readonly options: IOptions;

   /**
    * Декорируемая стратегия
    */
   readonly source: IItemsStrategy;

   /**
    * Возвращает количество элементов проекции
    */
   readonly count: number;

   /**
    * Возвращает элементы проекции
    */
   readonly items: Array<CollectionItem>;

   /**
    * Возвращает элемент по позиции
    * @param {Number} index Позиция
    * @return {Types/_display/CollectionItem}
    */
   at(index: number): CollectionItem;

   /**
    * Модифицирует состав элементов проекции при модификации исходной коллекции
    * @param {Number} start Позиция в коллекции
    * @param {Number} deleteCount Количество удаляемых элементов
    * @param {Array} [added] Добавляемые элементы
    * @return {Types/_display/CollectionItem} Удаленные элементы
    */
   splice(start: number, deleteCount: number, added?: Array<CollectionItem>): Array<CollectionItem>;

   /**
    * Сбрасывает все сформированные результаты
    */
   reset();

   /**
    * Очищает закэшированные результаты
    */
   invalidate();

   /**
    * Возвращает позицию в проекции по позиции в коллекции
    * @param {Number} index Позиция в коллекции
    * @return {Number}
    */
   getDisplayIndex(index: number): number;

   /**
    * Возвращает позицию в коллекци по позиции в проекции
    * @param {Number} index Позиция в проекции
    * @return {Number}
    */
   getCollectionIndex(index: number): number;
}
