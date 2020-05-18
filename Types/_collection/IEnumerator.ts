/**
 * Интерфейс объектов, поддерживающих простые итерации один за другим.
 * @interface Types/_collection/IEnumerator
 * @public
 * @author Мальцев А.А.
 */

/*
 * Interface of object which supports simple iteration one by one.
 * @interface Types/_collection/IEnumerator
 * @public
 * @author Мальцев А.А.
 */
import {EnumeratorIndex} from './IEnumerable';

export default interface IEnumerator<T, U = EnumeratorIndex> {
    readonly '[Types/_collection/IEnumerator]': boolean;

    /**
     * Возвращает текущий элемент
     * @example
     * Проверим текущий элемент:
     * <pre>
     *     var list = new List({
     *             items: [1, 2, 3]
     *         }),
     *         enumerator = list.getEnumerator();
     *
     *     enumerator.getCurrent();//undefined
     *     enumerator.moveNext();//true
     *     enumerator.getCurrent();//1
     * </pre>
     */
    getCurrent(): T;

    /**
     * Возвращает индекс текущего элемента
     * @example
     * Проверим текущий элемент:
     * <pre>
     *     var list = new List({
     *             items: [1, 2, 3]
     *         }),
     *         enumerator = list.getEnumerator();
     *
     *     enumerator.getCurrentIndex();//undefined
     *
     *     enumerator.moveNext();//true
     *     enumerator.getCurrentIndex();//0
     * </pre>
     */
    getCurrentIndex(): U;

    /**
     * Перемещает указатель на следующий элемент
     * @return true, если есть следующий элемент; false, если достигнут конец коллекции
     * @example
     * Получим элементы коллекции:
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
    moveNext(): boolean;

    /**
     * Сбрасывает текущий элемент
     * @example
     * Сбросим текущий элемент:
     * <pre>
     *     var list = new List({
     *             items: [1, 2, 3]
     *         }),
     *         enumerator = list.getEnumerator();
     *
     *     enumerator.moveNext();//true
     *     enumerator.getCurrent();//1
     *     enumerator.reset();
     *     enumerator.getCurrent();//undefined
     * </pre>
     */
    reset(): void;
}
