import format from './date';
import i18n = require('Core/i18n');
import 'i18n!Types/_formatter/retrospect';

export enum Type {
    Auto,
    Time,
    Date
}

function isThisDay(date: Date, thisDate: Date): boolean {
    const thisYear = thisDate.getFullYear();
    const thisMonth = thisDate.getMonth();
    const thisDay = thisDate.getDay();

    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDay();

    return year === thisYear && month === thisMonth && day === thisDay;
}

/**
 * Преобраузет дату в строку относительно текущего момента времени ('сегодня', 'вчера' и т.п.).
 * @remark
 * <h2>Параметры функции</h2>
 * <ul>
 *      <li><b>date</b> {Date} Дата.</li>
 *      <li><b>[type]</b> {Type} Тип кванта.</li>
 * </ul>
 * <h2>Возвращает</h2>
 * {String} Дата в текстовом виде.
 *
 * <h2>Доступные значения type.</h2>
 * <ul>
 *     <li>Auto: автопределение кванта;</li>
 *     <li>Time: квантирование по времени;</li>
 *     <li>Date: квантирование по дням;</li>
 * </ul>
 *
 * Выведем дату в с квантированемм по дням:
 * <pre>
 *     import {retrospect, retrospectType} from 'Types/formatter';
 *     const today = new Date();
 *     console.log(retrospect(today, retrospectType.Date)); // 'Сегодня'
 * </pre>
 *
 * @class
 * @name Types/_formatter/retrospect
 * @public
 * @author Мальцев А.А.
 */
export default function retrospect(date: Date, type: Type = Type.Auto): string {
    // Check arguments
    if (!(date instanceof Date)) {
        throw new TypeError('Argument "date" should be an instance of Date');
    }

    switch (type) {
        case Type.Date:
            const today = new Date();
            if (isThisDay(date, today)) {
                return i18n.rk('Today');
            }

            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            if (isThisDay(date, yesterday)) {
                return i18n.rk('Yesterday');
            }

            return format(date, format.FULL_DATE);
    }

    return '[Under construction]';
}
