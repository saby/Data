import format from './date';
import * as translate from 'i18n!Types';

/**
 * Тип квантификации
 */
export enum Type {
    /**
     *  Автопределение
     */
    Auto,

    /**
     *  По времени
     */
    Time,

    /**
     *  До дням
     */
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
 * @example
 * Выведем дату в с квантированемм по дням:
 * <pre>
 *     import {retrospect, retrospectType} from 'Types/formatter';
 *     const today = new Date();
 *     console.log(retrospect(today, retrospectType.Date)); // 'Сегодня'
 * </pre>
 *
 * @param date Дата
 * @param type Тип кванта
 * @returns Дата в текстовом виде
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
                return translate('Today');
            }

            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            if (isThisDay(date, yesterday)) {
                return translate('Yesterday');
            }

            return format(date, format.FULL_DATE);
    }

    return '[Under construction]';
}
