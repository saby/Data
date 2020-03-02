import IEnumerable from './IEnumerable';
import IObservable from './IObservable';
import List, {IOptions as IListOptions} from './List';
import EventRaisingMixin from './EventRaisingMixin';
import {
    ISerializableSignature,
    ObservableMixin,
    SerializableMixin
} from '../entity';
import {IReceiver} from '../_entity/relation';
import {register} from '../di';
import {applyMixins} from '../util';

const arraySlice = Array.prototype.slice;

/**
 * Список, в котором можно отслеживать изменения.
 * @remark
 * <pre>
 *     import {ObservableList, IObservable} from 'Types/collection';
 *
 *     const list = new ObservableList({
 *         items: [1, 2, 3]
 *     });
 *
 *     list.subscribe('onCollectionChange', (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) => {
 *         if (action == IObservable.ACTION_REMOVE) {
 *             console.log(oldItems); // [1]
 *             console.log(oldItemsIndex); // 0
 *         }
 *     });
 *
 *     list.removeAt(0);
 * </pre>
 * @class Types/_collection/ObservableList
 * @extends Types/_collection/List
 * @implements Types/_collection/IObservable
 * @implements Types/_entity/relation/IReceiver
 * @mixes Types/_entity/ObservableMixin
 * @mixes Types/_collection/EventRaisingMixin
 * @public
 * @author Мальцев А.А.
 */
class ObservableList<T> extends List<T> implements IReceiver {
    /**
     * Count of changed items that is a critical to generate one event with ACTION_RESET action instead of several ones
     */
    protected _resetChangesCount: number;

    /**
     * Items changed during event raising was switched off
     */
    protected _silentChangedItems: T[];

    constructor(options?: IListOptions<T>) {
        super(options);
        EventRaisingMixin.call(this, options);

        this._publish('onCollectionChange', 'onCollectionItemChange');
    }

    // region List

    assign(items: IEnumerable<T> | T[]): void {
        const oldItems = this._itemsSlice();
        const eventsWasRaised = this._eventRaising;

        this._eventRaising = false;
        super.assign(items);
        this._eventRaising = eventsWasRaised;

        if (oldItems.length > 0 || this._$items.length > 0) {
            this._notifyCollectionChange(
                IObservable.ACTION_RESET,
                this._itemsSlice(),
                0,
                oldItems,
                0
            );
        }
    }

    append(items: IEnumerable<T> | T[]): void {
        const eventsWasRaised = this._eventRaising;

        this._eventRaising = false;
        const count = this.getCount();
        super.append(items);
        this._eventRaising = eventsWasRaised;

        this._notifyCollectionChange(
            IObservable.ACTION_ADD,
            this._itemsSlice(count),
            count,
            [],
            0
        );
    }

    prepend(items: IEnumerable<T> | T[]): void {
        const eventsWasRaised = this._eventRaising;

        this._eventRaising = false;
        const length = this.getCount();
        super.prepend(items);
        this._eventRaising = eventsWasRaised;

        this._notifyCollectionChange(
            IObservable.ACTION_ADD,
            this._itemsSlice(0, this.getCount() - length),
            0,
            [],
            0
        );
    }

    clear(): void {
        const oldItems = this._$items.slice();
        const eventsWasRaised = this._eventRaising;

        this._eventRaising = false;
        super.clear();
        this._eventRaising = eventsWasRaised;

        this._notifyCollectionChange(
            IObservable.ACTION_RESET,
            this._itemsSlice(),
            0,
            oldItems,
            0
        );
    }

    add(item: T, at?: number): void {
        super.add(item, at);
        at = this._isValidIndex(at) ? at : this.getCount() - 1;
        this._notifyCollectionChange(
            IObservable.ACTION_ADD,
            this._itemsSlice(at, at + 1),
            at,
            [],
            0
        );
    }

    removeAt(index: number): T {
        const item = super.removeAt(index);
        this._notifyCollectionChange(
            IObservable.ACTION_REMOVE,
            [],
            0,
            [item],
            index
        );
        return item;
    }

