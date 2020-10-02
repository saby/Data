import { DestroyableMixin } from '../entity';
import { IEnumerable } from '../collection';
import { object } from '../util';
import { resolve } from '../di';
import { CompareFunction, EntityMarker } from '../_declarations';
import IEnumerator from '../_collection/IEnumerator';
import { EnumeratorIndex } from '../_collection/IEnumerable';
import Zipped from './Zipped';
import Mapped from './Mapped';
import Concatenated from './Concatenated';
import Flattened from './Flattened';
import Grouped from './Grouped';
import Counted from './Counted';
import Uniquely from './Uniquely';
import Filtered from './Filtered';
import Sliced from './Sliced';
import Reversed from './Reversed';
import Sorted from './Sorted';

export interface IObject<T> {
    [key: string]: T;
}

type PropertyMapFunc<T, U> = (item: T, property: U) => any;
type ReduceFunc<T, U> = (memo: any, item: T, index: U) => any;

/**
 * Абстрактная цепочка.
 * Это абстрактный класс, не предназначенный для создания самостоятельных экземпляров.
 * @class Types/_chain/Abstract
 * @mixes Types/_entity/DestroyableMixin
 * @implements Types/_collection/IEnumerable
 * @public
 * @author Мальцев А.А.
 */
export default abstract class Abstract<T, U = EnumeratorIndex> extends DestroyableMixin implements IEnumerable<T, U> {
    /**
     * Первый элемент цепочки
     */
    get start(): Abstract<T, U> {
        return this._previous ? this._previous.start : this;
    }

    /**
     * Требуется сохранять оригинальные индексы элементов
     */
    get shouldSaveIndices(): boolean {
        return this._previous ? this._previous.shouldSaveIndices : true;
    }

    /**
     * Данные, обрабатываемые цепочкой
     */
    protected _source: any;

    /**
     * Предыдущий элемент цепочки
     */
    protected _previous: Abstract<T, U>;

    /**
     * Конструктор цепочки
     * @param source Данные, обрабатываемые цепочкой
     */
    constructor(source: Abstract<T, U> | any) {
        super();

        if (source['[Types/_chain/Abstract]']) {
            this._previous = source as Abstract<T, U>;
            this._source = this._previous._source;
        } else {
            this._source = source;
        }
    }

    destroy(): void {
        this._source = null;
        this._previous = null;
        super.destroy();
    }

    // region IEnumerable

    readonly '[Types/_collection/IEnumerable]': EntityMarker = true;

    getEnumerator(): IEnumerator<T, U> {
        throw new Error('Not implemented');
    }

    /**
     * Перебирает все элементы коллекции, начиная с первого.
     * @param callback Колбэк для каждого элемента (аргументами придут элемент коллекции и его индекс)
     * @param [context] Контекст вызова callback
     * @example
     * Получим элементы коллекции:
     * <pre>
     * import {factory} from 'Types/chain';
     * factory({foo: 'Foo', bar: 'Bar'}).each((value, key) => {
     *     console.log('key: ' + key + ', value: ' + value);
     * });
     * //'key: foo, value: Foo', 'key: bar, value: Bar'
     * </pre>
     */
    each(callback: (item: T, index: U) => void, context?: object): void {
        const enumerator = this.getEnumerator();
        while (enumerator.moveNext()) {
            callback.call(
                context || this,
                enumerator.getCurrent(),
                enumerator.getCurrentIndex()
            );
        }
    }

    // endregion

    // region Public methods

    // region Summary

