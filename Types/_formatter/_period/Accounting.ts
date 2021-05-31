import {DefaultFullFormats, DefaultShortFormats} from './Default';
import IPeriodConfiguration from './IConfiguration';

class AccountingFullFormats extends DefaultFullFormats {
    static oneQuarter: string[] = ['MONTH', 'FULL_MONTH'];
    static quartersOneYear: string[] = ['MONTH', 'FULL_MONTH'];
    static quartersYears: string[] = ['FULL_MONTH', 'FULL_MONTH'];

    static oneHalfYear: string[] = ['MONTH', 'FULL_MONTH'];
    static halfYearsYears: string[] = ['FULL_MONTH', 'FULL_MONTH'];
}

class AccountingShortFormats extends DefaultShortFormats {
    static oneQuarter: string[] = ['SHR_MONTH', 'SHORT_MONTH'];
    static quartersOneYear: string[] = ['SHR_MONTH', 'SHORT_MONTH'];
    static quartersYears: string[] = ['SHORT_MONTH', 'SHORT_MONTH'];

    static oneHalfYear: string[] = ['SHR_MONTH', 'SHORT_MONTH'];
    static halfYearsYears: string[] = ['SHORT_MONTH', 'SHORT_MONTH'];
}

const Accounting: IPeriodConfiguration = {
    full: AccountingFullFormats,
    short: AccountingShortFormats
};

export default Accounting;