    replace(item: T, at: number): void {
        const oldItem = this._$items[at];
        super.replace(item, at);

        // Replace with itself has no effect
        if (oldItem !== item) {
            this._notifyCollectionChange(
                IObservable.ACTION_REPLACE,
                this._itemsSlice(at, at + 1),
                at,
                [oldItem],
                at
            );
        }
    }

    move(from: number, to: number): void {
        const item = this._$items[from];
        super.move(from, to);

        if (from !== to) {
            this._notifyCollectionChange(
                IObservable.ACTION_MOVE,
                [item],
                to,
                [item],
                from
            );
        }
    }

    // endregion

    // region IReceiver

    readonly '[Types/_entity/relation/IReceiver]': boolean;

    relationChanged(which: any, route: string[]): any {
        const target = which.target;
        const index = this.getIndex(target);
        const data = {};

        if (index > -1) {
            this._reindex(
                undefined,
                index,
                1
            );
        }

        const name = route[0];
        if (name === undefined) {
            this._notifyItemChange(
                target,
                which.data || {}
            );
        }

        data[index] = target;
        return {
            target,
            data
        };
    }

    // endregion

    // region EventRaisingMixin

    setEventRaising(enabled: boolean, analyze?: boolean): void {
        EventRaisingMixin.prototype.setEventRaising.call(this, enabled, analyze);

        // Если стрелять событиями до синхронизации то проекция не всегда сможет найти стрельнувший item или найдет
        // не тот
        if (enabled && analyze && this._silentChangedItems) {
            if (this._silentChangedItems.length >= Math.min(this._resetChangesCount, this._$items.length)) {
                // Если изменилось критическое число элементов, то генерируем reset
                this._notifyCollectionChange(
                    IObservable.ACTION_RESET,
                    this._itemsSlice(),
                    0,
                    [],
                    0
                );
            } else {
                // Собираем изменившиеся элементы в пачки
                this._extractPacksByList(
                    this,
                    this._silentChangedItems,
                    (pack, index) => {
                        this._notifyCollectionChange(
                            IObservable.ACTION_CHANGE,
                            pack,
                            index,
                            pack,
                            index
                        );
                    }
                );
            }
        }
        delete this._silentChangedItems;
    }

    // endregion

    // region Protected methods

    /**
     * Генерирует событие об изменении элемента
     * @param item Элемент
     * @param properties Изменившиеся свойства
     */
    protected _notifyItemChange(item: T, properties: object): void {
        if (this._isNeedNotifyCollectionItemChange()) {
            const index = this.getIndex(item);
            this._notify(
                'onCollectionItemChange',
                this._$items[index],
                index,
                properties
            );
        }

        if (
            (this.hasEventHandlers('onCollectionItemChange') || this.hasEventHandlers('onCollectionChange')) &&
            !this._eventRaising
        ) {
            if (!this._silentChangedItems) {
                this._silentChangedItems = [];
            }
            this._silentChangedItems.push(item);
        }
    }

    /**
     * Извлекает элементы, входящие в указанный отрезок
     * @param [begin] Индекс, по которому начинать извлечение.
     * @param [end] Индекс, по которому заканчивать извлечение.
     * @protected
     */
    protected _itemsSlice(begin?: number, end?: number): T[] {
        return arraySlice.apply(this._$items, arguments);
    }

    /**
     * Возвращает признак, что нужно генерировать события об изменениях элементов коллекции
     * @protected
     */
    protected _isNeedNotifyCollectionItemChange(): boolean {
        return this._eventRaising && this.hasEventHandlers('onCollectionItemChange');
    }

    // endregion

    // region SerializableMixin

    static fromJSON<T = SerializableMixin, K = any>(data: ISerializableSignature<K>): T {
        return List.fromJSON.call(this, data);
    }

    // endregion
}

applyMixins(ObservableList, ObservableMixin, IObservable, EventRaisingMixin);
// tslint:disable-next-line:interface-name
interface ObservableList<T> extends List<T>, ObservableMixin, EventRaisingMixin, IReceiver {}

Object.assign(ObservableList.prototype, {
    '[Types/_collection/ObservableList]': true,
    '[Types/_entity/relation/IReceiver]': true,
    _moduleName: 'Types/collection:ObservableList',
    _resetChangesCount: 100
});

export default ObservableList;

register('Types/collection:ObservableList', ObservableList, {instantiate: false});
