/**
 * @typedef {String} ConfigurationType Типы наборов форматов для периода. Описание наборов в {@link http://axure.tensor.ru/StandardsV8/форматы_дат_и_времени.html спецификациях}.
 * @variant Default Набор форматов по умолчанию.
 * @variant Text Текстовый набор набор форматов.
 * @variant Accounting Бухгалтерский набор набор форматов.
 */
export enum ConfigurationType {
    Default = 'Default',
    Text = 'Text',
    Accounting = 'Accounting'
}

/**
 * @typedef {Object} IConfigurationPeriod Настройки для отображения периода.
 * @property {IPeriodFormats} short Набор форматов с сокращёнными названиями.
 * @property {IPeriodFormats} full Набор форматов без сокращений.
 */
export default interface IConfigurationPeriod {
    short: IPeriodFormats;
    full: IPeriodFormats;
}

/**
 * @typedef {String} PeriodType Типы периодов. Подробное описание типов в {@link http://axure.tensor.ru/StandardsV8/форматы_дат_и_времени.html спецификациях}.
 * @variant oneDay Один день.
 * @variant daysOneMonth Дни в рамках одного месяца.
 * @variant daysMonthsOneYear Дни в рамках одного года.
 * @variant daysMonthsYears Дни в рамках некскольких лет.
 * @variant oneMonth Один месяц.
 * @variant monthsOneYear Месяцы в рамках года.
 * @variant monthsYears Месяцы в рамках нескольких лет.
 * @variant oneQuarter Один квартал.
 * @variant quartersOneYear Кварталы в рамках одного года.
 * @variant quartersYears Кварталы в рамках нескольких лет.
 * @variant oneHalfYear Одно полугодие.
 * @variant halfYearsYears Полугодия в рамках нескольких лет.
 * @variant oneYear Один год.
 * @variant years Несколько лет.
 * @variant openStartPeriod Период с неуказанной начальной границей.
 * @variant openFinishPeriod Период с неуказанной конечной границей.
 * @variant allPeriod Период с неуказнными границами.
 * @variant today Текущий день.
 */
export enum PeriodType {
    oneDay = 'oneDay',
    daysOneMonth = 'daysOneMonth',
    daysMonthsOneYear = 'daysMonthsOneYear',
    daysMonthsYears = 'daysMonthsYears',

    oneMonth = 'oneMonth',
    monthsOneYear = 'monthsOneYear',
    monthsYears = 'monthsYears',

    oneQuarter = 'oneQuarter',
    quartersOneYear = 'quartersOneYear',
    quartersYears = 'quartersYears',

    oneHalfYear = 'oneHalfYear',
    halfYearsYears = 'halfYearsYears',

    oneYear = 'oneYear',
    years = 'years',

    openStartPeriod = 'openStartPeriod',
    openFinishPeriod = 'openFinishPeriod',

    allPeriod = 'allPeriod',
    today = 'today'
}

/**
 * @typedef {Object} IPeriodFormats Форматы отображения периода.
 * @property {Array<String>} oneDay Один день.
 * @property {Array<String>} daysOneMonth Дни в рамках одного месяца.
 * @property {Array<String>} daysMonthsOneYear Дни в рамках одного года.
 * @property {Array<String>} daysMonthsYears Дни в рамках некскольких лет.
 * @property {Array<String>} oneMonth Один месяц.
 * @property {Array<String>} monthsOneYear Месяцы в рамках года.
 * @property {Array<String>} monthsYears Месяцы в рамках нескольких лет.
 * @property {Array<String>} oneQuarter Один квартал.
 * @property {Array<String>} quartersOneYear Кварталы в рамках одного года.
 * @property {Array<String>} quartersYears Кварталы в рамках нескольких лет.
 * @property {Array<String>} oneHalfYear Одно полугодие.
 * @property {Array<String>} halfYearsYears Полугодия в рамках нескольких лет.
 * @property {Array<String>} oneYear Один год.
 * @property {Array<String>} years Несколько лет.
 * @property {String} openStartPeriod Период с неуказанной начальной границей.
 * @property {String} openFinishPeriod Период с неуказанной конечной границей.
 * @property {String} allPeriod Период с неуказнными границами.
 * @property {String} today Текущий день.
 */
export interface IPeriodFormats {
    [PeriodType.oneDay]: string[];
    [PeriodType.daysOneMonth]: string[];
    [PeriodType.daysMonthsOneYear]: string[];
    [PeriodType.daysMonthsYears]: string[];

    [PeriodType.oneMonth]: string[];
    [PeriodType.monthsOneYear]: string[];
    [PeriodType.monthsYears]: string[];

    [PeriodType.oneQuarter]: string[];
    [PeriodType.quartersOneYear]: string[];
    [PeriodType.quartersYears]: string[];

    [PeriodType.oneHalfYear]: string[];
    [PeriodType.halfYearsYears]: string[];

    [PeriodType.oneYear]: string[];
    [PeriodType.years]: string[];

    [PeriodType.openStartPeriod]: string;
    [PeriodType.openFinishPeriod]: string;

    [PeriodType.allPeriod]: string;
    [PeriodType.today]: string;
}
