///<amd-module name="Types/_entity/TimeInterval" />
/**
 * Реализация объекта "Временной интервал".
 *
 * "Временной интервал" предназначен для хранения относительного временного промежутка, т.е. начало и окончание которого
 * не привязано к конкретным точкам во времени. Он может быть использован для хранения времени выполнения какого-либо
 * действия или для хранения времени до наступления события. При установке значения переменной данного типа, сохраняется
 * только дельта. При этом нужно учитывать, что интервал нормализует значения. В результате, интервал в 1 день, 777 часов,
 * 30 минут будет преобразован в интервал равный 33-м дням, 9 часам, 30 минутам, и будет сохранён именно в таком формате.
 * Формат ISO 8601 урезан до дней. Причина в том, что в случае использования месяцев и лет возникает неоднозначность. В итоге,
 * строковой формат выглядит так:
 * P[<Число_недель>W][<Число_дней>D][T[<Число_часов>H][<Число_минут>M][<Число_секунд>[.Число_долей_секунды]S]
 *
 * @class Types/_entity/TimeInterval
 * @public
 * @author Бегунов А.В.
 */

const millisecondsInSecond = 1000;
const millisecondsInMinute = 60000;
const millisecondsInHour = 3600000;
const millisecondsInDay = 86400000;
const secondsInMinute = 60;
const minutesInHour = 60;
const hoursInDay = 24;
const intervalKeys = ['days', 'hours', 'minutes', 'seconds', 'milliseconds'];
const millisecondsConst = {
   days: millisecondsInDay,
   hours: millisecondsInHour,
   minutes: millisecondsInMinute,
   seconds: millisecondsInSecond,
   milliseconds: 1
};
const regExesForParsing = {
   regExp: /^P(?:(-?[0-9]+)D)?(?:T(?:(-?[0-9]+)H)?(?:(-?[0-9]+)M)?(?:(-?[0-9]+(?:\.[0-9]{0,3})?)[0-9]*S)?)?$/i,
   format: 'P[<Число_дней>D][T[<Число_часов>H][<Число_минут>M][<Число_секунд>[.Число_долей_секунды]S]'
};
const regExesForValidation = {
   regExp: /^P(-?[0-9]+D)?(T(-?[0-9]+H)?(-?[0-9]+M)?(-?[0-9]+(\.[0-9]+)?S)?)?$/i,
   format: 'P[<Число_дней>D][T[<Число_часов>H][<Число_минут>M][<Число_секунд>[.Число_долей_секунды]S]'
};

interface IntervalObject {
   days: number;
   hours: number;
   minutes: number;
   seconds: number;
   milliseconds: number;
};

function toNumber(number: string): number {
   return parseFloat(number) || 0;
}

function truncate(number: number): number {
   return number > 0
      ? Math.floor(number)
      : Math.ceil(number);
}


function fromIntervalStrToIntervalArray(intervalStr: string): Array<string|number> {
   let intervalArray = [];
   let regexResult = regExesForParsing.regExp.exec(intervalStr);
   if (!isValidStrInterval(intervalStr)) {
      throw new Error(rk('Передаваемый аргумент не соответствует формату ISO 8601. Допустимые форматы') + ': ' + regExesForValidation.format + '. ');
   }

   // i = 1 - исключаем первый элемент из перебора, так как это всего лишь строка intervalStr
   regexResult.slice(1).forEach(function (value, i) {
      if (i === (regexResult.length - 1)) {
         // секунды
         intervalArray.push(truncate(Number(value)));
         // миллисекунды
         intervalArray.push(((Number(value) % 1) * 1000).toFixed());
      } else {
         intervalArray.push(toNumber(value));
      }
   });

   return intervalArray;
}

function fromIntervalArrayToIntervalObj(intervalArray: Array<string|number>): IntervalObject {
   let intervalObj = {};

   for (let i = 0; i < intervalKeys.length; i++) {
      intervalObj[intervalKeys[i]] = toNumber(String(intervalArray[i]));
   }

   return <IntervalObject>intervalObj;
}

function fromIntervalObjToMilliseconds(intervalObj: IntervalObject): number {
   let milliseconds = 0;
   for (let key in millisecondsConst) {
      if (millisecondsConst.hasOwnProperty(key)) {
         let val = millisecondsConst[key];
         milliseconds += val * toNumber(intervalObj[key]);
      }
   }
   return milliseconds;
}

function fromMillisecondsToNormIntervalObj(milliseconds: number): IntervalObject {
   let normIntervalObj = {};
   for (let key in millisecondsConst) {
      if (millisecondsConst.hasOwnProperty(key)) {
         let val = millisecondsConst[key];
         normIntervalObj[key] = truncate(milliseconds / val);
         milliseconds = milliseconds % val;
      }
   }
   return <IntervalObject>normIntervalObj;
}

