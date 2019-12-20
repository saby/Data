import {assert} from 'chai';
import Format from 'Types/_collection/format/Format';
import fieldsFactory from 'Types/_entity/format/fieldsFactory';

describe('Types/_entity/format/Format', () => {
    let format: Format;

    beforeEach(() => {
        format = new Format();
    });

    afterEach(() => {
        format = undefined;
    });

    describe('.constructor()', () => {
        it('should throw an error if items contains not a field format', () => {
            assert.throws(() => {
                return new Format({
                    items: [null]
                });
            });
        });

        it('should throw an error if items contains fields with same names', () => {
            assert.throws(() => {
                return new Format({
                    items: [
                        fieldsFactory({type: 'integer', name: 'f1'}),
                        fieldsFactory({type: 'integer', name: 'f2'}),
                        fieldsFactory({type: 'string', name: 'f1'})
                    ]
                });
            });
        });
    });

    describe('.add()', () => {
        it('should throw an error if not a field format passed', () => {
            assert.throws(() => {
                format.add(0 as any);
            });
        });

        it('should throw an error if field with given name already exists', () => {
            format.add(fieldsFactory({type: 'integer', name: 'f1'}));
            assert.throws(() => {
                format.add(fieldsFactory({type: 'integer', name: 'f1'}));
            });
        });
    });

    describe('.remove()', () => {
        it('should throw an error if not a field format passed', () => {
            assert.throws(() => {
                format.remove(1 as any);
            });
        });
    });

    describe('.replace()', () => {
        it('should throw an error if not a field format passed', () => {
            assert.throws(() => {
                format.replace(2 as any, 0);
            });
        });

        it('should throw an error if field with given name already exists', () => {
            format.add(fieldsFactory({type: 'integer', name: 'f1'}));
            format.add(fieldsFactory({type: 'integer', name: 'f2'}));
            format.replace(fieldsFactory({type: 'integer', name: 'f2'}), 1);
            assert.throws(() => {
                format.replace(fieldsFactory({type: 'integer', name: 'f1'}), 1);
            });
        });
    });

    describe('.assign()', () => {
        it('should throw an error if not a field format passed', () => {
            assert.throws(() => {
                format.assign([3] as any);
            });
        });

        it('should throw an error if field with given name already exists', () => {
            format.add(fieldsFactory({type: 'integer', name: 'f1'}));
            format.add(fieldsFactory({type: 'integer', name: 'f2'}));
            assert.throws(() => {
                format.assign([
                    fieldsFactory({type: 'integer', name: 'f1'}),
                    fieldsFactory({type: 'integer', name: '2'}),
                    fieldsFactory({type: 'integer', name: 'f1'})
                ]);
            });
        });
    });

    describe('.append()', () => {
        it('should throw an error if not a field format passed', () => {
            assert.throws(() => {
                format.append([4] as any);
            });
        });

        it('should throw an error if field with given name already exists', () => {
            format.append([fieldsFactory({type: 'integer', name: 'f1'})]);
            assert.throws(() => {
                format.append([fieldsFactory({type: 'integer', name: 'f1'})]);
            });
        });
    });

    describe('.prepend()', () => {
        it('should throw an error if not a field format passed', () => {
            assert.throws(() => {
                format.prepend([5] as any);
            });
        });

        it('should throw an error if field with given name already exists', () => {
            format.prepend([fieldsFactory({type: 'integer', name: 'f1'})]);
            assert.throws(() => {
                format.prepend([fieldsFactory({type: 'integer', name: 'f1'})]);
            });
        });
    });

    describe('.removeField()', () => {
        it('should remove field with given name', () => {
            const format = new Format({
                items: [
                    fieldsFactory({type: 'integer', name: 'f1'}),
                    fieldsFactory({type: 'string', name: 'f2'})
                ]
            });
            format.removeField('f2');
            assert.strictEqual(format.getCount(), 1);
            format.removeField('f1');
            assert.strictEqual(format.getCount(), 0);
        });

        it('should throw an error if field with given name does not exist', () => {
            assert.throws(() => {
                format.removeField('f1');
            });
        });
    });

    describe('.getFieldIndex()', () => {
        it('should return exists field index', () => {
            const format = new Format({
                items: [
                    fieldsFactory({type: 'integer', name: 'f1'}),
                    fieldsFactory({type: 'string', name: 'f2'})
                ]
            });
            assert.strictEqual(format.getFieldIndex('f1'), 0);
            assert.strictEqual(format.getFieldIndex('f2'), 1);
        });

        it('should -1 if field does not exist', () => {
            assert.strictEqual(format.getFieldIndex('f1'), -1);
            assert.strictEqual(format.getFieldIndex('f2'), -1);
        });
    });

    describe('.getFieldName()', () => {
        it('should return field name by index', () => {
            const format = new Format({
                items: [
                    fieldsFactory({type: 'integer', name: 'f1'}),
                    fieldsFactory({type: 'string', name: 'f2'})
                ]
            });
            assert.strictEqual(format.getFieldName(0), 'f1');
            assert.strictEqual(format.getFieldName(1), 'f2');
        });

        it('should throw an error if index is out of bounds', () => {
            assert.throws(() => {
                format.getFieldName(0);
            });
        });
    });

    describe('.clone()', () => {
        it('should return the clone', () => {
            const format = new Format({
                items: [
                    fieldsFactory({type: 'integer', name: 'f1'}),
                    fieldsFactory({type: 'string', name: 'f2'})
                ]
            });
            const clone: Format = format.clone();
            assert.instanceOf(clone, Format);
            assert.notEqual(format, clone);
            assert.strictEqual(format.getCount(), clone.getCount());
            for (let i = 0, count = format.getCount(); i < count; i++) {
                assert.notEqual(format.at(i), clone.at(i));
                assert.isTrue(
                    format.at(i).isEqual(
                        clone.at(i)
                    )
                );
            }
        });
    });
});