    /**
     * Запускает вычисление цепочки и возвращает полученное значение. Большинство цепочек возвращает массив, но
     * некоторые могут вернуть другой тип, в зависимости от вида исходной коллекции.
     * При передаче аргумента factory вернется тип значения, сконструированный фабрикой. Доступные стандартные фабрики
     * можно посмотреть в разделе {@link Types/_collection/Factory}.
     * @param {function(Types/_collection/IEnumerable): *} [factory] Фабрика для преобразования коллекции.
     * @param {...*} [optional] Дополнительные аргументы фабрики, придут в factory вторым, третьим и т.д аргументами.
     * @return {*}
     * @example
     * Получим четные отрицательные числа в виде массива:
     * <pre>
     * import {factory} from 'Types/chain';
     * factory([1, 2, 3, 4, 5])
     *     .map((item) => -1 * item)
     *     .filter((item) => item % 2 === 0)
     *     .value();//[-2, -4]
     * </pre>
     * Получим рекордсет из персонажей женского пола, отсортированных по имени:
     * <pre>
     * import {factory as chain} from 'Types/chain';
     * import {RecordSet, factory} from 'Types/collection';
     * chain(new RecordSet({rawData: [
     *     {name: 'Philip J. Fry', gender: 'M'},
     *     {name: 'Turanga Leela', gender: 'F'},
     *     {name: 'Professor Farnsworth', gender: 'M'},
     *     {name: 'Amy Wong', gender: 'F'},
     *     {name: 'Bender Bending Rodriguez', gender: 'R'}
     * ]}))
     *     .filter((item) => item.get('gender') === 'F')
     *     .sort((a, b) => a.get('name') - b.get('name'))
     *     .value(factory.recordSet);
     * //RecordSet([Model(Amy Wong), Model(Turanga Leela)])
     * </pre>
     * Получим рекордсет с адаптером для БЛ СБИС:
     * <pre>
     * import {factory as chain} from 'Types/chain';
     * import {SbisService} from 'Types/source';
     * import {factory} from 'Types/collection';
     * const dataSource = new SbisService({endpoint: 'Employee'});
     * dataSource.query().addCallback((response) => {
     *     const items = chain(response.getAll())
     *         .first(10)
     *         .value(factory.recordSet, {
     *             adapter: response.getAdapter()
     *         });
     *     //Do something with items
     * });
     * </pre>
     */
    value(): T[];
    value<S>(factory?: Function, ...optional: any[]): S;
    value<S>(factory?: Function, ...optional: any[]): T[] | S {
        if (factory instanceof Function) {
            const args = [this, ...optional];
            return factory(...args);
        }

        return this.toArray();
    }

    /**
     * Запускает вычисление цепочки и возвращает полученное значение в виде массива.
     * @return {Array}
     * @example
     * Получим значения полей объекта в виде массива:
     * <pre>
     * import {factory} from 'Types/chain';
     * factory({
     *     email: 'root@server.name',
     *     login: 'root'
     * }).toArray();//['root@server.name', 'root']
     * </pre>
     * Представим список в виде массива:
     * <pre>
     * import {factory} from 'Types/chain';
     * import {List} from 'Types/collection';
     * factory(new List({
     *     items: [
     *         {id: 1, name: 'SpongeBob SquarePants'},
     *         {id: 2, name: 'Patrick Star'}
     *     ]
     * })).toArray();//[{id: 1, name: 'SpongeBob SquarePants'}, {id: 2, name: 'Patrick Star'}]
     * </pre>
     */
    toArray(): T[] {
        const result = [];
        this.each((item) => {
            result.push(item);
        });
        return result;
    }

    /**
     * Запускает вычисление цепочки и возвращает полученное значение в виде объекта.
     * @return {Object}
     * @example
     * Трансформируем массив в объект индекс->значение:
     * <pre>
     * import {factory} from 'Types/chain';
     * factory(['root@server.name', 'root']).toObject();//{0: 'root@server.name', 1: 'root']}
     * </pre>
     * Представим запись в виде объекта:
     * <pre>
     * import {factory} from 'Types/chain';
     * import {Record} from 'Types/entity';
     * const record = new Record({
     *     rawData: {id: 1, title: 'New One'}
     *  });
     * factory(record).toObject();//{id: 1, title: 'New One'}
     * </pre>
     */
    toObject<S = IObject<T>>(): S {
        const result = {} as S;
        const enumerator = this.getEnumerator();
        while (enumerator.moveNext()) {
            result[enumerator.getCurrentIndex() as unknown as string] = enumerator.getCurrent();
        }
        return result;
    }

