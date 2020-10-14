import dateDifference, { Units } from "./dateDifference";

const MONTH_IN_YEAR = 11;

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
