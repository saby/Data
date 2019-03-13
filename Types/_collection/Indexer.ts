/**
 * Индексатор коллекции
 * @class Types/_collection/Indexer
 * @public
 * @author Мальцев А.А.
 */

/**
 * Ищет позицию вставки значения в массив методом деления пополам.
 * @param {Array} items Массив, значения котрого отсортированы по возрастанию.
 * @param {Number} value Вставляемое значение
 * @return {Number}
 */
function getPosition(items: any[], value: number): number {
   const count = items.length;
   let distance = count;
   let position = Math.floor(distance / 2);
   let having;
   while (distance > 0 && position < count) {
      having = items[position];
      distance = Math.floor(distance / 2);
      if (having > value) {
         position -= distance;
      } else {
         position += Math.max(distance, 1);
      }
   }

   return position;
}

export default class Indexer<T> /** @lends Types/_collection/Indexer.prototype */{
   /**
    * @property {Object} Коллекция
    */
   _collection: T;

   /**
    * @property {Function} Метод, возвращающий кол-во элементов коллекции
    */
   _count: (items: T) => number;

   /**
    * @property {Function} Метод, возвращающий элемент коллекции по индексу
    */
   _at: (items: T, index: number) => any;

   /**
    * @property {Function} Метод, возвращающий значение свойства элемента коллекции
    */
   _prop: (item: any, prop: string) => any;

   /**
    * @property {Object.<Object>} Индексы, распределенные по полям
    */
   _indices: Object;

   /**
    * Конструктор
    * @param {Object} collection Коллекция
    * @param {Function: Number} count Метод, возвращающий кол-во элементов коллекции
    * @param {Function: Object} at Метод, возвращающий элемент коллекции по индексу
    * @param {Function} prop Метод, возвращающий значение свойства элемента коллекции
    */
   constructor(
      collection: T,
      count: (items: T) => number,
      at: (items: T, index: number) => any,
      prop: (item: any, prop: string) => any
   ) {
      this._collection = collection;
      this._count = count;
      this._at = at;
      this._prop = prop;
      this.resetIndex();
   }

   // region Public methods

   /**
    * Возвращает индекс первого элемента с указанным значением свойства. Если такого элемента нет - вернет -1.
    * @param {String} property Название свойства элемента.
    * @param {*} value Значение свойства элемента.
    * @return {Number}
    */
   getIndexByValue(property: string, value: any): number {
      const indices = this.getIndicesByValue(property, value);
      return indices.length ? indices[0] : -1;
   }

   /**
    * Возвращает индексы всех элементов с указанным значением свойства.
    * @param {String} property Название свойства элемента.
    * @param {*} value Значение свойства элемента.
    * @return {Array.<Number>}
    */
   getIndicesByValue(property: string, value: any): number[] {
      const index = this._getIndex(property);
      if (index) {
         if (index[value]) {
            return index[value].slice();
         }
         value = '[' + (Array.isArray(value) ? value.join(',') : value) + ']';
         if (index[value]) {
            return index[value].slice();
         }
      }
      return [];
   }

   /**
    * Сбрасывает индекс
    */
   resetIndex(): void {
      this._indices = null;
   }

   /**
    * Обновляет индекс элементов
    * @param {Number} start С какой позиции
    * @param {Number} count Число обновляемых элементов
    */
   updateIndex(start: number, count: number): void {
      const indices = this._indices;

      if (!indices) {
         return;
      }

      // tslint:disable-next-line:forin
      for (const property in indices) {
         this._updateIndex(property, start, count);
      }
   }

   /**
    * Сдвигает индекс элементов
    * @param {Number} start С какой позиции
    * @param {Number} count Число сдвигаемых элементов
    * @param {Number} offset На сколько сдвинуть индексы
    */
   shiftIndex(start: number, count: number, offset: number): void {
      const finish = start + count;
      this._eachIndexItem((data) => {
         for (let i = 0; i < data.length; i++) {
            if (data[i] >= start && data[i] < finish) {
               data[i] += offset;
            }
         }
      });
   }

   /**
    * Удаляет элементы из индекса
    * @param {Number} start С какой позиции
    * @param {Number} count Число удаляемых элементов
    */
   removeFromIndex(start: number, count: number): void {
      this._eachIndexItem((data) => {
         for (let i = 0; i < count; i++) {
            const at = data.indexOf(start + i);
            if (at > -1) {
               data.splice(at, 1);
            }
         }
      });
   }

   // endregion

   // region Protected methods

   /**
    * Перебирает проиндексированные значения для всех свойств
    * @param {Function} callback Метод обратного вызова
    * @protected
    */
   protected _eachIndexItem(callback: Function): void {
      const indices = this._indices;
      if (!indices) {
         return;
      }

      let values;
      // tslint:disable-next-line:forin
      for (const property in indices) {
         values = indices[property];
         // tslint:disable-next-line:forin
         for (const value in values) {
            callback(values[value], value, property);
         }
      }
   }

   /**
    * Возвращает индекс для указанного свойства.
    * @param {String} property Название свойства.
    * @return {Array}
    * @protected
    */
   protected _getIndex(property: string): any[] {
      if (!property) {
         return undefined;
      }
      if (!this._hasIndex(property)) {
         this._createIndex(property);
      }
      return this._indices[property];
   }

   /**
    * Проверяет наличие индекса для указанного свойства.
    * @param {String} [property] Название свойства.
    * @return {Boolean}
    * @protected
    */
   protected _hasIndex(property: string): boolean {
      return property && this._indices ? property in this._indices : false;
   }

   /**
    * Удаляет индекс для указанного свойства.
    * @param {String} property Название свойства.
    * @protected
    */
   protected _deleteIndex(property: string): void {
      delete this._indices[property];
   }

   /**
    * Создает индекс для указанного свойства.
    * @param {String} property Название свойства.
    * @protected
    */
   protected _createIndex(property: string): void {
      if (!property) {
         return;
      }
      if (!this._indices) {
         this._indices = Object.create(null);
      }
      this._indices[property] = Object.create(null);

      this._updateIndex(property, 0, this._count(this._collection));
   }

   /**
    * Обновляет индекс указанного свойства
    * @param {String} property Название свойства.
    * @param {Number} start С какой позиции
    * @param {Number} count Число элементов
    * @protected
    */
   protected _updateIndex(property: string, start: number, count: number): void {
      const index = this._indices[property];
      if (!index) {
         return;
      }

      let item;
      let value;
      let positions;
      for (let i = start; i < start + count; i++) {
         item = this._at(this._collection, i);
         value = this._prop(item, property);
         if (value instanceof Array) {
            value = '[' + value.join(',') + ']';
         }
         if (!(value in index)) {
            index[value] = [];
         }
         positions = index[value];
         positions.splice(
            getPosition(positions, i),
            0,
            i
         );
      }
   }

   // region
}

Indexer.prototype['[Types/_collection/Indexer]'] = true;
Indexer.prototype._collection = null;
Indexer.prototype._count = null;
Indexer.prototype._at = null;
Indexer.prototype._prop = null;
Indexer.prototype._indices = null;