    /**
     * Сводит коллекцию к одному значению.
     * @param callback Функция, вычисляющая очередное значение.
     * Принимает аргументы: предыдущее вычисленное значение, текущий элемент, индекс текущего элемента.
     * @param [initialValue] Значение первого аргумента callback, передаваемое в первый вызов.
     * Если не указано, то в первый вызов первым аргументом будет передан первый элемент коллекции.
     * @example
     * Просуммируем массив:
     * <pre>
     * import {factory} from 'Types/chain';
     * factory([1, 2, 3, 4, 5]).reduce((memo, item) => memo + item);//15
     * </pre>
     */
    reduce<S = T>(callback: ReduceFunc<T, U>, initialValue?: S | T): S {
        let result = initialValue;
        let skipFirst = arguments.length < 2;

        this.each((item, index) => {
            if (skipFirst) {
                result = item;
                skipFirst = false;
                return;
            }
            result = callback(result, item, index);
        });

        return result as S;
    }

    /**
     * Сводит коллекцию к одному значению, проходя ее справа-налево.
     * @param callback Функция, вычисляющая очередное значение.
     * Принимает аргументы: предыдущее вычисленное значение, текущий элемент, индекс текущего элемента.
     * @param [initialValue] Значение первого аргумента callback, передаваемое в первый вызов.
     * Если не указано, то в первый вызов первым аргументом будет передан последний элемент коллекции.
     * @example
     * Поделим элементы массива, проходя их справа-налево:
     * <pre>
     * import {factory} from 'Types/chain';
     * import {Record} from 'Types/entity';
     * factory([2, 5, 2, 100]).reduceRight((memo, item) => item / memo);//5
     * </pre>
     */
    reduceRight<S = T>(callback: ReduceFunc<T, U>, initialValue?: S | T): S {
        if (arguments.length < 2) {
            return this.reverse().reduce(callback);
        }
        return this.reverse().reduce(callback, initialValue);
    }

    // endregion

    // region Transformation

    /**
     * Преобразует коллекцию с использованием вызова функции-преобразователя для каждого элемента.
     * @param callback Функция, возвращающая новый элемент.
     * Принимает аргументы: элемент коллекции и его порядковый номер.
     * @param [thisArg] Контекст вызова callback.
     * @example
     * Преобразуем массив в записи:
     * <pre>
     * import {factory} from 'Types/chain';
     * import {Record} from 'Types/entity';
     * factory([
     *     {id: 1, name: 'SpongeBob SquarePants'},
     *     {id: 2, name: 'Patrick Star'}
     * ]).map(
     *     (item) => new Record({rawData: item})
     * ).value();//[Record({id: 1, name: 'SpongeBob SquarePants'}), Record({id: 2, name: 'Patrick Star'})]
     * </pre>
     */
    map<S>(callback: (item: T, index: U) => S, thisArg?: object): Mapped<S> {
        const Next = resolve<any>('Types/chain:Mapped');
        return new Next(
            this,
            callback,
            thisArg
        );
    }

    /**
     * Перекомбинирует коллекцию, каждый n-ый элемент которой является массивом, первым элементом которого является n-ый
     * элемент исходной коллекции, вторым - n-ый элемент второй коллекции и т.д.
     * @param [args] Коллекции для комбинирования.
     * @example
     * Скомбинируем массивы:
     * <pre>
     * import {factory} from 'Types/chain';
     * factory(
     *     [1, 2, 3]
     * ).zip(
     *     ['one', 'two', 'three'],
     *     [true, true, false]
     * ).value();//[[1, 'one', true], [2, 'two', true], [3, 'three', false]]
     * </pre>
     */
    zip<S1>(arg1: S1[]): Zipped<[T, S1], T, S1>;
    zip<S1, S2>(arg1: S1[], arg2: S2[]): Zipped<[T, S1, S2], T, S1>;
    zip<S1, S2, S3>(arg1: S1[], arg2: S2[], arg3: S3[]): Zipped<[T, S1, S2, S3], T, S1>;
    zip<S, R>(...args: S[][]): Zipped<R, T, S> {
        const Next = resolve<any>('Types/chain:Zipped');
        return new Next(
            this,
            args
        );
    }

