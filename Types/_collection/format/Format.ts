/// <amd-module name="Types/_collection/format/Format" />
/**
 * Формат полей.
 * Представляет собой список полей записи: Types/_collection/List.<Types/_entity/format/Field>
 * @class Types/_entity/format/Format
 * @extends Types/_collection/List
 * @public
 * @author Мальцев А.А.
 */

import {IEquatable} from '../../entity';
import {format} from '../../entity';
import List, {IOptions as IListOptions} from '../List';
import {register} from '../../di';

export default class Format<T>
   extends List<T>
   implements IEquatable /** @lends Types/_entity/format/Format.prototype */ {
   _$items: any[];

   protected _moduleName: string;

   /**
    * @cfg {Array.<Types/_entity/format/Field>} Элементы списка
    * @name Types/_entity/format/Format#items
    */

   constructor(options?: IListOptions<T>) {
      super(options);
      for (let i = 0, len = this._$items.length; i < len; i++) {
         this._checkItem(this._$items[i]);
         this._checkName(this._$items[i], i);
      }
   }

   // region List

   add(item: T, at?: number): void {
      this._checkItem(item);
      this._checkName(item);
      super.add(item, at);
   }

   remove(item: T): boolean {
      this._checkItem(item);
      return super.remove(item);
   }

   replace(item: T, at: number): void {
      this._checkItem(item);
      this._checkName(item, at);
      super.replace(item, at);
   }

   assign(items: T[]): void {
      items = this._itemsToArray(items);
      for (let i = 0, len = items.length; i < len; i++) {
         this._checkItem(items[i]);
      }

      super.assign(items);

      for (let i = 0, len = this._$items.length; i < len; i++) {
         this._checkName(this._$items[i], i);
      }
   }

   append(items: T[]): void {
      items = this._itemsToArray(items);
      for (let i = 0, len = items.length; i < len; i++) {
         this._checkItem(items[i]);
         this._checkName(items[i]);
      }
      super.append(items);
   }

   prepend(items: T[]): void {
      items = this._itemsToArray(items);
      for (let i = 0, len = items.length; i < len; i++) {
         this._checkItem(items[i]);
         this._checkName(items[i]);
      }
      super.prepend(items);
   }

   getCount(): number {
      return super.getCount();
   }

   at(i: number): format.Field {
      return super.at(i);
   }

   getIndexByValue(name: string, value: any): number {
      return super.getIndexByValue(name, value);
   }

   removeAt(index: any): T {
      return super.removeAt(index);
   }

   // endregion

   // region IEquatable

   readonly '[Types/_entity/IEquatable]': boolean;

   isEqual(format: Format<T>): boolean {
      if (format === this) {
         return true;
      }
      if (!format) {
         return false;
      }
      if (!(format instanceof Format)) {
         return false;
      }
      if (this.getCount() !== format.getCount()) {
         return false;
      }
      for (let i = 0, count = this.getCount(); i < count; i++) {
         if (!this.at(i).isEqual(format.at(i))) {
            return false;
         }
      }
      return true;
   }

   // endregion

   // region Public methods

   /**
    * Удаляет поле из формата по имени.
    * Если поля с таким именем нет, генерирует исключение.
    * @param {String} name Имя поля
    */
   removeField(name: string): void {
      const index = this.getIndexByValue('name', name);
      if (index === -1) {
         throw new ReferenceError(`${this._moduleName}::removeField(): field "${name}" doesn't found`);
      }
      this.removeAt(index);
   }

   /**
    * Возвращает индекс поля по его имени.
    * Если поля с таким именем нет, возвращает -1.
    * @param {String} name Имя поля
    * @return {Number}
    */
   getFieldIndex(name: string): number {
      return this.getIndexByValue('name', name);
   }

   /**
    * Возвращает имя поля по его индексу.
    * Если индекс выходит за допустимый диапазон, генерирует исключение.
    * @param {Number} at Имя поля
    * @return {String}
    */
   getFieldName(at: number): string {
      return this.at(at).getName();
   }

   // endregion

   // region Protected methods

   /**
    * Проверяет, что переданный элемент - формат поля
    * @protected
    */
   protected _checkItem(item: T): void {
      if (!item || !(item instanceof format.Field)) {
         throw new TypeError('Item should be an instance of "Types/entity:format.Field"');
      }
   }

   /**
    * Проверяет, что формат поля не дублирует уже существующее имя поля
    * @protected
    */
   protected _checkName(item: any, at?: number): void {
      const exists = this.getFieldIndex(item.getName());
      if (exists > -1 && exists !== at) {
         throw new ReferenceError(`${this._moduleName}: field with name "${item.getName()}" already exists`);
      }
   }

   protected _itemsToArray(items: any): T[] {
      return super._itemsToArray(items);
   }

   // endregion
}

Object.assign(Format.prototype, {
   '[Types/_collection/format/Format]': true,
   '[Types/_entity/IEquatable]': true,
   _moduleName: 'Types/collection:format.Format'
});

register('Types/collection:format.Format', Format, {instantiate: false});
