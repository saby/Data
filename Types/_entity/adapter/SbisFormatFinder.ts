import {IRecordFormat, ITableFormat} from 'SbisFormatMixin';
import {logger} from '../../util';

//TODO Использовать только после полного перехода на стандарт es6.
/**
 * Функция генератор. Ищит в данных формат по индефикатору.
 * @param {Number} id - индефикатор формата.
 * @param {IRecordFormat | ITableFormat} data - сырые данные.
 * @param {Map <number, any>} storage - хранилище найденных форматов.
 */
/*
function* getFormatFromRawData(id: number, data: IRecordFormat | ITableFormat, storage: Map <number, any>) {
   if (data instanceof Array) {
      for (const element of data) {
         id = yield* getFormatFromRawData(id, element, storage);
      }
   } else if (typeof data === 'object') {
      if (data.f !== undefined && data.s) {
         storage.set(data.f, data.s);

         if (data.f === id) {
            id = yield data.s;
         }
      }

      if (data.d) {
         id = yield* data.d;
      }
   }

   return id;
}
*/

class RecursiveStack {

   protected _stack: Map<number, any>;

   public processableId: number;

   protected _current: any;

   constructor() {
      this._stack = new Map();
      this.processableId = -1;
   }

   get currentNode() {
      return this._current || undefined;
   }

   public push(node) {
      this._current = node;
      this.processableId++;
      this._stack.set(this.processableId, this._current);
   }

   public pop() {
      this.processableId--;
      this._current = this._stack.get(this.processableId);
      this._stack.delete(this.processableId + 1);
   }
}

class RecursiveIterator {
   protected stackNodes: RecursiveStack;

   constructor(data: IRecordFormat | ITableFormat) {
      this.stackNodes = new RecursiveStack();
      this.stackNodes.push({
         data: data
      });
   }

   public next(id: number, storage: Map<number, any>) {
      while (true) {
         if (this.stackNodes.processableId < 0) {
            return {value: undefined, done: true};
         }

         let result = this._process(id, storage);

         if (result) {
            return {value: result, done: false};
         }
      }
   }

   protected _process(id: number, storage: Map<number, any>) {
      const node = this.stackNodes.currentNode;

      if (node.data instanceof Array) {
         if (!node.iterator) {
            node.iterator = node.data[Symbol.iterator]();
         }

         while(true) {
            const item = node.iterator.next();

            if (item.done) {
               break;
            }

            if (item.value instanceof Object) {
               this.stackNodes.push({
                  data: item.value
               });

               const result = this._process(id, storage);

               if (result) {
                  return result;
               }
            }
         }

         this.stackNodes.pop();

         return undefined;
      } else if (node.data instanceof Object && !node.completed) {

         if (node.data.f !== undefined && node.data.s && !storage.has(node.data.f)) {
            storage.set(node.data.f, node.data.s);

            if (node.data.f === id) {
               return node.data.s;
            }
         }

         let result;

         if (node.data.d) {
            this.stackNodes.push( {
               data: node.data.d
            });

            node.completed = true;
            result = this._process(id, storage);
         }

         if (result) {
            return result;
         }

         this.stackNodes.pop();
         node.completed = true;

         return undefined;
      }

      this.stackNodes.pop();
      return undefined;
   }
}

class SbisFormatFinder {
   /**
    * Кеш, хранит ранее найденные форматы.
    */
   protected _cache: Map<number, any>;

   /**
    * Сырые данные.
    */
   protected _data: IRecordFormat | ITableFormat;

   /**
    * Функция генератор для поиска формат в данных.
    */
   protected _generator: RecursiveIterator;

   /**
    *
    * @param {IRecordFormat | ITableFormat} data - Сырые данные, представлены в формате JSON объекта.
    */
   constructor(data: IRecordFormat | ITableFormat) {
      this._cache = new Map();
      this._data = data;
   }

   /**
    * Возврашает формат по индефикатору.
    * @param {Number} id - индефикатор формата.
    */
   public getFormat(id?: number) {
      if (this._cache.has(id)) {
         return this._cache.get(id);
      }

      if (!this._generator) {
         this._generator = new RecursiveIterator( this._data);
      }

      const result = this._generator.next(id, this._cache);

      if (result.done) {
         throw new ReferenceError(`Couldn't find format by id`);
      }

      return result.value;
   }
}

export default SbisFormatFinder;
