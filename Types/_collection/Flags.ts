/// <amd-module name="Types/_collection/Flags" />
/**
 * Тип данных "флаги".
 * @class Types/Type/Flags
 * @extends Types/Type/Dictionary
 * @implements Types/Type/IFlags
 * @implements Types/Entity/ICloneable
 * @implements Types/Entity/IProducible
 * @mixes Types/Entity/ManyToManyMixin
 * @mixes Types/Entity/SerializableMixin
 * @mixes Types/Entity/CloneableMixin
 * @public
 * @author Мальцев А.А.
 */

import IFlags, {IValue} from './IFlags';
import Dictionary from './Dictionary';
import {ICloneable, IProducible, ManyToManyMixin, SerializableMixin, CloneableMixin} from '../entity';
import di from '../di';
import {applyMixins} from '../util';

interface ProduceOptions {
   format?: Object
}

function prepareValue(value): IValue {
   return value === null || value === undefined ? null : !!value;
}

export default class Flags<T> extends Dictionary<T> implements IFlags<T>, ICloneable, IProducible /** @lends Types/Type/Flags.prototype */{
   readonly '[Types/_collection/IFlags]': boolean;
   readonly '[Types/_entity/ICloneable]': boolean;
   readonly '[Types/_entity/IProducible]': boolean;
   readonly _moduleName: string;

   /**
    * @cfg {Array.<Boolean|Null>} Индексы выбранных значений в словаре
    * @name Types/Type/Flags#values
    */
   protected _$values: Array<IValue>;

   constructor(options?: Object) {
      super(options);
      SerializableMixin.constructor.call(this);
      this._publish('onChange');
      this._$values = this._$values || [];
   }

   destroy() {
      ManyToManyMixin.destroy.call(this);
      super.destroy();
   }

   //region ObservableMixin

   protected _publish: (...events) => void;
   protected _notify: (event: string, ...args) => void;

   //endregion

   //region ManyToManyMixin

   protected _childChanged: (data) => void;

   //endregion

   //region IFlags

   get(name: T, localize?: boolean): IValue {
      let ordinalIndex = this._getOrdinalIndex(name, localize);
      if (ordinalIndex !== undefined) {
         return prepareValue(this._$values[ordinalIndex]);
      }
      return undefined;
   }

   set(name: T, value: IValue, localize?: boolean) {
      let ordinalIndex = this._getOrdinalIndex(name, localize);
      if (ordinalIndex === undefined) {
         throw new ReferenceError(`${this._moduleName}::set(): the value "${name}" doesn't found in dictionary`);
      }

      value = prepareValue(value);
      if (this._$values[ordinalIndex] === value) {
         return;
      }
      this._$values[ordinalIndex] = value;

      let index = this._getIndex(name, localize);
      this._notifyChange(name, index, value);
   }

   getByIndex(index: number): IValue {
      let name = this._getValue(index);
      let ordinalIndex = this._getOrdinalIndex(name);

      return this._$values[ordinalIndex];
   }

   setByIndex(index: number, value: IValue) {
      let name = this._getValue(index);
      if (name === undefined) {
         throw new ReferenceError(`${this._moduleName}::setByIndex(): the index ${index} doesn't found in dictionary`);
      }

      let ordinalIndex = this._getOrdinalIndex(name);
      value = prepareValue(value);
      if (this._$values[ordinalIndex] === value) {
         return;
      }
      this._$values[ordinalIndex] = value;

      this._notifyChange(name, index, value);
   }

   setFalseAll() {
      this._setAll(false);
   }

   setTrueAll() {
      this._setAll(true);
   }

   setNullAll() {
      this._setAll(null);
   }

   //endregion

   //region IEquatable

   isEqual(to): boolean {
      if (!(to instanceof Flags)) {
         return false;
      }

      if (!Dictionary.prototype.isEqual.call(this, to)) {
         return false;
      }

      let enumerator = this.getEnumerator();
      let key;
      while (enumerator.moveNext()) {
         key = enumerator.getCurrent();
         if (this.get(key) !== to.get(key)) {
            return false;
         }
      }

      return true;
   }

   //endregion

   //region ICloneable

   clone: (shallow?: boolean) => Object;

   //endregion

   //region IProducible

   static produceInstance(data?: any, options?: ProduceOptions): any {
      return new this({
         dictionary: this.prototype._getDictionaryByFormat(options && options.format),
         localeDictionary: this.prototype._getLocaleDictionaryByFormat(options && options.format),
         values: data
      });
   }

   //endregion

   //region Public methods

   toString(): string {
      return '[' + this._$values.map((value) => {
         return value === null ? 'null' : value;
      }).join(',') + ']';
   }

   //endregion

   //region Protected methods

   /**
    * Возвращает порядковый номер значения в словаре
    * @param {String} name Значение в словаре
    * @param {Boolean} [localize=false] Это локализованное значение
    * @return {Number|undefined}
    * @protected
    */
   protected _getOrdinalIndex(name: T, localize?: boolean): number {
      let enumerator = this.getEnumerator(localize);
      let index = 0;
      while (enumerator.moveNext()) {
         if (enumerator.getCurrent() === name) {
            return index;
         }
         index++;
      }
      return undefined;
   }

   protected _setAll(value: IValue) {
      let dictionary = this._$dictionary;
      let values = this._$values;
      let enumerator = this.getEnumerator();
      let ordinalIndex = 0;
      while (enumerator.moveNext()) {
         if (values[ordinalIndex] !== value) {
            values[ordinalIndex] = value;
            let dictionaryIndex = enumerator.getCurrentIndex();
            this._notifyChange(dictionary[dictionaryIndex], dictionaryIndex, value);
         }
         ordinalIndex++;
      }
   }

   /**
    * Уведомляет об изменении
    * @param {String} name Имя флага
    * @param {Number} index Изменившийся индекс
    * @param {String} value Значение в индексе
    * @protected
    */
   protected _notifyChange(name: T, index: number | string, value: IValue) {
      let data = {};
      data[String(name)] = value;
      this._childChanged(data);
      this._notify('onChange', name, index, value);
   }

   //endregion
}

applyMixins(Flags, ManyToManyMixin, SerializableMixin, CloneableMixin);

Flags.prototype['[Types/_collection/Flags]'] = true;
// @ts-ignore
Flags.prototype['[Types/_collection/IFlags]'] = true;
// @ts-ignore
Flags.prototype['[Types/_entity/ICloneable]'] = true;
// @ts-ignore
Flags.prototype['[Types/_entity/IProducible]'] = true;
// @ts-ignore
Flags.prototype._moduleName = 'Types/collection:Flags';
// @ts-ignore
Flags.prototype._$values = undefined;
// @ts-ignore
Flags.prototype._type = 'flags';

//FIXME: backward compatibility for check via Core/core-instance::instanceOfModule()
Flags.prototype['[WS.Data/Type/Flags]'] = true;
//FIXME: backward compatibility for check via Core/core-instance::instanceOfMixin()
Flags.prototype['[WS.Data/Entity/ICloneable]'] = true;

di.register('Types/collection:Flags', Flags, {instantiate: false});
