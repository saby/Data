export type IValue = boolean | null;

/**
 * Интерфейс для типа "Флаг".
 * Это перечисляемая коллекция ключей и значений, каждый из которых может быть выбран или нет.
 * @interface Types/_collection/IFlags
 * @public
 * @author Мальцев А.А.
 */

/*
 * Flags type interface. It's an enumerable collection of keys and values and every one of them can be selected or not.
 * @interface Types/_collection/IFlags
 * @public
 * @author Мальцев А.А.
 */
export default interface IFlags<T> {
    readonly '[Types/_collection/IFlags]': boolean;

    /**
     * @event Происходит после изменения выборки.
     * @name Types/_collection/IFlags#onChange
     * @param {Env/Event.Object} event Дескриптор события.
     * @param {String|Array.<Boolean|Null>} name Имя флага или нескольких флагов в случае массовой операции.
     * @param {Number} [index] Индекс флага.
     * @param {Boolean|Null} [value] Новое значение выбранного флага.
     * @example
     * <pre>
     *     requirejs(['Types/collection'], function(collection) {
     *         var colors = new collection.Flags({
     *             dictionary: ['Red', 'Green', 'Blue']
     *         });
     *
     *         colors.subscribe('onChange', function(event, name, index, value) {
     *             console.log(name + '[' + index + ']: ' + value);
     *         });
     *
     *         colors.set('Red', true);//'Red[0]: true'
     *         colors.setByIndex(1, false);//'Green[1]: false'
     *     });
     * </pre>
     */

    /*
     * @event Triggers after change the selection
     * @name Types/_collection/IFlags#onChange
     * @param {Env/Event.Object} event Event descriptor
     * @param {String|Array.<Boolean|Null>} name Name of the flag or whole flags selection in case of mass operation
     * @param {Number} [index] Index of the flag
     * @param {Boolean|Null} [value] New value of selection of the flag
     * @example
     * <pre>
     *     requirejs(['Types/collection'], function(collection) {
     *         var colors = new collection.Flags({
     *             dictionary: ['Red', 'Green', 'Blue']
     *         });
     *
     *         colors.subscribe('onChange', function(event, name, index, value) {
     *             console.log(name + '[' + index + ']: ' + value);
     *         });
     *
     *         colors.set('Red', true);//'Red[0]: true'
     *         colors.setByIndex(1, false);//'Green[1]: false'
     *     });
     * </pre>
     */

    /**
     * Возвращает состояние выборки по имени флага. Если такое имя не определено, выдает исключение.
     * @param name Имя флага.
     * @param [localize=false] Должен вернуть локализованное имя флага.
     * @example
     * <pre>
     *     requirejs(['Types/collection'], function(collection) {
     *         var colors = new collection.Flags({
     *             dictionary: ['Red', 'Green', 'Blue'],
     *             values: [false, true, false]
     *         });
     *
     *         colors.get('Red');//false
     *         colors.get('Green');//true
     *     });
     * </pre>
     */

    /*
     * Returns selection state by the flag name. If such name is not defined it throws an exception.
     * @param name Name of the flag
     * @param [localize=false] Should return the localized flag name
     * @example
     * <pre>
     *     requirejs(['Types/collection'], function(collection) {
     *         var colors = new collection.Flags({
     *             dictionary: ['Red', 'Green', 'Blue'],
     *             values: [false, true, false]
     *         });
     *
     *         colors.get('Red');//false
     *         colors.get('Green');//true
     *     });
     * </pre>
     */
    get(name: T, localize?: boolean): IValue;

    /**
     * Устанавливает состояние выборки по имени флага. Если такое имя не определено, выдает исключение.
     * @param name Имя флага.
     * @param value Состояние выборки.
     * @param [localize=false] Локализованное имя флага.
     * @example
     * <pre>
     *     requirejs(['Types/collection'], function(collection) {
     *         var colors = new collection.Flags({
     *             dictionary: ['Red', 'Green', 'Blue']
     *         });
     *
     *         colors.set('Red', false);
     *         colors.set('Green', true);
     *
     *         colors.get('Red');//false
     *         colors.get('Green');//true
     *     });
     * </pre>
     */

