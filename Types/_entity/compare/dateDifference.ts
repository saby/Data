export enum Units {
    Year = 'Year',
    Month = 'Month',
    Day = 'Day'
}

const MS_IN_DAY = 24 * 60 * 60 * 1000;

function getMonthDifference(dateA: Date, dateB: Date): number {
    let dateAMonths = 12 * dateA.getFullYear() + dateA.getMonth();
    let dateBMonths = 12 * dateB.getFullYear() + dateB.getMonth();
    return dateBMonths - dateAMonths;
}

function getYearDifference(dateA: Date, dateB: Date): number {
    return dateB.getFullYear() - dateA.getFullYear();
}


/**
 * Рассчитывает разницу между датами в указанных единицах.
 * @remark
 * <h2>Параметры функции</h2>
 * <ul>
 *      <li><b>dateA</b> {Date} Первая дата.</li>
 *      <li><b>dateB</b> {Date} Вторая дата.</li>
 *      <li><b>[units]</b> {String} Единица расчета (если не передан, используются миллисекунды).</li>
 * </ul>
 * <h2>Возвращает</h2>
 * {number} Разница между датами в виде целого числа (дробная часть отбрасывается) в указанных единицах.
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
 * Выведем число дней между двумя датами:
 * <pre>
 *     import {compare} from 'Types/entity';
 *     const dateA = new Date(2019, 11, 31);
 *     const dateB = new Date(2020, 0, 1);
 *     console.log(compare.dateDifference(dateA, dateB, compare.DateUnits.Day)); // 1
 * </pre>
 *
 * @class
 * @name Types/_entity/compare/dateDifference
 * @public
 * @author Мальцев А.А.
 */
export default function dateDifference(dateA: Date, dateB: Date, units?: Units): number {
    let output: number;

    if (dateA instanceof Date && dateB instanceof Date) {
        switch (units) {
            case Units.Year:
                output = getYearDifference(dateA, dateB);
                break;
            case Units.Month:
                output = getMonthDifference(dateA, dateB);
                break;
            case Units.Day:
                output = (Number(dateB) - Number(dateA)) / MS_IN_DAY;
                break;
            default:
                output = Number(dateB) - Number(dateA);
        }
    } else {
        output = Number(dateB) - Number(dateA);
    }

    return output < 0 ? -Math.floor(-output) : Math.floor(output);
}
