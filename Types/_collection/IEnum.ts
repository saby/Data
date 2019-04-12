export type IIndex = number | string | null;

/**
 * Enum type interface. It's an enumerable collection of keys and values one of which can be selected or not.
 * @interface Types/_collection/IEnum
 * @public
 * @author Мальцев А.А.
 */
export default interface IEnum<T> {
   readonly '[Types/_collection/IEnum]': boolean;

   /**
    * @event Triggers after change the selected item
    * @name Types/_collection/IEnum#onChange
    * @param {Env/Event.Object} event Event descriptor
    * @param {Number} index Key of selected item
    * @param {String} value Value of selected item
    * @example
    * <pre>
    *    requirejs(['Types/collection'], function(collection) {
    *       var colors = new collection.Enum({
    *          dictionary: ['Red', 'Green', 'Blue']
    *       });
    *
    *       colors.subscribe('onChange', function(event, index, value) {
    *          console.log('New index: ' + index);
    *          console.log('New value: ' + value);
    *       });
    *
    *       colors.set(0);//'New index: 0', 'New value: Red'
    *       colors.setByValue('Green');//'New index: 1', 'New value: Green'
    *    });
    * </pre>
    */

   /**
    * Returns key of selected item
    * @return {Number|Null}
    * @example
    * <pre>
    *    requirejs(['Types/collection'], function(collection) {
    *       var colors = new collection.Enum({
    *          dictionary: ['Red', 'Green', 'Blue'],
    *          index: 1
    *       });
    *
    *       console.log(colors.get());//1
    *    });
    * </pre>
    */
   get(): IIndex;

   /**
    * Sets item with given key as selected. If such key is not defined it throws an exception.
    * @param {Number|Null} index Key of selected item
    * @example
    * <pre>
    *    requirejs(['Types/collection'], function(collection) {
    *       var colors = new collection.Enum({
    *          dictionary: ['Red', 'Green', 'Blue']
    *       });
    *
    *       colors.set(1);
    *       console.log(colors.get());//1
    *    });
    * </pre>
    */
   set(index: IIndex): void;

   /**
    * Returns value of selected item
    * @param {Boolean} [localize=false] Should return the localized value
    * @return {String}
    * @example
    * <pre>
    *    requirejs(['Types/collection'], function(collection) {
    *       var colors = new collection.Enum({
    *          dictionary: ['Red', 'Green', 'Blue'],
    *          index: 1
    *       });
    *
    *       console.log(colors.getAsValue());//Green
    *    });
    * </pre>
    */
   getAsValue(): T;

   /**
    * Sets item with given value as selected. If such key is not defined it throws an exception.
    * @param {String} value Value of selected item
    * @param {Boolean} [localize=false] It's the localized value
    * @example
    * <pre>
    *    requirejs(['Types/collection'], function(collection) {
    *       var colors = new collection.Enum({
    *          dictionary: ['Red', 'Green', 'Blue'],
    *          index: 1
    *       });
    *
    *       colors.setByValue('Green');
    *       console.log(colors.get());//1
    *    });
    * </pre>
    */
   setByValue(value: T): void;
}
