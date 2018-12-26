///<amd-module name="Types/_entity/date/toSql" />
import {date as dateFormatter} from '../../formatter';
/**
 * @public
 * @author Мальцев А.А.
 */

/**
 * @typedef {String} SerializeMode
 * @variant MODE_DATETIME Дата в время
 * @variant MODE_DATE Дата
 * @variant MODE_TIME Время
 */

const MODE = {
   'TIME': 'time',
   'DATE': 'date',
   'DATETIME': 'datetime'
}

const modeFormat = {
   'time': 'HH:mm:ss',
   'date': 'YYYY-MM-DD',
   'datetime': 'YYYY-MM-DD HH:mm:ss'
};

var UNIX_EPOCH_START = new Date(0);
/**
 * Приводит объект Date() к строке, содержащей дату в формате SQL.
 * @function
 * @name Types/_entity/date/toSql
 * @param {Date} date Дата
 * @param {SerializeMode} [mode=MODE_DATETIME] Режим сериализации.
 * @return {String}
 */
function getTimeZone(date:Date):string {
   var tz = -date.getTimezoneOffset() / 60,
      isNegative = tz < 0;
   if (isNegative) {
      tz = -tz;
   }
   return (isNegative ? '-' : '+') + (tz < 10 ? '0' : '') + tz;
};

export default function toSQL(date: Date, mode: string = 'datetime') {
   let result = dateFormatter(date, modeFormat[mode]);
   if (mode !== MODE.DATE && date > UNIX_EPOCH_START) {
      if (date.getMilliseconds() > 0) {
         result += `.${date.getMilliseconds()}`
      }
      result += getTimeZone(date);
   }
   return result;
};

export {MODE};
