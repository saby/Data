/**
 * Интерфейс привязки к коллекции.
 * Позволяет узнавать об изменения, происходящих с элементами коллекции.
 * @interface Types/_collection/IObservable
 * @public
 * @author Мальцев А.А.
 */
export default abstract class IObservable {
    '[Types/_collection/IObservable]': boolean;

    /**
     * Изменение коллекции: добавлены элементы
     */
    static readonly ACTION_ADD: string;

    /**
     * Изменение коллекции: удалены элементы
     */
    static readonly ACTION_REMOVE: string;

    /**
     * Изменение коллекции: изменены элементы
     */
    static readonly ACTION_CHANGE: string;

    /**
     * Изменение коллекции: заменены элементы
     */
    static readonly ACTION_REPLACE: string;

    /**
     * Изменение коллекции: перемещены элементы
     */
    static readonly ACTION_MOVE: string;

    /**
     * Изменение коллекции: значительное изменение
     */
    static readonly ACTION_RESET: string;

    /**
     * @typedef {String} ChangeAction
     * @variant a Добавлены элементы
     * @variant rm Удалены элементы
     * @variant ch Изменены элементы
     * @variant rp Заменены элементы
     * @variant m Перемещены элементы
     * @variant rs Значительное изменение
     */

    /**
     * @event После изменения коллекции
     * @name Types/_collection/IObservable#onCollectionChange
     * @param {Env/Event.Object} event Дескриптор события.
     * @param {ChangeAction} action Действие, приведшее к изменению.
     * @param {Array} newItems Новые элементы коллекции.
     * @param {Number} newItemsIndex Индекс, в котором появились новые элементы.
     * @param {Array} oldItems Удаленные элементы коллекции.
     * @param {Number} oldItemsIndex Индекс, в котором удалены элементы.
     * @example
     * <pre>
     * define([
     *     'Types/collection'
     * ], function(collection) {
     *     var list = new collection.ObservableList({
     *         items: [1, 2, 3]
     *     });
     *
     *     list.subscribe(
     *         'onCollectionChange',
     *        function(eventObject, action, newItems, newItemsIndex, oldItems, oldItemsIndex) {
     *             if (action == collection.IObservable.ACTION_REMOVE){
     *                 console.log(oldItems);//[1]
     *                 console.log(oldItemsIndex);//0
     *             }
     *         }
     *     );
     *
     *     list.removeAt(0);
     * });
     * </pre>
     */

    /**
     * @event После изменения элемента коллекции
     * @name Types/_collection/IObservable#onCollectionItemChange
     * @param {Env/Event.Object} event Дескриптор события.
     * @param {*} item Измененный элемент коллекции.
     * @param {Number} index Индекс измененного элемента.
     * @param {Object} [properties] Изменившиеся свойства
     * @example
     * Отследим изменение свойства title:
     * <pre>
     *     var records = [new Record(), new Record(), new Record()],
     *         list = new ObservableList({
     *             items: records
     *         });
     *
     *     list.subscribe('onCollectionItemChange', function(eventObject, item, index, properties) {
     *         console.log(item === records[2]);//true
     *         console.log(index);//2
     *         console.log('title' in properties);//true
     *     });
     *
     *     records[2].set('title', 'test');
     * </pre>
     */
}

Object.assign(IObservable.prototype, {
    '[Types/_collection/IObservable]': true,
});

Object.assign(IObservable, {
    ACTION_ADD: 'a',
    ACTION_REMOVE: 'rm',
    ACTION_CHANGE: 'ch',
    ACTION_REPLACE: 'rp',
    ACTION_MOVE: 'm',
    ACTION_RESET: 'rs',
});
