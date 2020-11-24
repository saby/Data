import { Units } from './dateDifference';

const MONTH_IN_YEAR = 11;

/**
 * Проверяет, что между датами только полные интервалы.
 * @remark
 * <h2>Примеры использования.</h2>
 *
 * Проверим что между датами только полные месяця:
 * <pre>
 *     import {compare} from 'Types/entity';
 *     const dateA = new Date(2019, 11, 01);
 *     const dateB = new Date(2019, 11, 30);
 *     console.log(compare.isFullInterval(dateA, dateB, compare.DateUnits.Month)); // true
 *
 *     const dateA = new Date(2019, 10, 01);
 *     const dateB = new Date(2019, 11, 05);
 *     console.log(compare.isFullInterval(dateA, dateB, compare.DateUnits.Month)); // false
 * </pre>
 *
 * @param begin Дата начала интервала
 * @param end Дата окончания интервала
 * @param unit Единица измерения интервала
 * @returns Между датами только полные интервалы
 * @public
 * @author Кудрявцев И.С.
 */

export default function isFullInterval(begin: Date, end: Date, unit: Units): boolean {
    switch (unit) {
        case Units.Day:
            return isFullDay(begin, end);

        case Units.Month:
            return isFullMonth(begin, end);

        case Units.Year:
            return isFullYear(begin, end);

        default:
            throw Error(`unit "${unit}" does not supported`);
    }
}

function isFullDay(begin: Date, end: Date): boolean {
        return begin.getHours() === 0 && end.getHours() === 23 && begin.getMinutes() === 0 && end.getMinutes() === 59;
}

function isFullMonth(begin: Date, end: Date): boolean {
    const lastDay = (new Date(end.getFullYear(), end.getMonth() + 1, 0)).getDate();
    return begin.getDate() === 1 && end.getDate() === lastDay;
}

function isFullYear(begin: Date, end: Date): boolean {
    return isFullMonth(begin, end) && begin.getMonth() === 0 && end.getMonth() === MONTH_IN_YEAR;
}