    /**
     * Преобразует коллекцию в объект, используя исходную коллекцию в качестве названий свойств, а вторую - в качестве
     * значений свойств.
     * @param values Значения свойств.
     * @example
     * Получим данные учетной записи:
     * <pre>
     * import {factory} from 'Types/chain';
     * factory(
     *     ['login', 'password', 'email']
     * ).zipObject(
     *     ['root', '123', 'root@localhost']
     * );//{login: 'root', password: '123', email: 'root@localhost'}
     * </pre>
     */
    zipObject<S1>(values: S1[]): IObject<S1> {
        const result = Object.create(null);
        this.zip(values).each((item) => {
            const [key, value]: [T, S1] = item;
            result[key] = value;
        });
        return result;
    }

    /**
     * Преобразует коллекцию, возвращая значение свойства для каждого элемента.
     * @param propertyName Название свойства.
     * @example
     * Получим имена персонажей из массива:
     * <pre>
     * import {factory} from 'Types/chain';
     * factory([
     *     {id: 1, name: 'SpongeBob SquarePants'},
     *     {id: 2, name: 'Patrick Star'}
     * ]).pluck('name').value();//['SpongeBob SquarePants', 'Patrick Star']
     * </pre>
     * Получим имена персонажей из рекордсета:
     * <pre>
     * import {factory} from 'Types/chain';
     * import {RecordSet} from 'Types/collection';
     * factory(new RecordSet({
     *     rawData: [
     *         {id: 1, name: 'SpongeBob SquarePants'},
     *         {id: 2, name: 'Patrick Star'}
     *     ]
     * })).pluck('name').value();//['SpongeBob SquarePants', 'Patrick Star']
     * </pre>
     */
    pluck<S>(propertyName: string): Mapped<S> {
        return this.map((item) => object.getPropertyValue(item, propertyName));
    }

    /**
     * Преобразует коллекцию, вызывая метод каждого элемента.
     * @param methodName Название метода.
     * @param [args] Аргументы метода.
     * @example
     * Получим список названий фруктов в верхнем регистре:
     * <pre>
     * import {factory} from 'Types/chain';
     * factory([
     *     'apple',
     *     'cherry',
     *     'banana'
     * ]).invoke('toUpperCase').value();//['APPLE', 'CHERRY', 'BANANA']
     * </pre>
     * Получим аббревиатуру из слов:
     * <pre>
     * import {factory} from 'Types/chain';
     * factory(['What', 'you', 'see', 'is', 'what', 'you', 'get'])
     *     .invoke('substr', 0, 1)
     *     .invoke('toUpperCase')
     *     .value()
     *     .join('');//['WYSIWYG']
     * </pre>
     */
    invoke(methodName: string, ...args: any[]): Mapped<T> {
        return this.map((item) => item[methodName](...args));
    }

    /**
     * Соединяет коллекцию с другими коллекциями, добавляя их элементы в конец.
     * @param [args] Коллекции, с которыми объединить.
     * @example
     * Объединим коллекцию с двумя массивами:
     * <pre>
     * import {factory} from 'Types/chain';
     * factory([1, 2]).concat([3, 4], [5]).value();//[1, 2, 3, 4, 5]
     * </pre>
     */
    concat(...args: Array<T[]|IEnumerable<T, U>>): Concatenated<T> {
        const Next = resolve<any>('Types/chain:Concatenated');
        return new Next(this, args);
    }

    /**
     * Разворачивает иерархическую коллекцию в плоскую: каждый итерируемый элемент коллекции рекрурсивно вставляется
     * в виде коллекции.
     * @example
     * Развернем массив:
     * <pre>
     * import {factory} from 'Types/chain';
     * factory([1, [2], [3, [[4, [5]]]]]).flatten().value();//[1, 2, 3, 4, 5]
     * </pre>
     */
    flatten(): Flattened<T> {
        const Next = resolve<any>('Types/chain:Flattened');
        return new Next(this);
    }

