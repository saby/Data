/// <amd-module name="Types/_collection/Dictionary" />
/**
 * Тип данных словарь.
 * Это абстрактный класс, не предусмотрено создание самостоятельных экземпляров.
 * @class Types/Type/Dictionary
 * @implements Types/Collection/IEnumerable
 * @implements Types/Entity/IEquatable
 * @mixes Types/Entity/OptionsMixin
 * @mixes Types/Entity/ObservableMixin
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

declare type DictionaryValues = Array<string> | GenericObject<string>;

export default abstract class Dictionary<T> extends DestroyableMixin implements IEnumerable<T>, IEquatable /** @lends Types/Type/Dictionary.prototype */{
   /**
    * @cfg {Array.<String>|Object.<String>} Словарь возможных значений
    * @name Types/Type/Dictionary#dictionary
    */
   protected _$dictionary: DictionaryValues;

   /**
    * @cfg {Array.<String>|Object.<String>} Локализованный словарь возможных значений
    * @name Types/Type/Dictionary#localeDictionary
    */
   protected _$localeDictionary: DictionaryValues;

   /**
    * Название типа данных для сериализации в сырой вид
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
    * Возвращает словарь возможных значений
    * @param {Boolean} [localize=false] Вернуть локализованный словарь
    * @return {Array.<String>|Object.<String>}
    * @protected
    */
   getDictionary(localize?: boolean): DictionaryValues {
      let dictionary = localize && this._$localeDictionary ? this._$localeDictionary : this._$dictionary;
      return dictionary
         ? (Array.isArray(dictionary) ? dictionary.slice() : Object.assign({}, dictionary))
         : dictionary;
   }

   //region IEnumerable

   readonly '[Types/_collection/IEnumerable]';

   each(callback: EnumeratorCallback<T>, context?: Object, localize?: boolean) {
      context = context || this;
      let enumerator = this.getEnumerator(localize);
      while (enumerator.moveNext()) {
         callback.call(
            context,
            enumerator.getCurrent(),
            enumerator.getCurrentIndex()
         );
      }
   }

   getEnumerator(localize?: boolean): IEnumerator<T> {
      let dictionary = localize && this._$localeDictionary ? this._$localeDictionary : this._$dictionary;
      let enumerator = dictionary instanceof Array ? new ArrayEnumerator(dictionary) : new Objectwise(dictionary);

      enumerator.setFilter((item: any, index: any): boolean => {
         return index !== 'null';
      });
      return enumerator;
   }

   //endregion

   //region IEquatable

   readonly '[Types/_entity/IEquatable]';

   isEqual(to: Object): boolean {
      if (!(to instanceof Dictionary)) {
         return false;
      }

      let enumerator = this.getEnumerator();
      let toEnumerator = to.getEnumerator();
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

   //endregion

   //region Protected methods

   /**
    * Возвращает индекс значения в словаре
    * @param {String} name Значение в словаре
    * @param {Boolean} [localize=false] Это локализованное значение
    * @return {Number|String|undefined}
    * @protected
    */
   protected _getIndex(name: T, localize?: boolean): number | string {
      let enumerator = this.getEnumerator(localize);
      while (enumerator.moveNext()) {
         if (enumerator.getCurrent() === name) {
            return enumerator.getCurrentIndex();
         }
      }
      return undefined;
   }

   /**
    * Возвращает значение в словаре по индексу
    * @param {Number|String} index Индекс в словаре
    * @param {Boolean} [localize=false] Вернуть локализованное значение
    * @return {String}
    * @protected
    */
   protected _getValue(index: number | string, localize?: boolean): any {
      return localize && this._$localeDictionary ? this._$localeDictionary[index] : this._$dictionary[index];
   }

   /**
    * Возвращает словарь из формата
    * @param {Types/Format/Field|Types/Format/UniversalField|String} format Формат поля
    * @return {Array}
    * @protected
    */
   protected _getDictionaryByFormat(format): Array<any> {
      if (!format) {
         return [];
      }
      return (
         format.getDictionary ? format.getDictionary() : format.meta && format.meta.dictionary
      ) || [];
   }

   /**
    * Возвращает локализованный словарь из формата
    * @param {Types/Format/Field|Types/Format/UniversalField|String} format Формат поля
    * @return {Array|undefined}
    * @protected
    */
   protected _getLocaleDictionaryByFormat(format): Array<any> {
      if (!format) {
         return;
      }
      return (
         format.getLocaleDictionary ? format.getLocaleDictionary() : format.meta && format.meta.localeDictionary
      ) || undefined;
   }

   //endregion
}

applyMixins(Dictionary, OptionsToPropertyMixin, ObservableMixin);

Dictionary.prototype['[Types/_collection/Dictionary]'] = true;
// @ts-ignore
Dictionary.prototype['[Types/_collection/IEnumerable]'] = true;
// @ts-ignore
Dictionary.prototype['[Types/_entity/IEquatable]'] = true;
// @ts-ignore
Dictionary.prototype._$dictionary = undefined;
// @ts-ignore
Dictionary.prototype._$localeDictionary = undefined;
// @ts-ignore
Dictionary.prototype._type = undefined;

//FIXME: backward compatibility for check via Core/core-instance::instanceOfMixin()
Dictionary.prototype['[WS.Data/Collection/IEnumerable]'] = true;
