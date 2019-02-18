/// <amd-module name="Types/_entity/ICloneable" />
/**
 * Интерфейс клонирования объекта.
 * @interface Types/_entity/ICloneable
 * @public
 * @author Мальцев А.А.
 */

export default interface ICloneable /** @lends Types/_entity/ICloneable.prototype */{
   readonly '[Types/_entity/ICloneable]': boolean;

   /**
    * Создает новый объект, который являтся копией текущего экземпляра.
    * @param {Object} [shallow=false] Создать поверхностную копию (агрегированные объекты не клонируются).
    * Использовать поверхностные копии можно только для чтения, т.к. изменения в них будут отражаться и на оригинале.
    * @return {Object}
    * @example
    * Создадим клон книги:
    * <pre>
    *    var book = new Record({
    *          rawData: {
    *             id: 1,
    *             title: 'Patterns of Enterprise Application Architecture'
    *          }
    *       }),
    *       clone = book.clone();
    *    book.get('title');//'Patterns of Enterprise Application Architecture'
    *    clone.get('title');//'Patterns of Enterprise Application Architecture'
    *    book.isEqual(clone);//true
    * </pre>
    */
   clone<T>(shallow?: boolean): T;
}
