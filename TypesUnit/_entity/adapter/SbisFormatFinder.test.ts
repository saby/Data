import {assert} from 'chai';
import SbisFormatFinder from 'Types/_entity/adapter/SbisFormatFinder';

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

const rawData = {
    f: 0,
    s: format0,
    d: [
        0,
        'Пётр',
        [
            {
                f: 1,
                s: format1,
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

describe('Types/_entity/format/FormatController', () => {
    let sbisFormatFinder: SbisFormatFinder;

    beforeEach(() => {
        sbisFormatFinder = new SbisFormatFinder(rawData);
    });

    afterEach(() => {
        sbisFormatFinder = undefined;
    });

    describe('cache', () => {
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
        sbisFormatFinder.scanFormats(rawData);

        assert.isTrue((sbisFormatFinder as any)._cache.has(0));
        assert.deepEqual(format0, (sbisFormatFinder as any)._cache.get(0));

        assert.isTrue((sbisFormatFinder as any)._cache.has(1));
        assert.deepEqual(format1, (sbisFormatFinder as any)._cache.get(1));
    });
});
