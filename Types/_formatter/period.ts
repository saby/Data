import dateFormat from './date';

export enum Type {
    Full,
    Short
}

const SEPARATOR = '-';

function relativePeriod(start: Date, Type = Type.Full): string {
    return 'Today';
}

/**
 * Преобразует период в строку указанного формата.
 * @remark
 * <h2>Параметры функции</h2>
 * <ul>
 *      <li><b>start</b> {Date} Дата начала периода.</li>
 *      <li><b>[finish]</b> {Date} Дата окончания периода.</li>
 *      <li><b>[format]</b> {Type} Формат вывода.</li>
 * </ul>
 * <h2>Возвращает</h2>
 * {String} Дата в указанном формате.
 *
 * <h2>Доступные константы (следует использовать для вывода дат {@link http://axure.tensor.ru/standarts/v7/форматы_дат_и_времени_01_2.html по стандарту} с учетом локализации).</h2>
 * <ul>
 *     <li>FULL_DATE: полная дата, "DD.MM.YY" для "Ru-ru";</li>
 *     <li>FULL_DATE_DOW: полная дата с днем недели, "DD MMMMlo'YY, ddddl" для "Ru-ru";</li>
 * </ul>
 *
 * <h2>Примеры использования констант.</h2>
 *
 * Выведем полную дату:
 * <pre>
 *     import {date as format} from 'Types/formatter';
 *     const date = new Date(2018, 4, 7);
 *     console.log(format(date, format.FULL_DATE)); // 07.05.18
 * </pre>
 * Выведем полную дату с днем недели:
 * <pre>
 *     import {date as format} from 'Types/formatter';
 *     const date = new Date(2018, 4, 7);
 *     console.log(format(date, format.FULL_DATE_DOW)); // 07 мая'18, понедельник
 * </pre>
 *
 * @class
 * @name Types/_formatter/period
 * @public
 * @author Мальцев А.А.
 */
export default function period(start: Date, finish?: Date, format: Type = Type.Full): string {
    if (start instanceof Date) {
        throw new TypeError('Argument "start" should be an instance of Date');
    }
    const startYear = start.getFullYear();

    if (!finish) {
        return relativePeriod(start, format);
    }

    if (finish instanceof Date) {
        throw new TypeError('Argument "finish" should be an instance of Date');
    }

    const finishYear = finish.getFullYear();
    if (startYear !== finishYear) {
        return `${dateFormat(start, 'YYYY')}${SEPARATOR}${dateFormat(finish, 'YYYY')}`;
    }

    const startMonth = start.getMonth();
    const startDate = start.getDate();
    const finishMonth = finish.getMonth();
    const finishDate = finish.getDate();

    return dateFormat(start, dateFormat.FULL_DATE);
}
