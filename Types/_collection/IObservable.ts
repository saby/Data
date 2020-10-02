import { EntityMarker } from '../_declarations';
import { Object as EventObject } from 'Env/Event';

export enum ChangeAction {
    ACTION_ADD = 'a',
    ACTION_REMOVE = 'rm',
    ACTION_CHANGE = 'ch',
    ACTION_REPLACE = 'rp',
    ACTION_MOVE = 'm',
    ACTION_RESET = 'rs'
}

export type CollectionChangeHandler<T> = (
    event: EventObject,
    action: ChangeAction,
    newItems: T[],
    newItemsIndex: number,
    oldItems: T[],
    oldItemsIndex: number
) => void;

/**
 * Интерфейс привязки к коллекции.
 * Позволяет узнавать об изменения, происходящих с элементами коллекции.
 * @interface Types/_collection/IObservable
 * @public
 * @author Мальцев А.А.
 */
export default abstract class IObservable {
    '[Types/_collection/IObservable]': EntityMarker;

    /**
     * Изменение коллекции: добавлены элементы
     */
    static readonly ACTION_ADD: ChangeAction = ChangeAction.ACTION_ADD;

    /**
     * Изменение коллекции: удалены элементы
     */
    static readonly ACTION_REMOVE: ChangeAction = ChangeAction.ACTION_REMOVE;

    /**
     * Изменение коллекции: изменены элементы
     */
    static readonly ACTION_CHANGE: ChangeAction = ChangeAction.ACTION_CHANGE;

    /**
     * Изменение коллекции: заменены элементы
     */
    static readonly ACTION_REPLACE: ChangeAction = ChangeAction.ACTION_REPLACE;

    /**
     * Изменение коллекции: перемещены элементы
     */
    static readonly ACTION_MOVE: ChangeAction = ChangeAction.ACTION_MOVE;

    /**
     * Изменение коллекции: значительное изменение
     */
    static readonly ACTION_RESET: ChangeAction = ChangeAction.ACTION_RESET;

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
     *     import {ObservableList, IObservable} from 'Types/collection';
     *
     *     const list = new ObservableList({
     *         items: [1, 2, 3]
     *     });
     *
     *     list.subscribe('onCollectionChange', (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) => {
     *         if (action == IObservable.ACTION_REMOVE){
     *             console.log(oldItems); // [1]
     *             console.log(oldItemsIndex); // 0
     *         }
     *     });
     *
     *     list.removeAt(0);
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
     *     import {ObservableList, IObservable} from 'Types/collection';
     *     import {Record} from 'Types/entity';
     *
     *     const records = [new Record(), new Record(), new Record()];
     *     const list = new ObservableList({
     *         items: records
     *     });
     *
     *     list.subscribe('onCollectionItemChange', (event, item, index, properties) => {
     *         console.log(item === records[2]); // true
     *         console.log(index); // 2
     *         console.log('title' in properties); // true
     *     });
     *
     *     records[2].set('title', 'test');
     * </pre>
     */
}

Object.assign(IObservable.prototype, {
    '[Types/_collection/IObservable]': true
});
