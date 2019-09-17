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

interface IIntervalObject {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    milliseconds: number;
}

function toNumber(value: string): number {
    return parseFloat(value) || 0;
}

function truncate(value: number): number {
    return value > 0
        ? Math.floor(value)
        : Math.ceil(value);
}

function fromIntervalStrToIntervalArray(intervalStr: string): Array<string|number> {
    const intervalArray = [];
    const regexResult = regExesForParsing.regExp.exec(intervalStr);
    if (!isValidStrInterval(intervalStr)) {
        throw new Error(
            `The argument does not correspond to the ISO 8601 format. Allowed formats: ${regExesForValidation.format}.`
        );
    }

    // i = 1 - exclude the first element because it's just a string intervalStr
    regexResult.slice(1).forEach((value, i) => {
        if (i === (regexResult.length - 1)) {
            // seconds
            intervalArray.push(truncate(Number(value)));
            // milliseconds
            intervalArray.push(((Number(value) % 1) * 1000).toFixed());
        } else {
            intervalArray.push(toNumber(value));
        }
    });

    return intervalArray;
}

function fromIntervalArrayToIntervalObj(intervalArray: Array<string|number>): IIntervalObject {
    const intervalObj = {};

    for (let i = 0; i < intervalKeys.length; i++) {
        intervalObj[intervalKeys[i]] = toNumber(String(intervalArray[i]));
    }

    return intervalObj as IIntervalObject;
}

function fromIntervalObjToMilliseconds(intervalObj: IIntervalObject): number {
    let milliseconds = 0;
    for (const key in millisecondsConst) {
        if (millisecondsConst.hasOwnProperty(key)) {
            const val = millisecondsConst[key];
            milliseconds += val * toNumber(intervalObj[key]);
        }
    }
    return milliseconds;
}

function fromMillisecondsToNormIntervalObj(milliseconds: number): IIntervalObject {
    const normIntervalObj = {};
    for (const key in millisecondsConst) {
        if (millisecondsConst.hasOwnProperty(key)) {
            const val = millisecondsConst[key];
            normIntervalObj[key] = truncate(milliseconds / val);
            milliseconds = milliseconds % val;
        }
    }
    return normIntervalObj as IIntervalObject;
}

// Converts a normalized object into a normalized string:
// {days: 1, hours: 2, minutes: 3, seconds: 4, milliseconds: 5} => "P1DT2H3M4.005S"
function fromNormIntervalObjToNormIntervalStr(normIntervalObj: IIntervalObject): string {
    const secondsWithMilliseconds = Number(
        (normIntervalObj.seconds + normIntervalObj.milliseconds / 1000).toFixed(3)
    );

    return `P${normIntervalObj.days}DT${normIntervalObj.hours}H${normIntervalObj.minutes}M${secondsWithMilliseconds}S`;
}

function isValidStrInterval(intervalStr: string): boolean {
    return regExesForValidation.regExp.test(intervalStr);
}

/**
 * Объект "Временной интервал".
 * @remark
 * "Временной интервал" предназначен для хранения относительного временного промежутка, т.е. начало и окончание которого не привязано к конкретным точкам во времени. Он может быть использован для хранения времени выполнения какого-либо действия или для хранения времени до наступления события.
 * При установке значения переменной данного типа, сохраняется только дельта. При этом нужно учитывать, что интервал нормализует значения. В результате, интервал в 1 день, 777 часов, 30 минут будет преобразован в интервал равный 33-м дням, 9 часам, 30 минутам, и будет сохранён именно в таком формате.
 * Формат ISO 8601 урезан до дней. Причина в том, что в случае использования месяцев и лет возникает неоднозначность.
 * В итоге, строковой формат выглядит так:
 * P[<Число_недель>W][<Число_дней>D][T[<Число_часов>H][<Число_минут>M][<Число_секунд>[.Число_долей_секунды]S]
 *
 * @class Types/_entity/TimeInterval
 * @public
 * @author Мальцев А.А.
 */
export default class TimeInterval {
    private _normIntervalObj: IIntervalObject;
    private _normIntervalStr: string;

    /**
     * Конструктор.
     * @param source Может быть:
     * строка - “P20DT3H1M5S”,
     * массив - [5, 2, 3, -4],
     * объект - {days: 1, minutes: 5},
     * число – 6 или объект типа Types/_entity/TimeInterval.
     * Если передается массив, то первый элемент – дни, второй – часы, т.д. до миллисекунд.
     * Остальные элементы игнорируются. Если передается число, то оно интерпретируется, как количество миллисекунд.
     */
    constructor(source?: TimeInterval | string | Array<string | number> | IIntervalObject | number) {
        if (this instanceof TimeInterval) {
            this._normIntervalObj = undefined;
            this._normIntervalStr = undefined;

            this.set(source);
        } else {
            throw new Error('TimeInterval call via operator new');
        }
    }

