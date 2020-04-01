import IEnumerator from './IEnumerator';

export type EnumeratorIndex = number | string;
export type EnumeratorCallback<T, U = EnumeratorIndex> = (item: T, index: U) => void;

/**
 * Interface of collection which provides their members through simple iteration one by one.
 * @interface Types/_collection/IEnumerable
 * @public
 * @author Мальцев А.А.
 */
export default interface IEnumerable<T, U = EnumeratorIndex> {
    readonly '[Types/_collection/IEnumerable]': boolean;

    /**
     * Возвращает энумератор для перебора элементов коллекции
     * @example
     * Получим элементы коллекции через энумератор:
     * <pre>
     *     var list = new List({
     *             items: [1, 2, 3]
     *         }),
     *         enumerator = list.getEnumerator();
     *
     *     while (enumerator.moveNext()) {
     *         console.log(enumerator.getCurrent());
     *     }
     *     //1, 2, 3
     * </pre>
     */
    getEnumerator(): IEnumerator<T, U>;

    /**
     * Перебирает все элементы коллекции, начиная с первого. Цикл проходит полное количество итераций, его невозможно прервать досрочно.
     * @param callback Функция обратного вызова для каждого элемента коллекции.
     * Аргументами придут
     * <ol>
     *     <li>item - обрабатываемый элемент коллекции, например {@link https://wi.sbis.ru/docs/js/Types/collection/List/ Types/collection:List}; возможные типы коллекций можно найти в библиотеке {@link https://wi.sbis.ru/docs/js/Types/collection/ Types/collection};</li>
     *     <li>index - порядковый номер такого элемента.</li>
     * </ol>
     * @param [context] Контекст вызова callback
     * @example
     * Получим элементы коллекции:
     * <pre>
     *     var list = new collection.List({
     *         items: [1, 2, 3]
     *     }),
     *
     *     list.each(function(item) {
     *         console.log(item);
     *     });
     *     //1, 2, 3
     * </pre>
     */
    each(callback: EnumeratorCallback<T, U>, context?: object): void;
}