    /**
     * Группирует коллекцию, создавая новую из элементов, сгруппированных в массивы.
     * @param key Поле группировки или функция, группировки для каждого элемента.
     * @param [value] Поле значения или функция, возвращающая значение для каждого элемента.
     * @example
     * Сгруппируем четные и нечетные значения массива:
     * <pre>
     * import {factory} from 'Types/chain';
     * factory([1, 2, 3, 4, 5])
     *     .group((item) => item % 2 === 0)
     *     .value();//[[1, 3, 5], [2, 4]]
     * </pre>
     * Сгруппируем значения по полю kind:
     * <pre>
     * import {factory} from 'Types/chain';
     * factory([
     *     {title: 'Apple', kind: 'fruit'},
     *     {title: 'Cherry', kind: 'fruit'},
     *     {title: 'Cucumber', kind: 'vegetable'},
     *     {title: 'Pear', kind: 'fruit'},
     *     {title: 'Potato', kind: 'vegetable'}
     * ]).group('kind', 'title').toObject();//{fruit: ['Apple', 'Cherry', 'Pear'], vegetable: ['Cucumber', 'Potato']}
     * </pre>
     */
    group<S>(key: string|((item: T) => string), value: string|((item: T) => S)): Grouped<S> {
        const Next = resolve<any>('Types/chain:Grouped');
        return new Next(
            this,
            key,
            value
        );
    }

   /**
    * Агрегирует коллекцию, подсчитывая число элементов, объединенных по заданному критерию.
    * @param [by] Поле агрегации или функция агрегации для каждого элемента.
    * Если не указан, возвращается общее количество элементов.
    * @example
    * Подсчитаем число элементов массива:
    * <pre>
    * import {factory} from 'Types/chain';
    * factory([1, 2, 3, 4, 5]).count();//5
    * </pre>
    * Подсчитаем четные и нечентные значения массива:
    * <pre>
    * import {factory} from 'Types/chain';
    * factory([1, 2, 3, 4, 5])
    *    .count((item) => item % 2 === 0)
    *    .value();//[3, 2]
    * </pre>
    * Подсчитаем фрукты и овощи:
    * <pre>
    * import {factory} from 'Types/chain';
    * factory([
    *    {title: 'Apple', kind: 'fruit'},
    *    {title: 'Cherry', kind: 'fruit'},
    *    {title: 'Cucumber', kind: 'vegetable'},
    *    {title: 'Pear', kind: 'fruit'},
    *    {title: 'Potato', kind: 'vegetable'}
    * ]).count('kind').toObject();//{fruit: 3, vegetable: 2}
    * </pre>
    */
    count(): number;
    count(by?: string |((item: T) => string | number | boolean)): Counted<T>;
    count(by?: string |((item: T) => string | number | boolean)): Counted<T> | number {
        if (by === undefined) {
            return this.reduce((memo) => memo + 1, 0);
        }

        const Next = resolve<any>('Types/chain:Counted');
        return new Next(this, by);
    }

    /**
     * Агрегирует коллекцию, находя максимальный элемент.
     * @example
     * Найдем максимальный элемент массива:
     * <pre>
     * import {factory} from 'Types/chain';
     * factory([1, 2, 3, 4, 5]).max();//5
     * </pre>
     */
    max(): number {
        return this.reduce((prev, current) => (current > prev ? current : prev));
    }

    /**
     * Агрегирует коллекцию, находя минимальный элемент.
     * @example
     * Найдем минимальный элемент массива:
     * <pre>
     * import {factory} from 'Types/chain';
     * factory([1, 2, 3, 4, 5]).min();//1
     * </pre>
     */
    min(): number {
        return this.reduce((prev, current) => (current < prev ? current : prev));
    }

