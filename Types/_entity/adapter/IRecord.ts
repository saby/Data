import Field from '../format/Field';
import UniversalField from '../format/UniversalField';

/**
 * Интерфейс адаптера для записи таблицы данных
 * @interface Types/_entity/adapter/IRecord
 * @public
 * @author Мальцев А.А.
 */
export default interface IRecord /** @lends Types/_entity/adapter/IRecord.prototype */{
   readonly '[Types/_entity/adapter/IRecord]': boolean;

   /**
    * Возвращает признак наличия поля в данных
    * @param {String} name Поле записи
    * @return {Boolean}
    */
   has(name: string): boolean;

   /**
    * Возвращает значение поля записи
    * @param {String} name Поле записи
    * @return {*}
    */
   get(name: string): any;

   /**
    * Сохраняет значение поля записи
    * @param {String} name Поле записи
    * @param {*} value Значение
    */
   set(name: string, value: any): void;

   /**
    * Очищает запись (удаляет все поля)
    */
   clear(): void;

   /**
    * Возвращает данные записи в формате адаптера
    * @return {*}
    */
   getData(): any;

   /**
    * Возвращает массив названий полей
    * @return {Array.<String>} Названия полей
    */
   getFields(): string[];

   /**
    * Возвращает формат поля (в режиме только для чтения)
    * @param {String} name Поле записи
    * @return {Types/_entity/format/Field}
    */
   getFormat(name: string): Field;

   /**
    * Возвращает общий универсальный формат поля - его нельзя использовать в замыканиях и сохранять куда-либо.
    * Метод каждый раз возвращает один и тот же объект, заменяя только его данные - подобный подход обеспечивает
    * ускорение и уменьшение расхода памяти.
    * @param {String} name Поле записи
    * @return {Types/_entity/format/UniversalField}
    */
   getSharedFormat(name: string): UniversalField;

   /**
    * Добавляет поле в запись.
    * Если позиция не указана (или указана как -1), поле добавляется в конец.
    * Если поле с таким форматом уже есть, генерирует исключение.
    * @param {Types/_entity/format/Field} format Формат поля
    * @param {Number} [at] Позиция поля
    */
   addField(format: Field, at?: number): void;

   /**
    * Удаляет поле из записи по имени.
    * @param {String} name Имя поля
    */
   removeField(name: string): void;

   /**
    * Удаляет поле из записи по позиции.
    * Если позиция выходит за рамки допустимого индекса, генерирует исключение.
    * @param {Number} index Позиция поля
    */
   removeFieldAt(index: number): void;
}
