import {applied} from '../entity';

/**
 * Сдвигает дату на конец указанной единицы измерения даты/времени
 * @param date Дата
 * @param unit Единица измерения
 * @public
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
