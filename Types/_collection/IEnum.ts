/// <amd-module name="Types/_collection/IEnum" />
/**
 * Интерфейс тип "перечисляемое".
 * Работает на основе словаря, хранящего соотвествие индексов и их значений.
 * @interface Types/Type/IEnum
 * @public
 * @author Мальцев А.А.
 */

export type IIndex = number | string | null;

export default interface IEnum<T> /** @lends Types/Type/IEnum.prototype */{
   readonly '[Types/_collection/IEnum]': boolean;

   /**
    * @event onChange После изменения выбранного значения.
    * @param {Core/EventObject} event Дескриптор события
    * @param {Number} index Новый индекс
    * @param {String} value Новое значение
    * @example
    * <pre>
    *    requirejs(['Types/Type/Enum'], function(Enum) {
    *       var colors = new Enum({
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
    * Возвращает индекс выбранного значения.
    * @return {Number|Null}
    * @example
    * <pre>
    *    requirejs(['Types/Type/Enum'], function(Enum) {
    *       var colors = new Enum({
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
    * Устанавливает индекс выбранного значения. Если индекс недопустим, кидает исключение.
    * @param {Number|Null} index Индекс выбранного значения
    * @example
    * <pre>
    *    requirejs(['Types/Type/Enum'], function(Enum) {
    *       var colors = new Enum({
    *          dictionary: ['Red', 'Green', 'Blue']
    *       });
    *
    *       colors.set(1);
    *       console.log(colors.get());//1
    *    });
    * </pre>
    */
   set(index: IIndex);

   /**
    * Возвращает выбранное значение.
    * @param {Boolean} [localize=false] Вернуть локализованное значение
    * @return {String}
    * @example
    * <pre>
    *    requirejs(['Types/Type/Enum'], function(Enum) {
    *       var colors = new Enum({
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
    * Устанавливает выбранное значение. Если значение недопустимо, кидает исключение.
    * @param {String} value Выбраноое значение
    * @param {Boolean} [localize=false] Установить локализованное значение
    * @example
    * <pre>
    *    requirejs(['Types/Type/Enum'], function(Enum) {
    *       var colors = new Enum({
    *          dictionary: ['Red', 'Green', 'Blue'],
    *          index: 1
    *       });
    *
    *       colors.setByValue('Green');
    *       console.log(colors.get());//1
    *    });
    * </pre>
    */
   setByValue(value: T);
}
