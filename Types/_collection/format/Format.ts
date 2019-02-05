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
import List from '../List';
import {register} from '../../di';

export default class Format<T> extends List<T> implements IEquatable /** @lends Types/_entity/format/Format.prototype */{
   _$items: Array<any>;

   protected _moduleName: string;

   /**
    * @cfg {Array.<Types/_entity/format/Field>} Элементы списка
    * @name Types/_entity/format/Format#items
    */

   constructor(options?: Object) {
      super(options);
      for (let i = 0, len = this._$items.length; i < len; i++) {
         this._checkItem(this._$items[i]);
         this._checkName(this._$items[i], i);
      }
   }

   //region List

   add(item: format.Field, at?: number) {
      this._checkItem(item);
      this._checkName(item);
      super.add(item, at);
   }

   remove(item: format.Field) {
      this._checkItem(item);
      return super.remove(item);
   }

   replace(item: format.Field, at: number) {
      this._checkItem(item);
      this._checkName(item, at);
      super.replace(item, at);
   }

   assign(items: Array<format.Field>) {
      items = this._itemsToArray(items);
      for (let i = 0, len = items.length; i < len; i++) {
         this._checkItem(items[i]);
      }

      super.assign(items);

      for (let i = 0, len = this._$items.length; i < len; i++) {
         this._checkName(this._$items[i], i);
      }
   }

   append(items: Array<format.Field>) {
      items = this._itemsToArray(items);
      for (let i = 0, len = items.length; i < len; i++) {
         this._checkItem(items[i]);
         this._checkName(items[i]);
      }
      super.append(items);
   }

   prepend(items: Array<format.Field>) {
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

   removeAt(index: any) {
      return super.removeAt(index);
   }

   //endregion List

   //region IEquatable

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

   //endregion IEquatable

   //region Public methods

   /**
    * Удаляет поле из формата по имени.
    * Если поля с таким именем нет, генерирует исключение.
    * @param {String} name Имя поля
    */
   removeField(name: string) {
      let index = this.getIndexByValue('name', name);
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

   //endregion Public methods

   //region Protected methods

   /**
    * Проверяет, что переданный элемент - формат поля
    * @protected
    */
   protected _checkItem(item: any) {
      if (!item || !(item instanceof format.Field)) {
         throw new TypeError('Item should be an instance of "Types/entity:format.Field"');
      }
   }

   /**
    * Проверяет, что формат поля не дублирует уже существующее имя поля
    * @protected
    */
   protected _checkName(item: format.Field, at?: number) {
      let exists = this.getFieldIndex(item.getName());
      if (exists > -1 && exists !== at) {
         throw new ReferenceError(`${this._moduleName}: field with name "${item.getName()}" already exists`);
      }
   }

   protected _itemsToArray(items: any): Array<format.Field> {
      return super._itemsToArray(items);
   }

   //endregion Protected methods
}

Object.assign(Format.prototype,{
   '[Types/_collection/format/Format]': true,
   '[Types/_entity/IEquatable]': true,
   _moduleName: 'Types/collection:format.Format'
});

register('Types/collection:format.Format', Format, {instantiate: false});
