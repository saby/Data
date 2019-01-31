/// <amd-module name="Types/_collection/Enum" />
/**
 * Enumerable type. It's an enumerable collection of keys and values one of which can be selected or not.
 * @class Types/_collection/Enum
 * @extends Types/_collection/Dictionary
 * @implements Types/_collection/IEnum
 * @implements Types/_entity/ICloneable
 * @implements Types/_entity/IProducible
 * @mixes Types/_entity/ManyToManyMixin
 * @mixes Types/_entity/SerializableMixin
 * @mixes Types/_entity/CloneableMixin
 * @public
 * @author Мальцев А.А.
 */

import IEnum, {IIndex} from './IEnum';
import Dictionary from './Dictionary';
import {ICloneable, IProducible, ManyToManyMixin, SerializableMixin, CloneableMixin} from '../entity';
import {register} from '../di';
import {applyMixins} from '../util';

interface ProduceOptions {
   format?: Object
}

export default class Enum<T> extends Dictionary<T> implements IEnum<T>, ICloneable, IProducible /** @lends Types/_collection/Enum.prototype */{
   readonly '[Types/_collection/IEnum]': boolean;
   readonly '[Types/_entity/ICloneable]': boolean;
   readonly '[Types/_entity/IProducible]': boolean;
   readonly _moduleName: string;

   /**
    * @cfg {Number|sting|null} Key of the selected item
    * @name Types/_collection/Enum#index
    */
   protected _$index: IIndex;

   constructor(options?: Object) {
      super(options);
      SerializableMixin.constructor.call(this);
      this._publish('onChange');
      this._checkIndex();
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

   //region IEnum

   get(): IIndex {
      return this._$index;
   }

   set(index: IIndex) {
      let value = this._$dictionary[index];
      const defined = value !== undefined;
      const changed = this._$index !== index;

      if (index === null || defined) {
         this._$index = index;
         this._checkIndex();
      } else {
         throw new ReferenceError(`${this._moduleName}::set(): the index "${index}" is out of range`);
      }

      if (changed) {
         this._notifyChange(this._$index, this.getAsValue());
      }
   }

   getAsValue(localize?: boolean): T {
      return this._getValue(this._$index, localize);
   }

   setByValue(value: T, localize?: boolean) {
      let index = this._getIndex(value, localize);
      const changed = index !== this._$index;

      if (value === null) {
         this._$index = <null>value;
      } else if (index === undefined) {
         throw new ReferenceError(`${this._moduleName}::setByValue(): the value "${value}" doesn't found in dictionary`);
      } else {
         this._$index = index;
      }

      if (changed) {
         this._notifyChange(index, value);
      }
   }

   //endregion

   //region IEquatable

   isEqual(to: Object): boolean {
      if (!(to instanceof Enum)) {
         return false;
      }

      if (!Dictionary.prototype.isEqual.call(this, to)) {
         return false;
      }

      return this.get() === to.get();
   }

   //endregion

   //region ICloneable

   clone: (shallow?: boolean) => Enum<T>;

   //endregion

   //region IProducible

   static produceInstance<T>(data?: any, options?: ProduceOptions): Enum<T> {
      return new this({
         dictionary: this.prototype._getDictionaryByFormat(options && options.format),
         localeDictionary: this.prototype._getLocaleDictionaryByFormat(options && options.format),
         index: data
      });
   }

   //endregion

   //region Public methods

   valueOf(): IIndex {
      return this.get();
   }

   toString(): string {
      let value = this.getAsValue();
      return value === undefined || value === null ? '' : String(value);
   }

   //endregion

   //region Protected methods

   /**
    * Converts key to the Number type
    * @protected
    */
   protected _checkIndex() {
      if (this._$index === null) {
         return;
      }
      this._$index = parseInt(String(this._$index), 10);
   }

   /**
    * Triggers a change event
    * @param {Number} index Key of selected item
    * @param {String} value Value of selected item
    * @protected
    */
   protected _notifyChange(index: IIndex, value: T) {
      let data = {};
      data[index] = value;
      this._childChanged(data);
      this._notify('onChange', index, value);
   }

   //endregion
}

applyMixins(Enum, ManyToManyMixin, SerializableMixin, CloneableMixin);

Enum.prototype['[Types/_collection/Enum]'] = true;
// @ts-ignore
Enum.prototype['[Types/_collection/IEnum]'] = true;
// @ts-ignore
Enum.prototype['[Types/_entity/ICloneable]'] = true;
// @ts-ignore
Enum.prototype['[Types/_entity/IProducible]'] = true;
// @ts-ignore
Enum.prototype._moduleName = 'Types/collection:Enum';
// @ts-ignore
Enum.prototype._$index = null;
// @ts-ignore
Enum.prototype._type = 'enum';

//FIXME: backward compatibility for check via Core/core-instance::instanceOfModule()
Enum.prototype['[WS.Data/Type/Enum]'] = true;
//FIXME: backward compatibility for check via Core/core-instance::instanceOfMixin()
Enum.prototype['[WS.Data/Entity/ICloneable]'] = true;

register('Types/collection:Enum', Enum, {instantiate: false});
