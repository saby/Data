/**
 * @typedef {String} SerializeMode
 * @variant MODE_DATETIME Дата в время
 * @variant MODE_DATE Дата
 * @variant MODE_TIME Время
 */

import dateFormatter from './date';
import {IHashMap} from '../_declarations';

type SerializationMode = 'time' | 'date' | 'datetime';

const MODE: IHashMap<SerializationMode> = {
    TIME: 'time',
    DATE: 'date',
    DATETIME: 'datetime'
};

const FORMAT = {
   time: 'HH:mm:ss${ms}Z',
   date: 'YYYY-MM-DD',
   datetime: 'YYYY-MM-DD HH:mm:ss${ms}Z',
};

/**
 * Serializes Date to the preferred SQL format.
 * @function
 * @name Types/_formatter/dateToSql
 * @param date Date to serialize
 * @param mode Serialization mode
 * @public
 * @author Мальцев А.А.
 */
export default function toSQL(date: Date, mode: SerializationMode = MODE.DATETIME): string {
   let format = FORMAT[mode];
   if (mode !== MODE.DATE) {
      let ms = date.getMilliseconds() > 0 ? '.SSS' : '';

      format = format.replace('${ms}', ms);
   }

   return dateFormatter(date, format);
}

export {MODE};