    /**
     * Возвращает строку формата ISO 8601.
     * P[<Число_дней>D][T[<Число_часов>H][<Число_минут>M][<Число_секунд>[.Число_долей_секунды]S]
     * @param source Может быть:
     * строка - “P20DT3H1M5S”,
     * массив - [5, 2, 3, -4],
     * объект - {days: 1, minutes: 5},
     * число – 6 или объект типа Types/_entity/TimeInterval.
     * Если передается массив, то первый элемент – дни, второй – часы, т.д. до миллисекунд.
     * Остальные элементы игнорируются. Если передается число, то оно интерпретируется, как количество миллисекунд.
     */
    static toString(source: TimeInterval | String | Array<string|number> | IIntervalObject | Number): string {
        if (source !== undefined) {
            return TimeInterval.prototype.set.call({}, source)._normIntervalStr;
        }

        return Function.toString.call(this);
    }

    /**
     * Возвращает колличество дней в интервале.
     */
    getDays(): number {
        return this._normIntervalObj.days;
    }

    /**
     * Добавляет дни к интервалу.
     *
     * @param days Количество дней.
     */
    addDays(days: number): this {
        return this.addMilliseconds(days * millisecondsInDay);
    }

    /**
     * Вычитает дни из интервала.
     * @param days Количество дней.
     */
    subDays(days: number): this {
        return this.subMilliseconds(days * millisecondsInDay);
    }

    /**
     * Возвращает колличество часов в интервале.
     */
    getHours(): number {
        return this._normIntervalObj.hours;
    }

    /**
     * Добавляет часы к интервалу.
     * @param hours Количество часов.
     */
    addHours(hours: number): this {
        return this.addMilliseconds(hours * millisecondsInHour);
    }

    /**
     * Вычитает часы из интервала.
     *
     * @param hours Количество часов.
     */
    subHours(hours: number): this {
        return this.subMilliseconds(hours * millisecondsInHour);
    }

    /**
     * Возвращает колличество минут в интервале.
     */
    getMinutes(): number {
        return this._normIntervalObj.minutes;
    }

    /**
     * Добавляет минуты к интервалу.
     *
     * @param minutes Количество минут.
     */
    addMinutes(minutes: number): this {
        return this.addMilliseconds(minutes * millisecondsInMinute);
    }

    /**
     * Вычитает часы из интервала.
     *
     * @param hours Количество часов.
     */
    subMinutes(minutes: number): this {
        return this.subMilliseconds(minutes * millisecondsInMinute);
    }

    /**
     * Возвращает колличество секунд в интервале.
     */
    getSeconds(): number {
        return this._normIntervalObj.seconds;
    }
    /**
     * Добавляет секунды к интервалу.
     * @param seconds Количество секунд.
     */
    addSeconds(seconds: number): this {
        return this.addMilliseconds(seconds * millisecondsInSecond);
    }

    /**
     * Вычитает секунды из интервала.
     *
     * @param seconds Количество секунд.
     */
    subSeconds(seconds: number): this {
        return this.subMilliseconds(seconds * millisecondsInSecond);
    }

    /**
     * Возвращает колличество миллисекунд в интервале.
     */
    getMilliseconds(): number {
        return this._normIntervalObj.milliseconds;
    }

    /**
     * Добавляет миллисекунды к интервалу.
     *
     * @param milliseconds Количество миллисекунд.
     */
    addMilliseconds(milliseconds: number): this {
        return this.set(this.getTotalMilliseconds() + truncate(milliseconds));
    }

    /**
     * Вычитает миллисекунды из интервала.
     *
     * @param milliseconds Количество миллисекунд.
     */
    subMilliseconds(milliseconds: number): this {
        return this.set(this.getTotalMilliseconds() - truncate(milliseconds));
    }

    /**
     * Возвращает общее колличество часов в интервале, переводя дни в часы.
     */
    getTotalHours(): number {
        return this._normIntervalObj.days * hoursInDay + this._normIntervalObj.hours;
    }

    /**
     * Возвращает общее колличество минут в интервале, переводя дни и часы в минуты.
     */
    getTotalMinutes(): number {
        return this.getTotalHours() * minutesInHour + this._normIntervalObj.minutes;
    }

