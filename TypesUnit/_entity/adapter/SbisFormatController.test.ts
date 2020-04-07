import {assert} from 'chai';
import * as sinon from 'sinon';
import SbisFormatController, {RecursiveIterator} from 'Types/_entity/adapter/SbisFormatController';

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

describe('Types/_entity/adapter/SbisFormatController', () => {
    let formatController: SbisFormatController;

    beforeEach(() => {
        formatController = new SbisFormatController(getRawData());
    });

    afterEach(() => {
        formatController = undefined;
    });

    describe('for native Iterator', () => {
        describe('._cache', () => {
            it('has id with value 0, but not 1', () => {
                formatController.getFormat(0);
                assert.deepEqual(format0, (formatController as any)._cache.get(0));
                assert.isFalse((formatController as any)._cache.has(1));
            });

            it('has all id', () => {
                assert.throws(() => {
                    formatController.getFormat();
                }, ReferenceError);
                assert.deepEqual(format0, (formatController as any)._cache.get(0));
                assert.deepEqual(format1, (formatController as any)._cache.get(1));
            });
        });

        it('.getFormat()', () => {
            assert.deepEqual(format0, formatController.getFormat(0));
            assert.deepEqual(format1, formatController.getFormat(1));
            assert.deepEqual(format1, formatController.getFormat(1));
            assert.throws(() => {
                formatController.getFormat(2);
            }, ReferenceError);
        });

        it('.scanFormats()', () => {
            formatController.scanFormats(getRawData());

            assert.isTrue((formatController as any)._cache.has(0));
            assert.deepEqual(format0, (formatController as any)._cache.get(0));

            assert.isTrue((formatController as any)._cache.has(1));
            assert.deepEqual(format1, (formatController as any)._cache.get(1));
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
                formatController.getFormat(0);
                assert.deepEqual(format0, (formatController as any)._cache.get(0));
                assert.isFalse((formatController as any)._cache.has(1));
            });

            it('has all id', () => {
                assert.throws(() => {
                    formatController.getFormat();
                }, ReferenceError);
                assert.deepEqual(format0, (formatController as any)._cache.get(0));
                assert.deepEqual(format1, (formatController as any)._cache.get(1));
            });
        });

        it('.getFormat()', () => {
            assert.deepEqual(format0, formatController.getFormat(0));
            assert.deepEqual(format1, formatController.getFormat(1));
            assert.deepEqual(format1, formatController.getFormat(1));
            assert.throws(() => {
                formatController.getFormat(2);
            }, ReferenceError);
        });

        it('.scanFormats()', () => {
            formatController.scanFormats(getRawData());

            assert.isTrue((formatController as any)._cache.has(0));
            assert.deepEqual(format0, (formatController as any)._cache.get(0));

            assert.isTrue((formatController as any)._cache.has(1));
            assert.deepEqual(format1, (formatController as any)._cache.get(1));
        });
    });
});
