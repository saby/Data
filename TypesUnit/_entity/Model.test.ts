import {assert} from 'chai';
import * as sinon from 'sinon';
import Model, {IProperty} from 'Types/_entity/Model';
import Compute from 'Types/_entity/functor/Compute';
import Track from 'Types/_entity/functor/Track';
import SbisAdapter from 'Types/_entity/adapter/Sbis';
import RecordSet from 'Types/_collection/RecordSet';
import {IHashMap} from 'Types/_declarations';
import {extend} from 'Core/core-extend';

interface IData {
    max: number;
    calc: number;
    calcRead: number;
    calcWrite: number;
    title: string;
    id: number;
}

interface IProperties extends IHashMap<IProperty> {
    calc: IProperty;
    calcRead: IProperty;
    calcWrite: IProperty;
    title: IProperty;
    sqMax: IProperty;
    internal: IProperty;
    date: IProperty;
}

interface IFooModel extends Model {
    _foo: string;
}

interface IBarModel extends Model {
    _bar: string;
}

function getModelData(): IData {
    return {
        max: 10,
        calc: 5,
        calcRead: 5,
        calcWrite: 5,
        title: 'A',
        id: 1
    };
}

function getModelProperties(sqMaxVal: number = 33): IProperties {
    interface ITesteeModel extends Model {
        _internal: string;
    }

    return {
        calc: {
            def: 1,
            get: (value) => 10 * value,
            set: (value) => value / 10
        },
        calcRead: {
            def: 2,
            get: (value) => 10 * value
        },
        calcWrite: {
            def: 3,
            set: (value) => value / 10
        },
        title: {
            def: 4,
            get: (value) => value + ' B'
        },
        sqMax: {
            def: () => sqMaxVal++,
            get(): number {
                return this.get('max') * this.get('max');
            }
        },
        internal: {
            get(this: ITesteeModel): string {
                return this.hasOwnProperty('_internal') ? this._internal : 'internalDefault';
            },
            set(this: ITesteeModel, value: string): void {
                this._internal = value;
            }
        },
        date: {
            get: () => new Date()
        }
    };
}

function getModel(modelData?: IData, modelProperties?: IProperties): Model {
    return new Model({
        keyProperty: 'id',
        rawData: modelData || getModelData(),
        properties: modelProperties || getModelProperties()
    });
}

