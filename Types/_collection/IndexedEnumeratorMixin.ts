/// <amd-module name="Types/_collection/IndexedEnumeratorMixin" />
/**
 * Миксин, позволящий использовать индексацию элементов в экземплярах,
 * реализующих интерфейс Types/Collection/IEnumerator.
 * @mixin Types/Collection/IndexedEnumeratorMixin
 * @public
 * @author Мальцев А.А.
 */

import { object } from '../util';
import IObservable from './IObservable';

const IndexedEnumeratorMixin = /** @lends Types/Collection/IndexedEnumeratorMixin.prototype */{
   '[Types/_collection/IndexedEnumeratorMixin]': true,

   /**
    * @member {Object} Индексы, распределенные по полям
    */
   _enumeratorIndexes: null,

   constructor() {
      this._enumeratorIndexes = {};
      this._onCollectionChange = this._onCollectionChange.bind(this);
   },

   // region Public methods

   /**
    * Переиндексирует энумератор
    * @param {Types/Collection/IBind/ChangeAction.typedef[]} [action] Действие, приведшее к изменению.
    * @param {Number} [start=0] С какой позиции переиндексировать
    * @param {Number} [count=0] Число переиндексируемых элементов
    */
   reIndex(action: string, start?: number, count?: number) {
      switch (action) {
         case IObservable.ACTION_ADD:
            this._shiftIndex(start, count);
            this._addToIndex(start, count);
            break;
         case IObservable.ACTION_REMOVE:
            this._removeFromIndex(start, count);
            this._shiftIndex(start + count, -count);
            break;
         case IObservable.ACTION_REPLACE:
            this._replaceInIndex(start, count);
            break;
         default:
            this._resetIndex();
      }
   },

   /**
    * Возвращает индекс первого элемента с указанным значением свойства. Если такого элемента нет - вернет -1.
    * @param {String} property Название свойства элемента.
    * @param {*} value Значение свойства элемента.
    * @return {Number}
    */
   getIndexByValue(property, value) {
      const index = this._getIndexForPropertyValue(property, value);
      return index.length ? index[0] : -1;
   },

   /**
    * Возвращает индексы всех элементов с указанным значением свойства.
    * @param {String} property Название свойства элемента.
    * @param {*} value Значение свойства элемента.
    * @return {Array.<Number>}
    */
   getIndicesByValue(property, value) {
      return this._getIndexForPropertyValue(property, value);
   },

   /**
    * Устанавливает коллекцию при изменении которой поисходит переиндексация энумератора
    * @param {Types/Collection/IBind} collection
    */
   setObservableCollection(collection) {
      collection.subscribe('onCollectionChange', this._onCollectionChange);
   },

   /**
    * Сбрасывает коллекцию при изменении которой поисходит переиндексация энумератора
    * @param {Types/Collection/IBind} collection
    */
   unsetObservableCollection(collection) {
      collection.unsubscribe('onCollectionChange', this._onCollectionChange);
   },

   // endregion Public methods

   // region Protected methods

   /**
    * Возвращает индекс для указанного значения свойства.
    * @param {String} property Название свойства элемента.
    * @param {*} value Значение свойства элемента.
    * @return {Array.<Number>}
    * @protected
    */
   _getIndexForPropertyValue(property, value) {
      const index = this._getIndex(property);
      return (index && index[value]) || [];
   },

   /**
    * Проверяет наличие индекса для указанного свойства.
    * @param {String} [property] Название свойства.
    * @protected
    */
   _hasIndex(property) {
      if (property) {
         return Object.prototype.hasOwnProperty.call(this._enumeratorIndexes, property);
      }
      return Object.keys(this._enumeratorIndexes).length === 0;
   },

   /**
    * Возвращает индекс для указанного свойства.
    * @param {String} property Название свойства.
    * @return {Object}
    * @protected
    */
   _getIndex(property) {
      if (property && !this._hasIndex(property)) {
         this._createIndex(property);
      }
      return this._enumeratorIndexes[property];
   },

   /**
    * Сбрасывает индекс
    */
   _resetIndex() {
      this._enumeratorIndexes = {};
   },

   /**
    * Удаляет индекс для указанного свойства.
    * @param {String} property Название свойства.
    * @protected
    */
   _deleteIndex(property) {
      delete this._enumeratorIndexes[property];
   },

   /**
    * Создает индекс для указанного свойства.
    * @param {String} property Название свойства.
    * @protected
    */
   _createIndex(property: string) {
      const index = {};
      let position = 0;

      this._enumeratorIndexes[property] = index;
      this.reset();

      while (this.moveNext()) {
         this._setToIndex(
            index,
            property,
            this.getCurrent(),
            position
         );
         position++;
      }
   },

   /**
    * Добавляет элементы в индекс
    * @param {Number} start С какой позиции переиндексировать
    * @param {Number} count Число переиндексируемых элементов
    * @protected
    */
   _addToIndex(start, count) {
      let index;
      const finish = start + count;
      let position;

      for (const property in this._enumeratorIndexes) {
         if (this._enumeratorIndexes.hasOwnProperty(property)) {
            index = this._enumeratorIndexes[property];
            position = 0;
            this.reset();
            while (this.moveNext()) {
               if (position >= start) {
                  this._setToIndex(
                     index,
                     property,
                     this.getCurrent(),
                     position
                  );
               }
               position++;
               if (position >= finish) {
                  break;
               }
            }
         }
      }
   },

   /**
    * Удаляет элементы из индекса
    * @param {Number} start С какой позиции переиндексировать
    * @param {Number} count Число переиндексируемых элементов
    * @protected
    */
   _removeFromIndex(start, count) {
      let index;
      let value;
      let elem;
      let at;

      for (const property in this._enumeratorIndexes) {
         if (this._enumeratorIndexes.hasOwnProperty(property)) {
            index = this._enumeratorIndexes[property];
            for (value in index) {
               if (index.hasOwnProperty(value)) {
                  elem = index[value];
                  for (let i = 0; i < count; i++) {
                     at = elem.indexOf(start + i);
                     if (at > -1) {
                        elem.splice(at, 1);
                     }
                  }
               }
            }
         }
      }
   },

   /**
    * Заменяет элементы в индексе
    * @param {Number} start С какой позиции заменять
    * @param {Number} count Число замененных элементов
    * @protected
    */
   _replaceInIndex(start, count) {
      this._removeFromIndex(start, count);
      this._addToIndex(start, count);
   },

   /**
    * Сдвигает позицию элементов индекса
    * @param {Number} start С какой позиции
    * @param {Number} offset Сдвиг
    * @protected
    */
   _shiftIndex(start, offset) {
      let index;
      let item;

      for (const property in this._enumeratorIndexes) {
         if (this._enumeratorIndexes.hasOwnProperty(property)) {
            index = this._enumeratorIndexes[property];
            for (const value in index) {
               if (index.hasOwnProperty(value)) {
                  item = index[value];
                  for (let i = 0; i < item.length; i++) {
                     if (item[i] >= start) {
                        item[i] += offset;
                     }
                  }
               }
            }
         }
      }
   },

   /**
    * Устанавливает элемент в индекс
    * @protected
    */
   _setToIndex(index, property, item, position) {
      let value = object.getPropertyValue(item, property);

      // FIXME: should figure out when search can be either CollectionItem instance and their contents
      if (value === undefined &&
         item instanceof Object &&
         typeof item.getContents === 'function'
      ) {
         // item is instance of Types/Display/CollectionItem
         value = object.getPropertyValue(item.getContents(), property);
      }

      if (!Object.prototype.hasOwnProperty.call(index, value)) {
         index[value] = [];
      }

      index[value].push(position);
   },

   /**
    * Удаляет индексы при изменении исходной коллекции
    * @param {Core/EventObject} event Дескриптор события.
    * @param {String} action Действие, приведшее к изменению.
    * @param {Array.<*>} newItems Новые элементы коллекции.
    * @param {Number} newItemsIndex Индекс, в котором появились новые элементы.
    * @param {Array.<*>} oldItems Удаленные элементы коллекции.
    * @param {Number} oldItemsIndex Индекс, в котором удалены элементы.
    * @protected
    */
   _onCollectionChange(event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) {
      switch (action) {
         case IObservable.ACTION_ADD:
         case IObservable.ACTION_REPLACE:
            this.reIndex(action, newItemsIndex, newItems.length);
            break;
         case IObservable.ACTION_REMOVE:
            this.reIndex(action, oldItemsIndex, oldItems.length);
            break;
         default:
            this.reIndex(action);
      }
   }

   // endregion Protected methods
};

export default IndexedEnumeratorMixin;
