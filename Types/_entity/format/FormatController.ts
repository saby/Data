import {IRecordFormat, ITableFormat} from '../adapter/SbisFormatMixin';
import {logger} from '../../util';

/**
 * Функция генератор. Ищит в данных формат по индефикатору.
 * @param {Number} id - индефикатор формата.
 * @param {IRecordFormat | ITableFormat} data - сырые данные.
 * @param {Map <number, any>} storage - хранилище найденных форматов.
 */
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


class FormatController {
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
   protected _generator: Iterator;

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
   public getFormat(id: number) {
      if (this._cache.has(id)) {
         return this._cache.get(id);
      }

      if (!this._generator) {
         this._generator = getFormatFromRawData(id, this._data, this._cache);
      }

      const result = this._generator.next(id);

      return result.done ? logger.error(`Could't find format by id`) : result.value;
   }
}

export default FormatController;
