import {DefaultFull, DefaultShort} from './Default';
import { IPeriodFormats } from './IConfiguration';

class AccountingFull extends DefaultFull {
    static oneQuarter: string[] = ['MONTH', 'FULL_MONTH'];
    static quartersOneYear: string[] = ['MONTH', 'FULL_MONTH'];
    static quartersYears: string[] = ['FULL_MONTH', 'FULL_MONTH'];

    static oneHalfYear: string[] = ['MONTH', 'FULL_MONTH'];
    static halfYearsYears: string[] = ['FULL_MONTH', 'FULL_MONTH'];
}

class AccountingShort extends DefaultShort {
    static oneQuarter: string[] = ['SHR_MONTH', 'SHORT_MONTH'];
    static quartersOneYear: string[] = ['SHR_MONTH', 'SHORT_MONTH'];
    static quartersYears: string[] = ['SHORT_MONTH', 'SHORT_MONTH'];

    static oneHalfYear: string[] = ['SHR_MONTH', 'SHORT_MONTH'];
    static halfYearsYears: string[] = ['SHORT_MONTH', 'SHORT_MONTH'];
}

export default class Accounting {
    static full: IPeriodFormats = AccountingFull;

    static short: IPeriodFormats = AccountingShort;
}
