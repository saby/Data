import {assert} from 'chai';
import Local, {IOptions} from 'Types/_source/Local';
import {Join as QueryJoin} from 'Types/_source/Query';
import JsonTable from 'Types/_entity/adapter/JsonTable';
import ITable from 'Types/_entity/adapter/ITable';
import {ExtendDate, IExtendDateConstructor} from 'Types/_declarations';

class TestLocal extends Local {
   constructor(options?: IOptions) {
      super(options);
   }

   protected _applyFrom(from?: string): any {
      return undefined;
   }

   protected _applyJoin(data: any, join: QueryJoin[]): any {
      return undefined;
   }

   protected _getTableAdapter(): ITable {
      return new JsonTable();
   }
}

describe('Types/_source/Local', () => {
    let source;

    beforeEach(() => {
        source = new TestLocal();
    });

    afterEach(() => {
        source = undefined;
    });

    describe('.create()', () => {
        it('should generate a request with Date field', (done) => {
            const date = new Date() as ExtendDate;
            if (!date.setSQLSerializationMode) {
                done();
            }

            date.setSQLSerializationMode((Date as IExtendDateConstructor).SQL_SERIALIZE_MODE_DATE);
            const meta = {foo: date};
            source.create(meta).addCallbacks((data) => {
                try {
                    assert.instanceOf(data.get('foo'), Date);
                    assert.strictEqual(
                       data.get('foo').getSQLSerializationMode(),
                       (Date as IExtendDateConstructor).SQL_SERIALIZE_MODE_DATE
                    );
                    done();
                } catch (err) {
                    done(err);
                }
            }, (err) => {
                done(err);
            });
        });

        it('should generate a request with Time field', (done) => {
            const date = new Date() as ExtendDate;
            if (!date.setSQLSerializationMode) {
                done();
            }

            date.setSQLSerializationMode((Date as IExtendDateConstructor).SQL_SERIALIZE_MODE_TIME);
            const meta = {foo: date};
            source.create(meta).addCallbacks((data) => {
                try {
                    assert.instanceOf(data.get('foo'), Date);
                    assert.strictEqual(
                       data.get('foo').getSQLSerializationMode(),
                       (Date as IExtendDateConstructor).SQL_SERIALIZE_MODE_TIME
                    );
                    done();
                } catch (err) {
                    done(err);
                }
            }, (err) => {
                done(err);
            });
        });
    });
});
