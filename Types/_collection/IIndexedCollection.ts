/**
 * Интерфейс коллекции с поиском элементов по значению свойств.
 * @interface Types/_collection/IIndexedCollection
 * @author Мальцев А.А.
 * @public
 */
export default interface IIndexedCollection {
   readonly '[Types/_collection/IIndexedCollection]': boolean;

   /**
    * Возвращает индекс первого элемента с указанным значением свойства. Если такого элемента нет - вернет -1.
    * @param {String} property Название свойства элемента.
    * @param {*} value Значение свойства элемента.
    * @return {Number}
    * @example
    * Получим индекс элемента со значением свойства id равным 5:
    * <pre>
    *    var list = new List({
    *       items: [
    *          {id: 1, title: 'One'}
    *          {id: 3, title: 'Three'}
    *          {id: 5, title: 'Five'}
    *       ]
    *    });
    *
    *    list.getIndexByValue('id', 5);//2
    * </pre>
    */
   getIndexByValue(property: string, value: any): number;

   /**
    * Возвращает индексы всех элементов с указанным значением свойства.
    * @param {String} property Название свойства элемента.
    * @param {*} value Значение свойства элемента.
    * @return {Array.<Number>}
    * @example
    * Получим индексы элементов со значением свойства node равным true:
    * <pre>
    *    var list = new List({
    *       items: [
    *          {id: 1, title: 'One', node: true}
    *          {id: 2, title: 'Two', node: true}
    *          {id: 3, title: 'Three', node: false}
    *          {id: 4, title: 'Four', node: true}
    *          {id: 5, title: 'Five', node: false}
    *       ]
    *    });
    *
    *    list.getIndicesByValue('node', true);//[0, 1, 3]
    * </pre>
    */
   getIndicesByValue(property: string, value: any): number[];
}
