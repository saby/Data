import {assert} from 'chai';
import detectPeriodType from 'Types/_formatter/detectPeriodType';


describe('auto detecting to period type', () => {
    const firstDay = 1;
    const firstMonth = 0;
    const startYear = 2021;
    const finishYear = 2022;
    const start = new Date(startYear, firstMonth, firstDay);

    it('February in leap year', () => {
       const leapYear = 2020;
       const february = 1;
       const lastDayOfFebruary = 29;
       const finish = new Date(leapYear, february, lastDayOfFebruary);

        assert.strictEqual(detectPeriodType(new Date(leapYear, february, firstDay), finish), 'oneMonth');
    });

    describe('year', () => {
        const lastDayOfYear = 31;
        const lastMonthOfYear = 11;

        it('one year', () => {
            const finish = new Date(startYear, lastMonthOfYear, lastDayOfYear);

            assert.strictEqual(detectPeriodType(start, finish), 'oneYear');
        });

        it('different years', () => {
            const finish = new Date(finishYear, lastMonthOfYear, lastDayOfYear);

            assert.strictEqual(detectPeriodType(start, finish), 'years');
        });
    });

    describe('half year', () => {
        const lastDayOfHalfYear = 30;
        const lastMonthOfHalfYear = 5;

        it('one half year', () => {
            const finish = new Date(startYear, lastMonthOfHalfYear, lastDayOfHalfYear);

            assert.strictEqual(detectPeriodType(start, finish), 'oneHalfYear');
        });

        it('half years in different years', () => {
            const finish = new Date(finishYear, lastMonthOfHalfYear, lastDayOfHalfYear);

            assert.strictEqual(detectPeriodType(start, finish), 'halfYearsYears');
        });
    });

    describe('quarter', () => {
        const lastDayOfFirstQuarter = 31;
        const lastMonthOfFirstQuarter = 2;
        const lastDayOfThirdQuarter = 30;
        const lastMonthOfThirdQuarter = 8;

        it('one quarter', () => {
            const finish = new Date(startYear, lastMonthOfFirstQuarter, lastDayOfFirstQuarter);

            assert.strictEqual(detectPeriodType(start, finish), 'oneQuarter');
        });

        it('quarters in one year', () => {
            const finish = new Date(startYear, lastMonthOfThirdQuarter, lastDayOfThirdQuarter);

            assert.strictEqual(detectPeriodType(start, finish), 'quartersOneYear');
        });

        it('quarters in different years', () => {
            const finish = new Date(finishYear, lastMonthOfThirdQuarter, lastDayOfThirdQuarter);

            assert.strictEqual(detectPeriodType(start, finish), 'quartersYears');
        });
    });

    describe('month', () => {
        const lastDayOfMonth = 31;
        const fifthMonth = 4;

        it('one month', () => {
            const finish = new Date(startYear, firstMonth, lastDayOfMonth);

            assert.strictEqual(detectPeriodType(start, finish), 'oneMonth');
        });

        it('months in one year', () => {
            const finish = new Date(startYear, fifthMonth, lastDayOfMonth);

            assert.strictEqual(detectPeriodType(start, finish), 'monthsOneYear');
        });

        it('months in different years', () => {
            const finish = new Date(finishYear, fifthMonth, lastDayOfMonth);

            assert.strictEqual(detectPeriodType(start, finish), 'monthsYears');
        });
    });

    describe('day', () => {
        const fifthDay = 5;
        const fifthMonth = 4;

        it('one day', () => {
            assert.strictEqual(detectPeriodType(start, start), 'oneDay');
        });

        it('days in one month', () => {
            const finish = new Date(startYear, firstMonth, fifthDay);

            assert.strictEqual(detectPeriodType(start, finish), 'daysOneMonth');
        });

        it('days in different months but in one year', () => {
            const finish = new Date(startYear, fifthMonth, fifthDay);

            assert.strictEqual(detectPeriodType(start, finish), 'daysMonthsOneYear');
        });

        it('full date', () => {
            const finish = new Date(finishYear, fifthMonth, fifthDay);

            assert.strictEqual(detectPeriodType(start, finish), 'daysMonthsYears');
        });
    });
});
