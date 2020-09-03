import {applied} from '../entity';
/**
 * Набор функций для модификаций даты и времени
 * @class
 * @name Types/_transformation/date
 * @public
 * @author Мальцев А.А.
 *
 */

/**
 * Сдвигает дату на конец указанной единицы измерения даты/времени
 * @function
 * @name Types/_transformation/date#toEndOf
 * @param date Дата
 * @param unit Единица измерения
 * @example
 * Сдвинем дату на последний день месяца:
 * <pre>
 * import {applied} from 'Types/entity';
 * import {date} from 'Types/transformation';
 *
 * const someDate = new Date(2019, 1, 1);
 * date.toEndOf(someDate, applied.dateUnit.Month);
 * console.log(someDate);
 * </pre>
 */
export function toEndOf(date: Date, unit: applied.dateUnit): Date {
    if (unit !== applied.dateUnit.Month) {
        throw new Error(`Unit "${unit}" is not supported`);
    }

    const result = new Date(date);
    const month = result.getMonth();

    result.setDate(1);
    result.setMonth(month + 1);
    result.setDate(0);

    return result;
}
