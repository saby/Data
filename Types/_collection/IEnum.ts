import { EntityMarker } from '../_declarations';

export type IIndex = number | string | null;

/**
 * Интерфейс перечисляемого типа.
 * Это перечисляемая коллекция ключей и значений, один из которых может быть выбран или нет.
 * @interface Types/_collection/IEnum
 * @public
 * @author Мальцев А.А.
 */

/*
 * Enum type interface. It's an enumerable collection of keys and values and one of them can be selected or not.
 * @interface Types/_collection/IEnum
 * @public
 * @author Мальцев А.А.
 */
export default interface IEnum<T> {
    readonly '[Types/_collection/IEnum]': EntityMarker;

    /**
     * @event Происходит после изменения выбранного элемента.
     * @name Types/_collection/IEnum#onChange
     * @param {Env/Event.Object} event Дескриптор события.
     * @param {Number} index Ключ выбранного элемента.
     * @param {String} value Значение выбранного элемента.
     * @example
     * <pre>
     *     requirejs(['Types/collection'], function(collection) {
     *         var colors = new collection.Enum({
     *             dictionary: ['Red', 'Green', 'Blue']
     *         });
     *
     *         colors.subscribe('onChange', function(event, index, value) {
     *             console.log('New index: ' + index);
     *             console.log('New value: ' + value);
     *         });
     *
     *         colors.set(0);//'New index: 0', 'New value: Red'
     *         colors.setByValue('Green');//'New index: 1', 'New value: Green'
     *     });
     * </pre>
     */

    /*
     * @event Triggers after change the selected item
     * @name Types/_collection/IEnum#onChange
     * @param {Env/Event.Object} event Event descriptor
     * @param {Number} index Key of selected item
     * @param {String} value Value of selected item
     * @example
     * <pre>
     *     requirejs(['Types/collection'], function(collection) {
     *         var colors = new collection.Enum({
     *             dictionary: ['Red', 'Green', 'Blue']
     *         });
     *
     *         colors.subscribe('onChange', function(event, index, value) {
     *             console.log('New index: ' + index);
     *             console.log('New value: ' + value);
     *         });
     *
     *         colors.set(0);//'New index: 0', 'New value: Red'
     *         colors.setByValue('Green');//'New index: 1', 'New value: Green'
     *     });
     * </pre>
     */

    /**
     * Возвращает ключ выбранного элемента.
     * @example
     * <pre>
     *     requirejs(['Types/collection'], function(collection) {
     *         var colors = new collection.Enum({
     *             dictionary: ['Red', 'Green', 'Blue'],
     *             index: 1
     *         });
     *
     *         console.log(colors.get());//1
     *     });
     * </pre>
     */

    /*
     * Returns key of selected item
     * @example
     * <pre>
     *     requirejs(['Types/collection'], function(collection) {
     *         var colors = new collection.Enum({
     *             dictionary: ['Red', 'Green', 'Blue'],
     *             index: 1
     *         });
     *
     *         console.log(colors.get());//1
     *     });
     * </pre>
     */
    get(): IIndex;

    /**
     * Устанавливает элемент с заданным ключом в качестве выбранного. Если такой ключ не определен, генерирует исключение.
     * @param index Ключ выбранного элемента.
     * @example
     * <pre>
     *     requirejs(['Types/collection'], function(collection) {
     *         var colors = new collection.Enum({
     *             dictionary: ['Red', 'Green', 'Blue']
     *         });
     *
     *         colors.set(1);
     *         console.log(colors.get());//1
     *     });
     * </pre>
     */

    /*
     * Sets item with given key as selected. If such key is not defined it throws an exception.
     * @param index Key of selected item
     * @example
     * <pre>
     *     requirejs(['Types/collection'], function(collection) {
     *         var colors = new collection.Enum({
     *             dictionary: ['Red', 'Green', 'Blue']
     *         });
     *
     *         colors.set(1);
     *         console.log(colors.get());//1
     *     });
     * </pre>
     */
    set(index: IIndex): void;

    /**
     * Возвращает значение выбранного элемента.
     * @param [localize=false] Должен вернуть локализованное значение.
     * @example
     * <pre>
     *     requirejs(['Types/collection'], function(collection) {
     *         var colors = new collection.Enum({
     *             dictionary: ['Red', 'Green', 'Blue'],
     *             index: 1
     *         });
     *
     *         console.log(colors.getAsValue());//Green
     *     });
     * </pre>
     */

    /*
     * Returns value of selected item
     * @param [localize=false] Should return the localized value
     * @example
     * <pre>
     *     requirejs(['Types/collection'], function(collection) {
     *         var colors = new collection.Enum({
     *             dictionary: ['Red', 'Green', 'Blue'],
     *             index: 1
     *         });
     *
     *         console.log(colors.getAsValue());//Green
     *     });
     * </pre>
     */
    getAsValue(localize?: boolean): T;

    /**
     * Устанавливает элемент с заданным значением в качестве выбранного. Если такой ключ не определен, генерирует исключение.
     * @param value Значение выбранного элемента.
     * @param [localize=false] Локализованное значение.
     * @example
     * <pre>
     *     requirejs(['Types/collection'], function(collection) {
     *         var colors = new collection.Enum({
     *             dictionary: ['Red', 'Green', 'Blue'],
     *             index: 1
     *         });
     *
     *         colors.setByValue('Green');
     *         console.log(colors.get());//1
     *     });
     * </pre>
     */

    /*
     * Sets item with given value as selected. If such key is not defined it throws an exception.
     * @param value Value of selected item
     * @param [localize=false] It's the localized value
     * @example
     * <pre>
     *     requirejs(['Types/collection'], function(collection) {
     *         var colors = new collection.Enum({
     *             dictionary: ['Red', 'Green', 'Blue'],
     *             index: 1
     *         });
     *
     *         colors.setByValue('Green');
     *         console.log(colors.get());//1
     *     });
     * </pre>
     */
    setByValue(value: T): void;
}
