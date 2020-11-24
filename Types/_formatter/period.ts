import dateFormat from './date';

/**
 * Тип периода
 */
export enum Type {
    /**
     * Автоматически определить подходящий тип
     */
    Auto,

    /**
     * В циыры
     */
    Digital,

    /**
     * В виде дат в полном формате
     */
    FullDate,

    /**
     * В виде дат в коротком формате
     */
    ShortDate,

    /**
     * В виде месяцев в полном формате
     */
    FullMonth,

    /**
     * В виде месяцев в коротком формате
     */
    ShortMonth,

    /**
     * В виде кварталов в полном формате
     */
    FullQuarter,

    /**
     * В виде кварталов в коротком формате
     */
    ShortQuarter,

    /**
     * В виде полугодий в полном формате
     */
    FullHalfYear,

    /**
     * В виде дат полугодий в коротком формате
     */
    ShortHalfYear,

    /**
     * В виде дат в годовом формате
     */
    Year
}

const SEPARATOR = '-';

function generalPeriod(start: Date, finish: Date, format: string): string {
    const startLabel = dateFormat(start, format);
    const finishLabel = dateFormat(finish, format);
    if (startLabel === finishLabel) {
        return startLabel;
    } else {
        return `${startLabel}${SEPARATOR}${finishLabel}`;
    }
}

function digitalPeriod(start: Date, finish: Date): string {
    const format = dateFormat.FULL_DATE;
    return `${dateFormat(start, format)}${SEPARATOR}${dateFormat(finish, format)}`;
}

function datesPeriod(start: Date, finish: Date, type: Type): string {
    const format = type === Type.FullDate ? dateFormat.FULL_DATE_FULL_MONTH : dateFormat.FULL_DATE_SHORT_MONTH;
    const onlyMonthFormat = type === Type.FullDate
        ? dateFormat.FULL_DATE_FULL_MONTH
        : dateFormat.SHORT_DATE_SHORT_MONTH;
    const onlyDateFormat = type === Type.FullDate ? dateFormat.FULL_DATE_FULL_MONTH : 'DD';

    const startDate = start.getDate();
    const startMonth = start.getMonth();
    const startYear = start.getFullYear();
    const finishDate = finish.getDate();
    const finishMonth = finish.getMonth();
    const finishYear = finish.getFullYear();
    if (startYear === finishYear) {
        // The same year
        if (startMonth === finishMonth) {
            // The same month
            if (startDate === finishDate) {
                // The same date
                return dateFormat(start, format);
            }
            return `${dateFormat(start, onlyDateFormat)}${SEPARATOR}${dateFormat(finish, format)}`;
        }
        return `${dateFormat(start, onlyMonthFormat)}${SEPARATOR}${dateFormat(finish, format)}`;
    }
    return `${dateFormat(start, format)}${SEPARATOR}${dateFormat(finish, format)}`;
}

function monthsPeriod(start: Date, finish: Date, type: Type): string {
    const format = type === Type.FullMonth ? dateFormat.FULL_MONTH : dateFormat.SHORT_MONTH;
    const onlyMonthFormat = type === Type.FullMonth ? 'MMMM' : 'MMM';

    const startMonth = start.getMonth();
    const startYear = start.getFullYear();
    const finishMonth = finish.getMonth();
    const finishYear = finish.getFullYear();
    if (startYear === finishYear) {
        if (startMonth === finishMonth) {
            return dateFormat(start, format);
        }
        return `${dateFormat(start, onlyMonthFormat)}${SEPARATOR}${dateFormat(finish, format)}`;
    }
    return `${dateFormat(start, format)}${SEPARATOR}${dateFormat(finish, format)}`;
}

function quartersPeriod(start: Date, finish: Date, type: Type): string {
    return generalPeriod(
        start,
        finish,
        type === Type.FullQuarter ? dateFormat.FULL_QUATER : dateFormat.SHORT_QUATER
    );
}

function halvesYearsPeriod(start: Date, finish: Date, type: Type): string {
    return generalPeriod(
        start,
        finish,
        type === Type.FullHalfYear ? dateFormat.FULL_HALF_YEAR : dateFormat.SHORT_HALF_YEAR
    );
}

function yearsPeriod(start: Date, finish: Date): string {
    return generalPeriod(start, finish, 'YYYY');
}

/**
 * Преобразует временной период в строку указанного формата {@link http://axure.tensor.ru/standarts/v7/форматы_дат_и_времени_01_2.html по стандарту}.
 * @example
 * Выведем период в формате короткой даты:
 * <pre>
 *     import {period, periodType} from 'Types/formatter';
 *     const start = new Date(2018, 4, 7);
 *     const finish = new Date(2019, 11, 3);
 *     console.log(period(start, finish, periodType.ShortDate)); // 7 май'18-3 дек'19
 * </pre>
 * @param start Дата начала периода.
 * @param finish Дата окончания периода.
 * @param type Тип периода.
 * @returns Период в в текстовом виде.
 * @public
 * @author Мальцев А.А.
 */
export default function period(start: Date, finish: Date, type: Type = Type.Auto): string {
    // Check arguments
    if (!(start instanceof Date)) {
        throw new TypeError('Argument "start" should be an instance of Date');
    }
    if (!(finish instanceof Date)) {
        throw new TypeError('Argument "finish" should be an instance of Date');
    }

    // Auto detection
    if (type === Type.Auto) {
        throw new TypeError('Automatic period format is under construction');
    }

    // Digital period
    if (type === Type.Digital) {
        return digitalPeriod(start, finish);
    }

    // Dates period
    if (type === Type.FullDate || type === Type.ShortDate) {
        return datesPeriod(start, finish, type);
    }

    // Months period
    if (type === Type.FullMonth || type === Type.ShortMonth) {
        return monthsPeriod(start, finish, type);
    }

    // Quarters period
    if (type === Type.FullQuarter || type === Type.ShortQuarter) {
        return quartersPeriod(start, finish, type);
    }

    // Halves a year period
    if (type === Type.FullHalfYear || type === Type.ShortHalfYear) {
        return halvesYearsPeriod(start, finish, type);
    }

    // Years period
    return yearsPeriod(start, finish);
}
