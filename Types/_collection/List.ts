import IEnumerable, {EnumeratorCallback} from './IEnumerable';
import IList from './IList';
import IObservable, {ChangeAction} from './IObservable';
import IIndexedCollection from './IIndexedCollection';
import Arraywise from './enumerator/Arraywise';
import Indexer from './Indexer';
import {
    CloneableMixin,
    DestroyableMixin,
    IEquatable,
    ISerializableState,
    ManyToManyMixin,
    OptionsToPropertyMixin,
    ReadWriteMixin,
    IReadWriteMixinOptions,
    relation,
    SerializableMixin,
    ISerializableSignature,
    VersionableMixin
} from '../entity';
import {register} from '../di';
import {deprecateExtend, mixin, object} from '../util';

export interface IOptions<T> extends IReadWriteMixinOptions {
    items?: T[];
}

/**
 * Список - коллекция c доступом по индексу.
 * @remark
 * Основные возможности:
 * <ul>
 *     <li>последовательный перебор элементов коллекции - поддержка интерфейса
 *          {@link Types/_collection/IEnumerable};
 *     </li>
 *     <li>доступ к элементам коллекции по индексу - поддержка интерфейса
 *          {@link Types/_collection/IList};
 *     </li>
 *     <li>поиск элементов коллекции по значению свойства - поддержка интерфейса
 *          {@link Types/_collection/IIndexedCollection}.
 *     </li>
 * </ul>
 * Создадим рекордсет, в котором в качестве сырых данных используется plain JSON (адаптер для данных в таком формате используется по умолчанию):
 * <pre>
 *     import {List} from 'Types/collection';
 *
 *     const characters = new List({
 *         items: [{
 *             id: 1,
 *             firstName: 'Tom',
 *             lastName: 'Sawyer'
 *         }, {
 *             id: 2,
 *             firstName: 'Huckleberry',
 *             lastName: 'Finn'
 *         }]
 *     });
 *     console.log(characters.at(0).firstName); // 'Tom'
 *     console.log(characters.at(1).firstName); // 'Huckleberry'
 * </pre>
 * @class Types/_collection/List
 * @mixes Types/_entity/DestroyableMixin
 * @implements Types/_collection/IEnumerable
 * @implements Types/_collection/IList
 * @implements Types/_collection/IIndexedCollection
 * @implements Types/_entity/IEquatable
 * @mixes Types/_entity/OptionsMixin
 * @mixes Types/_entity/SerializableMixin
 * @mixes Types/_entity/CloneableMixin
 * @mixes Types/_entity/ManyToManyMixin
 * @mixes Types/_entity/ReadWriteMixin
 * @mixes Types/_entity/VersionableMixin
 * @public
 * @author Мальцев А.А.
 */
export default class List<T> extends mixin<
    DestroyableMixin,
    OptionsToPropertyMixin,
    SerializableMixin,
    CloneableMixin,
    ManyToManyMixin,
    ReadWriteMixin,
    VersionableMixin
