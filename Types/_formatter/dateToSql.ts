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
   time: 'HH:mm:ss',
   date: 'YYYY-MM-DD',
   datetime: 'YYYY-MM-DD HH:mm:ss'
};

const MINUTES_IN_HOUR = 60;
const UNIX_EPOCH_START = new Date(0);

/**
 * Adds symbols to the left side of string until it reaches desired length
 */
function strPad(input: string | number, size: number, pattern: string): string {
   let output = String(input);

   if (pattern.length > 0) {
      while (output.length < size) {
         output = pattern + output;
      }
   }

   return output;
}

/**
 * Returns time zone offset in [+-]HH or [+-]HH:mm format
 */
function getTimeZone(date: Date): string {
   let totalMinutes = date.getTimezoneOffset();
   const isEast = totalMinutes <= 0;
   if (totalMinutes < 0) {
      totalMinutes = -totalMinutes;
   }
   let hours: number | string = Math.floor(totalMinutes / MINUTES_IN_HOUR);
   let minutes: number | string = totalMinutes - MINUTES_IN_HOUR * hours;
   const size = 2;

   hours = strPad(hours, size, '0');
   if (minutes === 0) {
      minutes = '';
   } else {
      minutes = strPad(minutes, size, '0');
   }

   return `${isEast ? '+' : '-'}${hours}${minutes ? ':' + minutes : ''}`;
}

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
   let result = dateFormatter(date, FORMAT[mode]);

   if (mode !== MODE.DATE && date > UNIX_EPOCH_START) {
      // Add milliseconds
      if (date.getMilliseconds() > 0) {
         result += `.${strPad(date.getMilliseconds(), 3, '0')}`;
      }

      // Add time zone offset
      result += getTimeZone(date);
   }

   return result;
}

export {MODE};