    /**
     * Преобразует коллекцию, удаляя из нее повторяющиеся элементы (используется строгое сравнение ===).
     * @param [idExtractor] Функция, возвращающая уникальный идентификатор элемента.
     * @example
     * Оставим уникальные значения массива:
     * <pre>
     * import {factory} from 'Types/chain';
     * factory([1, 2, 3, 2, 1, 0]).uniq().value();//[1, 2, 3, 0]
     * </pre>
     * Оставим элементы с уникальным значением поля kind:
     * <pre>
     * import {factory} from 'Types/chain';
     * factory([
     *     {title: 'Apple', kind: 'fruit'},
     *     {title: 'Cherry', kind: 'fruit'},
     *     {title: 'Cucumber', kind: 'vegetable'},
     *     {title: 'Pear', kind: 'fruit'},
     *     {title: 'Potato', kind: 'vegetable'}
     * ]).uniq(
     *     (item) => item.kind
     * ).value();//[{title: 'Apple', kind: 'fruit'}, {title: 'Cucumber', kind: 'vegetable'}]
     * </pre>
     */
    uniq(idExtractor?: (item: T) => string | number): Uniquely<T> {
        const Next = resolve<any>('Types/chain:Uniquely');
        return new Next(this, idExtractor);
    }

    /**
     * Преобразует коллекцию, добавляя в нее элементы других коллекций, которых в ней еще нет.
     * @param [args] Коллекции, элементы которых надо добавить.
     * @example
     * Оставим уникальные значения массива:
     * <pre>
     * import {factory} from 'Types/chain';
     * factory([1, 2, 3]).union([0, 1, 2, 3, 4, 5]).value();//[1, 2, 3, 0, 4, 5]
     * </pre>
     */
    union(...args: Array<T[]|IEnumerable<T, U>>): Uniquely<T> {
        return this
            .concat(...args)
            .uniq();
    }

    // endregion

    // region Filtering

    /**
     * Фильтрует коллекцию, оставляя в ней те элементы, которые прошли фильтр.
     * @param callback Фильтр c аргументами: элемент коллекции и его порядковый номер.
     * @param [thisArg] Контекст вызова callback.
     * @example
     * Выберем четные значения массива:
     * <pre>
     * import {factory} from 'Types/chain';
     * factory([1, 2, 3, 4, 5])
     *     .filter((item) => item % 2 === 0)
     *     .value();//[2, 4]
     * </pre>
     */
    filter(callback: (item: T, index: U) => boolean, thisArg?: object): Filtered<T> {
        const Next = resolve<any>('Types/chain:Filtered');
        return new Next(
            this,
            callback,
            thisArg
        );
    }

    /**
     * Фильтрует коллекцию, исключая из нее те элементы, которые прошли фильтр.
     * @param callback Функция c аргументами: элемент коллекции и его порядковый номер.
     * @param [thisArg] Контекст вызова callback.
     * @example
     * Исключим значения от 2 до 4:
     * <pre>
     * import {factory} from 'Types/chain';
     * factory([1, 2, 3, 4, 5])
     *     .reject((item) => item >= 2 && item <= 4)
     *     .value();//[1, 5]
     * </pre>
     */
    reject(callback: (item: T, index: U) => boolean, thisArg?: object): Filtered<T> {
        return this.filter((...args) => !callback.apply(thisArg, args));
    }

    /**
     * Фильтрует коллекцию, оставляя в ней элементы, имеющие указанный набор значений свойств.
     * @param properties Объект, с набором проверяемых свойств и их значений.
     * @example
     * Получим персонажей мужского пола из дома Старков:
     * <pre>
     * import {factory} from 'Types/chain';
     * const stillAliveOrNot = [
     *     {name: 'Eddard Stark', house: 'House Stark', gender: 'm'},
     *     {name: 'Catelyn Stark', house: 'House Stark', gender: 'f'},
     *     {name: 'Jon Snow', house: 'House Stark', gender: 'm'},
     *     {name: 'Sansa Stark', house: 'House Stark', gender: 'f'},
     *     {name: 'Arya Stark', house: 'House Stark', gender: 'f'},
     *     {name: 'Daenerys Targaryen', house: 'House Targaryen', gender: 'f'},
     *     {name: 'Viserys Targaryen', house: 'House Targaryen', gender: 'm'},
     *     {name: 'Jorah Mormont', house: 'House Targaryen', gender: 'm'}
     * ];
     * factory(stillAliveOrNot).where({
     *     house: 'House Stark',
     *     gender: 'm'
     * }).value();
     * //[{name: 'Eddard Stark', house: 'House Stark', gender: 'm'},
     * //{name: 'Jon Snow', house: 'House Stark', gender: 'm'}]
     * </pre>
     */
    where(properties: object): Filtered<T> {
        const keys = Object.keys(properties);
        return this.filter((item) => keys.reduce(
            (prev, key) => prev && object.getPropertyValue(item, key) === properties[key],
            true
        ));
    }

