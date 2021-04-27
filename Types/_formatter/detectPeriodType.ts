const LAST_DAY_LEAP_FEBRUARY = 29;

const lastDays = {
    January: 31,
    February: 28,
    March: 31,
    April: 30,
    May: 31,
    June: 30,
    July: 31,
    August: 31,
    September: 30,
    October: 31,
    November: 30,
    December: 31
};
const MONTH = {
    January: 0,
    February: 1,
    March: 2,
    April: 3,
    May: 4,
    June: 5,
    July: 6,
    August: 7,
    September: 8,
    October: 9,
    November: 10,
    December: 11
};

const halfYearRange = [
    [MONTH.January, MONTH.June],
    [MONTH.July, MONTH.December]
];
const quarterRange = [
    [MONTH.January, MONTH.March],
    [MONTH.April, MONTH.June],
    [MONTH.July, MONTH.September],
    [MONTH.October, MONTH.December]
];
const lastDaysMonth = [
    lastDays.January,
    lastDays.February,
    lastDays.March,
    lastDays.April,
    lastDays.May,
    lastDays.June,
    lastDays.July,
    lastDays.August,
    lastDays.September,
    lastDays.October,
    lastDays.November,
    lastDays.December
];

function isLeapYear(year: number): boolean {
    return new Date(year, 1, LAST_DAY_LEAP_FEBRUARY).getDate() === LAST_DAY_LEAP_FEBRUARY;
}

function isFullPeriod(startMonth: number, finishMonth: number, ranges: number[][]): boolean {
    let isStart = false;
    let isFinish = false;

    for (const [start, finish] of ranges) {
        if (start === startMonth) {
            isStart = true;
        }

        if (finish === finishMonth) {
            isFinish = true;
        }
    }

    return isStart && isFinish;
}

function isOneStepPeriod(startMonth: number, finishMonth: number, ranges: number[][]): boolean {
    return ranges.some((range) => {
        return range[0] === startMonth && range[1] === finishMonth;
    });
}

function isLastDayMonth(date: Date): boolean {
    const month = date.getMonth();

    if (month === 1 && isLeapYear(date.getFullYear())) {
        return date.getDate() === LAST_DAY_LEAP_FEBRUARY;
    }

    return date.getDate() === lastDaysMonth[month];
}

function isFullMonth(start: Date, finish: Date): boolean {
    return start.getDate() === 1 && isLastDayMonth(finish);
}

function isFullYear(startMonth: number, finishMonth: number): boolean {
    return startMonth === MONTH.January && finishMonth === MONTH.December;
}

function getMonthFormat(startMonth: number, finishMonth: number, startYear: number, finishYear: number): string {
    if (startYear === finishYear) {
        return startMonth === finishMonth ? 'oneMonth' : 'monthsOneYear';
    }

    return 'monthsYears';
}

function getQuarterFormat(startMonth: number, finishMonth: number, startYear: number, finishYear: number): string {
    if (startYear === finishYear) {
        return isOneStepPeriod(startMonth, finishMonth, quarterRange) ? 'oneQuarter' : 'quartersOneYear';
    }

    return 'quartersYears';
}

function getHalfYearFormat(startMonth: number, finishMonth: number, startYear: number, finishYear: number): string {
    if (startYear === finishYear && isOneStepPeriod(startMonth, finishMonth, halfYearRange)) {
        return 'oneHalfYear';
    }

    return 'halfYearsYears';
}

function getDateFormat(start: Date, finish: Date): string {
    if (start.getFullYear() === finish.getFullYear()) {
        if (start.getMonth() === finish.getMonth()) {
            if (start.getDate() === finish.getDate()) {
                return 'oneDay';
            }

            return 'daysOneMonth';
        }

        return 'daysMonthsOneYear';
    }

    return 'daysMonthsYears';
}

export default function detectPeriodType(start: Date, finish: Date): string {
    if (isFullMonth(start, finish)) {
        const startYear = start.getFullYear();
        const finishYear = finish.getFullYear();
        const startMonth = start.getMonth();
        const finishMonth = finish.getMonth();

        if (isFullYear(startMonth, finishMonth)) {
            return startYear === finishYear ? 'oneYear' : 'years';
        }

        if (isFullPeriod(startMonth, finishMonth, halfYearRange)) {
            return getHalfYearFormat(startMonth, finishMonth, startYear, finishYear);
        }

        if (isFullPeriod(startMonth, finishMonth, quarterRange)) {
            return getQuarterFormat(startMonth, finishMonth, startYear, finishYear);
        }

        return getMonthFormat(startMonth, finishMonth, startYear, finishYear);
    }

    return getDateFormat(start, finish);
}
