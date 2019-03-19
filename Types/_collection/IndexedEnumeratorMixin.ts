import IObservable from './IObservable';
import IEnumerator from './IEnumerator';
import {ObservableMixin} from '../entity';
import {object} from '../util';
import {Object as EventObject} from 'Env/Event';

/**
 * Миксин, позволящий использовать индексацию элементов в экземплярах,
 * реализующих интерфейс Types/_collection/IEnumerator.
 * @mixin Types/_collection/IndexedEnumeratorMixin
 * @public
 * @author Мальцев А.А.
 */
export default abstract class IndexedEnumeratorMixin<T> {
   readonly '[Types/_collection/IndexedEnumeratorMixin]': boolean;

   /**
    * Индексы, распределенные по полям
    */
   protected _enumeratorIndexes: object;

   constructor() {
      this._enumeratorIndexes = {};
      this._onCollectionChange = this._onCollectionChange.bind(this);
   }

   // region Public methods

   /**
    * Переиндексирует энумератор
    * @param {Types/_collection/IObservable/ChangeAction.typedef[]} [action] Действие, приведшее к изменению.
    * @param {Number} [start=0] С какой позиции переиндексировать
    * @param {Number} [count=0] Число переиндексируемых элементов
    */
   reIndex(action: string, start?: number, count?: number): void {
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
   }

   /**
    * Возвращает индекс первого элемента с указанным значением свойства. Если такого элемента нет - вернет -1.
    * @param {String} property Название свойства элемента.
    * @param {*} value Значение свойства элемента.
    * @return {Number}
    */
   getIndexByValue(property: string, value: any): number {
      const index = this._getIndexForPropertyValue(property, value);
      return index.length ? index[0] : -1;
   }

   /**
    * Возвращает индексы всех элементов с указанным значением свойства.
    * @param {String} property Название свойства элемента.
    * @param {*} value Значение свойства элемента.
    * @return {Array.<Number>}
    */
   getIndicesByValue(property: string, value: any): number[] {
      return this._getIndexForPropertyValue(property, value);
   }

   /**
    * Устанавливает коллекцию при изменении которой поисходит переиндексация энумератора
    * @param {Types/_entity/ObservableMixin} collection
    */
   setObservableCollection(collection: ObservableMixin): void {
      collection.subscribe('onCollectionChange', this._onCollectionChange);
   }

   /**
    * Сбрасывает коллекцию при изменении которой поисходит переиндексация энумератора
    * @param {Types/_entity/ObservableMixin} collection
    */
   unsetObservableCollection(collection: ObservableMixin): void {
      collection.unsubscribe('onCollectionChange', this._onCollectionChange);
   }

   // endregion

   // region Protected methods

   /**
    * Возвращает индекс для указанного значения свойства.
    * @param property Название свойства элемента.
    * @param value Значение свойства элемента.
    * @protected
    */
   protected _getIndexForPropertyValue(property: string, value: any): number[] {
      const index = this._getIndex(property);
      return (index && index[value]) || [];
   }

   /**
    * Проверяет наличие индекса для указанного свойства.
    * @param [property] Название свойства.
    * @protected
    */
   protected _hasIndex(property?: string): boolean {
      if (property) {
         return Object.prototype.hasOwnProperty.call(this._enumeratorIndexes, property);
      }
      return Object.keys(this._enumeratorIndexes).length === 0;
   }

   /**
    * Возвращает индекс для указанного свойства.
    * @param property Название свойства.
    * @protected
    */
   protected _getIndex(property: string): object {
      if (property && !this._hasIndex(property)) {
         this._createIndex(property);
      }
      return this._enumeratorIndexes[property];
   }

   /**
    * Сбрасывает индекс
    */
   protected _resetIndex(): void {
      this._enumeratorIndexes = {};
   }

   /**
    * Удаляет индекс для указанного свойства.
    * @param property Название свойства.
    * @protected
    */
   protected _deleteIndex(property: string): void {
      delete this._enumeratorIndexes[property];
   }

   /**
    * Создает индекс для указанного свойства.
    * @param property Название свойства.
    * @protected
    */
   protected _createIndex(property: string): void {
      const index = {};
      let position = 0;

      this._enumeratorIndexes[property] = index;
      const enumerator = this as any as IEnumerator<T>;
      enumerator.reset();

      while (enumerator.moveNext()) {
         this._setToIndex(
            index,
            property,
            enumerator.getCurrent(),
            position
         );
         position++;
      }
   }

   /**
    * Добавляет элементы в индекс
    * @param start С какой позиции переиндексировать
    * @param count Число переиндексируемых элементов
    * @protected
    */
   protected _addToIndex(start: number, count: number): void {
      let index;
      const finish = start + count;
      let position;

      const enumerator = this as any as IEnumerator<T>;

      for (const property in this._enumeratorIndexes) {
         if (this._enumeratorIndexes.hasOwnProperty(property)) {
            index = this._enumeratorIndexes[property];
            position = 0;
            enumerator.reset();
            while (enumerator.moveNext()) {
               if (position >= start) {
                  this._setToIndex(
                     index,
                     property,
                     enumerator.getCurrent(),
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
   }

   /**
    * Удаляет элементы из индекса
    * @param start С какой позиции переиндексировать
    * @param count Число переиндексируемых элементов
    * @protected
    */
   protected _removeFromIndex(start: number, count: number): void {
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
   }

   /**
    * Заменяет элементы в индексе
    * @param start С какой позиции заменять
    * @param count Число замененных элементов
    * @protected
    */
   protected _replaceInIndex(start: number, count: number): void {
      this._removeFromIndex(start, count);
      this._addToIndex(start, count);
   }

   /**
    * Сдвигает позицию элементов индекса
    * @param start С какой позиции
    * @param offset Сдвиг
    * @protected
    */
   protected _shiftIndex(start: number, offset: number): void {
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
   }

   /**
    * Устанавливает элемент в индекс
    * @protected
    */
   protected _setToIndex(index: object, property: string, item: any, position: number): void {
      let value = object.getPropertyValue(item, property);

      // FIXME: should figure out when search can be either CollectionItem instance and their contents
      if (value === undefined &&
         item instanceof Object &&
         typeof item.getContents === 'function'
      ) {
         // item is instance of Types/_display/CollectionItem
         value = object.getPropertyValue(item.getContents(), property);
      }

      if (!Object.prototype.hasOwnProperty.call(index, value)) {
         index[value as string] = [];
      }

      index[value as string].push(position);
   }

   /**
    * Удаляет индексы при изменении исходной коллекции
    * @param event Дескриптор события.
    * @param action Действие, приведшее к изменению.
    * @param newItems Новые элементы коллекции.
    * @param newItemsIndex Индекс, в котором появились новые элементы.
    * @param oldItems Удаленные элементы коллекции.
    * @param oldItemsIndex Индекс, в котором удалены элементы.
    * @protected
    */
   protected _onCollectionChange(
      event: EventObject,
      action: string,
      newItems: any[],
      newItemsIndex: number,
      oldItems: any[],
      oldItemsIndex: number
   ): void {
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

   // endregion
}

Object.assign(IndexedEnumeratorMixin.prototype, {
   '[Types/_collection/IndexedEnumeratorMixin]': true,
   _enumeratorIndexes: null
});
