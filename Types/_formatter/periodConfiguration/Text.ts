import {DefaultFull, DefaultShort} from './Default';
import { IPeriodFormats } from './IConfiguration';

class TextFull extends DefaultFull {
    static oneDay: string[] = ['FULL_DATE_FULL_MONTH'];
    static daysOneMonth: string[] = ['DAY', 'FULL_DATE_FULL_MONTH'];
    static daysMonthsOneYear: string[] = ['SHORT_DATE_FULL_MONTH', 'FULL_DATE_FULL_MONTH'];
    static daysMonthsYears: string[] = ['FULL_DATE_FULL_MONTH', 'FULL_DATE_FULL_MONTH'];

    static oneQuarter: string[] = ['MONTH', 'FULL_MONTH'];
    static quartersOneYear: string[] = ['MONTH', 'FULL_MONTH'];
    static quartersYears: string[] = ['FULL_MONTH', 'FULL_MONTH'];

    static oneHalfYear: string[] = ['MONTH', 'FULL_MONTH'];
    static halfYearsYears: string[] = ['FULL_MONTH', 'FULL_MONTH'];
}

class TextShort extends DefaultShort {
    static oneDay: string[] = ['FULL_DATE_SHORT_MONTH'];
    static daysOneMonth: string[] = ['DAY', 'FULL_DATE_SHORT_MONTH'];
    static daysMonthsOneYear: string[] = ['SHORT_DATE_SHORT_MONTH', 'FULL_DATE_SHORT_MONTH'];
    static daysMonthsYears: string[] = ['FULL_DATE_SHORT_MONTH', 'FULL_DATE_SHORT_MONTH'];

    static oneQuarter: string[] = ['SHR_MONTH', 'SHORT_MONTH'];
    static quartersOneYear: string[] = ['SHR_MONTH', 'SHORT_MONTH'];
    static quartersYears: string[] = ['SHORT_MONTH', 'SHORT_MONTH'];

    static oneHalfYear: string[] = ['SHR_MONTH', 'SHORT_MONTH'];
    static halfYearsYears: string[] = ['SHORT_MONTH', 'SHORT_MONTH'];
}

export default class Text {
    static full: IPeriodFormats = TextFull;

    static short: IPeriodFormats = TextShort;
}