// преобразует нормализованный объект в нормализованную строку: {days: 1, hours: 2, minutes: 3, seconds: 4, milliseconds: 5} => "P1DT2H3M4.005S"
function fromNormIntervalObjToNormIntervalStr(normIntervalObj: IntervalObject): string {
   let secondsWithMilliseconds = Number((normIntervalObj.seconds + normIntervalObj.milliseconds / 1000).toFixed(3));

   return 'P' + normIntervalObj.days + 'D' + 'T' + normIntervalObj.hours + 'H' + normIntervalObj.minutes + 'M' + secondsWithMilliseconds + 'S';
}

function isValidStrInterval(intervalStr: string): boolean {
   return regExesForValidation.regExp.test(intervalStr);
}

// вызывать с помощью call или apply


/**
 * @class
 * @name Types/_entity/TimeInterval
 * @public
 */
export default class TimeInterval {
   private _normIntervalObj: IntervalObject;
   private _normIntervalStr;

   /**
    * Конструктор.
    *
    * @param {Types/_entity/TimeInterval | String | Array | Object | Number} source - Может быть: строка - “P20DT3H1M5S”, массив - [5, 2, 3, -4], объект - {days: 1, minutes: 5}, число – 6 или объект типа Types/_entity/TimeInterval. Если передается массив, то первый элемент – дни, второй – часы, т.д. до миллисекунд. Остальные элементы игнорируются. Если передается число, то оно интерпретируется, как количество миллисекунд.
    * @return {Types/_entity/TimeInterval}
    */
   constructor(source?: TimeInterval | string | Array<string | number> | IntervalObject | number) {
      if (this instanceof TimeInterval) {
         this._normIntervalObj = undefined;
         this._normIntervalStr = undefined;

         this.set(source);
      } else {
         throw new Error(rk('TimeInterval вызывать через оператор new'));
      }
   }

   /**
    * Возвращает колличество дней в интервале.
    * @return {Number}
    * @function
    * @name Types/_entity/TimeInterval#getDays
    */
   getDays(): number {
      return this._normIntervalObj.days;
   }

   /**
    * Добавляет дни к интервалу.
    *
    * @param {Number} days - Колличество дней.
    * @return {Types/_entity/TimeInterval}
    * @function
    * @name Types/_entity/TimeInterval#addDays
    */
   addDays(days: number) {
      return this.addMilliseconds(days * millisecondsInDay);
   };

   /**
    * Вычитает дни из интервала.
    *
    * @param {Number} days - Колличество дней.
    * @return {Types/_entity/TimeInterval}
    * @function
    * @name Types/_entity/TimeInterval#subDays
    */
   subDays(days: number) {
      return this.subMilliseconds(days * millisecondsInDay);
   };

   /**
    * Возвращает колличество часов в интервале.
    *
    * @return {Number}
    * @function
    * @name Types/_entity/TimeInterval#getHours
    */
   getHours(): number {
      return this._normIntervalObj.hours;
   };

   /**
    * Добавляет часы к интервалу.
    *
    * @param {Number} hours - Колличество часов.
    * @return {Types/_entity/TimeInterval}
    * @function
    * @name Types/_entity/TimeInterval#addHours
    */
   addHours(hours: number) {
      return this.addMilliseconds(hours * millisecondsInHour);
   };

   /**
    * Вычитает часы из интервала.
    *
    * @param {Number} hours - Колличество часов.
    * @return {Types/_entity/TimeInterval}
    * @function
    * @name Types/_entity/TimeInterval#subHours
    */
   subHours(hours: number) {
      return this.subMilliseconds(hours * millisecondsInHour);
   };

   /**
    * Возвращает колличество минут в интервале.
    *
    * @return {Number}
    * @function
    * @name Types/_entity/TimeInterval#getMinutes
    */
   getMinutes(): number {
      return this._normIntervalObj.minutes;
   };

   /**
    * Добавляет минуты к интервалу.
    *
    * @param {Number} minutes - Колличество минут.
    * @return {Types/_entity/TimeInterval}
    * @function
    * @name Types/_entity/TimeInterval#addMinutes
    */
   addMinutes(minutes: number) {
      return this.addMilliseconds(minutes * millisecondsInMinute);
   };

   /**
    * Вычитает часы из интервала.
    *
    * @param {Number} hours - Колличество часов.
    * @return {Types/_entity/TimeInterval}
    * @function
    * @name Types/_entity/TimeInterval#subMinutes
    */
   subMinutes(minutes: number) {
      return this.subMilliseconds(minutes * millisecondsInMinute);
   };

   /**
    * Возвращает колличество секунд в интервале.
    *
    * @return {Number}
    * @function
    * @name Types/_entity/TimeInterval#getSeconds
    */
   getSeconds(): number {
      return this._normIntervalObj.seconds;
   };

