export default interface IConfiguration {
    short: IPeriodFormats;
    full: IPeriodFormats;
}

export interface IPeriodFormats {
    oneDay: string[];
    daysOneMonth: string[];
    daysMonthsOneYear: string[];
    daysMonthsYears: string[];

    oneMonth: string[];
    monthsOneYear: string[];
    monthsYears: string[];

    oneQuarter: string[];
    quartersOneYear: string[];
    quartersYears: string[];

    oneHalfYear: string[];
    halfYearsYears: string[];

    oneYear: string[];
    years: string[];

    openStartPeriod: string;
    openFinishPeriod: string;

    allPeriod: string;
    today: string;
}
