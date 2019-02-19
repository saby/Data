/// <amd-module name="Types/_collection/Dictionary" />
/**
 * An abstract enity which have the dictionary as collection of keys and values.
 * It's an abstract class and it's can't have instances.
 * @class Types/_collection/Dictionary
 * @implements Types/_collection/IEnumerable
 * @implements Types/_entity/IEquatable
 * @mixes Types/_entity/OptionsMixin
 * @mixes Types/_entity/ObservableMixin
 * @public
 * @author Мальцев А.А.
 */

import IEnumerable from './IEnumerable';
import {EnumeratorCallback} from './IEnumerable';
import IEnumerator from './IEnumerator';
import ArrayEnumerator from './enumerator/Arraywise';
import Objectwise from './enumerator/Objectwise';
import {IEquatable, DestroyableMixin, OptionsToPropertyMixin, ObservableMixin} from '../entity';
import {applyMixins} from '../util';

interface GenericObject<T> {}

declare type DictionaryValues = string[] | GenericObject<string>;

export default abstract class Dictionary<T> extends DestroyableMixin implements IEnumerable<T>, IEquatable /** @lends Types/_collection/Dictionary.prototype */{

   // region IEnumerable

   readonly '[Types/_collection/IEnumerable]';

   // endregion

   // region IEquatable

   readonly '[Types/_entity/IEquatable]';
   /**
    * @cfg {Array.<String>|Object.<String>} Collection of keys and values
    * @name Types/_collection/Dictionary#dictionary
    */
   protected _$dictionary: DictionaryValues;

   /**
    * @cfg {Array.<String>|Object.<String>} Localized collection of keys and values
    * @name Types/_collection/Dictionary#localeDictionary
    */
   protected _$localeDictionary: DictionaryValues;

   /**
    * Name of the concrete type which used during the serialization. Should be overrided.
    */
   protected _type: string;

   constructor(options?: Object) {
      super();
      OptionsToPropertyMixin.call(this, options);
      ObservableMixin.call(this, options);
      this._$dictionary = this._$dictionary || [];
   }

   destroy() {
      ObservableMixin.prototype.destroy.call(this);
      super.destroy();
   }

   /**
    * Returns collection of keys and values
    * @param {Boolean} [localize=false] Should return localized version
    * @return {Array.<String>|Object.<String>}
    * @protected
    */
   getDictionary(localize?: boolean): DictionaryValues {
      const dictionary = localize && this._$localeDictionary ? this._$localeDictionary : this._$dictionary;
      return dictionary
         ? (Array.isArray(dictionary) ? dictionary.slice() : {...dictionary})
         : dictionary;
   }

   each(callback: EnumeratorCallback<T>, context?: Object, localize?: boolean) {
      context = context || this;
      const enumerator = this.getEnumerator(localize);
      while (enumerator.moveNext()) {
         callback.call(
            context,
            enumerator.getCurrent(),
            enumerator.getCurrentIndex()
         );
      }
   }

   getEnumerator(localize?: boolean): IEnumerator<T> {
      const dictionary = localize && this._$localeDictionary ? this._$localeDictionary : this._$dictionary;
      const enumerator = dictionary instanceof Array ? new ArrayEnumerator(dictionary) : new Objectwise(dictionary);

      enumerator.setFilter((item: any, index: any): boolean => {
         return index !== 'null';
      });
      return enumerator;
   }

   isEqual(to: Object): boolean {
      if (!(to instanceof Dictionary)) {
         return false;
      }

      const enumerator = this.getEnumerator();
      const toEnumerator = to.getEnumerator();
      let item;
      let hasItem;
      let toItem;
      let hasToItem;

      do {
         hasItem = enumerator.moveNext();
         hasToItem = toEnumerator.moveNext();
         item = hasItem ? enumerator.getCurrent() : undefined;
         toItem = hasToItem ? toEnumerator.getCurrent() : undefined;
         if (item !== toItem) {
            return false;
         }
         if (enumerator.getCurrentIndex() !== toEnumerator.getCurrentIndex()) {
            return false;
         }
      } while (hasItem || hasToItem);

      return true;
   }

   // endregion

   // region Protected methods

   /**
    * Returns key of the value in dictionary
    * @param {String} name Value for lookup
    * @param {Boolean} [localize=false] Is the localized value
    * @return {Number|String|undefined}
    * @protected
    */
   protected _getIndex(name: T, localize?: boolean): number | string {
      const enumerator = this.getEnumerator(localize);
      while (enumerator.moveNext()) {
         if (enumerator.getCurrent() === name) {
            return enumerator.getCurrentIndex();
         }
      }
      return undefined;
   }

   /**
    * Returns value of the key in dictionary
    * @param {Number|String} index Key for lookup
    * @param {Boolean} [localize=false] Should return the localized value
    * @return {String}
    * @protected
    */
   protected _getValue(index: number | string, localize?: boolean): any {
      return localize && this._$localeDictionary ? this._$localeDictionary[index] : this._$dictionary[index];
   }

   /**
    * Extracts dictionary from the field format.
    * @param {Types/_entity/format/Field|Types/_entity/format/UniversalField|String} format Field format
    * @return {Array}
    * @protected
    */
   protected _getDictionaryByFormat(format): any[] {
      if (!format) {
         return [];
      }
      return (
         format.getDictionary ? format.getDictionary() : format.meta && format.meta.dictionary
      ) || [];
   }

   /**
    * Extracts dictionary from the field format.
    * @param {Types/_entity/format/Field|Types/_entity/format/UniversalField|String} format Field format
    * @return {Array|undefined}
    * @protected
    */
   protected _getLocaleDictionaryByFormat(format): any[] {
      if (!format) {
         return;
      }
      return (
         format.getLocaleDictionary ? format.getLocaleDictionary() : format.meta && format.meta.localeDictionary
      ) || undefined;
   }

   // endregion
}

applyMixins(Dictionary, OptionsToPropertyMixin, ObservableMixin);

Object.assign(Dictionary.prototype, {
   '[Types/_collection/Dictionary]': true,
   '[Types/_collection/IEnumerable]': true,
   '[Types/_entity/IEquatable]': true,
   _$dictionary: undefined,
   _$localeDictionary: undefined,
   _type: undefined
});

// FIXME: backward compatibility for check via Core/core-instance::instanceOfMixin()
Dictionary.prototype['[WS.Data/Collection/IEnumerable]'] = true;