   /**
    * Добавляет секунды к интервалу.
    *
    * @param {Number} seconds - Колличество секунд.
    * @return {Types/_entity/TimeInterval}
    * @function
    * @name Types/_entity/TimeInterval#addSeconds
    */
   addSeconds(seconds: number) {
      return this.addMilliseconds(seconds * millisecondsInSecond);
   };

   /**
    * Вычитает секунды из интервала.
    *
    * @param seconds {Number} Колличество секунд.
    * @return {Types/_entity/TimeInterval}
    * @function
    * @name Types/_entity/TimeInterval#subSeconds
    */
   subSeconds(seconds: number) {
      return this.subMilliseconds(seconds * millisecondsInSecond);
   };

   /**
    * Возвращает колличество миллисекунд в интервале.
    *
    * @return {Number}
    * @function
    * @name Types/_entity/TimeInterval#getMilliseconds
    */
   getMilliseconds(): number {
      return this._normIntervalObj.milliseconds;
   };

   /**
    * Добавляет миллисекунды к интервалу.
    *
    * @param {Number} milliseconds - Колличество миллисекунд.
    * @return {Types/_entity/TimeInterval}
    * @function
    * @name Types/_entity/TimeInterval#addMilliseconds
    */
   addMilliseconds(milliseconds: number) {
      return this.set(this.getTotalMilliseconds() + truncate(milliseconds));
   };

   /**
    * Вычитает миллисекунды из интервала.
    *
    * @param {Number} milliseconds - Колличество миллисекунд.
    * @return {Types/_entity/TimeInterval}
    * @function
    * @name Types/_entity/TimeInterval#subMilliseconds
    */
   subMilliseconds(milliseconds: number) {
      return this.set(this.getTotalMilliseconds() - truncate(milliseconds));
   };

   /**
    * Возвращает общее колличество часов в интервале, переводя дни в часы.
    *
    * @return {Number}
    * @function
    * @name Types/_entity/TimeInterval#getTotalHours
    */
   getTotalHours(): number {
      return this._normIntervalObj.days * hoursInDay + this._normIntervalObj.hours;
   };

   /**
    * Возвращает общее колличество минут в интервале, переводя дни и часы в минуты.
    *
    * @return {Number}
    * @function
    * @name Types/_entity/TimeInterval#getTotalMinutes
    */
   getTotalMinutes(): number {
      return this.getTotalHours() * minutesInHour + this._normIntervalObj.minutes;
   };

   /**
    * Возвращает общее колличество секунд в интервале, переводя дни, часы и минуты в секунды.
    *
    * @return {Number}
    * @function
    * @name Types/_entity/TimeInterval#getTotalSeconds
    */
   getTotalSeconds(): number {
      return this.getTotalMinutes() * secondsInMinute + this._normIntervalObj.seconds;
   };

   /**
    * Возвращает общее колличество миллисекунд в интервале, переводя дни, часы, минуты и секунды в миллисекунды.
    *
    * @return {Number}
    * @function
    * @name Types/_entity/TimeInterval#getTotalMilliseconds
    */
   getTotalMilliseconds(): number {
      return this.getTotalSeconds() * millisecondsInSecond + this._normIntervalObj.milliseconds;
   };

   /**
    * Устанавливает значение интервала.
    *
    * @param {Types/_entity/TimeInterval | String | Array | Object | Number} source - Может быть: строка - “P20DT3H1M5S”, массив - [5, 2, 3, -4], объект - {days: 1, minutes: 5}, число – 6 или объект типа Types/_entity/TimeInterval. Если передается массив, то первый элемент – дни, второй – часы, т.д. до миллисекунд. Остальные элементы игнорируются. Если передается число, то оно интерпретируется, как количество миллисекунд.
    * @return {Types/_entity/TimeInterval} Возвращает this.
    * @function
    * @name Types/_entity/TimeInterval#set
    */
   set(source:  TimeInterval| String | Array<number|string> | IntervalObject | Number): TimeInterval {
      let type;

      //source = coreClone(source);

      if (source instanceof TimeInterval) {
         type = 'timeInterval';
      } else if (typeof source === 'string') {
         type = 'intervalStr';
      } else if (source instanceof Array) {
         source = source.slice();
         type = 'intervalArray';
      } else if (source && typeof source === 'object') {
         source = Object.assign({}, source);
         type = 'intervalObj';
      } else {
         source = toNumber(<string>source);
         type = 'milliseconds';
      }

      switch (type) {
         case 'intervalStr':
            source = fromIntervalStrToIntervalArray(<string>source);
         // pass through
         case 'intervalArray':
            source = fromIntervalArrayToIntervalObj(<Array<number|string>>source);
         // pass through
         case 'intervalObj':
            source = fromIntervalObjToMilliseconds(<IntervalObject>source);
         // pass through
         case 'milliseconds':
            this._normIntervalObj = source = fromMillisecondsToNormIntervalObj(<number>source);
            this._normIntervalStr = fromNormIntervalObjToNormIntervalStr(source);
            break;
         case 'timeInterval':
            this.assign(<TimeInterval>source);
            break;
      }

      return this;
   };

