import enumerableComparator, {ISession} from './enumerableComparator';
import {ChangeAction} from './IObservable';
import IList from './IList';
import {ISerializable, EventRaisingMixin as EntityEventRaisingMixin} from '../entity';

/**
 * Миксин для реализации коллекции, в которой можно приостанавливать генерацию событий об изменениях с фиксацией состояния.
 * Работает соместно с {@link Types/_entity/EventRaisingMixin}.
 * @mixin Types/_collection/EventRaisingMixin
 * @public
 * @author Мальцев А.А.
 */
class EventRaisingMixin {
    '[Types/_collection/EventRaisingMixin]': boolean;

    protected _eventRaising: boolean;

    /**
     * Метод получения содержимого элемента коллекции (если такое поведение поддерживается)
     */
    protected _sessionItemContentsGetter: string;

    /**
     * Состояние коллекции до выключения генерации событий
     */
    protected _beforeRaiseOff: ISession;

    /**
     * Сообщение для режима блокировки изменений
     */
    protected _blockChangesMessage: string;

    // region EntityEventRaisingMixin

    constructor() {
        EntityEventRaisingMixin.call(this);
    }

    setEventRaising(enabled: boolean, analyze?: boolean): void {
        EntityEventRaisingMixin.prototype.setEventRaising.call(this, enabled, analyze);
    }

    isEventRaising(): boolean {
        return EntityEventRaisingMixin.prototype.isEventRaising.call(this);
    }

    // endregion

    // region Protected methods

    /**
     * Запускает серию обновлений
     * @protected
     */
    protected _startUpdateSession(): ISession {
        if (!this._eventRaising) {
            return null;
        }
        return enumerableComparator.startSession(this as any, this._sessionItemContentsGetter);
    }

    /**
     * Завершает серию обновлений
     * @param session Серия обновлений
     * @param [analize=true] Запустить анализ изменений
     * @protected
     */
    protected _finishUpdateSession(session: ISession, analize?: boolean): void {
        if (!session) {
            return;
        }

        analize = analize === undefined ? true : analize;

        enumerableComparator.finishSession(session, this as any, this._sessionItemContentsGetter);

        if (analize) {
            this._analizeUpdateSession(session);
        }
    }

    /**
     * Анализирует серию обновлений, генерирует события об изменениях
     * @param session Серия обновлений
     * @protected
     */
    protected _analizeUpdateSession(session: ISession): void {
        if (!session) {
            return;
        }

        enumerableComparator.analizeSession(session, this as any, (action, changes) => {
            this._notifyCollectionChange(
                action,
                changes.newItems,
                changes.newItemsIndex,
                changes.oldItems,
                changes.oldItemsIndex,
                session
            );
        });
    }

    /**
     * Генерирует событие об изменении коллекции
     * @param action Действие, приведшее к изменению.
     * @param newItems Новые исходной коллекции.
     * @param newItemsIndex Индекс коллекции, в котором появились новые элементы.
     * @param oldItems Удаленные элементы коллекции.
     * @param oldItemsIndex Индекс коллекции, в котором удалены элементы.
     * @param [session] Серия обновлений
     * @protected
     */
    protected _notifyCollectionChange(
        action: ChangeAction,
        newItems: any[],
        newItemsIndex: number,
        oldItems: any[],
        oldItemsIndex: number,
        session?: ISession
    ): void {
        if (!this._isNeedNotifyCollectionChange()) {
            return;
        }

        // Block from recursive changes in some cases
        if (this._blockChangesMessage) {
            throw new Error(this._blockChangesMessage);
        }
        if (action === ChangeAction.ACTION_RESET) {
            this._blockChangesMessage = `The instance of '${(this as unknown as ISerializable)._moduleName}' is blocked from changes because reset action is in progress.`;
        }

        this._notify(
            'onCollectionChange',
            action,
            newItems,
            newItemsIndex,
            oldItems,
            oldItemsIndex
        );

        this._blockChangesMessage = '';
    }

    /**
     * Разбивает элементы списка на пачки в порядке их следования в списке.
     * @param list Список, в котором содержатся элементы.
     * @param items Элементы в произвольном порядке.
     * @param callback Функция обратного вызова для каждой пачки
     * @protected
     */
    protected _extractPacksByList(list: IList<any>, items: any[], callback: Function): void {
        const send = (pack, index) => {
            callback(pack.slice(), index);
            pack.length = 0;
        };
        const sortedItems = [];
        let item;
        let index;
        for (let i = 0; i < items.length; i++) {
            item = items[i];
            index = list.getIndex(item);
            sortedItems[index] = item;
        }

        const pack = [];
        let packIndex = 0;
        const maxIndex = sortedItems.length - 1;
        for (let index = 0; index <= maxIndex; index++) {
            item = sortedItems[index];

            if (!item) {
                if (pack.length) {
                    send(pack, packIndex);
                }
                continue;
            }

            if (!pack.length) {
                packIndex = index;
            }
            pack.push(item);

        }

        if (pack.length) {
            send(pack, packIndex);
        }
    }

    /**
     * Возвращает признак, что нужно генерировать события об изменениях коллекции
     * @protected
     */
    protected _isNeedNotifyCollectionChange(): boolean {
        return this._eventRaising && this.hasEventHandlers('onCollectionChange');
    }

    // endregion
}

export default EventRaisingMixin;

/**
 * Hook to fulfill changes analysis.
 * Executes in context of instance.
 */
function onEventRaisingChange(this: EventRaisingMixin, enabled: boolean, analyze?: boolean): void {
    if (!analyze) {
        return;
    }

    if (enabled) {
        this._eventRaising = enabled;
        this._finishUpdateSession(this._beforeRaiseOff);
        this._beforeRaiseOff = null;
    } else {
        this._beforeRaiseOff = this._startUpdateSession();
    }
}

Object.assign(EventRaisingMixin.prototype, {
    '[Types/_entity/EventRaisingMixin]': true,
    _eventRaising: true,

    '[Types/_collection/EventRaisingMixin]': true,
    _eventRaisingTrigger: onEventRaisingChange,
    _sessionItemContentsGetter: '',
    _beforeRaiseOff: null,
    _blockChangesMessage: ''
});
