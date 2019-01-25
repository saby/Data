/// <amd-module name="Types/_collection/IFlags" />
/**
 * Flags interface. It's an enumerable collection of keys and values every one of which can be selected or not.
 * @interface Types/_collectionIFlags
 * @public
 * @author Мальцев А.А.
 */

export type IValue = boolean | null;

export default interface IFlags<T> /** @lends Types/_collectionIFlags.prototype */{
   readonly '[Types/_collection/IFlags]': boolean;

   /**
    * @event onChange Triggers after change the selection
    * @param {Core/EventObject} event Event descriptor
    * @param {String} name Name of the flag
    * @param {Number} index Index of the flag
    * @param {Boolean|Null} value New value of selection of the flag
    * @example
    * <pre>
    *    requirejs(['Types/collection'], function(collection) {
    *       var colors = new collection.Flags({
    *          dictionary: ['Red', 'Green', 'Blue']
    *       });
    *
    *       colors.subscribe('onChange', function(event, name, index, value) {
    *          console.log(name + '[' + index + ']: ' + value);
    *       });
    *
    *       colors.set('Red', true);//'Red[0]: true'
    *       colors.setByIndex(1, false);//'Green[1]: false'
    *    });
    * </pre>
    */

   /**
    * Returns selection state by the flag name. If such name is not defined it throws an exception.
    * @param {String} name Name of the flag
    * @param {Boolean} [localize=false] Should return the localized flag name
    * @return {Boolean|Null}
    * @example
    * <pre>
    *    requirejs(['Types/collection'], function(collection) {
    *       var colors = new collection.Flags({
    *          dictionary: ['Red', 'Green', 'Blue'],
    *          values: [false, true, false]
    *       });
    *
    *       colors.get('Red');//false
    *       colors.get('Green');//true
    *    });
    * </pre>
    */
   get(name: T): IValue;

   /**
    * Sets selection state by the flag name. If such name is not defined it throws an exception.
    * @param {String} name Name of the flag
    * @param {Boolean|Null} value Selection state
    * @param {Boolean} [localize=false] It's the localized flag name
    * @example
    * <pre>
    *    requirejs(['Types/collection'], function(collection) {
    *       var colors = new collection.Flags({
    *          dictionary: ['Red', 'Green', 'Blue']
    *       });
    *
    *       colors.set('Red', false);
    *       colors.set('Green', true);
    *
    *       colors.get('Red');//false
    *       colors.get('Green');//true
    *    });
    * </pre>
    */
   set(name: T, value: IValue);

   /**
    * Returns selection state by the flag index. If such index is not defined it throws an exception.
    * @param {Number} index Index of the flag
    * @return {Boolean|Null}
    * @example
    * <pre>
    *    requirejs(['Types/collection'], function(collection) {
    *       var colors = new collection.Flags({
    *          dictionary: ['Red', 'Green', 'Blue'],
    *          values: [false, true, false]
    *       });
    *
    *       colors.getByIndex(0);//false
    *       colors.getByIndex(1);//true
    *    });
    * </pre>
    */
   getByIndex(index: number): IValue;

   /**
    * Sets selection state by the flag index. If such index is not defined it throws an exception.
    * @param {Number} index Index of the flag
    * @param {Boolean|Null} value Selection state
    * @example
    * <pre>
    *    requirejs(['Types/collection'], function(collection) {
    *       var colors = new collection.Flags({
    *          dictionary: ['Red', 'Green', 'Blue'],
    *          values: [false, true, false]
    *       });
    *
    *       colors.setByIndex(0, false);
    *       colors.setByIndex(1, true);
    *
    *       colors.get('Red');//false
    *       colors.get('Green');//true
    *    });
    * </pre>
    */
   setByIndex(index: number, value: IValue);

   /**
    * Sets selection state of all the flags to false
    */
   setFalseAll();

   /**
    * Sets selection state of all the flags to true
    */
   setTrueAll();

   /**
    * Sets selection state of all the flags to null
    */
   setNullAll();
}
