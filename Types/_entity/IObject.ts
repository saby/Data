import { EntityMarker } from '../_declarations';

/**
 * Интерфейс доступа к свойствам объекта.
 * Позволяет читать и записывать значения свойств, а также проверять их наличие.
 * @interface Types/_entity/IObject
 * @public
 * @author Кудрявцев И.С.
 */
export default interface IObject<T = any> {
    readonly '[Types/_entity/IObject]': EntityMarker;

    /**
     * Возвращает значение свойства.
     * Если свойство не существует, возвращает undefined.
     * Если свойство является объектом, то всегда возвращается один и тот же объект (если он не был заменен через вызов метода set).
     * @param {String} name Название свойства
     * @return {*}
     * @example
     * Получим имя и сведения о родителях персонажа:
     * <pre>
     *     var timeline = 'before s6e10',
     *         character = new Record({
     *             rawData: {
     *                 name: 'Jon',
     *                 familyName: 'Snow',
     *                 father: {
     *                     name: 'Eddard',
     *                     familyName: 'Stark'
     *                 }
     *             }
     *         });
     *
     *     character.get('name');//'Jon'
     *     character.get('father');//{name: 'Eddard', familyName: 'Stark'}
     *     character.get('mother');//undefined
     * </pre>
     */
    get<K extends keyof T>(name: K): T[K];

    /**
     * Устанавливает значение свойства.
     * Если свойство только для чтения, генерирует исключение.
     * @param {String|Object} name Название свойства или набор названий свойств и их значений
     * @param {*} [value] Значение свойства (передается в случае, если name - строка)
     * @example
     * Установим имя персонажа:
     * <pre>
     *     var character = new Record();
     *     character.set('name', 'Jon');
     * </pre>
     * Установим данные персонажа:
     * <pre>
     *     var character = new Record();
     *     character.set({
     *         name: 'Jon',
     *         familyName: 'Snow',
     *         house: 'House Stark'
     *     });
     * </pre>
     */
    set<K extends keyof T>(name: K, value: T[K]): void;

    /**
     * Проверяет наличие свойства у объекта.
     * @param {String} name Название свойства
     * @return {Boolean}
     * @example
     * Проверим наличие связей персонажа:
     * <pre>
     *     var timeline = 'before s6e10',
     *         character = new Record({
     *             rawData: {
     *                 name: 'Jon',
     *                 familyName: 'Snow',
     *                 father: {
     *                     name: 'Eddard',
     *                     familyName: 'Stark'
     *                 }
     *             }
     *         });
     *
     *     character.has('father');//true
     *     character.has('mother');//false
     * </pre>
     */
    has(name: string): boolean;
}

export type IObjectConstructor<T = any> = new() => IObject<T>;
