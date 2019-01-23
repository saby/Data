/// <amd-module name="Types/_collection/IFlags" />
/**
 * Интерфейс типа "флаги".
 * Работает на основе словаря, хранящего соотвествие индексов и их значений.
 * @interface Types/_collectionIFlags
 * @public
 * @author Мальцев А.А.
 */

export type IValue = boolean | null;

export default interface IFlags<T> /** @lends Types/_collectionIFlags.prototype */{
   readonly '[Types/_collection/IFlags]': boolean;

   /**
    * @event onChange После изменения состояния флага.
    * @param {Core/EventObject} event Дескриптор события
    * @param {String} name Название флага
    * @param {Number} index Индекс флага
    * @param {Boolean|Null} value Новое значение флага
    * @example
    * <pre>
    *    requirejs(['Types/Type/Flags'], function(Flags) {
    *       var colors = new Flags({
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
    * Возвращает состояние флага с именем. Если имя недопустимо, кидает исключение.
    * @param {String} name Название флага
    * @param {Boolean} [localize=false] Название флага локализовано
    * @return {Boolean|Null}
    * @example
    * <pre>
    *    requirejs(['Types/Type/Flags'], function(Flags) {
    *       var colors = new Flags({
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
    * Устанавливает состояние флага с именем. Если имя недопустимо, кидает исключение.
    * @param {String} name Название флага
    * @param {Boolean|Null} value Значение флага
    * @param {Boolean} [localize=false] Название флага локализовано
    * @example
    * <pre>
    *    requirejs(['Types/Type/Flags'], function(Flags) {
    *       var colors = new Flags({
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
    * Возвращает состояние флага по индексу. Если индекс недопустим, кидает исключение.
    * @param {Number} index Индекс флага
    * @return {Boolean|Null}
    * @example
    * <pre>
    *    requirejs(['Types/Type/Flags'], function(Flags) {
    *       var colors = new Flags({
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
    * Устанавливает состояние флага по индексу. Если индекс недопустим, кидает исключение.
    * @param {Number} index Индекс флага
    * @param {Boolean|Null} value Значение флага
    * @example
    * <pre>
    *    requirejs(['Types/Type/Flags'], function(Flags) {
    *       var colors = new Flags({
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
    * Устанавливает все флаги в состояние false
    */
   setFalseAll();

   /**
    * Устанавливает все флаги в состояние true
    */
   setTrueAll();

   /**
    * Устанавливает все флаги в состояние null
    */
   setNullAll();
}
