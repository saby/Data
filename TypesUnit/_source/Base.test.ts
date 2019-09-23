import {assert} from 'chai';
import BaseSource, {IOptions} from 'Types/_source/Base';
import JsonAdapter from 'Types/_entity/adapter/Json';

class TestSource extends BaseSource {
   protected _moduleName: string;

   constructor(options?: IOptions) {
      super(options);
   }
}
Object.assign(TestSource.prototype, {
   _moduleName: '[TestSource]'
});

describe('Types/_source/Base', () => {
    let source: TestSource;

    beforeEach(() => {
        source = new TestSource();
    });

    afterEach(() => {
        source = undefined;
    });

    describe('.getAdapter()', () => {
        it('should return the JSON adapter by default', () => {
            const adapter = source.getAdapter();
            assert.instanceOf(adapter, JsonAdapter);
        });

        it('should return value passed to the constructor', () => {
            const adapter = new JsonAdapter();
            const source = new TestSource({
                adapter
            });

            assert.strictEqual(source.getAdapter(), adapter);
        });
    });

    describe('.getModel()', () => {
        it('should return "Types/entity:Model" by default', () => {
            assert.equal(source.getModel(), 'Types/entity:Model');
        });

        it('should return value passed to the constructor', () => {
            const source = new TestSource({
                model: 'my.model'
            });

            assert.equal(source.getModel(), 'my.model');
        });
    });

    describe('.setModel()', () => {
        it('should set the new value', () => {
            source.setModel('my.model');
            assert.equal(source.getModel(), 'my.model');
        });
    });

    describe('.getListModule()', () => {
        it('should return "Types/collection:RecordSet" by default', () => {
            assert.equal(source.getListModule(), 'Types/collection:RecordSet');
        });

        it('should return value passed to the constructor', () => {
            const source = new TestSource({
                listModule: 'my.list'
            });

            assert.equal(source.getListModule(), 'my.list');
        });
    });

    describe('.setListModule()', () => {
        it('should set the new value', () => {
            source.setListModule('my.list');
            assert.equal(source.getListModule(), 'my.list');
        });
    });

    describe('.getKeyProperty()', () => {
        it('should return an empty string by default', () => {
            assert.strictEqual(source.getKeyProperty(), '');
        });

        it('should return value passed to the constructor', () => {
            const source = new TestSource({
                keyProperty: 'test'
            });

            assert.equal(source.getKeyProperty(), 'test');
        });
    });

    describe('.setKeyProperty()', () => {
        it('should set the new value', () => {
            source.setKeyProperty('test');
            assert.equal(source.getKeyProperty(), 'test');
        });
    });

    describe('.getOptions()', () => {
        it('should return an Object by default', () => {
            assert.strictEqual(source.getOptions().debug, false);
        });

        it('should return value passed to the constructor', () => {
            const source = new TestSource({
                options: {debug: true}
            });

            assert.strictEqual(source.getOptions().debug, true);
        });

        it('should return merged value of the prototype and the constructor', () => {
            const source = new TestSource({
                options: {foo: 'bar'} as any
            });

            assert.isFalse(source.getOptions().debug);
            assert.equal((source.getOptions() as any).foo, 'bar');
        });
    });

    describe('.setOptions()', () => {
        it('should set new value', () => {
            const options = {
                debug: true,
                foo: 'bar'
            };
            source = new TestSource({options});

            source.setOptions({debug: true});
            assert.strictEqual(options.debug, true);
            assert.strictEqual(options.foo, 'bar');
        });

        it('should leave the prototype options untouched', () => {
            const source = new TestSource();

            assert.deepEqual((TestSource.prototype as any)._$options, source.getOptions());
            source.setOptions({debug: true});
            assert.notDeepEqual((TestSource.prototype as any)._$options, source.getOptions());
        });
    });

    describe('.toJSON()', () => {
        it('should return valid signature', () => {
            const options = {};
            const source = new TestSource(options);
            const json = source.toJSON();

            assert.deepEqual(json.$serialized$, 'inst');
            assert.deepEqual(json.module, '[TestSource]');
            assert.deepEqual(json.state.$options, options);
        });
    });
});
