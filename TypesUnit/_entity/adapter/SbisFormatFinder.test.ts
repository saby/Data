import {assert} from 'chai';
import * as sinon from 'sinon';
import SbisFormatFinder, {RecursiveIterator} from 'Types/_entity/adapter/SbisFormatFinder';

const format0 = [{
    n: '@Родитель',
    t: 'Число целое'
}, {
    n: 'Имя',
    t: 'Строка'
}, {
    n: 'Дети',
    t: {
        n: 'Массив',
        t: 'Объект'
    }
}];

const format1 = [{
    n: '@Ребёнок',
    t: 'Число целое'
}, {
    n: 'Имя',
    t: 'Строка'
}];

function getRawData(): any {
    return {
        f: 0,
        s: format0.slice(),
        d: [
            0,
            'Пётр',
            [
                {
                    f: 1,
                    s: format1.slice(),
                    d: [
                        0,
                        'Вова'
                    ]
                },
                {
                    f: 1,
                    d: [
                        0,
                        'Оля'
                    ]
                }
            ]
        ]
    };
}

function getFullRawData(): any {
    return {
        s: format0.slice(),
        d: [
            0,
            'Пётр',
            [
                {
                    s: format1.slice(),
                    d: [
                        0,
                        'Вова'
                    ]
                },
                {
                    s: format1.slice(),
                    d: [
                        0,
                        'Оля'
                    ]
                }
            ]
        ]
    };
}

describe('Types/_entity/adapter/SbisFormatFinder', () => {
    let sbisFormatFinder: SbisFormatFinder;

    beforeEach(() => {
        sbisFormatFinder = new SbisFormatFinder(getRawData());
    });

    afterEach(() => {
        sbisFormatFinder = undefined;
    });

    describe('for native Iterator', () => {
        describe('._cache', () => {
            it('has id with value 0, but not 1', () => {
                sbisFormatFinder.getFormat(0);
                assert.deepEqual(format0, (sbisFormatFinder as any)._cache.get(0));
                assert.isFalse((sbisFormatFinder as any)._cache.has(1));
            });

            it('has all id', () => {
                assert.throws(() => {
                    sbisFormatFinder.getFormat();
                }, ReferenceError);
                assert.deepEqual(format0, (sbisFormatFinder as any)._cache.get(0));
                assert.deepEqual(format1, (sbisFormatFinder as any)._cache.get(1));
            });
        });

        it('.getFormat()', () => {
            assert.deepEqual(format0, sbisFormatFinder.getFormat(0));
            assert.deepEqual(format1, sbisFormatFinder.getFormat(1));
            assert.deepEqual(format1, sbisFormatFinder.getFormat(1));
            assert.throws(() => {
                sbisFormatFinder.getFormat(2);
            }, ReferenceError);
        });

        it('.scanFormats()', () => {
            sbisFormatFinder.scanFormats(getRawData());

            assert.isTrue((sbisFormatFinder as any)._cache.has(0));
            assert.deepEqual(format0, (sbisFormatFinder as any)._cache.get(0));

            assert.isTrue((sbisFormatFinder as any)._cache.has(1));
            assert.deepEqual(format1, (sbisFormatFinder as any)._cache.get(1));
        });
    });

    describe('for pseudo Iterator', () => {
        var stubDoesEnvSupportIterator;
        beforeEach(() => {
            stubDoesEnvSupportIterator = sinon.stub(RecursiveIterator, 'doesEnvSupportIterator');
            stubDoesEnvSupportIterator.returns(false);
        });

        afterEach(() => {
            stubDoesEnvSupportIterator.restore();
            stubDoesEnvSupportIterator = undefined;
        });

        describe('._cache', () => {
            it('has id with value 0, but not 1', () => {
                sbisFormatFinder.getFormat(0);
                assert.deepEqual(format0, (sbisFormatFinder as any)._cache.get(0));
                assert.isFalse((sbisFormatFinder as any)._cache.has(1));
            });

            it('has all id', () => {
                assert.throws(() => {
                    sbisFormatFinder.getFormat();
                }, ReferenceError);
                assert.deepEqual(format0, (sbisFormatFinder as any)._cache.get(0));
                assert.deepEqual(format1, (sbisFormatFinder as any)._cache.get(1));
            });
        });

        it('.getFormat()', () => {
            assert.deepEqual(format0, sbisFormatFinder.getFormat(0));
            assert.deepEqual(format1, sbisFormatFinder.getFormat(1));
            assert.deepEqual(format1, sbisFormatFinder.getFormat(1));
            assert.throws(() => {
                sbisFormatFinder.getFormat(2);
            }, ReferenceError);
        });

        it('.scanFormats()', () => {
            sbisFormatFinder.scanFormats(getRawData());

            assert.isTrue((sbisFormatFinder as any)._cache.has(0));
            assert.deepEqual(format0, (sbisFormatFinder as any)._cache.get(0));

            assert.isTrue((sbisFormatFinder as any)._cache.has(1));
            assert.deepEqual(format1, (sbisFormatFinder as any)._cache.get(1));
        });
    });

    it('::recoverData()', () => {
        const data = getRawData();

        assert.deepEqual(getFullRawData(), SbisFormatFinder.recoverData(data));
    });
});