    /**
     * Возвращает общее колличество секунд в интервале, переводя дни, часы и минуты в секунды.
     */
    getTotalSeconds(): number {
        return this.getTotalMinutes() * secondsInMinute + this._normIntervalObj.seconds;
    }

    /**
     * Возвращает общее колличество миллисекунд в интервале, переводя дни, часы, минуты и секунды в миллисекунды.
     */
    getTotalMilliseconds(): number {
        return this.getTotalSeconds() * millisecondsInSecond + this._normIntervalObj.milliseconds;
    }

    /**
     * Устанавливает значение интервала.
     *
     * @param source Может быть:
     * строка - “P20DT3H1M5S”,
     * массив - [5, 2, 3, -4],
     * объект - {days: 1, minutes: 5},
     * число – 6 или объект типа Types/_entity/TimeInterval.
     * Если передается массив, то первый элемент – дни, второй – часы, т.д. до миллисекунд.
     * Остальные элементы игнорируются. Если передается число, то оно интерпретируется, как количество миллисекунд.
     */
    set(source: TimeInterval| String | Array<number|string> | IIntervalObject | Number): this {
        let type;

        // source = coreClone(source);

        if (source instanceof TimeInterval) {
            type = 'timeInterval';
        } else if (typeof source === 'string') {
            type = 'intervalStr';
        } else if (source instanceof Array) {
            source = source.slice();
            type = 'intervalArray';
        } else if (source && typeof source === 'object') {
            source = {...source};
            type = 'intervalObj';
        } else {
            source = toNumber(source as string);
            type = 'milliseconds';
        }

        switch (type) {
            case 'intervalStr':
                source = fromIntervalStrToIntervalArray(source as string);
                // pass through
            case 'intervalArray':
                source = fromIntervalArrayToIntervalObj(source as Array<number|string>);
                // pass through
            case 'intervalObj':
                source = fromIntervalObjToMilliseconds(source as IIntervalObject);
                // pass through
            case 'milliseconds':
                this._normIntervalObj = source = fromMillisecondsToNormIntervalObj(source as number);
                this._normIntervalStr = fromNormIntervalObjToNormIntervalStr(source);
                break;
            case 'timeInterval':
                this.assign(source as TimeInterval);
                break;
        }

        return this;
    }

    /**
     * Возвращает значение интервала в виде строки формата ISO 8601.
     *
     * @return {String} P[<Число_дней>D][T[<Число_часов>H][<Число_минут>M][<Число_секунд>[.Число_долей_секунды]S].
     *
     */
    toString(): string {
        return String(this._normIntervalStr);
    }

    valueOf(): string {
        return String(this._normIntervalStr);
    }

    /**
     * Возвращает значение интервала в виде объекта {days: 1, minutes: 2, seconds: 3, miliseconds: 4}.
     *
     * @return {Object}
     */
    toObject(): IIntervalObject {
        return {...this._normIntervalObj};
    }

    /**
     * Возвращает клон интервала.
     *
     * @return {Types/_entity/TimeInterval}
     */
    clone(): TimeInterval {
        return new TimeInterval(this);
    }

    /**
     * Возвращает результат операции над интервалом.
     *
     * @param operation - Возможные значения: '==', '!=', '>=', '<=', '>', '<', '+', '-', '+=', '-='.
     * @param operand
     * @return новый TimeInterval-объект, ['==', '!=', '>=', '<=', '>', '<'] - true/false.
     */
    calc(operation: string, operand: TimeInterval): TimeInterval | boolean {
        const allowedOps = [
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
            throw new Error(`Operation "${operation}" is not available. Permitted operations: ${allowedOps.join(', ')}.`);
        }
        if (!(this instanceof TimeInterval && operand instanceof TimeInterval)) {
            throw new Error('Operand must be an instance of TimeInterval');
        }

        const milliseconds1 = this.getTotalMilliseconds();
        const milliseconds2 = operand.getTotalMilliseconds();

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
    }

    /**
     * Прибавляет интервал к дате.
     * @param date
     */
    addToDate(date: Date): Date {
        return this._dateModifier(1, date);
    }

    /**
     * Вычитает интервал из даты.
     *
     * @param date
     */
    subFromDate(date: Date): Date {
        return this._dateModifier(-1, date);
    }

    /**
     * Присваивает значение из временного интервала.
     * @param source
     */
    assign(source: TimeInterval): void {
        this._normIntervalObj = source.toObject();
        this._normIntervalStr = source.valueOf();
    }

    private _dateModifier(sign: number, date: Date): Date {
        const resultDate = new Date(date.getTime());

        resultDate.setTime(resultDate.getTime() + sign * this.getTotalMilliseconds());

        return resultDate;
    }
}
