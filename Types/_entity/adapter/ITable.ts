/// <amd-module name="Types/_entity/adapter/ITable" />
/**
 * Интерфейс адаптера для таблицы данных
 * @interface Types/_entity/adapter/ITable
 * @public
 * @author Мальцев А.А.
 */

import UniversalField from '../format/UniversalField';
import Field from '../format/Field';

export default interface ITable /** @lends Types/_entity/adapter/ITable.prototype */{
   readonly '[Types/_entity/adapter/ITable]': boolean;

   /**
    * Возвращает массив названий полей
    * @return {Array.<String>} Названия полей
    */
   getFields(): string[];

   /**
    * Возвращает кол-во записей таблицы
    * @return {Number}
    */
   getCount(): number;

   /**
    * Возвращает данные таблицы в формате адаптера
    * @return {*}
    */
   getData(): any;

   /**
    * Добавляет запись в таблицу
    * @param {*} record Запись
    * @param {Number} [at] Позиция, в которую добавляется запись (по умолчанию - в конец)
    */
   add(record: any, at?: number): void;

   /**
    * Возвращает запись по позиции
    * @param {Number} index Позиция
    * @return {*} Запись таблицы
    */
   at(index: number): any;

   /**
    * Удаляет запись по позиции
    * @param {Number} at Позиция записи
    */
   remove(at: number): void;

   /**
    * Заменяет запись
    * @param {*} record Заменяющая запись
    * @param {Number} at Позиция, в которой будет произведена замена
    */
   replace(record: any, at: number): void;

   /**
    * Перемещает запись
    * @param {Number} source Позиция, откуда перемещаем
    * @param {Number} target Позиция, в позицию которую перемещаем
    * @return {*}
    */
   move(source: number, target: number): void;

   /**
    * Объединяет две записи
    * @param {Number} acceptor Позиция принимающей записи
    * @param {Number} donor Позиция записи-донора
    * @param {String} idProperty  Название поля содержащего первичный ключ
    * @return {*}
    */
   merge(acceptor: number, donor: number, idProperty: string): any;

   /**
    * Копирует запись по позиции
    * @param {Number} index Позиция, которая будет скопирована
    * @return {*}
    */
   copy(index: number): any;

   /**
    * Очищает таблицу (удаляет все записи)
    */
   clear(): void;

   /**
    * Возвращает формат поля (в режиме только для чтения)
    * @param {String} name Поле записи
    * @return {Types/_entity/format/Field}
    */
   getFormat(name: string): any;

   /**
    * Возвращает общий универсальный формат поля - его нельзя использовать в замыканиях и сохранять куда-либо.
    * Метод каждый раз возвращает один и тот же объект, заменяя только его данные - подобный подход обеспечивает
    * ускорение и уменьшение расхода памяти.
    * @param {String} name Поле записи
    * @return {Types/_entity/format/UniversalField}
    */
   getSharedFormat(name: string): UniversalField;

   /**
    * Добавляет поле в таблицу.
    * Если позиция не указана (или указана как -1), поле добавляется в конец.
    * Если поле с таким форматом уже есть, генерирует исключение.
    * @param {Types/_entity/format/Field} format Формат поля
    * @param {Number} [at] Позиция поля
    */
   addField(format: Field, at: number): void;

   /**
    * Удаляет поле из таблицы по имени.
    * @param {String} name Имя поля
    */
   removeField(name: string): void;

   /**
    * Удаляет поле из таблицы по позиции.
    * Если позиция выходит за рамки допустимого индекса, генерирует исключение.
    * @param {Number} index Позиция поля
    */
   removeFieldAt(index: number): void;
}
