import {assert} from 'chai';
import * as sinon from 'sinon';
import period, {Type} from 'Types/_formatter/period';
import i18n = require('Core/i18n');

type testingTuple = [Date, Date, Type, string];

describe('Types/_formatter/period', () => {
    let stubEnabled;
    let stubGetLang;

    before(() => {
        stubEnabled = sinon.stub(i18n, 'isEnabled');
        stubGetLang = sinon.stub(i18n, 'getLang');
        stubEnabled.returns(true);
        stubGetLang.returns('en-US');
    });

    after(() => {
        stubEnabled.restore();
        stubGetLang.restore();
        stubEnabled = undefined;
        stubGetLang = undefined;
    });

    // tslint:disable-next-line:no-magic-numbers
    const commonStart = new Date(2018, 1, 2);
    // tslint:disable-next-line:no-magic-numbers
    const anotherYear = new Date(2019, 9, 8);
    // tslint:disable-next-line:no-magic-numbers
    const anotherMonth = new Date(2018, 9, 8);
    // tslint:disable-next-line:no-magic-numbers
    const anotherDay = new Date(2018, 1, 7);

    const expectedList: testingTuple[] = [
        [commonStart, anotherYear, Type.Digital, '02.02.18-08.10.19'],
        [commonStart, anotherYear, Type.FullDate, '02 February\'18-08 October\'19'],
        [commonStart, anotherYear, Type.ShortDate, '02 Feb\'18-08 Oct\'19'],
        [commonStart, anotherYear, Type.FullDate, '02 February\'18-08 October\'19'],
        [commonStart, anotherYear, Type.ShortDate, '02 Feb\'18-08 Oct\'19'],
        [commonStart, anotherYear, Type.FullDate, '02 February\'18-08 October\'19'],
        [commonStart, anotherYear, Type.ShortDate, '02 Feb\'18-08 Oct\'19'],
        [commonStart, anotherYear, Type.FullMonth, 'February\'18-October\'19'],
        [commonStart, anotherYear, Type.ShortMonth, 'Feb\'18-Oct\'19'],
        [commonStart, anotherYear, Type.FullQuarter, 'I quarter \'18-IV quarter \'19'],
        [commonStart, anotherYear, Type.ShortQuarter, 'I qtr \'18-IV qtr \'19'],
        [commonStart, anotherYear, Type.FullHalfYear, 'I half year \'18-II half year \'19'],
        [commonStart, anotherYear, Type.ShortHalfYear, 'I hy \'18-II hy \'19'],
        [commonStart, anotherYear, Type.Year, '2018-2019'],

        [commonStart, anotherMonth, Type.Digital, '02.02.18-08.10.18'],
        [commonStart, anotherMonth, Type.FullDate, '02 February\'18-08 October\'18'],
        [commonStart, anotherMonth, Type.ShortDate, '02 Feb-08 Oct\'18'],
        [commonStart, anotherMonth, Type.FullDate, '02 February\'18-08 October\'18'],
        [commonStart, anotherMonth, Type.ShortDate, '02 Feb-08 Oct\'18'],
        [commonStart, anotherMonth, Type.FullDate, '02 February\'18-08 October\'18'],
        [commonStart, anotherMonth, Type.ShortDate, '02 Feb-08 Oct\'18'],
        [commonStart, anotherMonth, Type.FullMonth, 'February-October\'18'],
        [commonStart, anotherMonth, Type.ShortMonth, 'Feb-Oct\'18'],
        [commonStart, anotherMonth, Type.FullQuarter, 'I quarter \'18-IV quarter \'18'],
        [commonStart, anotherMonth, Type.ShortQuarter, 'I qtr \'18-IV qtr \'18'],
        [commonStart, anotherMonth, Type.FullHalfYear, 'I half year \'18-II half year \'18'],
        [commonStart, anotherMonth, Type.ShortHalfYear, 'I hy \'18-II hy \'18'],

        [commonStart, anotherDay, Type.Digital, '02.02.18-07.02.18'],
        [commonStart, anotherDay, Type.FullDate, '02 February\'18-07 February\'18'],
        [commonStart, anotherDay, Type.ShortDate, '02-07 Feb\'18'],
        [commonStart, anotherDay, Type.FullDate, '02 February\'18-07 February\'18'],
        [commonStart, anotherDay, Type.ShortDate, '02-07 Feb\'18'],
        [commonStart, anotherDay, Type.FullDate, '02 February\'18-07 February\'18'],
        [commonStart, anotherDay, Type.ShortDate, '02-07 Feb\'18'],
        [commonStart, anotherDay, Type.FullMonth, 'February\'18'],
        [commonStart, anotherDay, Type.ShortMonth, 'Feb\'18'],
        [commonStart, anotherDay, Type.FullQuarter, 'I quarter \'18'],
        [commonStart, anotherDay, Type.ShortQuarter, 'I qtr \'18'],
        [commonStart, anotherDay, Type.FullHalfYear, 'I half year \'18'],
        [commonStart, anotherDay, Type.ShortHalfYear, 'I hy \'18']
    ];

    expectedList.forEach(([start, finish, type, expected], index) => {
        it(`should format period from '${start}' to '${finish}' with ${type} as '${expected}'} at ${index}`, () => {
            const given = period(start, finish, type);
            assert.strictEqual(given, expected);
        });
    });

    it('should throw TypeError for Auto type', () => {
        assert.throws(() => {
            period(new Date(), new Date(), Type.Auto);
        }, TypeError);
    });
});
