import {assert} from 'chai';
import {stub} from 'sinon';
import period, { Type } from 'Types/_formatter/period';
import { PeriodType, ConfigurationType } from 'Types/_formatter/_period/IConfiguration';
import {controller} from 'I18n/i18n';
import enUS from 'I18n/locales/en-US';

type testingTupleComp = [Date, Date, Type, string];
type ITestingTuple = {
    [name in PeriodType]: [Date, Date, string];
};

describe('Types/_formatter/period', () => {
    const startYear = 2021;
    const firstMonth = 0;
    const firstDay = 1;

    const finishYear = 2022;
    const finishMonth = 6;
    const finishDay = 5;

    const start = new Date(startYear, firstMonth, firstDay);
    const finishAnotherYear = new Date(finishYear, firstMonth, firstDay);
    const finishAnotherMonth = new Date(startYear, finishMonth, firstDay);
    const finishAnotherDay = new Date(startYear, firstMonth, finishDay);

    const lastMonthOfThirdQuarter = 8;
    const lastMonthOfFirstQuarter = 2;
    const finishOfFirstQuarter = new Date(startYear, lastMonthOfFirstQuarter, firstDay);
    const finishOfThirdQuarter = new Date(startYear, lastMonthOfThirdQuarter, firstDay);
    const finishOfFirstQuarterAnotherYear = new Date(finishYear, lastMonthOfFirstQuarter, firstDay);

    const lastMonthOfHalfYear = 5;
    const finishOfHalfYear = new Date(startYear, lastMonthOfHalfYear, firstDay);
    const finishOfHalfYearAnotherYear = new Date(finishYear, lastMonthOfHalfYear, firstDay);

    let stubEnabled;
    let stubGetLang;

    controller.addLocale('en-US', enUS);

    beforeEach(() => {
        stubEnabled = stub(controller, 'isEnabled');
        stubGetLang = stub(controller, 'currentLocale');
        stubEnabled.get(() => true);
        stubGetLang.get(() => 'en-US');
    });

    afterEach(() => {
        stubEnabled.restore();
        stubGetLang.restore();
        stubEnabled = undefined;
        stubGetLang = undefined;
    });

    it('should format open period if start or finish is not Date', () => {
        const date = new Date(startYear, firstMonth, finishDay);

        assert.strictEqual(period(null, date), 'to 5 January\'21');
        assert.strictEqual(period(date, null), 'from 5 January\'21');
    });

    it('should format undefined period if start and finish is not Date', () => {
        const options = {
            undefinedPeriod: 'WholePeriod'
        };

        assert.strictEqual(period(null, null, options), 'WholePeriod');
    });

    // TODO Поддержка старой сигнатуры period. Удалить в 21.4000.
    describe('Compatibility', () => {
        // tslint:disable-next-line:no-magic-numbers
        const commonStart = new Date(2018, 1, 2);
        // tslint:disable-next-line:no-magic-numbers
        const anotherYear = new Date(2019, 9, 8);
        // tslint:disable-next-line:no-magic-numbers
        const anotherMonth = new Date(2018, 9, 8);
        // tslint:disable-next-line:no-magic-numbers
        const anotherDay = new Date(2018, 1, 7);

        const expectedList: testingTupleComp[] = [
            [commonStart, anotherYear, Type.Digital, '02.02.18-08.10.19'],
            [commonStart, anotherYear, Type.FullDate, '2 February\'18-8 October\'19'],
            [commonStart, anotherYear, Type.ShortDate, '2 Feb\'18-8 Oct\'19'],
            [commonStart, anotherYear, Type.FullDate, '2 February\'18-8 October\'19'],
            [commonStart, anotherYear, Type.ShortDate, '2 Feb\'18-8 Oct\'19'],
            [commonStart, anotherYear, Type.FullDate, '2 February\'18-8 October\'19'],
            [commonStart, anotherYear, Type.ShortDate, '2 Feb\'18-8 Oct\'19'],
            [commonStart, anotherYear, Type.FullMonth, 'February\'18-October\'19'],
            [commonStart, anotherYear, Type.ShortMonth, 'Feb\'18-Oct\'19'],
            [commonStart, anotherYear, Type.FullQuarter, 'I quarter\'18-IV quarter\'19'],
            [commonStart, anotherYear, Type.ShortQuarter, 'I qtr\'18-IV qtr\'19'],
            [commonStart, anotherYear, Type.FullHalfYear, 'I half year\'18-II half year\'19'],
            [commonStart, anotherYear, Type.ShortHalfYear, 'I hy\'18-II hy\'19'],
            [commonStart, anotherYear, Type.Year, '2018-2019'],

            [commonStart, anotherMonth, Type.Digital, '02.02.18-08.10.18'],
            [commonStart, anotherMonth, Type.FullDate, '2 February\'18-8 October\'18'],
            [commonStart, anotherMonth, Type.ShortDate, '2 Feb-8 Oct\'18'],
            [commonStart, anotherMonth, Type.FullDate, '2 February\'18-8 October\'18'],
            [commonStart, anotherMonth, Type.ShortDate, '2 Feb-8 Oct\'18'],
            [commonStart, anotherMonth, Type.FullDate, '2 February\'18-8 October\'18'],
            [commonStart, anotherMonth, Type.ShortDate, '2 Feb-8 Oct\'18'],
            [commonStart, anotherMonth, Type.FullMonth, 'February-October\'18'],
            [commonStart, anotherMonth, Type.ShortMonth, 'Feb-Oct\'18'],
            [commonStart, anotherMonth, Type.FullQuarter, 'I quarter\'18-IV quarter\'18'],
            [commonStart, anotherMonth, Type.ShortQuarter, 'I qtr\'18-IV qtr\'18'],
            [commonStart, anotherMonth, Type.FullHalfYear, 'I half year\'18-II half year\'18'],
            [commonStart, anotherMonth, Type.ShortHalfYear, 'I hy\'18-II hy\'18'],

            [commonStart, anotherDay, Type.Digital, '02.02.18-07.02.18'],
            [commonStart, anotherDay, Type.FullDate, '2 February\'18-7 February\'18'],
            [commonStart, anotherDay, Type.ShortDate, '2-7 Feb\'18'],
            [commonStart, anotherDay, Type.FullDate, '2 February\'18-7 February\'18'],
            [commonStart, anotherDay, Type.ShortDate, '2-7 Feb\'18'],
            [commonStart, anotherDay, Type.FullDate, '2 February\'18-7 February\'18'],
            [commonStart, anotherDay, Type.ShortDate, '2-7 Feb\'18'],
            [commonStart, anotherDay, Type.FullMonth, 'February\'18'],
            [commonStart, anotherDay, Type.ShortMonth, 'Feb\'18'],
            [commonStart, anotherDay, Type.FullQuarter, 'I quarter\'18'],
            [commonStart, anotherDay, Type.ShortQuarter, 'I qtr\'18'],
            [commonStart, anotherDay, Type.FullHalfYear, 'I half year\'18'],
            [commonStart, anotherDay, Type.ShortHalfYear, 'I hy\'18']
        ];

        expectedList.forEach(([start, finish, type, expected], index) => {
            it(`should format period from '${start}' to '${finish}' with ${type} as '${expected}'} at ${index}`, () => {
                const given = period(start, finish, type);
                assert.strictEqual(given, expected);
            });
        });
    });

    describe('Default configuration', () => {
        describe('full', () => {
            const testCase: ITestingTuple = {
                oneDay: [start, start, '1 January\'21'],
                daysOneMonth: [start, finishAnotherDay, '01.01.21-05.01.21'],
                daysMonthsOneYear: [start, finishAnotherMonth, '01.01.21-01.07.21'],
                daysMonthsYears: [start, finishAnotherYear, '01.01.21-01.01.22'],
                oneMonth: [start, start, 'January\'21'],
                monthsOneYear: [start, finishAnotherMonth, 'January-July\'21'],
                monthsYears: [start, finishAnotherYear, 'January\'21-January\'22'],
                oneQuarter: [start, finishOfFirstQuarter, 'I quarter\'21'],
                quartersOneYear: [start, finishOfThirdQuarter, 'I-III quarter\'21'],
                quartersYears: [start, finishOfFirstQuarterAnotherYear, 'I quarter\'21-I quarter\'22'],
                oneHalfYear: [start, finishOfHalfYear, 'I half year\'21'],
                halfYearsYears: [start, finishOfHalfYearAnotherYear, 'I half year\'21-I half year\'22'],
                oneYear: [start, start, '2021'],
                years: [start, finishAnotherYear, '2021-2022'],
                openStartPeriod: [null, finishAnotherDay, 'to 5 January\'21'],
                openFinishPeriod: [finishAnotherDay, null, 'from 5 January\'21'],
                allPeriod: [null, null, 'Whole period'],
                today: [start, start, 'Today']
            };

            for (const [key, test] of Object.entries(testCase)) {
                it (`Type - ${key}`, () => {
                    const options = {
                        type: key as PeriodType
                    };

                    assert.strictEqual(period(test[0], test[1], options), test[2]);
                });
            }
        });

        describe('short', () => {
            const testCase: ITestingTuple = {
                oneDay: [start, start, '1 Jan\'21'],
                daysOneMonth: [start, finishAnotherDay, '01.01.21-05.01.21'],
                daysMonthsOneYear: [start, finishAnotherMonth, '01.01.21-01.07.21'],
                daysMonthsYears: [start, finishAnotherYear, '01.01.21-01.01.22'],
                oneMonth: [start, start, 'Jan\'21'],
                monthsOneYear: [start, finishAnotherMonth, 'Jan-Jul\'21'],
                monthsYears: [start, finishAnotherYear, 'Jan\'21-Jan\'22'],
                oneQuarter: [start, finishOfFirstQuarter, 'I qtr\'21'],
                quartersOneYear: [start, finishOfThirdQuarter, 'I-III qtr\'21'],
                quartersYears: [start, finishOfFirstQuarterAnotherYear, 'I qtr\'21-I qtr\'22'],
                oneHalfYear: [start, finishOfHalfYear, 'I hy\'21'],
                halfYearsYears: [start, finishOfHalfYearAnotherYear, 'I hy\'21-I hy\'22'],
                oneYear: [start, start, '2021'],
                years: [start, finishAnotherYear, '2021-2022'],
                openStartPeriod: [null, finishAnotherDay, 'to 5 Jan\'21'],
                openFinishPeriod: [finishAnotherDay, null, 'from 5 Jan\'21'],
                allPeriod: [null, null, 'Whole period'],
                today: [start, start, 'Today']
            };

            for (const [key, test] of Object.entries(testCase)) {
                it (`Type - ${key}`, () => {
                    const options = {
                        type: key as PeriodType,
                        short: true
                    };

                    assert.strictEqual(period(test[0], test[1], options), test[2]);
                });
            }
        });
    });

    describe('Text configuration', () => {
        describe('full', () => {
            const testCase: ITestingTuple = {
                oneDay: [start, start, '1 January\'21'],
                daysOneMonth: [start, finishAnotherDay, '1-5 January\'21'],
                daysMonthsOneYear: [start, finishAnotherMonth, '1 January-1 July\'21'],
                daysMonthsYears: [start, finishAnotherYear, '1 January\'21-1 January\'22'],
                oneMonth: [start, start, 'January\'21'],
                monthsOneYear: [start, finishAnotherMonth, 'January-July\'21'],
                monthsYears: [start, finishAnotherYear, 'January\'21-January\'22'],
                oneQuarter: [start, finishOfFirstQuarter, 'January-March\'21'],
                quartersOneYear: [start, finishOfThirdQuarter, 'January-September\'21'],
                quartersYears: [start, finishOfFirstQuarterAnotherYear, 'January\'21-March\'22'],
                oneHalfYear: [start, finishOfHalfYear, 'January-June\'21'],
                halfYearsYears: [start, finishOfHalfYearAnotherYear, 'January\'21-June\'22'],
                oneYear: [start, start, '2021'],
                years: [start, finishAnotherYear, '2021-2022'],
                openStartPeriod: [null, finishAnotherDay, 'to 5 January\'21'],
                openFinishPeriod: [finishAnotherDay, null, 'from 5 January\'21'],
                allPeriod: [null, null, 'Whole period'],
                today: [start, start, 'Today']
            };

            for (const [key, test] of Object.entries(testCase)) {
                it (`Type - ${key}`, () => {
                    const options = {
                        configuration: ConfigurationType.Text,
                        type: key as PeriodType
                    };

                    assert.strictEqual(period(test[0], test[1], options), test[2]);
                });
            }
        });

        describe('short', () => {
            const testCase: ITestingTuple = {
                oneDay: [start, start, '1 Jan\'21'],
                daysOneMonth: [start, finishAnotherDay, '1-5 Jan\'21'],
                daysMonthsOneYear: [start, finishAnotherMonth, '1 Jan-1 Jul\'21'],
                daysMonthsYears: [start, finishAnotherYear, '1 Jan\'21-1 Jan\'22'],
                oneMonth: [start, start, 'Jan\'21'],
                monthsOneYear: [start, finishAnotherMonth, 'Jan-Jul\'21'],
                monthsYears: [start, finishAnotherYear, 'Jan\'21-Jan\'22'],
                oneQuarter: [start, finishOfFirstQuarter, 'Jan-Mar\'21'],
                quartersOneYear: [start, finishOfThirdQuarter, 'Jan-Sep\'21'],
                quartersYears: [start, finishOfFirstQuarterAnotherYear, 'Jan\'21-Mar\'22'],
                oneHalfYear: [start, finishOfHalfYear, 'Jan-Jun\'21'],
                halfYearsYears: [start, finishOfHalfYearAnotherYear, 'Jan\'21-Jun\'22'],
                oneYear: [start, start, '2021'],
                years: [start, finishAnotherYear, '2021-2022'],
                openStartPeriod: [null, finishAnotherDay, 'to 5 Jan\'21'],
                openFinishPeriod: [finishAnotherDay, null, 'from 5 Jan\'21'],
                allPeriod: [null, null, 'Whole period'],
                today: [start, start, 'Today']
            };

            for (const [key, test] of Object.entries(testCase)) {
                it (`Type - ${key}`, () => {
                    const options = {
                        configuration: ConfigurationType.Text,
                        type: key as PeriodType,
                        short: true
                    };

                    assert.strictEqual(period(test[0], test[1], options), test[2]);
                });
            }
        });
    });

    describe('Accounting configuration', () => {
        describe('full', () => {
            const testCase: ITestingTuple = {
                oneDay: [start, start, '1 January\'21'],
                daysOneMonth: [start, finishAnotherDay, '01.01.21-05.01.21'],
                daysMonthsOneYear: [start, finishAnotherMonth, '01.01.21-01.07.21'],
                daysMonthsYears: [start, finishAnotherYear, '01.01.21-01.01.22'],
                oneMonth: [start, start, 'January\'21'],
                monthsOneYear: [start, finishAnotherMonth, 'January-July\'21'],
                monthsYears: [start, finishAnotherYear, 'January\'21-January\'22'],
                oneQuarter: [start, finishOfFirstQuarter, 'January-March\'21'],
                quartersOneYear: [start, finishOfThirdQuarter, 'January-September\'21'],
                quartersYears: [start, finishOfFirstQuarterAnotherYear, 'January\'21-March\'22'],
                oneHalfYear: [start, finishOfHalfYear, 'January-June\'21'],
                halfYearsYears: [start, finishOfHalfYearAnotherYear, 'January\'21-June\'22'],
                oneYear: [start, start, '2021'],
                years: [start, finishAnotherYear, '2021-2022'],
                openStartPeriod: [null, finishAnotherDay, 'to 5 January\'21'],
                openFinishPeriod: [finishAnotherDay, null, 'from 5 January\'21'],
                allPeriod: [null, null, 'Whole period'],
                today: [start, start, 'Today']
            };

            for (const [key, test] of Object.entries(testCase)) {
                it (`Type - ${key}`, () => {
                    const options = {
                        configuration: ConfigurationType.Accounting,
                        type: key as PeriodType
                    };

                    assert.strictEqual(period(test[0], test[1], options), test[2]);
                });
            }
        });

        describe('short', () => {
            const testCase: ITestingTuple = {
                oneDay: [start, start, '1 Jan\'21'],
                daysOneMonth: [start, finishAnotherDay, '01.01.21-05.01.21'],
                daysMonthsOneYear: [start, finishAnotherMonth, '01.01.21-01.07.21'],
                daysMonthsYears: [start, finishAnotherYear, '01.01.21-01.01.22'],
                oneMonth: [start, start, 'Jan\'21'],
                monthsOneYear: [start, finishAnotherMonth, 'Jan-Jul\'21'],
                monthsYears: [start, finishAnotherYear, 'Jan\'21-Jan\'22'],
                oneQuarter: [start, finishOfFirstQuarter, 'Jan-Mar\'21'],
                quartersOneYear: [start, finishOfThirdQuarter, 'Jan-Sep\'21'],
                quartersYears: [start, finishOfFirstQuarterAnotherYear, 'Jan\'21-Mar\'22'],
                oneHalfYear: [start, finishOfHalfYear, 'Jan-Jun\'21'],
                halfYearsYears: [start, finishOfHalfYearAnotherYear, 'Jan\'21-Jun\'22'],
                oneYear: [start, start, '2021'],
                years: [start, finishAnotherYear, '2021-2022'],
                openStartPeriod: [null, finishAnotherDay, 'to 5 Jan\'21'],
                openFinishPeriod: [finishAnotherDay, null, 'from 5 Jan\'21'],
                allPeriod: [null, null, 'Whole period'],
                today: [start, start, 'Today']
            };

            for (const [key, test] of Object.entries(testCase)) {
                it (`Type - ${key}`, () => {
                    const options = {
                        configuration: ConfigurationType.Accounting,
                        type: key as PeriodType,
                        short: true
                    };

                    assert.strictEqual(period(test[0], test[1], options), test[2]);
                });
            }
        });
    });
});