   /**
    * Возвращает значение интервала в виде строки формата ISO 8601.
    *
    * @return {String} P[<Число_дней>D][T[<Число_часов>H][<Число_минут>M][<Число_секунд>[.Число_долей_секунды]S].
    *
    */
   toString(): string {
      return String(this._normIntervalStr);
   };

   valueOf(): string {
      return String(this._normIntervalStr);
   };

   /**
    * Возвращает значение интервала в виде объекта {days: 1, minutes: 2, seconds: 3, miliseconds: 4}.
    *
    * @return {Object}
    */
   toObject(): IntervalObject {
      return Object.assign({},this._normIntervalObj);
   };

   /**
    * Возвращает клон интервала.
    *
    * @return {Types/_entity/TimeInterval}
    */
   clone(): TimeInterval {
      return new TimeInterval(this);
   };

   /**
    * Возвращает результат операции над интервалом.
    *
    * @param {String} operation - Возможные значения: '==', '!=', '>=', '<=', '>', '<', '+', '-', '+=', '-='.
    * @param {Types/_entity/TimeInterval} operand
    * @return {Types/_entity/TimeInterval | Boolean} ['+=', '-='] - this, ['+', '-'] - новый TimeInterval-объект, ['==', '!=', '>=', '<=', '>', '<'] - true/false.
    */
   calc(operation: string, operand: TimeInterval) {
      var
         allowedOps = [
            '==',
            '!=',
            '>=',
            '<=',
            '>',
            '<',
            '+',
            '-',
            '+=',
            '-='
         ];

      if (allowedOps.indexOf(operation) === -1) {
         throw new Error(rk('Операция') + ' \"' + operation + '\" ' + rk('не доступна. Разрешенные операции') + ': ' + allowedOps.join(', '));
      }
      if (!(this instanceof TimeInterval && operand instanceof TimeInterval)) {
         throw new Error(rk('Operand должен быть объектом класса TimeInterval'));
      }

      var
         milliseconds1 = this.getTotalMilliseconds(),
         milliseconds2 = operand.getTotalMilliseconds();

      switch (operation) {
         case '==':
            return milliseconds1 === milliseconds2;
         case '!=':
            return milliseconds1 !== milliseconds2;
         case '>=':
            return milliseconds1 >= milliseconds2;
         case '<=':
            return milliseconds1 <= milliseconds2;
         case '>':
            return milliseconds1 > milliseconds2;
         case '<':
            return milliseconds1 < milliseconds2;
         case '+':
            return new TimeInterval().set(milliseconds1 + milliseconds2);
         case '-':
            return new TimeInterval().set(milliseconds1 - milliseconds2);
         case '+=':
            return this.set(milliseconds1 + milliseconds2);
         case '-=':
            return this.set(milliseconds1 - milliseconds2);
      }
   };

   /**
    * Прибавляет интервал к дате.
    *
    * @param {Date} date
    * @return {Date}
    */
   addToDate(date: Date): Date {
      return this._dateModifier(1, date);
   };

   /**
    * Вычитает интервал из даты.
    *
    * @param {Date} date
    * @return {Date}
    */
   subFromDate(date: Date): Date {
      return this._dateModifier(-1, date);
   };
   /**
    * Присваивает значение из временного интервала.
    * @param {TimeInterval} source
    */
   assign(source: TimeInterval) {
      this._normIntervalObj = source.toObject();
      this._normIntervalStr = source.valueOf();
   }

   private _dateModifier(sign: number, date: Date) {
      date = new Date(date.getTime());

      date.setTime(date.getTime() + sign * this.getTotalMilliseconds());

      return date;
   }

   /**
    * Возвращает строку формата ISO 8601.
    *
    * @param {Types/_entity/TimeInterval | String | Array | Object | Number} source - Может быть: строка - “P20DT3H1M5S”, массив - [5, 2, 3, -4], объект - {days: 1, minutes: 5}, число – 6 или объект типа Types/_entity/TimeInterval. Если передается массив, то первый элемент – дни, второй – часы, т.д. до миллисекунд. Остальные элементы игнорируются. Если передается число, то оно интерпретируется, как количество миллисекунд.
    * @return {String} P[<Число_дней>D][T[<Число_часов>H][<Число_минут>M][<Число_секунд>[.Число_долей_секунды]S].
    */
   static toString(source: TimeInterval | String | Array<string|number> | IntervalObject | Number) {
      if (source !== undefined) {
         return TimeInterval.prototype.set.call({}, source)._normIntervalStr;
      }

      return Function.toString.call(this);
   };
}

