interface IIndex {
    [key: string]: number[];
}

interface IIndices {
    [key: string]: IIndex;
}

/**
 * Ищет позицию вставки значения в отсортированный массив методом деления пополам.
 * @param items Массив, значения котрого отсортированы по возрастанию.
 * @param value Вставляемое значение
 */
function getInsertPosition(items: number[], value: number): number {
    let begin = 0;
    let end = items.length;
    let delta: number;
    while ((delta = end - begin) > 0) {
        const position = begin + Math.floor(delta / 2);
        const given = items[position];
        if (given === value) {
            return position;
        } else if (given > value) {
            end = Math.min(position, end - 1);
        } else {
            begin = Math.max(position, begin + 1);
        }
    }

    return begin;
}

/**
 * Индексатор коллекции
 * @class Types/_collection/Indexer
 * @public
 * @author Кудрявцев И.С.
 */
export default class Indexer<T> {
    /**
     * Коллекция
     */
    _collection: T;

    /**
     * Метод, возвращающий кол-во элементов коллекции
     */
    _count: (items: T) => number;

    /**
     * Метод, возвращающий элемент коллекции по индексу
     */
    _at: (items: T, index: number) => any;

    /**
     * Метод, возвращающий значение свойства элемента коллекции
     */
    _prop: (item: any, prop: string) => any;

    /**
     * Индексы, распределенные по полям
     */
    _indices: IIndices;

    /**
     * Конструктор
     * @param collection Коллекция
     * @param count Метод, возвращающий кол-во элементов коллекции
     * @param at Метод, возвращающий элемент коллекции по индексу
     * @param prop Метод, возвращающий значение свойства элемента коллекции
     */
    constructor(
        collection: T,
        count: (items: T) => number,
        at: (items: T, index: number) => any,
        prop: (item: any, prop: string) => any
    ) {
        this._collection = collection;
        this._count = count;
        this._at = at;
        this._prop = prop;
        this.resetIndex();
    }

    // region Public methods

    /**
     * Возвращает индекс первого элемента с указанным значением свойства. Если такого элемента нет - вернет -1.
     * @param property Название свойства элемента.
     * @param value Значение свойства элемента.
     */
    getIndexByValue(property: string, value: any): number {
        const indices = this.getIndicesByValue(property, value);
        return indices.length ? indices[0] : -1;
    }

    /**
     * Возвращает индексы всех элементов с указанным значением свойства.
     * @param property Название свойства элемента.
     * @param value Значение свойства элемента.
     */
    getIndicesByValue(property: string, value: any): number[] {
        const index = this._getIndex(property);
        if (index) {
            if (index[value]) {
                return index[value].slice();
            }
            value = '[' + (Array.isArray(value) ? value.join(',') : value) + ']';
            if (index[value]) {
                return index[value].slice();
            }
        }
        return [];
    }

    /**
     * Сбрасывает индекс
     */
    resetIndex(): void {
        this._indices = null;
    }

    /**
     * Обновляет индекс элементов
     * @param start С какой позиции
     * @param count Число обновляемых элементов
     */
    updateIndex(start: number, count: number): void {
        const indices = this._indices;

        if (!indices) {
            return;
        }

        // tslint:disable-next-line:forin
        for (const property in indices) {
            this._updateIndex(property, start, count);
        }
    }

    /**
     * Сдвигает индекс элементов
     * @param start С какой позиции
     * @param count Число сдвигаемых элементов
     * @param offset На сколько сдвинуть индексы
     */
    shiftIndex(start: number, count: number, offset: number): void {
        const finish = start + count;
        this._eachIndexItem((data) => {
            for (let i = 0; i < data.length; i++) {
                if (data[i] >= start && data[i] < finish) {
                    data[i] += offset;
                }
            }
        });
    }

    /**
     * Удаляет элементы из индекса
     * @param start С какой позиции
     * @param count Число удаляемых элементов
     */
    removeFromIndex(start: number, count: number): void {
        this._eachIndexItem((data) => {
            for (let i = 0; i < count; i++) {
                const at = data.indexOf(start + i);
                if (at > -1) {
                    data.splice(at, 1);
                }
            }
        });
    }

    // endregion

    // region Protected methods

    /**
     * Перебирает проиндексированные значения для всех свойств
     * @param callback Метод обратного вызова
     * @protected
     */
    protected _eachIndexItem(callback: Function): void {
        const indices = this._indices;
        if (!indices) {
            return;
        }

        let values;
        // tslint:disable-next-line:forin
        for (const property in indices) {
            values = indices[property];
            // tslint:disable-next-line:forin
            for (const value in values) {
                callback(values[value], value, property);
            }
        }
    }

    /**
     * Возвращает индекс для указанного свойства.
     * @param property Название свойства.
     * @protected
     */
    protected _getIndex(property: string): IIndex {
        if (!property) {
            return undefined;
        }
        if (!this._hasIndex(property)) {
            this._createIndex(property);
        }
        return this._indices[property];
    }

    /**
     * Проверяет наличие индекса для указанного свойства.
     * @param [property] Название свойства.
     * @protected
     */
    protected _hasIndex(property: string): boolean {
        return property && this._indices ? property in this._indices : false;
    }

    /**
     * Удаляет индекс для указанного свойства.
     * @param property Название свойства.
     * @protected
     */
    protected _deleteIndex(property: string): void {
        delete this._indices[property];
    }

    /**
     * Создает индекс для указанного свойства.
     * @param property Название свойства.
     * @protected
     */
    protected _createIndex(property: string): void {
        if (!property) {
            return;
        }
        if (!this._indices) {
            this._indices = Object.create(null);
        }
        this._indices[property] = Object.create(null);

        this._updateIndex(property, 0, this._count(this._collection));
    }

    /**
     * Обновляет индекс указанного свойства
     * @param property Название свойства.
     * @param start С какой позиции
     * @param count Число элементов
     * @protected
     */
    protected _updateIndex(property: string, start: number, count: number): void {
        const index = this._indices[property];
        if (!index) {
            return;
        }

        let item;
        let value;
        let positions;
        for (let i = start; i < start + count; i++) {
            item = this._at(this._collection, i);
            value = this._prop(item, property);
            if (value instanceof Array) {
                value = '[' + value.join(',') + ']';
            }
            if (!(value in index)) {
                index[value] = [];
            }
            positions = index[value];
            positions.splice(
                getInsertPosition(positions, i),
                0,
                i
            );
        }
    }

    // region
}

Indexer.prototype['[Types/_collection/Indexer]'] = true;
Indexer.prototype._collection = null;
Indexer.prototype._count = null;
Indexer.prototype._at = null;
Indexer.prototype._prop = null;
Indexer.prototype._indices = null;
