/// <amd-module name="Types/_entity/IEquatable" />
/**
 * Интерфейс сравнения объектов.
 * @interface Types/_entity/IEquatable
 * @public
 * @author Мальцев А.А.
 */

export default interface IEquatable /** @lends Types/_entity/IEquatable.prototype */{
   readonly '[Types/_entity/IEquatable]': boolean;

   /**
    * Проверяет эквивалентность текущего объекта другому объекту.
    * @param {Object} to Объект, с которым сравнивается текущий объект.
    * @return {Boolean}
    * @example
    * Проверим идентичность записей до и после изменения поля:
    * <pre>
    * requirejs(['Types/Entity/Record'], function(Record) {
    *    var articleA = new Record({
    *          rawData: {
    *             foo: 'bar'
    *          }
    *       }),
    *       articleB = articleA.clone();
    *
    *    articleA.isEqual(articleB);//true
    *    articleA.set('title', 'New Title');
    *    articleA.isEqual(articleB);//false
    * });
    * </pre>
    */
   isEqual(to: Object): boolean;
}
