import {assert} from 'chai';
import ObservableList from 'Types/_collection/ObservableList';
import List from 'Types/_collection/List';
import IBindCollection from 'Types/_collection/IObservable';
import Record from 'Types/_entity/Record';
import 'Types/_entity/adapter/Json';

describe('Types/_collection/ObservableList', () => {
    function checkEvent(
        action: any,
        newItems: any,
        newItemsIndex: any,
        oldItems: any,
        oldItemsIndex: any,
        actionOriginal: any,
        newItemsOriginal: any,
        newItemsIndexOriginal: any,
        oldItemsOriginal: any,
        oldItemsIndexOriginal: any
    ): void {
        if (action !== actionOriginal) {
            throw new Error('Invalid action');
        }

        for (let i = 0; i < newItems.length; i++) {
            if (newItems[i] !== newItemsOriginal[i]) {
                throw new Error('Invalid newItems');
            }
        }
        if (newItemsIndex !== newItemsIndexOriginal) {
            throw new Error('Invalid newItemsIndex');
        }

        for (let i = 0; i < oldItems.length; i++) {
            if (oldItems[i] !== oldItemsOriginal[i]) {
                throw new Error('Invalid oldItems');
            }
        }
        if (oldItemsIndex !== oldItemsIndexOriginal) {
            throw new Error('Invalid oldItemsIndex');
        }
    }

    interface IData {
        id: number | string;
        lastName?: string;
    }

    let items: IData[];

    beforeEach(() => {
        items = [{
            id: 1,
            lastName: 'One'
        }, {
            id: 2,
            lastName: 'Two'
        }, {
            id: 3,
            lastName: 'Three'
        }, {
            id: 4,
            lastName: 'Four'
        }, {
            id: 5,
            lastName: 'Five'
        }, {
            id: 6,
            lastName: 'Six'
        }, {
            id: 7,
            lastName: 'Seven'
        }];
    });

    afterEach(() => {
        items = undefined;
    });

    describe('.append()', () => {
        it('should trigger onCollectionChange with valid arguments', (done) => {
            const list = new ObservableList({
                items: items.slice()
            });
            const concatItems = [1, 2, 3];
            const handler = (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) => {
                try {
                    checkEvent(
                        action,
                        newItems,
                        newItemsIndex,
                        oldItems,
                        oldItemsIndex,
                        IBindCollection.ACTION_ADD,
                        concatItems,
                        items.length,
                        [],
                        0
                    );
                    done();
                } catch (err) {
                    done(err);
                }
            };
            list.subscribe('onCollectionChange', handler);

            list.append(new List<any>({
                items: concatItems
            }));

            list.unsubscribe('onCollectionChange', handler);
            list.destroy();
        });
    });

    describe('.prepend', () => {
        it('should trigger onCollectionChange with valid arguments', (done) => {
            const list = new ObservableList({
                items: items.slice()
            });
            const concatItems = [4, 5, 6];
            const handler = (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) => {
                try {
                    checkEvent(
                        action, newItems, newItemsIndex, oldItems, oldItemsIndex,
                        IBindCollection.ACTION_ADD, concatItems, 0, [], 0
                    );
                    done();
                } catch (err) {
                    done(err);
                }
            };

            list.subscribe('onCollectionChange', handler);

            list.prepend(new List<any>({
                items: concatItems
            }));

            list.unsubscribe('onCollectionChange', handler);
            list.destroy();
        });
    });

    describe('.assign()', () => {
        it('should trigger onCollectionChange with valid arguments', (done) => {
            const list = new ObservableList({
                items: items.slice()
            });
            const fillItems = ['a', 'b'];
            const handler = (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) => {
                try {
                    checkEvent(
                        action, newItems, newItemsIndex, oldItems, oldItemsIndex,
                        IBindCollection.ACTION_RESET, fillItems, 0, items, 0
                    );
                    done();
                } catch (err) {
                    done(err);
                }
            };

            list.subscribe('onCollectionChange', handler);

            list.assign(new List<any>({
                items: fillItems
            }));

            list.unsubscribe('onCollectionChange', handler);
            list.destroy();
        });

        it('should trigger onCollectionItemChange with changed item after several assigns', (done) => {
            const list = new ObservableList<Record>();
            const items = [new Record(), new Record(), new Record()];
            let firesToBeDone = 3;
            const handler = () => {
                firesToBeDone--;
                if (firesToBeDone === 0) {
                    done();
                }
            };
            list.subscribe('onCollectionItemChange', handler);
            list.assign(items);
            list.at(1).set('a', 1);
            list.assign(items);
            list.at(1).set('a', 2);
            list.assign(items);
            list.at(1).set('a', 3);
            list.unsubscribe('onCollectionItemChange', handler);
            list.destroy();
        });

        it('shouldn\'t trigger onCollectionChange if empty replaced with empty', () => {
            const list = new ObservableList();
            let triggered = false;
            const handler = () => {
                triggered = true;
            };

            list.subscribe('onCollectionChange', handler);
            list.assign(new List());
            list.unsubscribe('onCollectionChange', handler);

            assert.isFalse(triggered);
        });

        it('should throw an error on attempt to change instance within onCollectionChange handler', () => {
            const list = new ObservableList();
            let triggered = false;
            const handler = () => {
                assert.throws(() => {
                    list.add(2);
                }, 'blocked from changes');
                triggered = true;
            };
            list.subscribe('onCollectionChange', handler);
            list.assign([1]);
            list.unsubscribe('onCollectionChange', handler);
            list.destroy();

            assert.isTrue(triggered);
        });
    });

    describe('.clear()', () => {
        it('should trigger onCollectionChange with valid arguments', (done) => {
            const list = new ObservableList({
                items: items.slice()
            });
            const handler = (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) => {
                try {
                    checkEvent(
                        action, newItems, newItemsIndex, oldItems, oldItemsIndex,
                        IBindCollection.ACTION_RESET, [], 0, items, 0
                    );
                    done();
                } catch (err) {
                    done(err);
                }
            };

            list.subscribe('onCollectionChange', handler);

            list.clear();

            list.unsubscribe('onCollectionChange', handler);
            list.destroy();
        });
    });

    describe('.add()', () => {
        context('when append', () => {
            it('should trigger onCollectionChange with valid arguments', (done) => {
                const list = new ObservableList({
                    items: items.slice()
                });
                let andDone = false;
                let addIndex = items.length;
                let addItem;
                const handler = (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) => {
                    try {
                        checkEvent(
                            action, newItems, newItemsIndex, oldItems, oldItemsIndex,
                            IBindCollection.ACTION_ADD, [addItem], addIndex, [], 0
                        );
                        if (andDone) {
                            done();
                        }
                    } catch (err) {
                        done(err);
                    }
                };

                list.subscribe('onCollectionChange', handler);

                addItem = {a: 1};
                list.add(addItem);

                addItem = {a: 2};
                addIndex++;
                list.add(addItem);

                andDone = true;
                addItem = {a: 3};
                addIndex++;
                list.add(addItem);

                list.unsubscribe('onCollectionChange', handler);
                list.destroy();
            });
        });

        context('when prepend', () => {
            it('should trigger onCollectionChange with valid arguments', (done) => {
                const list = new ObservableList({
                    items: items.slice()
                });
                let andDone = false;
                let addItem;
                const handler = (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) => {
                    try {
                        checkEvent(
                            action, newItems, newItemsIndex, oldItems, oldItemsIndex,
                            IBindCollection.ACTION_ADD, [addItem], 0, [], 0
                        );
                        if (andDone) {
                            done();
                        }
                    } catch (err) {
                        done(err);
                    }
                };

                list.subscribe('onCollectionChange', handler);

                addItem = {b: 1};
                list.add(addItem, 0);

                addItem = {b: 2};
                list.add(addItem, 0);

                andDone = true;
                addItem = {b: 3};
                list.add(addItem, 0);

                list.unsubscribe('onCollectionChange', handler);
                list.destroy();
            });
        });

        context('when insert', () => {
            it('should trigger onCollectionChange with valid arguments', (done) => {
                const list = new ObservableList({
                    items: items.slice()
                });
                let andDone = false;
                let addItem;
                let at;
                const handler = (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) => {
                    try {
                        checkEvent(
                            action, newItems, newItemsIndex, oldItems, oldItemsIndex,
                            IBindCollection.ACTION_ADD, [addItem], at, [], 0
                        );
                        if (andDone) {
                            done();
                        }
                    } catch (err) {
                        done(err);
                    }
                };

                list.subscribe('onCollectionChange', handler);

                addItem = {c: 1};
                at = 5;
                list.add(addItem, at);
                list.add(addItem, at);

                addItem = {c: 2};
                at = 4;
                list.add(addItem, at);

                andDone = true;
                addItem = {c: 3};
                at = 1;
                list.add(addItem, at);

                list.unsubscribe('onCollectionChange', handler);
                list.destroy();
            });
        });
    });

    describe('.removeAt()', () => {
        it('should trigger onCollectionChange with valid arguments', (done) => {
            const list = new ObservableList({items});
            let andDone = false;
            let oldItem;
            let at;
            const handler = (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) => {
                try {
                    checkEvent(
                        action, newItems, newItemsIndex, oldItems, oldItemsIndex,
                        IBindCollection.ACTION_REMOVE, [], 0, [oldItem], at
                    );
                    if (andDone) {
                        done();
                    }
                } catch (err) {
                    done(err);
                }
            };

            list.subscribe('onCollectionChange', handler);

            at = 1;
            oldItem = list.at(at);
            list.removeAt(at);

            at = 1;
            oldItem = list.at(at);
            list.removeAt(at);

            andDone = true;
            at = 3;
            oldItem = list.at(at);
            list.removeAt(at);

            list.unsubscribe('onCollectionChange', handler);
            list.destroy();
        });

        it("shouldn't trigger onCollectionChange with change item", (done) => {
            const list = new ObservableList({
                items: []
            });
            const addItem = new Record({
                rawData: {foo: 'fail'}
            });
            const handler = () => {
                done();
            };

            list.add(addItem);
            list.removeAt(0);
            list.subscribe('onCollectionChange', handler);
            addItem.set('foo', 'ok');
            list.unsubscribe('onCollectionChange', handler);
            list.destroy();
            done();
        });

        it('should trigger onCollectionChange with change item and list had changed yet', (done) => {
            const list = new ObservableList({items});
            let at;
            const handler = (event, action, newItems, newItemsIndex, oldItems) => {
                if (list.getIndex(oldItems[0]) === -1) {
                    done();
                }
            };

            list.subscribe('onCollectionChange', handler);

            at = 1;
            list.removeAt(at);
        });

    });

    describe('.replace()', () => {
        it('should trigger onCollectionChange with valid arguments', (done) => {
            const list = new ObservableList({
                items: items.slice()
            });
            let andDone = false;
            let oldItem;
            let newItem;
            let at;
            const handler = (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) => {
                try {
                    checkEvent(
                        action, newItems, newItemsIndex, oldItems, oldItemsIndex,
                        IBindCollection.ACTION_REPLACE, [newItem], at, [oldItem], at
                    );
                    if (andDone) {
                        done();
                    }
                } catch (err) {
                    done(err);
                }
            };

            list.subscribe('onCollectionChange', handler);

            at = 1;
            oldItem = list.at(at);
            newItem = {d: 1};
            list.replace(newItem, at);

            at = 5;
            oldItem = list.at(at);
            newItem = {d: 2};
            list.replace(newItem, at);

            andDone = true;
            at = 3;
            oldItem = list.at(at);
            newItem = {d: 3};
            list.replace(newItem, at);

            list.unsubscribe('onCollectionChange', handler);
            list.destroy();
        });

        it('should don\'t trigger onCollectionChange if replace with itself', () => {
            const list = new ObservableList({
                items: items.slice()
            });
            let fireCount = 0;
            const handler = () => {
                fireCount++;
            };

            list.subscribe('onCollectionChange', handler);
            list.each((item, at) => {
                list.replace(item, at);
            });
            list.unsubscribe('onCollectionChange', handler);
            list.destroy();

            assert.strictEqual(fireCount, 0);
        });
    });

    describe('.move()', () => {
        it('should trigger onCollectionChange with valid arguments', (done) => {
            const list = new ObservableList({
                items: items.slice()
            });
            let andDone = false;
            let oldItem;
            let newItem;
            let from;
            let to;
            const handler = (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) => {
                try {
                    checkEvent(
                        action, newItems, newItemsIndex, oldItems, oldItemsIndex,
                        IBindCollection.ACTION_MOVE, [newItem], to, [oldItem], from
                    );
                    if (andDone) {
                        done();
                    }
                } catch (err) {
                    done(err);
                }
            };

            list.subscribe('onCollectionChange', handler);

            from = 0;
            to = 1;
            newItem = oldItem = list.at(from);
            list.move(from, to);

            andDone = true;
            from = 2;
            to = 0;
            newItem = oldItem = list.at(from);
            list.move(from, to);

            list.unsubscribe('onCollectionChange', handler);
            list.destroy();
        });

        it('should don\'t trigger onCollectionChange for equal positions', () => {
            const list = new ObservableList({
                items: items.slice()
            });
            let fireCount = 0;
            const handler = () => {
                fireCount++;
            };

            list.subscribe('onCollectionChange', handler);
            list.move(0, 0);
            list.unsubscribe('onCollectionChange', handler);
            list.destroy();

            assert.strictEqual(fireCount, 0);
        });
    });

    describe('.getIndexByValue', () => {
        it('should update index after change item property', () => {
            const item = new Record({
                rawData: {checked: false}
            });
            const list = new ObservableList({
                items: [item]
            });

            assert.strictEqual(
                list.getIndexByValue('checked', false),
                0
            );
            assert.strictEqual(
                list.getIndexByValue('checked', true),
                -1
            );

            item.set('checked', true);
            assert.strictEqual(
                list.getIndexByValue('checked', false),
                -1
            );
            assert.strictEqual(
                list.getIndexByValue('checked', true),
                0
            );

            item.set('checked', false);
            assert.strictEqual(
                list.getIndexByValue('checked', false),
                0
            );
            assert.strictEqual(
                list.getIndexByValue('checked', true),
                -1
            );
        });
    });

    describe('.setEventRaising()', () => {
        it('should enable and disable onCollectionItemChange', () => {
            let fired;
            const list = new ObservableList({
                items: items.slice()
            });
            const handler = () => {
                fired = true;
            };

            list.subscribe('onCollectionItemChange', handler);

            fired = false;
            list.setEventRaising(true);
            list.at(0).id = 999;
            (list as any)._notifyItemChange(list.at(0), {id: 999});
            assert.isTrue(fired);

            fired = false;
            list.setEventRaising(false);
            list.at(0).id = 777;
            (list as any)._notifyItemChange(list.at(0), {id: 777});
            assert.isFalse(fired);

            list.unsubscribe('onCollectionItemChange', handler);
        });

        it('should enable and disable onCollectionChange', () => {
            let fired;
            const list = new ObservableList({
                items: items.slice()
            });
            const handler = () => {
                fired = true;
            };

            list.subscribe('onCollectionChange', handler);

            fired = false;
            list.setEventRaising(true);
            list.add({id: 'testA'});
            assert.isTrue(fired);

            fired = false;
            list.setEventRaising(false);
            list.add({id: 'testB'});
            assert.isFalse(fired);

            list.unsubscribe('onCollectionChange', handler);
        });

        it('should trigger ACTION_ADD after restore if "analize" is true and one item added', () => {
            const list = new ObservableList({
                items: items.slice()
            });
            const args: any = {};
            let fired = false;
            const handler = (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) => {
                fired = true;
                args.action = action;
                args.newItems = newItems;
                args.newItemsIndex = newItemsIndex;
                args.oldItems = oldItems;
                args.oldItemsIndex = oldItemsIndex;
            };

            list.subscribe('onCollectionChange', handler);
            list.setEventRaising(false, true);
            list.add({id: 'testA'});

            assert.isFalse(fired);

            list.setEventRaising(true, true);
            list.unsubscribe('onCollectionChange', handler);

            assert.isTrue(fired);
            assert.strictEqual(args.action, IBindCollection.ACTION_ADD);
            assert.strictEqual(args.newItems[0].id, 'testA');
            assert.strictEqual(args.newItemsIndex, list.getCount() - 1);
            assert.strictEqual(args.oldItems.length, 0);
            assert.strictEqual(args.oldItemsIndex, 0);
        });

        it('should trigger onCollectionChange with ACTION_CHANGE if "analize" is true and some item changed', () => {
            const items = [new Record(), new Record(), new Record()];
            const list = new ObservableList({items});
            const args: any = {};
            let fired = false;
            let item;
            const handler = (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) => {
                fired = true;
                args.action = action;
                args.newItems = newItems;
                args.newItemsIndex = newItemsIndex;
                args.oldItems = oldItems;
                args.oldItemsIndex = oldItemsIndex;
            };

            list.subscribe('onCollectionChange', handler);
            list.setEventRaising(false, true);
            item = list.at(1);
            item.set('testP', 'testV');

            assert.isFalse(fired);

            list.setEventRaising(true, true);
            list.unsubscribe('onCollectionChange', handler);

            assert.isTrue(fired);
            assert.strictEqual(args.action, IBindCollection.ACTION_CHANGE);
            assert.strictEqual(args.newItems[0], item);
            assert.strictEqual(args.newItemsIndex, 1);
            assert.strictEqual(args.oldItems[0], item);
            assert.strictEqual(args.oldItemsIndex, 1);
        });

        it('should trigger onCollectionChange with ACTION_CHANGE if "analize" is true and a few items changed', () => {
            const items = [new Record(), new Record(), new Record(), new Record(), new Record()];
            const list = new ObservableList({items});
            const packs = [[0], [2, 3]];
            const args = [];
            const handler = (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) => {
                args.push({action, newItems, newItemsIndex, oldItems, oldItemsIndex});
            };

            list.subscribe('onCollectionChange', handler);
            list.setEventRaising(false, true);
            for (let i = 0; i < packs.length; i++) {
                const pack = packs[i];
                for (let j = 0; j < pack.length; j++) {
                    list.at(pack[j]).set('testP', 'testV');
                }
            }

            assert.isTrue(args.length === 0);

            list.setEventRaising(true, true);
            list.unsubscribe('onCollectionChange', handler);

            assert.isTrue(args.length === 2);
            for (let i = 0; i < packs.length; i++) {
                const pack = packs[i].map((index) => items[index]);
                const arg = args[i];

                assert.strictEqual(arg.action, IBindCollection.ACTION_CHANGE);
                assert.deepEqual(arg.newItems, pack);
                assert.strictEqual(arg.newItemsIndex, packs[i][0]);
                assert.deepEqual(arg.oldItems, pack);
                assert.strictEqual(arg.oldItemsIndex, packs[i][0]);
            }
        });

        it('should trigger CollectionChange with ACTION_RESET if "analize" is true and a lot of items changed', () => {
            const items = [new Record(), new Record(), new Record()];
            const list = new ObservableList({
                items
            });
            const args: any = {};
            let fired = false;
            const handler = (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) => {
                fired = true;
                args.action = action;
                args.newItems = newItems;
                args.newItemsIndex = newItemsIndex;
                args.oldItems = oldItems;
                args.oldItemsIndex = oldItemsIndex;
            };

            list.subscribe('onCollectionChange', handler);
            list.setEventRaising(false, true);

            list.each((item, i) => {
                item.set('foo', i);
            });

            assert.isFalse(fired);

            list.setEventRaising(true, true);
            list.unsubscribe('onCollectionChange', handler);

            const listItems = [];
            list.each((item) => {
                listItems.push(item);
            });

            assert.isTrue(fired);
            assert.strictEqual(args.action, IBindCollection.ACTION_RESET);
            assert.deepEqual(args.newItems, listItems);
            assert.strictEqual(args.newItemsIndex, 0);
            assert.deepEqual(args.oldItems, []);
            assert.strictEqual(args.oldItemsIndex, 0);
        });

        it('should fire after wake up', () => {
            const list = new ObservableList({
                items: items.slice()
            });
            const addItem = {id: 'Test'};
            const given = [];
            const expect = [{
                action: IBindCollection.ACTION_MOVE,
                newItems: [list.at(1)],
                newItemsIndex: 0,
                oldItems: [list.at(1)],
                oldItemsIndex: 1
            }, {
                action: IBindCollection.ACTION_REMOVE,
                newItems: [],
                newItemsIndex: 0,
                oldItems: [list.at(2)],
                oldItemsIndex: 2
            }, {
                action: IBindCollection.ACTION_ADD,
                newItems: [addItem],
                newItemsIndex: 1,
                oldItems: [],
                oldItemsIndex: 0
            }];
            const handler = (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) => {
                given.push({action, newItems, newItemsIndex, oldItems, oldItemsIndex});
            };

            list.subscribe('onCollectionChange', handler);

            list.setEventRaising(false, true);
            const item = list.removeAt(0);
            list.add(item, 1);
            list.setEventRaising(true, true);

            list.setEventRaising(false, true);
            list.removeAt(2);
            list.setEventRaising(true, true);

            list.setEventRaising(false, true);
            list.add(addItem, 1);
            list.setEventRaising(true, true);

            list.unsubscribe('onCollectionChange', handler);

            assert.strictEqual(expect.length, given.length);
            for (let i = 0; i < given.length; i++) {
                assert.strictEqual(given[i].action, expect[i].action, 'at change #' + i);

                assert.strictEqual(given[i].newItems.length, expect[i].newItems.length, 'at change #' + i);
                assert.strictEqual(given[i].newItemsIndex, expect[i].newItemsIndex, 'at change #' + i);
                for (let j = 0; j < given[i].newItems.length; j++) {
                    assert.strictEqual(given[i].newItems[j], expect[i].newItems[j], 'at change #' + i);
                }

                assert.strictEqual(given[i].oldItems.length, expect[i].oldItems.length, 'at change #' + i);
                assert.strictEqual(given[i].oldItemsIndex, expect[i].oldItemsIndex, 'at change #' + i);
                for (let j = 0; j < given[i].oldItems.length; j++) {
                    assert.strictEqual(given[i].oldItems[j], expect[i].oldItems[j], 'at change #' + i);
                }
            }
        });

        it('should throw an error if enabled not changed and anailze=true', () => {
            const list = new ObservableList();

            list.setEventRaising(false, true);
            assert.throws(() => {
                list.setEventRaising(false, true);
            });

            list.setEventRaising(true, true);
            assert.throws(() => {
                list.setEventRaising(true, true);
            });
        });

        it('should generate move action if item has been removed and added in one transaction', () => {
            const list = new ObservableList({
                items: [{a: 1}, {b: 2}, {c: 3}, {d: 4}]
            });
            const item = list.at(0);
            const given = [];
            const expect = [{
                action: IBindCollection.ACTION_MOVE,
                newItems: [list.at(1), list.at(2)],
                newItemsIndex: 0,
                oldItems: [list.at(1), list.at(2)],
                oldItemsIndex: 1,
                groupId: 1
            }];
            const handler = (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) => {
                given.push({action, newItems, newItemsIndex, oldItems, oldItemsIndex});
            };

            list.setEventRaising(false, true);
            list.remove(item);
            list.add(item, 2);
            list.subscribe('onCollectionChange', handler);
            list.setEventRaising(true, true);
            list.unsubscribe('onCollectionChange', handler);

            assert.strictEqual(expect.length, given.length);
            for (let i = 0; i < given.length; i++) {
                assert.strictEqual(given[i].action, expect[i].action, `at change #${i}`);

                assert.strictEqual(given[i].newItems.length, expect[i].newItems.length, `at change #${i}`);
                assert.strictEqual(given[i].newItemsIndex, expect[i].newItemsIndex, `at change #${i}`);
                for (let j = 0; j < given[i].newItems.length; j++) {
                    assert.strictEqual(given[i].newItems[j], expect[i].newItems[j], `newItems[${j}] at change #${i}`);
                }

                assert.strictEqual(given[i].oldItems.length, expect[i].oldItems.length, `at change #${i}`);
                assert.strictEqual(given[i].oldItemsIndex, expect[i].oldItemsIndex, `at change #${i}`);
                for (let j = 0; j < given[i].oldItems.length; j++) {
                    assert.strictEqual(given[i].oldItems[j], expect[i].oldItems[j], `oldItems[${j}] at change #${i}`);
                }
            }
        });
    });

    describe('.isEventRaising()', () => {
        it('should return true by default', () => {
            const list = new ObservableList();
            assert.isTrue(list.isEventRaising());
        });

        it('should return true if enabled', () => {
            const list = new ObservableList();
            list.setEventRaising(true);
            assert.isTrue(list.isEventRaising());
        });

        it('should return false if disabled', () => {
            const list = new ObservableList();
            list.setEventRaising(false);
            assert.isFalse(list.isEventRaising());
        });
    });

    describe('.subscribe()', () => {
        it('should trigger "onCollectionItemChange" if property changed', () => {
            const item = new Record({
                rawData: {foo: 'fail'}
            });
            const list = new ObservableList({
                items: [item]
            });
            const given: any = {};
            const handler = (event, item, index, props) => {
                given.item = item;
                given.index = index;
                given.props = props;
            };

            list.subscribe('onCollectionItemChange', handler);
            item.set('foo', 'ok');
            list.unsubscribe('onCollectionItemChange', handler);

            assert.strictEqual(given.item, item);
            assert.strictEqual(given.index, 0);
            assert.deepEqual(given.props, {foo: 'ok'});
        });

        it('should trigger "onCollectionItemChange" if Flags property changed', () => {
            const item = new Record({
                rawData: {foo: [false]},
                format: {
                    foo: {type: 'flags', dictionary: ['one']}
                }
            });
            const list = new ObservableList({
                items: [item]
            });
            const given: any = {};
            const handler = (event, item, index, props) => {
                given.item = item;
                given.index = index;
                given.props = props;
            };
            const foo = item.get('foo');

            list.subscribe('onCollectionItemChange', handler);
            foo.set('one', true);
            list.unsubscribe('onCollectionItemChange', handler);

            assert.strictEqual(given.item, item);
            assert.strictEqual(given.index, 0);
            assert.deepEqual(given.props, {foo});
        });

        it('should trigger "onCollectionItemChange" if Enum property changed', () => {
            const item = new Record({
                rawData: {foo: 0},
                format: {
                    foo: {type: 'enum', dictionary: ['one', 'two']}
                }
            });
            const list = new ObservableList({
                items: [item]
            });
            const given: any = {};
            const handler = (event, item, index, props) => {
                given.item = item;
                given.index = index;
                given.props = props;
            };
            const foo = item.get('foo');

            list.subscribe('onCollectionItemChange', handler);
            foo.set(1);
            list.unsubscribe('onCollectionItemChange', handler);

            assert.strictEqual(given.item, item);
            assert.strictEqual(given.index, 0);
            assert.deepEqual(given.props, {foo});
        });

        it('should trigger "onCollectionItemChange" if relation changed', () => {
            const item = new Record({
                rawData: {foo: 'fail'}
            });
            const list = new ObservableList({
                items: [item]
            });
            const given: any = {};
            const handler = (event, item, index, props) => {
                given.item = item;
                given.index = index;
                given.props = props;
            };

            list.subscribe('onCollectionItemChange', handler);
            list.relationChanged({target: item}, []);
            list.unsubscribe('onCollectionItemChange', handler);

            assert.strictEqual(given.item, item);
            assert.strictEqual(given.index, 0);
            assert.instanceOf(given.props, Object);
        });

        it('should trigger "onEventRaisingChange"', () => {
            const list = new ObservableList();
            let data;
            const handler = (event, enabled, analyze) => {
                data = {enabled, analyze};
            };

            list.subscribe('onEventRaisingChange', handler);

            list.setEventRaising(false);
            assert.strictEqual(data.enabled, false);
            assert.strictEqual(data.analyze, false);

            list.setEventRaising(true);
            assert.strictEqual(data.enabled, true);
            assert.strictEqual(data.analyze, false);

            list.setEventRaising(false, true);
            assert.strictEqual(data.enabled, false);
            assert.strictEqual(data.analyze, true);

            list.setEventRaising(true, true);
            assert.strictEqual(data.enabled, true);
            assert.strictEqual(data.analyze, true);

            list.unsubscribe('onEventRaisingChange', handler);
        });
    });
});
