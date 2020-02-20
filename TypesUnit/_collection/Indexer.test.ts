import {assert} from 'chai';
import Indexer from 'Types/_collection/Indexer';

interface IItem {
    id: number;
    name: string;
    gender: string;
}

describe('Types/_collection/Indexer', () => {
    let items: IItem[];
    let indexer: Indexer<IItem[]>;

    beforeEach(() => {
        items = [{
            id: 1,
            name: 'John',
            gender: 'm'
        }, {
            id: 2,
            name: 'Bill',
            gender: 'm'
        }, {
            id: 3,
            name: 'Eva',
            gender: 'f'
        }, {
            id: 4,
            name: 'Ken',
            gender: 'm'
        }];

        indexer = new Indexer(
            items,
            (arr) => arr.length,
            (arr, at) => arr[at],
            (item, property) => item[property]
        );
    });

    afterEach(() => {
        items = undefined;
    });

    describe('.getIndexByValue()', () => {
        it('should return item index for scalar', () => {
            for (let i = 0; i < items.length; i++) {
                assert.strictEqual(
                    i,
                    indexer.getIndexByValue('id', items[i].id)
                );
                assert.strictEqual(
                    i,
                    indexer.getIndexByValue('name', items[i].name)
                );
            }
        });

        it('should return item index for Array', () => {
            const items = [
                {id: [1]},
                {id: [2, 1]},
                {id: [3, 'a']},
                {id: [4]}
            ];

            const indexer = new Indexer(
                items,
                (arr) => arr.length,
                (arr, at) => arr[at],
                (item, property) => item[property]
            );

            for (let i = 0; i < items.length; i++) {
                assert.strictEqual(
                    i,
                    indexer.getIndexByValue('id', items[i].id)
                );
            }
        });

        it('should return -1 with not exists property', () => {
            assert.strictEqual(
                -1,
                indexer.getIndexByValue('some', 0)
            );
        });

        it('should return -1 for not a property name', () => {
            assert.strictEqual(indexer.getIndexByValue(undefined, undefined), -1);
            assert.strictEqual(indexer.getIndexByValue(null, undefined), -1);
            assert.strictEqual(indexer.getIndexByValue(false as unknown as string, undefined), -1);
            assert.strictEqual(indexer.getIndexByValue(0 as unknown as string, undefined), -1);
            assert.strictEqual(indexer.getIndexByValue('', undefined), -1);
        });

        it('should work fine with names from Object.prototype', () => {
            const items: any[] = [
                {constructor: 'a'},
                {hasOwnProperty: 1},
                {toString: false},
                {isPrototypeOf: null}
            ];

            const indexer = new Indexer(
                items,
                (arr) => arr.length,
                (arr, at) => arr[at],
                (item, property) => item[property]
            );

            for (let i = 0; i < items.length; i++) {
               for (const k in items[i]) {
                  if (Object.prototype.hasOwnProperty.call(items[i], k)) {
                     assert.strictEqual(
                         i,
                        indexer.getIndexByValue(k, items[i][k])
                     );
                  }
               }
            }
        });

        it('should work fine with values from Object.prototype', () => {
            const items = [
                {id: 'constructor'},
                {id: 'hasOwnProperty'},
                {id: 'toString'},
                {id: 'isPrototypeOf'}
            ];

            const indexer = new Indexer(
                items,
                (arr) => arr.length,
                (arr, at) => arr[at],
                (item, property) => item[property]
            );

            for (let i = 0; i < items.length; i++) {
                assert.strictEqual(
                    i,
                    indexer.getIndexByValue('id', items[i].id)
                );
            }
        });
    });

    describe('.getIndicesByValue()', () => {
        it('should return items indices with given property', () => {
            assert.deepEqual(
                [0],
                indexer.getIndicesByValue('id', 1)
            );
            assert.deepEqual(
                [0, 1, 3],
                indexer.getIndicesByValue('gender', 'm')
            );
            assert.deepEqual(
                [2],
                indexer.getIndicesByValue('gender', 'f')
            );
        });

        it('should return no indices with not exists property', () => {
            assert.strictEqual(
                0,
                indexer.getIndicesByValue('some', 0).length
            );
        });
    });

    describe('.resetIndex()', () => {
        it('should build equal indices', () => {
            const v1 = indexer.getIndicesByValue('id', 1);

            indexer.resetIndex();
            const v2 = indexer.getIndicesByValue('id', 1);

            assert.deepEqual(v1, v2);
        });
    });

    describe('.updateIndex()', () => {
        it('should update index', () => {
            const pos = 1;
            const oldV = items[pos].id;
            const newV = 100;

            assert.strictEqual(indexer.getIndexByValue('id', oldV), pos);

            items[pos].id = newV;
            indexer.updateIndex(pos, 1);

            assert.strictEqual(indexer.getIndexByValue('id', newV), pos);
        });

        it('should update index after partial remove', () => {
            const items = [
                {id: 1},
                {id: 1},
                {id: 1},
                {id: 1},
                {id: 1},
                {id: 1},
                {id: 1},
                {id: 1}
            ];

            const indexer = new Indexer(
                items,
                (arr) => arr.length,
                (arr, at) => arr[at],
                (item, property) => item[property]
            );

            assert.deepEqual(indexer.getIndicesByValue('id', 1), [0, 1, 2, 3, 4, 5, 6, 7]);

            const start = 4;
            const count = 2;
            indexer.removeFromIndex(start, count);
            indexer.updateIndex(start, count);

            assert.deepEqual(indexer.getIndicesByValue('id', 1), [0, 1, 2, 3, 4, 5, 6, 7]);
        });
    });

    describe('.shiftIndex()', () => {
        it('should shift indices', () => {
            const offset = 11;
            const start = 1;
            const count = 2;
            const oldIndices = indexer.getIndicesByValue('gender', 'm');
            const expect = oldIndices.map((index) => {
                return index >= start && index < start + count ? index + offset : index;
            });

            indexer.shiftIndex(start, count, offset);
            const newIndices = indexer.getIndicesByValue('gender', 'm');
            assert.deepEqual(newIndices, expect);
        });
    });

    describe('.removeFromIndex()', () => {
        it('should remove indices', () => {
            const indicesA = indexer.getIndicesByValue('id', 2);
            assert.equal(indicesA[0], 1);
            indexer.removeFromIndex(1, 1);
            assert.equal(indexer.getIndicesByValue('id', 1).length, 1);
            assert.equal(indexer.getIndicesByValue('id', 2).length, 0);
            assert.equal(indexer.getIndicesByValue('id', 3).length, 1);
            assert.equal(indexer.getIndicesByValue('id', 4).length, 1);

            const indicesB = indexer.getIndicesByValue('id', 1);
            assert.equal(indicesB[0], 0);
            indexer.removeFromIndex(0, 2);
            assert.equal(indexer.getIndicesByValue('id', 1).length, 0);
            assert.equal(indexer.getIndicesByValue('id', 2).length, 0);
            assert.equal(indexer.getIndicesByValue('id', 3).length, 1);
            assert.equal(indexer.getIndicesByValue('id', 4).length, 1);
        });
    });
});
