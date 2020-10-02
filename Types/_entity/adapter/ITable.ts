import UniversalField from '../format/UniversalField';
import Field from '../format/Field';
import { EntityMarker } from '../../_declarations';

/**
 * Интерфейс адаптера для таблицы данных
 * @interface Types/_entity/adapter/ITable
 * @public
 * @author Мальцев А.А.
 */
export default interface ITable {
    readonly '[Types/_entity/adapter/ITable]': EntityMarker;

    /**
     * Возвращает массив названий полей
     */
    getFields(): string[];

    /**
     * Возвращает кол-во записей таблицы
     */
    getCount(): number;

    /**
     * Возвращает данные таблицы в формате адаптера
     */
    getData(): any;

    /**
     * Добавляет запись в таблицу
     * @param record Запись
     * @param [at] Позиция, в которую добавляется запись (по умолчанию - в конец)
     */
    add(record: any, at?: number): void;

    /**
     * Возвращает запись по позиции
     * @param index Позиция
     */
    at(index: number): any;

    /**
     * Удаляет запись по позиции
     * @param at Позиция записи
     */
    remove(at: number): void;

    /**
     * Заменяет запись
     * @param record Заменяющая запись
     * @param at Позиция, в которой будет произведена замена
     */
    replace(record: any, at: number): void;

    /**
     * Перемещает запись
     * @param source Позиция, откуда перемещаем
     * @param target Позиция, в позицию которую перемещаем
     */
    move(source: number, target: number): void;

    /**
     * Объединяет две записи
     * @param acceptor Позиция принимающей записи
     * @param donor Позиция записи-донора
     * @param keyProperty Название поля содержащего первичный ключ
     */
    merge(acceptor: number, donor: number, keyProperty: string): any;

    /**
     * Копирует запись по позиции
     * @param index Позиция, которая будет скопирована
     */
    copy(index: number): any;

    /**
     * Очищает таблицу (удаляет все записи)
     */
    clear(): void;

    /**
     * Возвращает формат поля (в режиме только для чтения)
     * @param name Поле записи
     */
    getFormat(name: string): any;

    /**
     * Возвращает общий универсальный формат поля - его нельзя использовать в замыканиях и сохранять куда-либо.
     * Метод каждый раз возвращает один и тот же объект, заменяя только его данные - подобный подход обеспечивает
     * ускорение и уменьшение расхода памяти.
     * @param name Поле записи
     */
    getSharedFormat(name: string): UniversalField;

    /**
     * Добавляет поле в таблицу.
     * Если позиция не указана (или указана как -1), поле добавляется в конец.
     * Если поле с таким форматом уже есть, генерирует исключение.
     * @param format Формат поля
     * @param [at] Позиция поля
     */
    addField(format: Field, at?: number): void;

    /**
     * Удаляет поле из таблицы по имени.
     * @param name Имя поля
     */
    removeField(name: string): void;

    /**
     * Удаляет поле из таблицы по позиции.
     * Если позиция выходит за рамки допустимого индекса, генерирует исключение.
     * @param index Позиция поля
     */
    removeFieldAt(index: number): void;
}
