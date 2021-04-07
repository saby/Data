import Field from '../format/Field';
import UniversalField from '../format/UniversalField';
import { EntityMarker } from '../../_declarations';

/**
 * Интерфейс адаптера для записи таблицы данных
 * @interface Types/_entity/adapter/IRecord
 * @public
 * @author Кудрявцев И.С.
 */
export default interface IRecord {
    readonly '[Types/_entity/adapter/IRecord]': EntityMarker;

    /**
     * Возвращает признак наличия поля в данных
     * @param name Поле записи
     */
    has(name: string): boolean;

    /**
     * Возвращает значение поля записи
     * @param name Поле записи
     */
    get(name: string): any;

    /**
     * Сохраняет значение поля записи
     * @param name Поле записи
     * @param value Значение
     */
    set(name: string, value: any): void;

    /**
     * Очищает запись (удаляет все поля)
     */
    clear(): void;

    /**
     * Возвращает данные записи в формате адаптера
     */
    getData(): any;

    /**
     * Возвращает массив названий полей
     */
    getFields(): string[];

    /**
     * Возвращает формат поля (в режиме только для чтения)
     * @param name Поле записи
     */
    getFormat(name: string): Field;

    /**
     * Возвращает общий универсальный формат поля - его нельзя использовать в замыканиях и сохранять куда-либо.
     * Метод каждый раз возвращает один и тот же объект, заменяя только его данные - подобный подход обеспечивает
     * ускорение и уменьшение расхода памяти.
     * @param name Поле записи
     */
    getSharedFormat(name: string): UniversalField;

    /**
     * Добавляет поле в запись.
     * Если позиция не указана (или указана как -1), поле добавляется в конец.
     * Если поле с таким форматом уже есть, генерирует исключение.
     * @param format Формат поля
     * @param [at] Позиция поля
     */
    addField(format: Field, at?: number): void;

    /**
     * Удаляет поле из записи по имени.
     * @param name Имя поля
     */
    removeField(name: string): void;

    /**
     * Удаляет поле из записи по позиции.
     * Если позиция выходит за рамки допустимого индекса, генерирует исключение.
     * @param index Позиция поля
     */
    removeFieldAt(index: number): void;
}
