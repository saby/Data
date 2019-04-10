/**
 * Интерфейс сравнения объектов.
 * @interface Types/_entity/IEquatable
 * @public
 * @author Мальцев А.А.
 */
export default interface IEquatable {
   readonly '[Types/_entity/IEquatable]': boolean;

   /**
    * Проверяет эквивалентность текущего объекта другому объекту.
    * @param {Object} to Объект, с которым сравнивается текущий объект.
    * @return {Boolean}
    * @example
    * Проверим идентичность записей до и после изменения поля:
    * <pre>
    * requirejs(['Types/entity'], function(entity) {
    *    var articleA = new entity.Record({
    *       rawData: {
    *          foo: 'bar'
    *       }
    *    });
    *    var articleB = articleA.clone();
    *
    *    articleA.isEqual(articleB);//true
    *    articleA.set('title', 'New Title');
    *    articleA.isEqual(articleB);//false
    * });
    * </pre>
    */
   isEqual(to: object): boolean;
}
