/// <amd-module name="Types/_collection/Flags" />
/**
 * Flags type. It's an enumerable collection of keys and values every one of which can be selected or not.
 * @class Types/_collection/Flags
 * @extends Types/_collection/Dictionary
 * @implements Types/_collection/IFlags
 * @implements Types/_entity/ICloneable
 * @implements Types/_entity/IProducible
 * @mixes Types/_entity/ManyToManyMixin
 * @mixes Types/_entity/SerializableMixin
 * @mixes Types/_entity/CloneableMixin
 * @public
 * @author Мальцев А.А.
 */

import IFlags, {IValue} from './IFlags';
import Dictionary from './Dictionary';
import {ICloneable, IProducible, ManyToManyMixin, SerializableMixin, CloneableMixin} from '../entity';
import {register} from '../di';
import {applyMixins} from '../util';

interface ProduceOptions {
   format?: Object;
}

function prepareValue(value): IValue {
   return value === null || value === undefined ? null : !!value;
}

export default class Flags<T> extends Dictionary<T> implements IFlags<T>, ICloneable, IProducible /** @lends Types/_collection/Flags.prototype */{
   readonly '[Types/_collection/IFlags]': boolean;
   readonly '[Types/_entity/ICloneable]': boolean;
   readonly '[Types/_entity/IProducible]': boolean;
   readonly _moduleName: string;

   // endregion

   // region ICloneable

   clone: <Flags>(shallow?: boolean) => Flags;

   /**
    * @cfg {Array.<Boolean|Null>} Selection state of the flags by their indices
    * @name Types/_collection/Flags#values
    */
   protected _$values: IValue[];

   // region ObservableMixin

   protected _publish: (...events) => void;
   protected _notify: (event: string, ...args) => void;

   // endregion

   // region ManyToManyMixin

   protected _childChanged: (data) => void;

   constructor(options?: Object) {
      super(options);
      SerializableMixin.constructor.call(this);
      this._publish('onChange');
      this._$values = this._$values || [];
   }

   // endregion

   // region IProducible

   static produceInstance<T>(data?: any, options?: ProduceOptions): Flags<T> {
      return new this({
         dictionary: this.prototype._getDictionaryByFormat(options && options.format),
         localeDictionary: this.prototype._getLocaleDictionaryByFormat(options && options.format),
         values: data
      });
   }

   destroy() {
      ManyToManyMixin.destroy.call(this);
      super.destroy();
   }

   // endregion

   // region IFlags

   get(name: T, localize?: boolean): IValue {
      const ordinalIndex = this._getOrdinalIndex(name, localize);
      if (ordinalIndex !== undefined) {
         return prepareValue(this._$values[ordinalIndex]);
      }
      return undefined;
   }

   set(name: T, value: IValue, localize?: boolean) {
      const ordinalIndex = this._getOrdinalIndex(name, localize);
      if (ordinalIndex === undefined) {
         throw new ReferenceError(`${this._moduleName}::set(): the value "${name}" doesn't found in dictionary`);
      }

      value = prepareValue(value);
      if (this._$values[ordinalIndex] === value) {
         return;
      }
      this._$values[ordinalIndex] = value;

      const index = this._getIndex(name, localize);
      this._notifyChange(name, index, value);
   }

   getByIndex(index: number): IValue {
      const name = this._getValue(index);
      const ordinalIndex = this._getOrdinalIndex(name);

      return this._$values[ordinalIndex];
   }

   setByIndex(index: number, value: IValue) {
      const name = this._getValue(index);
      if (name === undefined) {
         throw new ReferenceError(`${this._moduleName}::setByIndex(): the index ${index} doesn't found in dictionary`);
      }

      const ordinalIndex = this._getOrdinalIndex(name);
      value = prepareValue(value);
      if (this._$values[ordinalIndex] === value) {
         return;
      }
      this._$values[ordinalIndex] = value;

      this._notifyChange(name, index, value);
   }

   fromArray(source: IValue[]) {
      const values = this._$values;
      const enumerator = this.getEnumerator();
      let ordinalIndex = 0;
      const selection = [];
      while (enumerator.moveNext()) {
         const value = source[ordinalIndex] === undefined ? null : source[ordinalIndex];
         values[ordinalIndex] = value;
         const dictionaryIndex = enumerator.getCurrentIndex();
         selection[dictionaryIndex] = value;
         ordinalIndex++;
      }
      this._notifyChanges(selection);
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

   // endregion

   // region IEquatable

   isEqual(to): boolean {
      if (!(to instanceof Flags)) {
         return false;
      }

      if (!Dictionary.prototype.isEqual.call(this, to)) {
         return false;
      }

      const enumerator = this.getEnumerator();
      let key;
      while (enumerator.moveNext()) {
         key = enumerator.getCurrent();
         if (this.get(key) !== to.get(key)) {
            return false;
         }
      }

      return true;
   }

   // endregion

   // region Public methods

   toString(): string {
      return '[' + this._$values.map((value) => {
         return value === null ? 'null' : value;
      }).join(',') + ']';
   }

   // endregion

   // region Protected methods

   /**
    * Returns an ordinal index of the flag.
    * @param {String} name Name of the flag
    * @param {Boolean} [localize=false] Is the localized flag name
    * @return {Number|undefined}
    * @protected
    */
   protected _getOrdinalIndex(name: T, localize?: boolean): number {
      const enumerator = this.getEnumerator(localize);
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
      const dictionary = this._$dictionary;
      const values = this._$values;
      const enumerator = this.getEnumerator();
      let ordinalIndex = 0;
      while (enumerator.moveNext()) {
         if (values[ordinalIndex] !== value) {
            values[ordinalIndex] = value;
            const dictionaryIndex = enumerator.getCurrentIndex();
            this._notifyChange(dictionary[dictionaryIndex], dictionaryIndex, value);
         }
         ordinalIndex++;
      }
   }

   /**
    * Triggers a change event
    * @param {String} name Name of the flag
    * @param {Number} index Index of the flag
    * @param {String} value New value of selection of the flag
    * @protected
    */
   protected _notifyChange(name: T, index: number | string, value: IValue) {
      const data = {};
      data[String(name)] = value;
      this._childChanged(data);
      this._notify('onChange', name, index, value);
   }

   /**
    * Triggers a mass change event
    * @param {Array.<Boolean|Null>} values Selection
    * @protected
    */
   protected _notifyChanges(values: IValue[]) {
      this._childChanged(values);
      this._notify('onChange', values);
   }

   // endregion
}

applyMixins(Flags, ManyToManyMixin, SerializableMixin, CloneableMixin);

Object.assign(Flags.prototype, {
   '[Types/_collection/Flags]': true,
   '[Types/_collection/IFlags]': true,
   '[Types/_entity/ICloneable]': true,
   '[Types/_entity/IProducible]': true,
   _moduleName: 'Types/collection:Flags',
   _$values: undefined,
   _type: 'flags'
});

// FIXME: backward compatibility for check via Core/core-instance::instanceOfModule()
Flags.prototype['[WS.Data/Type/Flags]'] = true;
// FIXME: backward compatibility for check via Core/core-instance::instanceOfMixin()
Flags.prototype['[WS.Data/Entity/ICloneable]'] = true;

register('Types/collection:Flags', Flags, {instantiate: false});