    /**
     * Возвращает первый элемент коллекции или фильтрует ее, оставляя в ней первые n элементов.
     * @param [n] Количество элементов, которые нужно выбрать. Если не указан, то возвращается первый элемент.
     * @example
     * Выберем первый элемент:
     * <pre>
     * import {factory} from 'Types/chain';
     * factory([1, 2, 3, 4, 5]).first();//1
     * </pre>
     * Выберем первые 3 элемента:
     * <pre>
     * import {factory} from 'Types/chain';
     * factory([1, 2, 3, 4, 5]).first(3).value();//[1, 2, 3]
     * </pre>
     */
    first(): T;
    first(n?: number): Sliced<T>;
    first(n?: number): Sliced<T> | T {
        if (n === undefined) {
            const enumerator = this.getEnumerator();
            return enumerator.moveNext() ? enumerator.getCurrent() : undefined;
        }

        const Next = resolve<any>('Types/chain:Sliced');
        return new Next(this, 0, n);
    }

    /**
     * Возвращает последний элемент коллекции или фильтрует ее, оставляя в ней последние n элементов.
     * @param [n] Количество выбираемых элементов. Если не указано, то возвращается последний элемент.
     * @example
     * Выберем последний элемент:
     * <pre>
     * import {factory} from 'Types/chain';
     * factory([1, 2, 3, 4, 5]).last();//5
     * </pre>
     * Выберем последние 3 элемента:
     * <pre>
     * import {factory} from 'Types/chain';
     * factory([1, 2, 3, 4, 5]).last(3).value();//[3, 4, 5]
     * </pre>
     */
    last(): T;
    last(n?: number): Reversed<T, U>;
    last(n?: number): Reversed<T, U> | T {
        if (n === undefined) {
            return this.reverse().first() as T;
        }

        return (
            this.reverse().first(n) as Sliced<T>
        ).reverse() as unknown as Reversed<T, U>;
    }

    // endregion

    // region Ordering

    /**
     * Меняет порядок элементов коллекции на обратный
     * @example
     * Изменим порядок элементов:
     * <pre>
     * import {factory} from 'Types/chain';
     * factory(['one', 'two', 'three']).reverse().value();//['three', 'two', 'one']
     * </pre>
     */
    reverse(): Reversed<T, U> {
        const Next = resolve<any>('Types/chain:Reversed');
        return new Next(this);
    }

   /**
    * Сортирует коллекцию с использованием функции сортировки, алгоритм работы и сигнатура которой аналогичны методу
    * {@link https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Array/sort sort}.
    * @param [compareFunction] Функция сортировки. Принимает аргументами два элемента
    * коллекции, которые нужно сравнить.
    * @example
    * Отсортируем массив чисел по возрастанию:
    * <pre>
    * import {factory} from 'Types/chain';
    * factory([2, 4, 3, 1, 5])
    *    .sort((a, b) => a - b)
    *    .value();//[1, 2, 3, 4, 5]
    * </pre>
    */
   sort(compareFunction?: CompareFunction<T>): Sorted<T, U> {
      const Next = resolve<any>('Types/chain:Sorted');
      return new Next(this, compareFunction);
   }

    // endregion

    // region Static methods

    static propertyMapper<T, U = EnumeratorIndex>(name: string|PropertyMapFunc<T, U>): PropertyMapFunc<T, U> {
        if (typeof name === 'function') {
            return name;
        }

        if (name === undefined) {
            return (item) => item;
        }

        return (item: unknown) => object.getPropertyValue(item, name);
    }

    // endregion
}

Object.assign(Abstract.prototype, {
    '[Types/_chain/Abstract]': true,
    _source: null,
    _previous: null
});
