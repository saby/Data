import dateDifference, { Units } from "./dateDifference";

const MONTH_IN_YEAR = 11;

/**
 * Рассчитывает количество интервалов между датами, включая граничные значения.
 * @remark
 * <h2>Параметры функции</h2>
 * <ul>
 *      <li><b>dateA</b> {Date} Первая дата.</li>
 *      <li><b>dateB</b> {Date} Вторая дата.</li>
 *      <li><b>[units]</b> {String} Единица расчета.</li>
 * </ul>
 * <h2>Возвращает</h2>
 * {number} Количество интервалов между датами.
 *
 * <h2>Доступные единицы расчета.</h2>
 * <ul>
 *     <li>Year: год;</li>
 *     <li>Month: месяц;</li>
 *     <li>Day: день;</li>
 * </ul>
 *
 * <h2>Примеры использования.</h2>
 *
 * Выведем Количество полных месяцев между датами:
 * <pre>
 *     import {dateInterval} from 'Types/entity';
 *     const dateA = new Date(2019, 11, 01);
 *     const dateB = new Date(2019, 11, 30);
 *     console.log(compare.dateInterval(dateA, dateB, compare.DateUnits.Month)); // 1
 * </pre>
 *
 * @class
 * @name Types/_entity/compare/dateInterval
 * @public
 * @author Мальцев А.А.
 */

export default function dateInterval(begin: Date, end: Date, unit: Units): number {
    const diff = dateDifference(begin, end, unit);

    switch ( unit ) {
        case Units.Day:
            return (diff + 1);

        case Units.Month:
            return isFullMonth(begin, end) ? (diff + 1) : diff;

        case Units.Year:
            return isFullYear(begin, end) ? (diff + 1) : diff;

        default:
            throw Error(`unit "${unit}" does not supported`);
    }
}

function isFullMonth(begin: Date, end: Date): boolean {
    const lastDay = (new Date(end.getFullYear(), end.getMonth() + 1, 0)).getDate();
    return begin.getDate() === 1 && end.getDate() === lastDay
}

function isFullYear(begin: Date, end: Date): boolean {
    return isFullMonth(begin, end) && begin.getMonth() === 0 && end.getMonth() === MONTH_IN_YEAR;
}
