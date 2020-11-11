import dateDifference, { Units } from './dateDifference';
import isFullInterval from './isFullInterval';

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
 *     import {compare} from 'Types/entity';
 *     const dateA = new Date(2019, 11, 01);
 *     const dateB = new Date(2019, 11, 30);
 *     console.log(compare.dateInterval(dateA, dateB, compare.DateUnits.Month)); // 1
 *
 *     import {compare} from 'Types/entity';
 *     const dateA = new Date(2019, 10, 25);
 *     const dateB = new Date(2019, 11, 05);
 *     console.log(compare.dateInterval(dateA, dateB, compare.DateUnits.Month)); // 1
 * </pre>
 *
 * @class
 * @name Types/_entity/compare/dateInterval
 * @public
 * @author Мальцев А.А.
 */

export default function dateInterval(begin: Date, end: Date, unit: Units): number {
    if (!Units.hasOwnProperty(unit)) {
        throw Error(`unit "${unit}" does not supported`);
    }

    const diff = dateDifference(begin, end, unit);

    if (isFullInterval(begin, end, unit)) {
        return diff + 1;
    }

    return diff === 1 && !isBeginningUnit(begin, unit) ? 0 : diff;
}

function isBeginningUnit(data: Date, unit: Units) {
    switch (unit) {
        case Units.Day:
            return data.getHours() === 0 && data.getMinutes() === 0;

        case Units.Month:
            return data.getDate() === 1;

        case Units.Year:
            return data.getMonth() === 0;
    }
}
