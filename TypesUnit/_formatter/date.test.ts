import {assert} from 'chai';
import * as sinon from 'sinon';
import format from 'Types/_formatter/date';
import * as locales from 'Core/helpers/i18n/locales';
import * as i18n from 'Core/i18n';

describe('Types/_formatter/date', () => {
    const check = (date, pattern, expected) => {
        return () => {
            const given = format(date, pattern);
            if (expected instanceof Function) {
                assert.isTrue(expected(given));
            } else {
                assert.strictEqual(given, expected);
            }
        };
    };

    const date = new Date(2009, 1, 7, 3, 4, 5, 678);

    const generic = {
        SSS: '678',
        s: '5',
        ss: '05',
        m: '4',
        mm: '04',
        h: '3',
        H: '3',
        HH: '03',
        'h:m:s': '3:4:5',
        'hh:mm:ss': '03:04:05',
        D: '7',
        DD: '07',
        M: '2',
        MM: '02',
        Q: '1',
        Y: '9',
        YY: '09',
        YYYY: '2009',
        Yh: '1'
    };

    const localized = {
        'ru-RU': {
            a: 'дп',
            dd: 'Сб',
            ddl: 'сб',
            ddd: 'Сбт',
            dddl: 'сбт',
            dddd: 'Суббота',
            ddddl: 'суббота',
            MMM: 'Фев',
            MMMl: 'фев',
            MMMM: 'Февраль',
            MMMMl: 'февраль',
            MMMMo: 'Февраля',
            MMMMlo: 'февраля',
            QQr: 'I кв',
            QQQr: 'I квр',
            QQQQr: 'I квартал',
            YYhr: 'I пл',
            YYYYhr: 'I полугодие'
        },
        'en-US': {
            a: 'am',
            dd: 'Sa',
            ddl: 'sa',
            ddd: 'Sat',
            dddl: 'sat',
            dddd: 'Saturday',
            ddddl: 'saturday',
            MMM: 'Feb',
            MMMl: 'feb',
            MMMM: 'February',
            MMMMl: 'february',
            MMMMo: 'February',
            MMMMlo: 'february',
            QQr: 'I qt',
            QQQr: 'I qtr',
            QQQQr: 'I quarter',
            YYhr: 'I hy',
            YYYYhr: 'I half year'
        }
    };

    Object.keys(generic).forEach((pattern) => {
        const expected = generic[pattern];
        it(
            `should format "${pattern}"${expected instanceof Function ? '' : ' as "' + expected + '"'}`,
            check(date, pattern, expected)
        );
    });

    Object.keys(localized).forEach((locale) => {
        context('for locale"' + locale + '"', () => {
            let stubEnabled;
            let stubGetLang;

            beforeEach(() => {
                stubEnabled = sinon.stub(i18n, 'isEnabled');
                stubGetLang = sinon.stub(i18n, 'getLang');
                stubEnabled.returns(true);
                stubGetLang.returns(locale);
            });

            afterEach(() => {
                stubEnabled.restore();
                stubGetLang.restore();
                stubEnabled = undefined;
                stubGetLang = undefined;
            });

            const data = localized[locale];
            Object.keys(data).forEach((pattern) => {
                const expected = data[pattern];
                it(
                  `should format "${pattern}"${expected instanceof Function ? '' : ' as "' + expected + '"'}`,
                  check(date, pattern, expected)
                );
            });
        });
    });

    it('should format "h" as "12" for midnight', () => {
        const date = new Date(2018, 1, 1, 0, 0, 0);
        assert.equal(format(date, 'h'), '12');
    });

    it('should format "h" as "12" for noon', () => {
        const date = new Date(2018, 1, 1, 12, 0, 0);
        assert.equal(format(date, 'h'), '12');
    });

    it('should format "h" as "1" for a hour past noon', () => {
        const date = new Date(2018, 1, 1, 13, 0, 0);
        assert.equal(format(date, 'h'), '1');
    });

    it('should format "a" as "am" for midnight', () => {
        const date = new Date(2018, 1, 1, 0, 0, 0);
        assert.include(['am', 'дп'], format(date, 'a'));
    });

    it('should format "a" as "pm" for noon', () => {
        const date = new Date(2018, 1, 1, 15, 0, 0);
        assert.include(['pm', 'пп'], format(date, 'a'));
    });

    it('should format "Q" as "1" for January', () => {
        const date = new Date(2018, 0, 1);
        assert.equal(format(date, 'Q'), '1');
    });

    it('should format "Q" as "2" for April', () => {
        const date = new Date(2018, 3, 1);
        assert.equal(format(date, 'Q'), '2');
    });

    it('should format "Q" as "3" for July', () => {
        const date = new Date(2018, 6, 1);
        assert.equal(format(date, 'Q'), '3');
    });

    it('should format "Q" as "4" for October', () => {
        const date = new Date(2018, 9, 1);
        assert.equal(format(date, 'Q'), '4');
    });

    it('should format "Q" as "4" for December', () => {
        const date = new Date(2018, 11, 1);
        assert.equal(format(date, 'Q'), '4');
    });

    it('should format "Yh" as "1" for January', () => {
        const date = new Date(2018, 0, 1);
        assert.equal(format(date, 'Yh'), '1');
    });

    it('should format "Yh" as "1" for June', () => {
        const date = new Date(2018, 5, 1);
        assert.equal(format(date, 'Yh'), '1');
    });

    it('should format "Yh" as "2" for July', () => {
        const date = new Date(2018, 6, 1);
        assert.equal(format(date, 'Yh'), '2');
    });

    it('should format "Yh" as "2" for December', () => {
        const date = new Date(2018, 11, 1);
        assert.equal(format(date, 'Yh'), '2');
    });

    it('should format "ddl" with not a date', () => {
        const dt: any = {
            getDay: () => {
                return -1;
            }
        };
        assert.equal(format(dt, 'ddl'), 'undefined');
    });

    context('timezones', () => {
        let timezoneOffsetStub;
        let date;

        beforeEach(() => {
            date = new Date(2018, 11, 1);
            timezoneOffsetStub = sinon.stub(date, 'getTimezoneOffset');
        });

        afterEach(() => {
            timezoneOffsetStub.restore();
        });

        it('should format "Z" as timezone east', () => {
            timezoneOffsetStub.callsFake(() => -180);
            assert.equal(format(date, 'Z'), '+03');
        });

        it('should format "Z" as timezone west', () => {
            timezoneOffsetStub.callsFake(() => 180);
            assert.equal(format(date, 'Z'), '-03');
        });

        it('should format "Z" as timezone with minutes', () => {
            timezoneOffsetStub.callsFake(() => 210);
            assert.equal(format(date, 'Z'), '-03:30');
        });

        it('should format "ZZ" as timezone without colon', () => {
            timezoneOffsetStub.callsFake(() => 210);
            assert.equal(format(date, 'ZZ'), '-0330');
        });
    });

    it('should escape square brackets', () => {
        const date = new Date(2018, 4, 7);
        assert.equal(format(
            date,
            '[Today is ]D.MM, YY. [How long ago it was?]'
        ), 'Today is 7.05, 18. How long ago it was?');
    });

    context('constants', () => {
        const map = {
            FULL_DATE_DOW: 'fullDateDayOfWeekFormat',
            FULL_DATE: 'fullDateFormat',
            FULL_DATE_FULL_MONTH: 'fullDateFullMonthFormat',
            FULL_DATE_FULL_MONTH_FULL_YEAR: 'fullDateFullMonthFullYearFormat',
            FULL_DATE_FULL_YEAR: 'fullDateFullYearFormat',
            FULL_DATE_SHORT_MONTH: 'fullDateShortMonthFormat',
            FULL_DATE_SHORT_MONTH_FULL_YEAR: 'fullDateShortMonthFullYearFormat',
            FULL_HALF_YEAR: 'fullHalfYearFormat',
            FULL_MONTH: 'fullMonthFormat',
            FULL_QUATER: 'fullQuarterFormat',
            FULL_TIME: 'fullTimeFormat',
            SHORT_DATE_DOW: 'shortDateDayOfWeekFormat',
            SHORT_DATE: 'shortDateFormat',
            SHORT_DATE_FULL_MONTH: 'shortDateFullMonthFormat',
            SHORT_DATE_SHORT_MONTH: 'shortDateShortMonthFormat',
            SHORT_HALF_YEAR: 'shortHalfYearFormat',
            SHORT_MONTH: 'shortMonthFormat',
            SHORT_QUATER: 'shortQuarterFormat',
            SHORT_TIME: 'shortTimeFormat'
        };

        Object.keys(map).forEach((constant) => {
            it(constant, () => {
                assert.strictEqual(format[constant], locales.current.config[map[constant]]);
            });
        });

        it('SHORT_DATETIME', () => {
            assert.strictEqual(
                format.SHORT_DATETIME,
                locales.current.config.shortDateShortMonthFormat + ' ' + locales.current.config.shortTimeFormat
            );
        });

        it('FULL_DATETIME', () => {
            assert.strictEqual(
                format.FULL_DATETIME,
                locales.current.config.fullDateShortMonthFormat + ' ' + locales.current.config.shortTimeFormat)
            ;
        });
    });
});
