import {IFieldFormat, IRecordFormat, ITableFormat} from 'SbisFormatMixin';
import {Map} from '../../shim';

interface IResultGenerator {
    value: undefined | IFieldFormat[];
    done: boolean;
}

interface IIteratorResult {
    value: undefined | unknown;
    done: boolean;
}

class IteratorArray {
    currentIndex: number = -1;
    _data: unknown[];

    constructor(data) {
        this._data = data;
    }

    next(): IIteratorResult {
        this.currentIndex += 1;

        if (this.isDone()) {
            return {
                value: undefined,
                done: true
            };
        } else {
            return {
                value: this._data[this.currentIndex],
                done: false
            };
        }
    }

    protected isDone(): boolean {
        return this.currentIndex === this._data.length;
    }
}

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

/**
 * Класс рекусвиного стека. Хранит стек обрабатываемых узлов дерева.
 */
class RecursiveStack {

    /**
     * Стек узлов
     */
   protected _stack: Map<number, IFieldFormat[]>;

    /**
     * Индефикатор обрабатываемага узла.
     */
   processableId: number;

    /**
     * Последний узел стека.
     */
   protected _current: any;

   constructor() {
      this._stack = new Map();
      this.processableId = -1;
   }

    /**
     * Возврашет последний узел из стека.
     */
   get currentNode(): any {
      return this._current || undefined;
   }

    /**
     * Добавляет узел в стек.
     * @param {any} node - Добавляемый узел.
     */
   push(node: any): void {
      this._current = node;
      this.processableId++;
      this._stack.set(this.processableId, this._current);
   }

    /**
     * Удаляет последний узел из стека.
     */
   pop(): void {
      this.processableId--;
      this._current = this._stack.get(this.processableId);
      this._stack.delete(this.processableId + 1);
   }
}

/**
 * Класс рекурсивного итератора по форматам.
 */
class RecursiveIterator {

    /**
     * Инстансе рекусривного стека.
     */
   protected stackNodes: RecursiveStack;

   constructor(data: IRecordFormat | ITableFormat) {
      this.stackNodes = new RecursiveStack();

      //Сразу же добавляем в стек корень дерева.
      this.stackNodes.push({
         data
      });
   }

    /**
     * Делает итерацию до искомого формата.
     * @param {Number} id - индефикатор искомого формата.
     * @param {Map} storage - кеш форматов.
     */
   next(storage: Map<number, IFieldFormat[]>, id?: number): IResultGenerator {
      while (true) {
         if (this.stackNodes.processableId < 0) {
             // id обрабтываемого узла меньше 0, значит дерево обработано.
            return {value: undefined, done: true};
         }

         const result = this._process(storage, id);

         if (result) {
            return {value: result, done: false};
         }
      }
   }

    /**
     * Обработчик узла.
     * @param {Number} id - индефикатор искомого формата.
     * @param {Map} storage - кеш форматов.
     */
   protected _process(storage: Map<number, IFieldFormat[]>, id?: number): IFieldFormat[] {
       //Получаем из стека послдений узел, чтобы обработь его.
      const node = this.stackNodes.currentNode;

      if (node.data instanceof Array) {
         if (!node.iterator) {
             node.iterator = this.getIterator(node.data);
         }

         while (true) {
            const item = node.iterator.next();

            if (item.done) {
               break;
            }

            //Оптимизация, в массивах нас интересуют только объекты.
            if (item.value instanceof Object) {
               this.stackNodes.push({
                  data: item.value
               });

               const result = this._process(storage, id);

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

         //Если в record есть данные их надо обработать.
         if (node.data.d) {
            this.stackNodes.push( {
               data: node.data.d
            });

            node.completed = true;
            result = this._process(storage, id);
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

   protected getIterator(data) {
       return RecursiveIterator.doesEnvSupportIterator() ? data[Symbol.iterator]() : new IteratorArray(data);
   }

   static doesEnvSupportIterator(): boolean {
       return typeof Symbol !== 'undefined' && Symbol.iterator !== undefined;
   }

}

/**
 * Класс поиска форматов в сырых данных. С хранением в кеше раннее найденных форматов.
 */
class SbisFormatFinder {
   /**
    * Кеш, хранит ранее найденные форматы.
    */
   protected _cache: Map<number, IFieldFormat[]>;

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
   constructor(data?: IRecordFormat | ITableFormat) {
      this._cache = new Map();
      this._data = data;
   }

   /**
    * Возврашает формат по индефикатору.
    * @param {Number} id - индефикатор формата.
    */
   getFormat(id?: number): IFieldFormat[] {
      if (this._cache.has(id)) {
         return this._cache.get(id);
      }

      if (!this._generator) {
         this._generator = new RecursiveIterator(this._data);
      }

      const result = this._generator.next(this._cache, id);

      if (result.done) {
         throw new ReferenceError("Couldn't find format by id");
      }

      return result.value;
   }

    scanFormats(data) {
        if (typeof data === 'object') {
            const generator = new RecursiveIterator(data);

            generator.next(this._cache);
        }
    }

    recoverData(data) {
        if (Array.isArray(data)) {
            for (const item of data) {
                this.recoverData(item);
            }
        } else if (data && typeof data === 'object') {
            const record = (data as IRecordFormat);

            if (record.f !== undefined) {
                const format = this.getFormat(record.f);

                if (!record.s || Object.getOwnPropertyDescriptor(data, 's').enumerable === false) {
                    record.s = format;
                }

                delete record.f;
            }

            if (record.d) {
                this.recoverData(record.d);
            }
        }

        return data;
    }
}

export {RecursiveIterator};
export default SbisFormatFinder;
