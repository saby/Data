///<amd-module name="Types/_entity/date/toSql" />
/**
 * Serializes Date to the preferred SQL format.
 * @public
 * @author Мальцев А.А.
 */

/**
 * @typedef {String} SerializeMode
 * @variant MODE_DATETIME Дата в время
 * @variant MODE_DATE Дата
 * @variant MODE_TIME Время
 */

import {date as dateFormatter} from '../../formatter';

const MODE = {
   'TIME': 'time',
   'DATE': 'date',
   'DATETIME': 'datetime'
};

const FORMAT = {
   'time': 'HH:mm:ss',
   'date': 'YYYY-MM-DD',
   'datetime': 'YYYY-MM-DD HH:mm:ss'
};

const UNIX_EPOCH_START = new Date(0);

/**
 * Returns time zone offset in [+-]HH or [+-]HH:mm format
 */
function getTimeZone(date: Date): string {
   let totalMinutes = date.getTimezoneOffset();
   const isEast = totalMinutes <= 0;
   if (totalMinutes < 0) {
      totalMinutes = -totalMinutes;
   }
   let hours: number | string = Math.ceil(totalMinutes / 60);
   let minutes: number | string = totalMinutes - 60 * hours;

   if (hours < 10) {
      hours = '0' + hours;
   }
   if (minutes === 0) {
      minutes = '';
   } else if (minutes < 10) {
      minutes = '0' + minutes;
   }

   return `${isEast ? '+' : '-'}${hours}${minutes ? ':' + minutes : ''}`;
}

export default function toSQL(date: Date, mode: string = MODE.DATETIME) {
   let result = dateFormatter(date, FORMAT[mode]);

   if (mode !== MODE.DATE && date > UNIX_EPOCH_START) {
      //Add milliseconds
      if (date.getMilliseconds() > 0) {
         result += `.${date.getMilliseconds()}`
      }

      //Add time zone offset
      result += getTimeZone(date);
   }

   return result;
}

export {MODE};
