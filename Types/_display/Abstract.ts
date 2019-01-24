/// <amd-module name="Types/_display/Abstract" />
/**
 * Абстрактная проекция данных.
 * Это абстрактный класс, не предназначенный для создания самостоятельных экземпляров.
 * @class Types/_display/Abstract
 * @mixes Types/_entity/DestroyableMixin
 * @mixes Types/_entity/OptionsMixin
 * @mixes Types/_entity/ObservableMixin
 * @public
 * @author Мальцев А.А.
 */

import {DestroyableMixin, OptionsToPropertyMixin, ObservableMixin} from '../entity';
import {IEnumerable as IEnumerableCollection, IEnumerable, IEnumerator} from '../collection';
import {create} from '../di';
import {mixin} from '../util';

/**
 * Массив соответствия индексов проекций и коллекций
 */
let displaysToCollections: Array<IEnumerable<any>> = [];

/**
 * Массив соответствия индексов проекций и их инстансов
 */
let displaysToInstances: Array<Abstract> = [];

/**
 * Счетчик ссылок на singlton-ы
 */
let displaysCounter: Array<number> = [];

export interface IEnumerable<T> extends IEnumerableCollection<T> {
   getEnumerator(localize?: boolean): IEnumerator<T>;
}

interface IOptions {
   collection?: IEnumerable<any>;
}

export default abstract class Abstract extends mixin(
   DestroyableMixin, OptionsToPropertyMixin, ObservableMixin
) /** @lends Types/_display/Abstract.prototype */{
   constructor(options?: IOptions) {
      super(options);
      OptionsToPropertyMixin.call(this, options);
      ObservableMixin.call(this, options);
   }

   destroy() {
      DestroyableMixin.prototype.destroy.call(this);
      ObservableMixin.prototype.destroy.call(this);
   }

   //region Statics

   /**
    * Возвращает проекцию по умолчанию
    * @param {Types/_collection/IEnumerable} collection Объект, для которого требуется получить проекцию
    * @param {Object} [options] Опции конструктора проекции
    * @param {Boolean} [single=false] Возвращать singleton для каждой collection
    * @return {Types/_display/Abstract}
    * @static
    */
   static getDefaultDisplay(collection: IEnumerable<any>, options?: IOptions, single?: boolean) {
      if (arguments.length === 2 && (typeof options !== 'object')) {
         single = options;
         options = {};
      }

      let index = single ? displaysToCollections.indexOf(collection) : -1;
      if (index === -1) {
         options = options || {};
         options.collection = collection;
         let instance;

         if (collection && collection['[Types/_collection/IEnum]']) {
            instance = create('Types/display:Enum', options);
         } else if (collection && collection['[Types/_collection/IFlags]']) {
            instance = create('Types/display:Flags', options);
         } else if (collection && collection['[Types/_collection/IEnumerable]']) {
            instance = create('Types/display:Collection', options);
         } else if (collection instanceof Array) {
            instance = create('Types/display:Collection', options);
         } else {
            throw new TypeError(`Argument "collection" should implement Types/_collection/IEnumerable or be an instance of Array, but "${collection}" given.`);
         }

         if (single) {
            displaysToCollections.push(collection);
            displaysToInstances.push(instance);
            displaysCounter.push(1);
         }

         return instance;
      } else {
         displaysCounter[index]++;
         return displaysToInstances[index];
      }
   }

   /**
    * Освобождает проекцию, которую запрашивали через getDefaultDisplay как singleton
    * @param {Types/_display/Abstract} display Проекция, полученная через getDefaultDisplay с single=true
    * @return {Boolean} Ссылка на проекцию была освобождена
    * @static
    */
   static releaseDefaultDisplay(display) {
      let index = displaysToInstances.indexOf(display);
      if (index === -1) {
         return false;
      }

      displaysCounter[index]--;

      if (displaysCounter[index] === 0) {
         displaysToInstances[index].destroy();

         displaysCounter.splice(index, 1);
         displaysToInstances.splice(index, 1);
         displaysToCollections.splice(index, 1);
      }

      return true;
   }

   //endregion
}

Abstract.prototype['[Types/_display/Abstract]'] = true;

// Deprecated
Abstract.prototype['[WS.Data/Display/Display]'] = true;