    /*
     * Sets selection state by the flag name. If such name is not defined it throws an exception.
     * @param name Name of the flag
     * @param value Selection state
     * @param [localize=false] It's the localized flag name
     * @example
     * <pre>
     *     requirejs(['Types/collection'], function(collection) {
     *         var colors = new collection.Flags({
     *             dictionary: ['Red', 'Green', 'Blue']
     *         });
     *
     *         colors.set('Red', false);
     *         colors.set('Green', true);
     *
     *         colors.get('Red');//false
     *         colors.get('Green');//true
     *     });
     * </pre>
     */
    set(name: T, value: IValue, localize?: boolean): void;

    /**
     * Возвращает состояние выборки по индексу флага. Если такой индекс не определен, генерирует исключение.
     * @param index Индекс флага.
     * @example
     * <pre>
     *     requirejs(['Types/collection'], function(collection) {
     *         var colors = new collection.Flags({
     *             dictionary: ['Red', 'Green', 'Blue'],
     *             values: [false, true, false]
     *         });
     *
     *         colors.getByIndex(0);//false
     *         colors.getByIndex(1);//true
     *     });
     * </pre>
     */

    /*
     * Returns selection state by the flag index. If such index is not defined it throws an exception.
     * @param index Index of the flag
     * @example
     * <pre>
     *     requirejs(['Types/collection'], function(collection) {
     *         var colors = new collection.Flags({
     *             dictionary: ['Red', 'Green', 'Blue'],
     *             values: [false, true, false]
     *         });
     *
     *         colors.getByIndex(0);//false
     *         colors.getByIndex(1);//true
     *     });
     * </pre>
     */
    getByIndex(index: number): IValue;

    /**
     * Устанавливает состояние выборки по индексу флага. Если такой индекс не определен, генерирует исключение.
     * @param index Индекс флага.
     * @param value Состояние выборки.
     * @example
     * <pre>
     *     requirejs(['Types/collection'], function(collection) {
     *         var colors = new collection.Flags({
     *             dictionary: ['Red', 'Green', 'Blue'],
     *             values: [false, true, false]
     *         });
     *
     *         colors.setByIndex(0, false);
     *         colors.setByIndex(1, true);
     *
     *         colors.get('Red');//false
     *         colors.get('Green');//true
     *     });
     * </pre>
     */

    /*
     * Sets selection state by the flag index. If such index is not defined it throws an exception.
     * @param index Index of the flag
     * @param value Selection state
     * @example
     * <pre>
     *     requirejs(['Types/collection'], function(collection) {
     *         var colors = new collection.Flags({
     *             dictionary: ['Red', 'Green', 'Blue'],
     *             values: [false, true, false]
     *         });
     *
     *         colors.setByIndex(0, false);
     *         colors.setByIndex(1, true);
     *
     *         colors.get('Red');//false
     *         colors.get('Green');//true
     *     });
     * </pre>
     */
    setByIndex(index: number, value: IValue): void;

    /**
     * Устанавливает выборку флагов из массива. Индексы, которых нет в этом массиве, будут установлены в ноль.
     * @param source Массив выбранных флагов.
     * @example
     * <pre>
     *     requirejs(['Types/collection'], function(collection) {
     *         var colors = new collection.Flags({
     *             dictionary: ['Red', 'Green', 'Blue']
     *         });
     *
     *         colors.fromArray([false, true]);
     *
     *         colors.get('Red');//false
     *         colors.get('Green');//true
     *         colors.get('Blue');//null
     *     });
     * </pre>
     */

    /*
     * Sets flags selection from array. Indices which not present in that array are going to be set to null.
     * @param source Array of flags selection
     * @example
     * <pre>
     *     requirejs(['Types/collection'], function(collection) {
     *         var colors = new collection.Flags({
     *             dictionary: ['Red', 'Green', 'Blue']
     *         });
     *
     *         colors.fromArray([false, true]);
     *
     *         colors.get('Red');//false
     *         colors.get('Green');//true
     *         colors.get('Blue');//null
     *     });
     * </pre>
     */
    fromArray(source: IValue[]): void;

    /**
     * Устанавливает состояние выбора всех флагов на false.
     */

    /*
     * Sets selection state of all the flags to false
     */
    setFalseAll(): void;

    /**
     * Устанавливает состояние выбора всех флагов на true.
     */

    /*
     * Sets selection state of all the flags to true
     */
    setTrueAll(): void;

    /**
     * Устанавливает состояние выбора всех флагов на null.
     */

    /*
     * Sets selection state of all the flags to null
     */
    setNullAll(): void;
}
