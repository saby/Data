/// <amd-module name="Types/_collection/enumerator/Arraywise" />
/**
 * Энумератор для массива
 * @class Types/_collection/ArrayEnumerator
 * @implements Types/_collection/IEnumerator
 * @mixes Types/_collection/IndexedEnumeratorMixin
 * @public
 * @author Мальцев А.А.
 */

import IEnumerator from '../IEnumerator';
import IndexedEnumeratorMixin from '../IndexedEnumeratorMixin';
import {register} from '../../di';
import {mixin} from '../../util';

export default class Arraywise<T> extends mixin(
   Object,
   IndexedEnumeratorMixin
) implements IEnumerator<T> /** @lends Types/_collection/ArrayEnumerator.prototype */{
   /**
    * Конструктор
    * @param {Array} items Массив
    */
   constructor(items: Array<T>) {
      super();
      let checkedItems = items;
      if (checkedItems === undefined) {
         checkedItems = [];
      }
      if (!(checkedItems instanceof Array)) {
         throw new Error('Argument items should be an instance of Array');
      }
      this._items = checkedItems;
      IndexedEnumeratorMixin.constructor.call(this);
   }

   // region Types/_collection/IEnumerator

   readonly '[Types/_collection/IEnumerator]': true;

   getCurrent(): any {
      if (this._index < 0) {
         return undefined;
      }
      return this._resolver ? this._resolver(this._index) : this._items[this._index];
   }

   getCurrentIndex(): number {
      return this._index;
   }

   moveNext(): boolean {
      if (1 + this._index >= this._items.length) {
         return false;
      }
      this._index++;

      const current = this.getCurrent();
      if (this._filter && !this._filter(current, this._index)) {
         return this.moveNext();
      }

      return true;
   }

   reset() {
      this._index = -1;
   }

   // endregion Types/_collection/IEnumerator

   // region Public methods

   /**
    * Устанавливает резолвер элементов по позиции
    * @param {function(Number): *} resolver Функция обратного вызова, которая должна по позиции вернуть элемент
    */
   setResolver(resolver: (index: number) => any) {
      this._resolver = resolver;
   }

   /**
    * Устанавливает фильтр элементов
    * @param {function(*): Boolean} filter Функция обратного вызова, которая должна для каждого элемента вернуть
    * признак, проходит ли он фильтр
    */
   setFilter(filter: (item: any, index: any) => boolean) {
      this._filter = filter;
   }

   // endregion Public methods
}

Arraywise.prototype['[Types/_collection/enumerator/Arraywise]'] = true;

/**
 * @property {Array} Массив
 */
Arraywise.prototype._items = null;

/**
 * @property {Number} Текущий индекс
 */
Arraywise.prototype._index = -1;

/**
 * @property {function(Number): *} Резолвер элементов
 */
Arraywise.prototype._resolver = null;

/**
 * @property {function(*): Boolean} Фильтр элементов
 */
Arraywise.prototype._filter = null;

register('Types/collection:enumerator.Arraywise', Arraywise, {instantiate: false});