describe('Types/_entity/Model', () => {
    let model: Model;
    let modelData: IData;
    let modelProperties;

    beforeEach(() => {
        modelData = getModelData();
        modelProperties = getModelProperties();
        model = getModel(modelData, modelProperties);
    });

    afterEach(() => {
        modelData = undefined;
        modelProperties = undefined;
        model = undefined;
    });

    describe('.constructor', () => {
        it('should set instance state via constructor', () => {
            const model = new Model({
                instanceState: {
                    _foo: 'bar'
                },
                properties: {
                    foo: {
                        get(this: IFooModel): string {
                            return this._foo;
                        }
                    }
                }
            });

            assert.equal(model.get('foo'), 'bar');
        });
    });

    describe('.get()', () => {
        it('should return a data value', () => {
            assert.strictEqual(model.get('max'), modelData.max);
            assert.strictEqual(model.get('id'), modelData.id);
        });

        it('should return a calculated value', () => {
            assert.strictEqual(model.get('calc'), modelData.calc * 10);
            assert.strictEqual(model.get('calcRead'), modelData.calc * 10);
            assert.strictEqual(model.get('calcWrite'), modelData.calc);
            assert.strictEqual(model.get('title'), 'A B');
            assert.strictEqual(model.get('sqMax'), modelData.max * modelData.max);
        });

        it('should return the property value', () => {
            assert.strictEqual(model.get('internal'), 'internalDefault');
        });

        it('should return cached property value', () => {
            const values = [1, 2, 3];
            const model = new Model({
                cacheMode: (Model as any).CACHE_MODE_ALL,
                properties: {
                    foo: {
                        get: () => values.pop()
                    }
                }
            });

            assert.strictEqual(model.get('foo'), 3);
            assert.strictEqual(values.length, 2);
            assert.strictEqual(model.get('foo'), 3);
            assert.strictEqual(values.length, 2);
        });

        it('should return a single instance for Object', () => {
            const value = model.get('date');
            assert.instanceOf(value, Date);
            assert.strictEqual(model.get('date'), value);
            assert.strictEqual(model.get('date'), value);
        });

        it('should prevent caching for overridden property', () => {
            const model = new Model({
                rawData: {
                    test: {a: 1}
                },
                properties: {
                    test: {
                        get: () => 2
                    }
                }
            });
            assert.strictEqual(model.get('test'), 2);
            assert.strictEqual(model.get('test'), 2);
        });

        it('should return cached value inside a getter and then able to reset it', () => {
            let cached;
            const model = new Model({
                rawData: {
                    foo: {bar: 'bar'}
                },
                properties: {
                    foo: {
                        get(value: string): string {
                            cached = this.get('foo');
                            return value;
                        },
                        set: (value) => value
                    }
                }
            });

            const foo = model.get('foo');
            assert.strictEqual(foo.bar, 'bar');
            assert.strictEqual(cached.bar, 'bar');

            model.set('foo', {baz: 'baz'});
            assert.strictEqual(model.get('foo').baz, 'baz');
        });

        it('should use recordset format for the property initial value', () => {
            const SubModel = extend(Model, {
                _$properties: {
                    id: {
                        get: (value) => value.toDateString()
                    }
                }
            });
            const date = new Date();
            const rs = new RecordSet({
                model: SubModel,
                format: [{name: 'id', type: 'datetime'}]
            });
            const model = new Model({
                rawData: {
                    id: date.getTime()
                }
            });

            rs.add(model);
            assert.strictEqual(rs.at(0).get('id'), date.toDateString());
        });

        it('should use recordset format for not a property', () => {
            const rs = new RecordSet({
                format: [{name: 'id', type: 'datetime'}]
            });
            const model = new Model({
                rawData: {
                    id: 1
                }
            });
            rs.add(model);
            assert.instanceOf(rs.at(0).get('id'), Date);
        });

        it('should return raw value instead of property default value', () => {
            const model = new Model({
                properties: {
                    id: {
                        def: 0
                    }
                },
                rawData: {
                    id: 1
                }
            });
            assert.equal(model.get('id'), 1);
        });
    });

    describe('.set()', () => {
        it('should set a writable property', () => {
            model.set('calc', 50);
            assert.strictEqual(model.get('calc'), 50);
            assert.strictEqual(model.getRawData().calc, 5);

            model.set('calc', 70);
            assert.strictEqual(model.get('calc'), 70);
            assert.strictEqual(model.getRawData().calc, 7);

            model.set('calcWrite', 50);
            assert.strictEqual(model.get('calcWrite'), 5);
            assert.strictEqual(model.getRawData().calcWrite, 5);

            model.set('calcWrite', 70);
            assert.strictEqual(model.get('calcWrite'), 7);
            assert.strictEqual(model.getRawData().calcWrite, 7);
        });

        it('should trigger "onPropertyChange" for tracking properties', () => {
            const model = new Model({
                properties: {
                    foo: {
                        get(): string {
                            return this._foo;
                        },
                        set: Track.create(function(value: string): void {
                            this._foo = value;
                        })
                    }
                } as IHashMap<IProperty<IFooModel>>
            });

            let changed;
            const handler = (event, props) => {
                changed = props;
            };

            model.subscribe('onPropertyChange', handler);
            model.set('foo', 'bar');
            model.unsubscribe('onPropertyChange', handler);

            assert.deepEqual(changed, {
                foo: 'bar'
            });
        });

        it('should trigger only one event "onPropertyChange" if some propperty calls set() inside itself', () => {
            const model = new Model({
                rawData: {
                    foo: 'one',
                    bar: 'two'
                },
                properties: {
                    moreFoo: {
                        get: (value) => value,
                        set(value: string): string {
                            const realValue = '{' + value + '}';
                            this.set('bar', '[' + value + ']');
                            this.set('foo', value);
                            return realValue;
                        }
                    }
                }
            });

            let changed;
            const handler = (event, props) => {
                changed = props;
            };

            model.subscribe('onPropertyChange', handler);
            model.set('moreFoo', 'three');
            model.unsubscribe('onPropertyChange', handler);

            assert.deepEqual(changed, {
                foo: 'three',
                bar: '[three]',
                moreFoo: '{three}'
            });
        });

        it('should write and read updated cached value inside set', () => {
            let updatedValue;
            const model = new Model({
                rawData: {
                    foo: [1]
                },
                properties: {
                    bar: {
                        set(value: string): void {
                            this.set('foo', [value]);
                            updatedValue = this.get('foo');
                        }
                    }
                }
            });

            model.set('bar', 2);

            assert.deepEqual(updatedValue, [2]);
            assert.deepEqual(model.get('foo'), [2]);
        });

        it('shouldn\'t change cached field value taken from format if model has any properties', () => {
            const model = new Model({
                format: {
                    foo: Model
                } as any,
                rawData: {
                    foo: {bar: 1}
                },
                properties: {}
            });
            const foo = model.get('foo');
            model.set('foo', foo);

            assert.isFalse(model.isChanged('foo'));
        });

        it('should throw an Error for read only property', () => {
            assert.throws(() => {
                model.set('calcRead', 100);
            });
            assert.strictEqual(model.get('calcRead'), 50);
            assert.strictEqual(model.getRawData().calcRead, 5);

            assert.throws(() => {
                model.set('calcRead', 70);
            });
            assert.strictEqual(model.get('calcRead'), 50);
            assert.strictEqual(model.getRawData().calcRead, 5);

            assert.throws(() => {
                model.set('title', 'test');
            });
            assert.strictEqual(model.get('title'), 'A B');
            assert.strictEqual(model.getRawData().title, 'A');
        });

        it('should attempt to set every property if someone throws an Error', () => {
            const model = new Model({
                properties: {
                    foo: {
                        get: () => 'ro',
                        set: () => {
                            throw new Error('oops!');
                        }
                    },
                    bar: {
                        get(): string {
                            return this._bar;
                        },
                        set(value: string): void {
                            this._bar = value;
                        }
                    }
                } as IHashMap<IProperty<IBarModel>>
            });
            assert.throws(() => {
                model.set({
                    foo: 'one',
                    bar: 'two'
                });
            });
            assert.strictEqual(model.get('foo'), 'ro');
            assert.strictEqual(model.get('bar'), 'two');
        });

        it('should attempt to set every property if several throw an Error', () => {
            const model = new Model({
                properties: {
                    foo: {
                        get: () => 'foo',
                        set: () => {
                            throw new Error('oops foo!');
                        }
                    },
                    bar: {
                        get(): string {
                            return this._bar;
                        },
                        set(value: string): void {
                            this._bar = value;
                        }
                    },
                    baz: {
                        get: () => 'baz',
                        set: () => {
                            throw new Error('oops baz!');
                        }
                    }
                } as IHashMap<IProperty<IBarModel>>
            });

            assert.throws(() => {
                model.set({
                    foo: 'one',
                    bar: 'two',
                    baz: 'three'
                });
            });

            assert.strictEqual(model.get('foo'), 'foo');
            assert.strictEqual(model.get('bar'), 'two');
            assert.strictEqual(model.get('baz'), 'baz');
        });

        it('should don\'t throw an Error for property with only "def"', () => {
            const model = new Model({
                properties: {
                    test: {
                        def: null
                    }
                }
            });
            assert.strictEqual(model.get('test'), null);
            model.set('test', 'new');
            assert.strictEqual(model.get('test'), 'new');
        });

        it('should set the rawData value', () => {
            model.set('max', 13);
            assert.strictEqual(model.get('max'), 13);
            assert.strictEqual(model.getRawData().max, 13);

            model.set('internal', 'testInternal');
            assert.strictEqual(model.get('internal'), 'testInternal');
            assert.isUndefined(model.getRawData().internal);
        });

        it('should set inverted rawData value', () => {
            const model = new Model({
                rawData: {
                    foo: false
                },
                properties: {
                    foo: {
                        get: (value) => !value,
                        set: (value) => !value
                    }
                }
            });

            assert.isTrue(model.get('foo'));

            let fromEvent;
            model.subscribe('onPropertyChange', (event, map) => {
                fromEvent = map.foo;
            });

            model.set('foo', false);
            assert.isFalse(model.get('foo'));
            assert.isTrue(model.getRawData().foo);
            assert.isFalse(fromEvent);

            fromEvent = undefined;
            model.set('foo', true);
            assert.isTrue(model.get('foo'));
            assert.isFalse(model.getRawData().foo);
            assert.isTrue(fromEvent);
        });

        it('should work well in case of getter exception', () => {
            const model = new Model({
                properties: {
                    p1: {
                        get: () => {
                            throw new Error('Something went wrong');
                        },
                        set(value: string): void {
                            this._p1 = value;
                        }
                    }
                } as IHashMap<IProperty<Model & {
                    _p1: string;
                }>>
            });

            // Get twice checks valid state
            assert.throws(() => {
                model.get('p1');
            });
            assert.throws(() => {
                model.get('p1');
            });

            model.set('p1', 'v1');
        });

        it('should set values', () => {
            model.set({
                calc: 50,
                calcWrite: 50,
                id: 'test'
            });
            assert.strictEqual(model.get('calc'), 50);
            assert.strictEqual(model.get('calcWrite'), 5);
            assert.strictEqual(model.get('id'), 'test');
        });

        it('should set values with exception', () => {
            assert.throws(() => {
                model.set({
                    calc: 50,
                    calcRead: 100,
                    calcWrite: 50,
                    id: 'test'
                });
            });
            assert.strictEqual(model.get('calc'), 50);
            assert.strictEqual(model.get('calcRead'), 50);
            assert.strictEqual(model.get('calcWrite'), 5);
            assert.strictEqual(model.get('id'), 'test');
        });

        it('should set value when property define only default value ', () => {
            const model = new Model({
                properties: {
                    id: {
                        def: 0
                    }
                },
                rawData: {
                    id: 1
                }
            });
            model.set('id', 2);
            assert.equal(model.get('id'), 2);
        });

        it('should work well on property value convert', () => {
            const model = new Model({
                properties: {
                    id: {
                        get(): string {
                            return this._id;
                        },
                        set(value: string): void {
                            this._id = value.toString();
                        }
                    }
                } as IHashMap<IProperty<Model & {
                    _id: string;
                }>>
            });

            model.set('id', [1, 2, 3]);
            assert.equal(model.get('id'), '1,2,3');
        });

        it('should reset cached property value if related raw field has been changed', () => {
            const model = new Model({
                rawData: {
                    foo: 1
                },
                properties: {
                    bar: {
                        get(): string {
                            return this.get('foo');
                        }
                    }
                }
            });

            assert.strictEqual(model.get('bar'), 1);

            model.set('foo', 2);
            assert.strictEqual(model.get('bar'), 2);
        });

        it('should reset cached property value if related property has been changed', () => {
            const model = new Model({
                properties: {
                    foo: {
                        get(): string | number {
                            return this._foo === undefined ? 1 : this._foo;
                        },
                        set(value: string): string {
                            return this._foo = value;
                        }
                    },
                    bar: {
                        get(): string {
                            return this.get('foo');
                        }
                    }
                } as IHashMap<IProperty<IFooModel>>
            });

            assert.strictEqual(model.get('bar'), 1);

            model.set('foo', 2);
            assert.strictEqual(model.get('bar'), 2);
        });

        it('should reset changed flag for modified by link property on related property change', () => {
            const model = new Model({
                rawData: {
                    foo: '1'
                },
                properties: {
                    bar: {
                        get(): Model {
                            return new Model({
                                rawData: {
                                    foo: this.get('foo')
                                }
                            });
                        }
                    }
                }
            });

            const bar = model.get('bar');
            bar.set('foo', 2);
            assert.isTrue(model.isChanged('bar'));
            model.set('foo', 3);
            assert.isFalse(model.isChanged('bar'));
        });

        context('if has properties defined dependency', () => {
            it('should reset related property', () => {
                const model = new Model({
                    properties: {
                        foo: {
                            get: Compute.create(function(): string[] {
                                const bar = this.get('bar');
                                return ['foo'].concat(bar);
                            }, ['bar'])
                        },
                        bar: {
                            get(): string[] {
                                return this._bar || ['bar'];
                            },
                            set(value: string): void {
                                this._bar = [value];
                            }
                        }
                    } as IHashMap<IProperty<Model & {
                        _bar: string[];
                    }>>
                });

                const fooA = model.get('foo');
                assert.deepEqual(fooA, ['foo', 'bar']);

                model.set('bar', 'baz');
                const fooB = model.get('foo');
                assert.deepEqual(fooB, ['foo', 'baz']);

                const fooC = model.get('foo');
                model.set('moo', 'shmoo');
                assert.strictEqual(model.get('foo'), fooC);
            });

            it('should don\'t reset unrelated property', () => {
                const model = new Model({
                    properties: {
                        foo: {
                            get: Compute.create(function(): string[] {
                                const bar = this.get('bar');
                                return ['foo'].concat(bar);
                            }, [])
                        },
                        bar: {
                            get(): string[] {
                                return this._bar || ['bar'];
                            },
                            set(value: string): void {
                                this._bar = [value];
                            }
                        }
                    } as IHashMap<IProperty<Model & {
                        _bar: string[];
                    }>>
                });

                const fooA = model.get('foo');
                assert.deepEqual(fooA, ['foo', 'bar']);

                const fooB = model.get('foo');
                model.set('bar', 'baz');
                assert.strictEqual(model.get('foo'), fooB);
                assert.deepEqual(model.get('foo'), ['foo', 'bar']);
            });

            it('should reset deep related property and dont\'t resut unrelated', () => {
                const model = new Model({
                    properties: {
                        foo: {
                            get: Compute.create(function(): string[] {
                                const bar = this.get('bar');
                                return ['foo'].concat([bar.get('a'), bar.get('b')]);
                            }, ['bar.a'])
                        },
                        bar: {
                            get: () => {
                                return new Model({rawData: {
                                        a: 1,
                                        b: 2
                                    }});
                            }
                        }
                    }
                });

                const bar = model.get('bar');
                assert.deepEqual(model.get('foo'), ['foo', 1, 2]);

                const fooA = model.get('foo');
                bar.set('a', 10);
                assert.notEqual(model.get('foo'), fooA);
                assert.deepEqual(model.get('foo'), ['foo', 10, 2]);

                const fooB = model.get('foo');
                bar.set('b', 20);
                assert.strictEqual(model.get('foo'), fooB);
                assert.deepEqual(model.get('foo'), ['foo', 10, 2]);
            });
        });

        context('if has properties calculated dependency', () => {
            const MyModel = extend(Model, {
                _$properties: {
                    p1: {
                        get(): object {
                            return {
                                p2: this.get('p2'),
                                p3: this.get('p3')
                            };
                        }
                    },
                    p3: {
                        get(): object {
                            return {
                                p4: this.get('p4'),
                                p5: this.get('p5')
                            };
                        }
                    }
                }
            });

            const getMyModel = () => {
                return new MyModel({
                    rawData: {
                        p2: 'v2',
                        p4: 'v4',
                        p5: 'v5'
                    }
                });
            };

            it('should reset the value on direct dependency', () => {
                const model = getMyModel();
                const v3old = model.get('p3');
                model.set('p4', 'v4new');
                const v3new = model.get('p3');
                assert.notEqual(v3old, v3new);
                assert.equal(v3old.p4, 'v4');
                assert.equal(v3new.p4, 'v4new');
            });

            it('should reset the value on indirect dependency', () => {
                const model = getMyModel();
                const v1old = model.get('p1');
                model.set('p5', 'v5new');
                const v1new = model.get('p1');
                assert.notEqual(v1old, v1new);
                assert.equal(v1old.p3.p5, 'v5');
                assert.equal(v1new.p3.p5, 'v5new');
            });

            it('should leave the independent value', () => {
                const model = getMyModel();
                const v3old = model.get('p3');
                model.set('p2', 'v2new');
                const v3new = model.get('p3');
                assert.strictEqual(v3old, v3new);
            });

            it('should reset the value if dependency cached', () => {
                const MyModel = extend(Model, {
                    _$properties: {
                        a: {
                            get(): string[] {
                                return ['a'].concat(this.get('b'));
                            }
                        },
                        b: {
                            get(): string[] {
                                return ['b'];
                            },
                            set(): void {
                                // Do nothing
                            }
                        }
                    }
                });

                const model = new MyModel();
                const oldB = model.get('b');
                const oldA = model.get('a');

                model.set('b', ['b1']);
                const newB = model.get('b');
                const newA = model.get('a');

                assert.notEqual(oldB, newB);
                assert.notEqual(oldA, newA);
            });

            it('should stay inner index length stable on several calls', () => {
                const model = getMyModel();
                model.get('p3');
                model.get('p3');
                assert.equal(model._propertiesDependency.get('p4').size, 1);
                assert.equal(model._propertiesDependency.get('p5').size, 1);
            });
        });

        context('if adapter doesn\'t support dynamic properties define', () => {
            const getData = () => {
                return {
                    d: [
                        1,
                        '2'
                    ],
                    s: [
                        {n: 'a'},
                        {n: 'b'}
                    ]
                };
            };

            it('should throw an error', () => {
                const model = new Model({
                    rawData: getData(),
                    adapter: new SbisAdapter()
                });
                assert.throws(() => {
                    model.set('c', 50);
                });
            });

            it('should don\'t throw an error if user defined property has setter without a result', () => {
                const model = new Model({
                    rawData: getData(),
                    adapter: new SbisAdapter(),
                    properties: {
                        c: {
                            set: () => {/**/}
                        }
                    }
                });
                model.set('c', 50);
            });

            it('should throw an error if user defined property has setter with a result', () => {
                const model = new Model({
                    rawData: getData(),
                    adapter: new SbisAdapter(),
                    properties: {
                        c: {
                            set: (value) => value
                        }
                    }
                });
                assert.throws(() => {
                    model.set('c', 50);
                });
            });
        });

    });

    describe('.has()', () => {
        it('should return true for defined field', () => {
            for (const key in modelData) {
                if (modelData.hasOwnProperty(key)) {
                    assert.isTrue(model.has(key));
                }
            }
        });

        it('should return true for defined property', () => {
            for (const key in modelProperties) {
                if (modelProperties.hasOwnProperty(key)) {
                    assert.isTrue(model.has(key));
                }
            }
        });

        it('should return false for undefined property', () => {
            assert.isFalse(model.has('blah'));
        });
    });

    describe('.getDefault()', () => {
        it('should return undefined for undefined property', () => {
            assert.strictEqual(model.getDefault('max'), undefined);
        });

        it('should return defined value', () => {
            assert.strictEqual(model.getDefault('calc'), 1);
            assert.strictEqual(model.getDefault('calcRead'), 2);
            assert.strictEqual(model.getDefault('calcWrite'), 3);
            assert.strictEqual(model.getDefault('title'), 4);
        });

        it('should return function result and exec this function once', () => {
            assert.strictEqual(model.getDefault('sqMax'), 33);
            assert.strictEqual(model.getDefault('sqMax'), 33);
        });
    });

    describe('.each()', () => {
        it('should return equivalent values', () => {
            model.each((name, value) => {
                if (modelProperties[name] && modelProperties[name].get) {
                    assert.strictEqual(model.get(name), value);
                } else {
                    assert.strictEqual(modelData[name], value);
                }
            });
        });

        it('should traverse all properties in given order', () => {
            const allProps = Object.keys(modelProperties);
            for (const key in modelData) {
                if (modelData.hasOwnProperty(key) &&
                    allProps.indexOf(key) === -1
                ) {
                    allProps.push(key);
                }
            }
            let count = 0;
            model.each((name) => {
                assert.strictEqual(name, allProps[count]);
                count++;
            });
            assert.strictEqual(allProps.length, count);
        });
    });

    describe('.getProperties()', () => {
        it('should return a model properties', () => {
            assert.deepEqual(model.getProperties(), modelProperties);
        });
    });

    describe('.getKey()', () => {
        it('should return key', () => {
            assert.strictEqual(model.getKey(), modelData.id);
        });

        it('should detect keyProperty automatically', () => {
            const data = {
                d: [
                    1,
                    'a',
                    'test'
                ],
                s: [
                    {n: 'Num'},
                    {n: '@Key'},
                    {n: 'Name'}]
            };
            const model = new Model({
                rawData: data,
                adapter: new SbisAdapter()
            });
            assert.strictEqual(model.getKeyProperty(), '@Key');
            assert.strictEqual(model.getKey(), data.d[1]);
        });

        it('should return undefined for empty key property', () => {
            const newModel = new Model({
                rawData: modelData
            });
            assert.isUndefined(newModel.getKey());
        });
    });

    describe('.getKeyProperty()', () => {
        it('should return id property', () => {
            assert.strictEqual(model.getKeyProperty(), 'id');
        });
    });

    describe('.setKeyProperty()', () => {
        it('should set id property', () => {
            const newModel = new Model({
                rawData: modelData
            });
            newModel.setKeyProperty('id');
            assert.strictEqual(newModel.getKey(), modelData.id);
        });
    });

    describe('.clone()', () => {
        it('should clone properties definition', () => {
            const clone = model.clone<Model>();
            assert.notEqual(model.getProperties(), clone.getProperties());
            assert.deepEqual(model.getProperties(), clone.getProperties());
        });

        it('should have another instance id', () => {
            const id = model.getInstanceId();
            const clone = model.clone<Model>();
            assert.notEqual(clone.getInstanceId(), id);
        });

        it('should clone id property', () => {
            const clone = model.clone<Model>();
            assert.strictEqual(model.getKey(), clone.getKey());
            assert.strictEqual(model.getKeyProperty(), clone.getKeyProperty());
        });

        it('should give equal fields for not an Object', () => {
            const clone = model.clone<Model>();
            model.each((name, value: any) => {
                if (!(value instanceof Object)) {
                    assert.strictEqual(value, clone.get(name));
                }
            });
            clone.each((name, value: any) => {
                if (!(value instanceof Object)) {
                    assert.strictEqual(value, model.get(name));
                }
            });
        });
    });

    describe('.merge()', () => {
        it('should merge models', () => {
            const newModel = new Model({
                keyProperty: 'id',
                rawData: {
                    title: 'new',
                    link: '123'
                }
            });
            newModel.merge(model);
            assert.strictEqual(newModel.getKey(), modelData.id);
        });

        it('should do nothing with itself', () => {
            const model = new Model({
                keyProperty: 'id',
                rawData: {
                    foo: 'bar'
                }
            });

            sinon.spy(model, 'set');
            model.merge(model);
            assert.isFalse((model.set as any).called);
        });

        context('with various adapter types', () => {
            const getSbisData = () => {
                return {
                    d: [
                        1,
                        2,
                        3
                    ],
                    s: [
                        {n: 'a'},
                        {n: 'b'},
                        {n: 'c'}
                    ]
                };
            };
            const getSimpleData = () => {
                return {
                    c: 4,
                    d: 5,
                    e: 6
                };
            };

            it('should append new fields if acceptor\'s adapter supports dynamic fields definition', () => {
                const acceptor = new Model({
                    rawData: getSimpleData()
                });
                const donor = new Model({
                    rawData: getSbisData(),
                    adapter: new SbisAdapter()
                });

                acceptor.merge(donor);
                donor.each((field, value) => {
                    assert.strictEqual(acceptor.get(field), value);
                });
            });

            it('should update exists fields if acceptor\'s adapter doesn\'t support dynamic fields definition', () => {
                const acceptor = new Model({
                    rawData: getSbisData(),
                    adapter: new SbisAdapter()
                });
                const donor = new Model({
                    rawData: getSimpleData()
                });

                acceptor.merge(donor);
                acceptor.each((field, value) => {
                    if (donor.has(field)) {
                        assert.strictEqual(donor.get(field), value);
                    }
                });
            });
        });

        it('should stay unchanged with empty donor', () => {
            assert.isFalse(model.isChanged());
            const anotherModel = new Model();
            model.merge(anotherModel);
            assert.isFalse(model.isChanged());
        });

        it('should stay unchanged with same donor', () => {
            assert.isFalse(model.isChanged());
            const anotherModel = new Model({
                rawData: {
                    max: modelData.max
                }
            });
            model.merge(anotherModel);
            assert.isFalse(model.isChanged());
        });

        it('should stay changed', () => {
            model.set('max', 2);
            assert.isTrue(model.isChanged());
            const anotherModel = new Model({
                rawData: {
                    max: 157
                }
            });
            model.merge(anotherModel);
            assert.isTrue(model.isChanged());
        });

        it('should become changed with different donor', () => {
            assert.isFalse(model.isChanged());
            const anotherModel = new Model({
                rawData: {
                    max: 157
                }
            });
            model.merge(anotherModel);
            assert.isTrue(model.isChanged());
        });

        it('should become changed with different donor', () => {
            const model = new Model({
                rawData: {
                    d: ['qwe'],
                    s: [{
                        n: 'name',
                        t: 'Строка'
                    }]
                },
                adapter: 'Types/entity:adapter.Sbis'
            });
            const anotherModel = new Model({
                rawData: {
                    d: ['qwe2', 'qwe3'],
                    s: [{
                        n: 'name2',
                        t: 'Строка'
                    }, {
                        n: 'name',
                        t: 'Строка'
                    }]
                },
                adapter: 'Types/entity:adapter.Sbis'
            });

            model.merge(anotherModel);
            assert.strictEqual(model.get('name'), 'qwe3');
        });
    });

    describe('.getInstanceId()', () => {
        it('should return different values for different instances', () => {
            const modelA = getModel();
            const modelB = getModel();
            assert.notEqual(modelA.getInstanceId(), modelB.getInstanceId());
        });
    });

    describe('.relationChanged', () => {
        it('should return affected "which"', () => {
            const rawData = {foo: ['bar']};
            const model = new Model({
                rawData
            });
            const target = model.get('foo');
            const which = {
                target,
                data: {baz: 'bad'}
            };
            const route = ['field.foo'];

            const result = model.relationChanged(which, route);
            assert.strictEqual(result.target, target);
            assert.deepEqual(result.data, {foo: target});
        });

        it('should not clear own cache', () => {
            const model = new Model({
                properties: {
                    obj: {
                        get: () => {
                            return {};
                        }
                    }
                }
            });
            const obj = model.get('obj');

            model.relationChanged({target: obj}, ['field.obj']);
            assert.equal(obj, model.get('obj'));
        });

        it('should clear cache for a dependency field', () => {
            const model = new Model({
                properties: {
                    obj: {
                        get: () => {
                            return {};
                        }
                    },
                    obj2: {
                        get(): object {
                            return {
                                obj: this.get('obj')
                            };
                        }
                    }
                }
            });
            const obj = model.get('obj');
            const obj2 = model.get('obj2');

            model.relationChanged({target: obj2}, ['field.obj']);
            assert.strictEqual(obj, model.get('obj'));
            assert.notEqual(obj2, model.get('obj2'));
        });
    });

    describe('.getInstanceState', () => {
        it('should return null by default', () => {
            const model = new Model();
            assert.isNull(model.getInstanceState());
        });

        it('should return object with tracking properties values', () => {
            const model = new Model({
                properties: {
                    foo: {
                        get: Track.create(function(): string {
                            return this._foo = 'bar';
                        }, '_foo')
                    }
                } as IHashMap<IProperty<IFooModel>>
            });

            assert.equal(model.get('foo'), 'bar');
            assert.deepEqual(model.getInstanceState(), {_foo: 'bar'});
        });
    });

    describe('.subscribe()', () => {
        it('should trigger "onPropertyChange" if property value type supports mediator', () => {
            const model = new Model({
                properties: {
                    record: {
                        get: () => {
                            return new Model();
                        }
                    }
                }
            });
            const given = {
                properties: undefined
            };
            const handler = (event, properties) => {
                given.properties = properties;
            };

            model.subscribe('onPropertyChange', handler);
            const property = model.get('record');
            property.set('a', 2);
            model.unsubscribe('onPropertyChange', handler);

            assert.strictEqual(given.properties.record, property);
        });

        it('should trigger "onPropertyChange" for new property value', () => {
            const model = new Model({
                properties: {
                    record: {
                        get(): object {
                            return this._record || (this._record = new Model());
                        },
                        set(value: object): void {
                            this._record = value;
                        }
                    }
                } as IHashMap<IProperty<Model & {
                    _record: object;
                }>>
            });
            const given = {
                properties: undefined
            };
            const handler = (event, properties) => {
                given.properties = properties;
            };

            model.get('record');
            const newProperty = new Model();
            model.set('record', newProperty);

            model.subscribe('onPropertyChange', handler);
            model.get('record').set('b', 2);
            model.unsubscribe('onPropertyChange', handler);

            assert.strictEqual(given.properties.record, newProperty);
        });

        it('should don\'t trigger "onPropertyChange" for old property value', () => {
            const model = new Model({
                properties: {
                    record: {
                        get(): object {
                            return this._record || (this._record = new Model());
                        },
                        set(value: object): void {
                            this._record = value;
                        }
                    }
                } as IHashMap<IProperty<Model & {
                    _record: object;
                }>>
            });
            const given = {
                properties: undefined
            };
            const handler = (event, properties) => {
                given.properties = properties;
            };

            const oldProperty = model.get('record');
            const newProperty = new Model();
            model.set('record', newProperty);

            model.subscribe('onPropertyChange', handler);
            oldProperty.set('a', 2);
            model.unsubscribe('onPropertyChange', handler);

            assert.isUndefined(given.properties);
        });

        it('should trigger "onPropertyChange" for instance with IObjectNotify created in def', () => {
            const model = new Model({
                properties: {
                    foo: {
                        def: () => new Model(),
                        get: (value) => value
                    }
                }
            });
            const foo = model.get('foo');
            let given = {};
            const handler = (event, properties) => {
                given = properties;
            };

            assert.instanceOf(foo, Model);

            model.subscribe('onPropertyChange', handler);
            foo.set('bar', 'baz');
            model.unsubscribe('onPropertyChange', handler);

            assert.isTrue('foo' in given);
        });
    });

    describe('.toJSON()', () => {
        it('should serialize a model', () => {
            const json = model.toJSON();
            const options = (model as any)._getOptions();
            delete options.owner;

            assert.strictEqual(json.module, 'Types/entity:Model');
            assert.isNumber(json.id);
            assert.isTrue(json.id > 0);
            assert.deepEqual(json.state.$options, options);
            assert.deepEqual((json.state as any)._changedFields, (model as any)._changedFields);
        });

        it('should serialize an instance id', () => {
            const json = model.toJSON();
            assert.strictEqual((json.state as any)._instanceId, model.getInstanceId());
        });
    });

    describe('.fromJSON()', () => {
        it('should restore an instance id', () => {
            const json = model.toJSON();
            const clone = (Model as any).fromJSON(json);

            assert.strictEqual((json.state as any)._instanceId, clone.getInstanceId());
        });
    });

    describe('.toString()', () => {
        it('should serialize a model', () => {
            const model = new Model({
                rawData: {to: 'String'}
            });
            assert.equal(model.toString(), '{"to":"String"}');
        });
    });

    context('when old style extend used', () => {
        describe('.$constructor()', () => {
            it('should be called', () => {
                let testOk = false;
                const Sub = extend(Model, {
                    $constructor: () => {
                        testOk = true;
                    }
                });
                const instance = new Sub();
                assert.isTrue(testOk);
                instance.destroy();
            });

            it('should be called on each child', () => {
                let testOk = 0;
                const Sub = extend(Model, {
                    $constructor: () => {
                        testOk++;
                    }
                });
                const MoreSub = extend(Sub, {
                    $constructor: () => {
                        testOk += 2;
                    }
                });

                const instance = new MoreSub();
                assert.equal(testOk, 3);

                instance.destroy();
            });
        });

        describe('.getKeyProperty()', () => {
            it('should return value passed to the constructor as keyProperty even if superclass has old-fashioned idProperty', () => {
                const Sub = extend(Model, {
                    $protected: {
                        _options: {
                            idProperty: 'foo'
                        }
                    }
                });
                const instance = new Sub({
                    keyProperty: 'bar'
                });

                assert.equal(instance.getKeyProperty(), 'bar');
                instance.destroy();
            });
        });

        describe('.toJSON()', () => {
            it('should dont save _$properties', () => {
                const Sub = extend(Model, {
                    _moduleName: 'Sub',
                    _$properties: {
                        some: {
                            foo: () => {
                                return 'bar';
                            }
                        }
                    }
                });
                const instance = new Sub();
                const serialized = instance.toJSON();

                assert.isUndefined(serialized.state.$options.properties);
            });

            it('should save old _options object values', () => {
                const Sub = extend(Model, {
                    _moduleName: 'Sub',
                    $protected: {
                        _options: {
                            opt1: 1,
                            opt2: 'a'
                        }
                    }
                });
                const instance = new Sub({
                    opt2: 'b'
                });
                const serialized = instance.toJSON();

                assert.equal(serialized.state.$options.opt1, 1);
                assert.equal(serialized.state.$options.opt2, 'b');
            });
        });

        describe('.fromObject', () => {
            it('should return a model', () => {
                const data = {
                    id: 1,
                    title: 'title',
                    selected: true,
                    pid: null
                };
                const model = (Model as any).fromObject(data);

                assert.instanceOf(model, Model);
                for (const key in data) {
                    if (data.hasOwnProperty(key)) {
                        assert.strictEqual(model.get(key), data[key]);
                    }
                }
            });
        });
    });
});
