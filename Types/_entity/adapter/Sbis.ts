import Abstract from './Abstract';
import {ITableFormat, IRecordFormat} from './SbisFormatMixin';
import FormatController from './../adapter/SbisFormatFinder';
import SbisTable from './SbisTable';
import SbisRecord from './SbisRecord';
import FIELD_TYPE from './SbisFieldType';
import {register} from '../../di';
import IFormatController from '../adapter/IFormatController';

/**
 * Адаптер для данных в формате СБиС.
 * Работает с форматом данных, который использует БЛ СБИС.
 * Примеры можно посмотреть в модулях {@link Types/_entity/adapter/SbisRecord} и
 * {@link Types/_entity/adapter/SbisTable}.
 * @class Types/_entity/adapter/Sbis
 * @extends Types/_entity/adapter/Abstract
 * @public
 * @author Мальцев А.А.
 */
export default class Sbis extends Abstract implements IFormatController {
   protected _formatController: FormatController;

   readonly '[Types/_entity/format/IFormatController]': boolean = true;

   forTable(data: ITableFormat): SbisTable {
      const table =  new SbisTable(data);
      table.setFormatController(this._formatController);

      return table;
   }

   forRecord(data: IRecordFormat): SbisRecord {
      const record = new SbisRecord(data);
      record.setFormatController(this._formatController);

      return record;
   }

   // region IFormatController

   setFormatController(controller: FormatController): void {
      this._formatController = controller;
   }

   // endregion

   getKeyField(data: ITableFormat): string {
      // TODO: primary key field index can be defined in this._data.k. and can be -1
      let index;
      let s;
      if (data && data.s) {
         s = data.s;
         for (let i = 0, l = s.length; i < l; i++) {
            if (s[i].n && s[i].n[0] === '@') {
               index = i;
               break;
            }
         }
         if (index === undefined && s.length) {
            index = 0;
         }
      }
      return index === undefined ? undefined : s[index].n;
   }

   static get FIELD_TYPE(): object {
      return FIELD_TYPE;
   }
}

Object.assign(Sbis.prototype, {
   '[Types/_entity/adapter/Sbis]': true,
   _moduleName: 'Types/entity:adapter.Sbis'
});

register('Types/entity:adapter.Sbis', Sbis, {instantiate: false});
// Deprecated
register('adapter.sbis', Sbis);
