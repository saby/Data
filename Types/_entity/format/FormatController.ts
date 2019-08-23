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

   constructor(data) {
      this._cache = new Map();
      this._data = data || {};
   }
}

export default FormatController;
