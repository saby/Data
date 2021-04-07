import ObservableMixin from './ObservableMixin';
import { EntityMarker } from '../_declarations';

/**
 * Миксин для реализации сущности, в которой можно приостанавливать генерацию событий об изменениях с фиксацией состояния.
 * Работает соместно с {@link Types/_entity/ObservableMixin}.
 * @mixin Types/_entity/EventRaisingMixin
 * @public
 * @author Кудрявцев И.С.
 */
class EventRaisingMixin {
    '[Types/_entity/EventRaisingMixin]': EntityMarker;

    /**
     * @event После изменения режима генерации событий
     * @name Types/_entity/EventRaisingMixin#onEventRaisingChange
     * @param {Boolean} enabled Включена или выключена генерация событий
     * @param {Boolean} analyze Включен или выключен анализ изменений
     */

    /**
     * Генерация событий включена
     */
    protected _eventRaising: boolean;

    /**
     * Hooks to implement additional behaviour when event rasing occuires
     */
    protected _eventRaisingTrigger: (enabled: boolean, analyze?: boolean) => void;

    constructor() {
        this._publish('onEventRaisingChange');
    }

    // region Public methods

    /**
     * Включает/выключает генерацию событий об изменении коллекции
     * @param enabled Включить или выключить генерацию событий
     * @param [analyze=false] Анализировать изменения (если включить, то при enabled = true будет произведен анализ всех изменений с момента enabled = false - сгенерируются события обо всех изменениях)
     * @example
     * Сгенерируем событие о перемещении элемента c позиции 1 на позицию 3:
     * <pre>
     *     import {ObservableList, IObservable} from 'Types/collection';
     *
     *     const list = new ObservableList({
     *         items: ['one', 'two', 'three', 'four', 'five']
     *     });
     *
     *     list.subscribe('onCollectionChange', (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) => {
     *         console.log(action === IObservable.ACTION_MOVE); // true
     *
     *         console.log(oldItems[0] === 'two'); // true
     *         console.log(oldItems[0] === item); // true
     *         console.log(oldItemsIndex === 1); // true
     *
     *         console.log(newItems[0] === 'two'); // true
     *         console.log(newItems[0] === item); // true
     *         console.log(newItemsIndex === 3); // true
     *     });
     *
     *     list.setEventRaising(false, true);
     *     const item = list.removeAt(1);
     *     list.add(item, 3);
     *     list.setEventRaising(true, true);
     * </pre>
     */
    setEventRaising(enabled: boolean, analyze?: boolean): void {
        enabled = !!enabled;
        analyze = !!analyze;
        const isEqual = this._eventRaising === enabled;

        if (analyze && isEqual) {
            throw new Error(`The events raising is already ${enabled ? 'enabled' : 'disabled'} with analize=true`);
        }

        if (this._eventRaisingTrigger) {
            this._eventRaisingTrigger.call(this, enabled, analyze);
        }

        this._eventRaising = enabled;

        if (!isEqual) {
            this._notify('onEventRaisingChange', enabled, analyze);
        }
    }

    /**
     * Возвращает признак, включена ли генерация событий об изменении проекции
     */
    isEventRaising(): boolean {
        return this._eventRaising;
    }

    // endregion
}

// tslint:disable-next-line:interface-name no-empty-interface
interface EventRaisingMixin extends ObservableMixin {}

export default EventRaisingMixin;

Object.assign(EventRaisingMixin.prototype, {
    '[Types/_entity/EventRaisingMixin]': true,
    _eventRaising: true
});
