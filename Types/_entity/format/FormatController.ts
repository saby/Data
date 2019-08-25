import {IRecordFormat, ITableFormat} from '../adapter/SbisFormatMixin';

class FormatController {
   /**
    *
    */
   protected _cache: Map<number, any>;

   /**
    *
    */
   protected _data: IRecordFormat | ITableFormat;

   /**
    *
    * @param data
    */
   protected _generator: Iterator;

   constructor(data: IRecordFormat | ITableFormat) {
      this._cache = new Map();
      this._data = data;
   }


   public getFormat(id: number) {
      if (this._cache.has(id)) {
         return this._cache.get(id);
      }

      if (!this._generator) {
         this._generator = this._getFormatFromRawData(id, this._data);
      }

      const result = this._generator.next(id);

      return result.done ? result.value : console.error(`Could't find format by id`);
   }

   protected *_getFormatFromRawData(id: number, data: IRecordFormat | ITableFormat) {
      if (data instanceof Array) {
         for (const element of data) {
            id = yield* this._getFormatFromRawData(id, element);
         }
      } else if (typeof data === 'object') {
         if (data.f !== undefined && data.s) {
            this._cache.set(data.f, data.s);

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
}

export default FormatController;