>(
    DestroyableMixin,
    OptionsToPropertyMixin,
    SerializableMixin,
    CloneableMixin,
    ManyToManyMixin,
    ReadWriteMixin,
    VersionableMixin
) implements
   IEnumerable<T, number>,
   IList<T>,
   IIndexedCollection,
   IEquatable {

    /**
     * @cfg {Array.<*>} Элементы списка
     * @name Types/_collection/List#items
     */
    protected _$items: T[];

    /**
     * Items indexer
     */
    protected _indexer: Indexer<T[]>;

    constructor(options?: IOptions<T>) {
        if (options && 'items' in options && !(options.items instanceof Array)) {
            throw new TypeError('Option "items" should be an instance of Array');
        }

        super(options);
        OptionsToPropertyMixin.call(this, options);
        SerializableMixin.call(this);
        ReadWriteMixin.call(this, options);

        this._$items = this._$items || [];
        for (let i = 0, count = this._$items.length; i < count; i++) {
            this._addChild(this._$items[i]);
        }
    }

    destroy(): void {
        this._$items = null;
        this._indexer = null;

        ReadWriteMixin.prototype.destroy.call(this);
        super.destroy();
    }

    // region IEnumerable

    readonly '[Types/_collection/IEnumerable]': boolean;

    /**
     * Возвращает энумератор для перебора элементов списка.
     * Пример использования можно посмотреть в модуле {@link Types/_collection/IEnumerable}.
     */
    getEnumerator(): Arraywise<T> {
        return new Arraywise(this._$items);
    }

    each(callback: EnumeratorCallback<T, number>, context?: object): void {
        // It's faster than use getEnumerator()
        for (let i = 0, count = this.getCount(); i < count; i++) {
            callback.call(
                context || this,
                this.at(i),
                i,
                this
            );
        }
    }

    forEach: (callback: EnumeratorCallback<T, number>, context?: object) => void;

    // endregion

    // region IList

    readonly '[Types/_collection/IList]': boolean;

    assign(items: IEnumerable<T> | T[]): void {
        for (let i = 0, count = this._$items.length; i < count; i++) {
            this._removeChild(this._$items[i]);
        }
        this._$items.length = 0;

        items = this._splice(items || [], 0, IObservable.ACTION_RESET);

        for (let i = 0, count = items.length; i < count; i++) {
            this._addChild(items[i]);
        }
        this._childChanged(items);
    }

    append(items: IEnumerable<T> | T[]): void {
        items = this._splice(items, this.getCount(), IObservable.ACTION_ADD);

        for (let i = 0, count = items.length; i < count; i++) {
            this._addChild(items[i]);
        }
        this._childChanged(items);
    }

    prepend(items: IEnumerable<T> | T[]): void {
        items = this._splice(items, 0, IObservable.ACTION_ADD);

        for (let i = 0, count = items.length; i < count; i++) {
            this._addChild(items[i]);
        }
        this._childChanged(items);
    }

    clear(): void {
        this._$items.length = 0;
        this._reindex();
        this._getMediator().clear(this, relation.ManyToManyClearType.Slaves);
        this._childChanged();
        this._nextVersion();
    }

    add(item: T, at?: number): void {
        if (at === undefined) {
            at = this._$items.length;
            this._$items.push(item);
        } else {
            at = at || 0;
            if (at !== 0 && !this._isValidIndex(at, true)) {
                throw new Error('Index is out of bounds');
            }
            this._$items.splice(at, 0, item);
        }

        this._addChild(item);
        this._childChanged(item);
        this._nextVersion();
        this._reindex(IObservable.ACTION_ADD, at, 1);
    }

    at(index: number): T {
        return this._$items[index];
    }

    remove(item: T): boolean {
        const index = this.getIndex(item);
        if (index !== -1) {
            this.removeAt(index);
            this._childChanged(item);
            return true;
        }
        return false;
    }

    removeAt(index: number): T {
        if (!this._isValidIndex(index)) {
            throw new Error('Index is out of bounds');
        }
        this._removeChild(this._$items[index]);
        const deleted = this._$items.splice(index, 1);
        this._reindex(IObservable.ACTION_REMOVE, index, 1);
        this._childChanged(index);
        this._nextVersion();
        return deleted[0];
    }

    replace(item: T, at: number): void {
        if (!this._isValidIndex(at)) {
            throw new Error('Index is out of bounds');
        }

        const oldItem = this._$items[at];

        // Replace with itself has no effect
        if (oldItem === item) {
            return;
        }

        this._removeChild(oldItem);
        this._$items[at] = item;
        this._addChild(item);
        this._reindex(IObservable.ACTION_REPLACE, at, 1);
        this._childChanged(item);
        this._nextVersion();
    }

    move(from: number, to: number): void {
        if (!this._isValidIndex(from)) {
            throw new Error('Argument "from" is out of bounds');
        }
        if (!this._isValidIndex(to)) {
            throw new Error('Argument "to" is out of bounds');
        }
        if (from === to) {
            return;
        }

        const items = this._$items.splice(from, 1);
        this._$items.splice(to, 0, items[0]);

        if (from < to) {
            this._reindex(IObservable.ACTION_REPLACE, from, 1 + to - from);
        } else {
            this._reindex(IObservable.ACTION_REPLACE, to, 1 + from - to);
        }
        this._childChanged(items[0]);
        this._nextVersion();
    }

    getCount(): number {
        return this._$items.length;
    }

    getIndex(item: T): number {
        return this._$items.indexOf(item);
    }

    // endregion

    // region IIndexedCollection

    readonly '[Types/_collection/IIndexedCollection]': boolean;

    getIndexByValue(property: string, value: any): number {
        return this._getIndexer().getIndexByValue(property, value);
    }

    getIndicesByValue(property: string, value: any): number[] {
        return this._getIndexer().getIndicesByValue(property, value);
    }

    // endregion

    // region IEquatable

    readonly '[Types/_entity/IEquatable]': boolean;

    isEqual(to: any): boolean {
        if (to === this) {
            return true;
        }
        if (!to || !(to instanceof List)) {
            return false;
        }

        if (this.getCount() !== to.getCount()) {
            return false;
        }
        for (let i = 0, count = this.getCount(); i < count; i++) {
            if (this.at(i) !== to.at(i)) {
                return false;
            }
        }
        return true;
    }

    // endregion

    // region SerializableMixin

    static fromJSON<T = SerializableMixin, K = any>(data: ISerializableSignature<K>): T {
        return SerializableMixin.fromJSON.call(this, data);
    }

    _getSerializableState(state: ISerializableState<IOptions<T>>): ISerializableState<IOptions<T>> {
        return SerializableMixin.prototype._getSerializableState.call(this, state);
    }

    _setSerializableState(state: ISerializableState<IOptions<T>>): Function {
        const fromSerializableMixin = SerializableMixin.prototype._setSerializableState(state);
        return function(): void {
            fromSerializableMixin.call(this);
            this._clearIndexer();
        };
    }

    // endregion

    // region Protected methods

    /**
     * Возвращает индексатор коллекции
     * @protected
     */
    protected _getIndexer(): Indexer<T[]> {
        return this._indexer || (this._indexer = new Indexer<T[]>(
            this._$items,
            (items) => items.length,
            (items, at) => items[at],
            (item, property) => object.getPropertyValue(item, property)
        ));
    }

    /**
     * Очищает индексатор коллекции
     * @protected
     */
    protected _clearIndexer(): void {
        this._indexer = null;
    }

    /**
     * Проверяет корректность индекса
     * @param index Индекс
     * @param [addMode=false] Режим добавления
     * @protected
     */
    protected _isValidIndex(index: number, addMode?: boolean): boolean {
        let max = this.getCount();
        if (addMode) {
            max++;
        }
        return index >= 0 && index < max;
    }

    /**
     * Переиндексирует список
     * @param [action] Действие, приведшее к изменению.
     * @param [start=0] С какой позиции переиндексировать
     * @param [count=0] Число переиндексируемых элементов
     * @protected
     */
    protected _reindex(action?: ChangeAction, start?: number, count?: number): void {
        if (!this._indexer) {
            return;
        }

        const indexer = this._getIndexer();
        switch (action) {
            case IObservable.ACTION_ADD:
                indexer.shiftIndex(start, this.getCount() - start, count);
                indexer.updateIndex(start, count);
                break;
            case IObservable.ACTION_REMOVE:
                indexer.removeFromIndex(start, count);
                indexer.shiftIndex(start + count, this.getCount() - start, -count);
                break;
            case IObservable.ACTION_REPLACE:
                indexer.removeFromIndex(start, count);
                indexer.updateIndex(start, count);
                break;
            case IObservable.ACTION_RESET:
                indexer.resetIndex();
                break;
            default:
                if (count > 0) {
                    indexer.removeFromIndex(start, count);
                    indexer.updateIndex(start, count);
                } else {
                    indexer.resetIndex();
                }
        }
    }

    /**
     * Вызывает метод splice
     * @param items Коллекция с элементами для замены
     * @param start Индекс в массиве, с которого начинать добавление.
     * @param action Действие, приведшее к изменению.
     * @protected
     */
    protected _splice(items: IEnumerable<T> | T[], start: number, action: ChangeAction): T[] {
        items = this._itemsToArray(items);
        this._$items.splice(start, 0, ...items);
        this._reindex(action, start, items.length);
        this._nextVersion();
        return items;
    }

    /**
     * Приводит переденные элементы к массиву
     * @protected
     */
    protected _itemsToArray(items: IEnumerable<T> | T[]): T[] {
        if (items instanceof Array) {
            return items;
        } else if (items && items['[Types/_collection/IEnumerable]']) {
            const result = [];
            items.each((item) => {
                result.push(item);
            });
            return result;
        } else {
            throw new TypeError(
                'Argument "items" must be an instance of Array or implement Types/collection:IEnumerable.'
            );
        }
    }

    // endregion

    // region Deprecated

    /**
     * @deprecated
     */
    static extend(mixinsList: any, classExtender: any): Function {
        return deprecateExtend(
             this,
             classExtender,
             mixinsList,
             'Types/_collection/List'
        );
    }

    // endregion
}

Object.assign(List.prototype, {
    '[Types/_collection/List]': true,
    '[Types/_collection/IEnumerable]': true,
    '[Types/_collection/IIndexedCollection]': true,
    '[Types/_collection/IList]': true,
    '[Types/_entity/IEquatable]': true,
    _moduleName: 'Types/collection:List',
    _$items: null,
    _indexer: null
});

// Aliases
List.prototype.forEach = List.prototype.each;

register('Types/collection:List', List, {instantiate: false});
