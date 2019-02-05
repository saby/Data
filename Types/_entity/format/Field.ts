/// <amd-module name="Types/_entity/format/Field" />
/**
 * Прототип поля записи.
 * Это абстрактный класс, не предназначенный для создания самостоятельных экземпляров.
 * @class Types/_entity/format/Field
 * @mixes Types/_entity/DestroyableMixin
 * @implements Types/_entity/ICloneable
 * @implements Types/_entity/IEquatable
 * @mixes Types/_entity/OptionsMixin
 * @mixes Types/_entity/SerializableMixin
 * @mixes Types/_entity/CloneableMixin
 * @public
 * @author Мальцев А.А.
 */

import {mixin} from '../../util';
import DestroyableMixin from '../DestroyableMixin';
import ICloneable from '../ICloneable';
import IEquatable from '../IEquatable';
import OptionsToPropertyMixin from '../OptionsToPropertyMixin';
import SerializableMixin from '../SerializableMixin';
import CloneableMixin from '../CloneableMixin';
import {isEqual} from '../../object';

export default abstract class Field extends mixin(
   DestroyableMixin, OptionsToPropertyMixin, SerializableMixin, CloneableMixin
) implements ICloneable, IEquatable /** @lends Types/_entity/format/Field.prototype */{
   /**
    * @cfg {String} Имя поля
    * @name Types/_entity/format/Field#name
    * @see getName
    * @see setName
    */
   _$name: string;

   /**
    * @cfg {String|Function} Модуль, который является конструктором значения поля
    * @name Types/_entity/format/Field#type
    * @see getType
    */
   _$type: any;

   /**
    * @cfg {*} Значение поля по умолчанию
    * @name Types/_entity/format/Field#defaultValue
    * @see getDefaultValue
    * @see setDefaultValue
    */
   _$defaultValue: any;

   /**
    * @cfg {Boolean} Значение может быть null
    * @name Types/_entity/format/Field#nullable
    * @see isNullable
    * @see setNullable
    */
   _$nullable: boolean;

   /**
    * Название типа поля
    */
   _typeName: string;

   constructor(options?: Object) {
      super(options);
      OptionsToPropertyMixin.call(this, options);
   }

   //region ICloneable

   readonly '[Types/_entity/ICloneable]': boolean;

   clone: (shallow?: boolean) => Field;

   //endregion

   //region Types/_entity/IEquatable

   readonly '[Types/_entity/IEquatable]': boolean;

   /**
    * Сравнивает 2 формата поля на идентичность: совпадает тип, название, значение по умолчанию, признак isNullable. Для полей со словарем - словарь.
    * @param {Types/_entity/format/Field} to Формат поля, с которым сравнить
    * @return {Boolean}
    */
   isEqual(to: Field): boolean {
      if (to === this) {
         return true;
      }
      let selfProto = Object.getPrototypeOf(this);
      let toProto = Object.getPrototypeOf(to);

      return selfProto === toProto &&
         this.getName() === to.getName() &&
         isEqual(this.getDefaultValue(), to.getDefaultValue()) &&
         this.isNullable() === to.isNullable();
   }

   //endregion Types/_entity/IEquatable

   //region Public methods

   /**
    * Возвращает модуль, который является конструктором значения поля
    * @return {String|Function}
    */
   getType() {
      return this._$type || this.getTypeName();
   }

   /**
    * Возвращает название типа поля
    * @return {String}
    */
   getTypeName() {
      return this._typeName;
   }

   /**
    * Возвращает имя поля
    * @return {String}
    * @see name
    * @see setName
    */
   getName() {
      return this._$name;
   }

   /**
    * Устанавливает имя поля
    * @param {String} name Имя поля
    * @see name
    * @see getName
    */
   setName(name) {
      this._$name = name;
   }

   /**
    * Возвращает значение поля по умолчанию
    * @return {*}
    * @see defaultValue
    * @see setDefaultValue
    */
   getDefaultValue() {
      return this._$defaultValue;
   }

   /**
    * Устанавливает значение поля по умолчанию
    * @param {*} value Значение поля по умолчанию
    * @see defaultValue
    * @see getDefaultValue
    */
   setDefaultValue(value) {
      this._$defaultValue = value;
   }

   /**
    * Возвращает признак, что значение может быть null
    * @return {Boolean}
    * @see name
    * @see setNullable
    */
   isNullable() {
      return this._$nullable;
   }

   /**
    * Устанавливает признак, что значение может быть null
    * @param {Boolean} nullable Значение может быть null
    * @see name
    * @see isNullable
    */
   setNullable(nullable) {
      this._$nullable = nullable;
   }

   /**
    * Копирует формат поля из другого формата
    * @param {Types/_entity/format/Field} format Формат поля, который надо скопировать
    */
   copyFrom(format) {
      let formatOptions = format._getOptions();
      let key;
      for (let option in formatOptions) {
         if (formatOptions.hasOwnProperty(option)) {
            key = '_$' + option;
            if (key in this) {
               this[key] = formatOptions[option];
            }
         }
      }
   }

   //endregion Public methods
}

Field.prototype['[Types/_entity/format/DestroyableMixin]'] = true;
Field.prototype._$name = '';
Field.prototype._$type = null;
Field.prototype._$defaultValue = null;
Field.prototype._$nullable = true;
Field.prototype._typeName = '';
