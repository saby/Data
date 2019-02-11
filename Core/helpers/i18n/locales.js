define(["require", "exports"], function (require, exports) {
    "use strict";
    var available = {
        'en-US': {
            minDays: ['Su', 'Mo', 'To', 'We', 'Th', 'Fr', 'Sa'],
            shortDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            longDays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            longMonths: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            ordinalMonths: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            shortOrdinalMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            am: 'am',
            pm: 'pm',
            minHalfYear: '$digit$s$ hy',
            longHalfYear: '$digit$s$ half year',
            minQuarter: '$digit$s$ qt',
            shortQuarter: '$digit$s$ qtr',
            longQuarter: '$digit$s$ quarter',
            quarters: ['I', 'II', 'III', 'IV'],
            longQuarters: ['I quarter', 'II quarter', 'III quarter', 'IV quarter'],
            fullDateDayOfWeekFormat: 'dddd, DD MMMM\'YY',
            fullDateFormat: 'DD.MM.YY',
            fullDateFullMonthFormat: 'DD MMMM\'YY',
            fullDateFullMonthFullYearFormat: 'DD MMMM, YYYY',
            fullDateFullYearFormat: 'DD.MM.YYYY',
            fullDateShortMonthFormat: 'DD MMM\'YY',
            fullDateShortMonthFullYearFormat: 'DD MMM YYYY',
            fullHalfYearFormat: 'YYYYhr \'YY',
            fullMonthFormat: 'MMMM\'YY',
            fullQuarterFormat: 'QQQQr \'YY',
            fullTimeFormat: 'HH:mm:ss',
            shortDateDayOfWeekFormat: 'dddd, DD MMMM',
            shortDateFormat: 'DD.MM',
            shortDateFullMonthFormat: 'DD MMMM',
            shortDateShortMonthFormat: 'DD MMM',
            shortHalfYearFormat: 'YYhr \'YY',
            shortMonthFormat: 'MMM\'YY',
            shortQuarterFormat: 'QQQr \'YY',
            shortTimeFormat: 'HH:mm',
            masks: {
                date: '%m/%d/%y',
                min: '%I:%M %p',
                sec: '%I:%M:%S %p',
                msec: '%I:%M:%S.%J %p'
            }
        }
    };
    var locales = /** @class */ (function () {
        function locales() {
        }
        Object.defineProperty(locales, "available", {
            get: function () {
                return Object.keys(available);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(locales, "current", {
            get: function () {
                return {
                    config: available['en-US']
                };
            },
            enumerable: true,
            configurable: true
        });
        return locales;
    }());
    return locales;
});
