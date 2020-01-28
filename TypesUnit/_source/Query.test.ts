import {assert} from 'chai';
import Query, {
    AndExpression,
    Join,
    Order,
    OrExpression,
    playExpression,
    WhereExpression
} from 'Types/_source/Query';
import Record from 'Types/_entity/Record';
import {IHashMap} from 'Types/_declarations';

interface IAtoG {
    a?: number;
    b?: number;
    c?: number;
    d?: number;
    e?: number;
    f?: number;
    g?: number;
}

describe('Types/_source/Query', () => {
    let query: Query;

    beforeEach(() => {
        query = new Query();
    });

    afterEach(() => {
        query = undefined;
    });

    describe('.select()', () => {
        it('should set select from array', () => {
            const fields = ['id', 'name'];
            query.select(fields);
            assert.deepEqual(query.getSelect(), {id: 'id', name: 'name'});
        });

        it('should set select from string', () => {
            const fields = ['id', 'name'];
            query.select(fields.join(','));
            assert.deepEqual(query.getSelect(), {id: 'id', name: 'name'});
        });

        it('should throw an error fields is a invalid', () => {
            const fields: any = 12;
            assert.throws(() => {
                query.select(fields);
            });
        });
    });

    describe('.clear()', () => {
        it('should clear query', () => {
            query.clear();
            assert.deepEqual(query.getSelect(), {});
        });
    });

    describe('.clone()', () => {
        it('should clone query', () => {
            assert.deepEqual(query, query.clone());
        });

        it('should clone Record in meta', () => {
            const rec = new Record();
            rec.set('foo', 'bar');
            query.meta(rec);

            const clone = query.clone();
            assert.instanceOf(clone.getMeta(), Record);
            assert.notEqual(clone.getMeta<Record>(), rec);
            assert.isTrue(clone.getMeta<Record>().isEqual(rec));
        });
    });

    describe('.getAs()', () => {
        it('should return as', () => {
            query.from('product', 'item');
            assert.equal(query.getAs(), 'item');
        });
    });

    describe('.orderBy()', () => {
        it('should set order from string', () => {
            query.orderBy('customerId', true);

            assert.deepEqual(
                query.getOrderBy().map((item) => [item.getSelector(), item.getOrder()]),
                [['customerId', true]]
            );
        });

        it('should set order from Object', () => {
            query.orderBy({customerId: true, date: false});

            assert.deepEqual(
                query.getOrderBy().map((item) => [item.getSelector(), item.getOrder()]),
                [['customerId', true], ['date', false]]
            );
        });

        it('should set order from Array', () => {
            query.orderBy([{customerId: true}, {date: false}]);

            assert.deepEqual(
                query.getOrderBy().map((item) => [item.getSelector(), item.getOrder()]),
                [['customerId', true], ['date', false]]
            );
        });

        it('should set nullPolicy as false', () => {
            query.orderBy('customerId', true, false);

            assert.deepEqual(
                query.getOrderBy().map((item) => item.getNullPolicy()),
                [false]
            );
        });

        it('should set nullPolicy as true', () => {
            query.orderBy('customerId', true, true);

            assert.deepEqual(
                query.getOrderBy().map((item) => item.getNullPolicy()),
                [true]
            );
        });

        it('should set nullPolicy from array', () => {
            query.orderBy([
                ['id', true, true],
                ['customerId', true, false]
            ]);

            assert.deepEqual(
                query.getOrderBy().map((item) => [item.getSelector(), item.getOrder(), item.getNullPolicy()]),
                [
                    ['id', true, true],
                    ['customerId', true, false]
                ]
            );
        });
    });

    describe('.groupBy()', () => {
        it('should set group by from array', () => {
            const groupBy = ['date', 'customerId'];
            query.groupBy(groupBy);
            assert.equal(query.getGroupBy(), groupBy);
        });

        it('should set group by from string', () => {
            const groupBy = 'customerId';
            query.groupBy(groupBy);
            assert.deepEqual(query.getGroupBy(), [groupBy]);
        });

        it('should set group by from object', () => {
            const groupBy: any = {customerId: true};
            assert.throws(() => {
                query.groupBy(groupBy);
            });
        });
    });

    describe('.where()', () => {
        it('should set expression as object', () => {
            const where  = {id: 10};
            query.where(where);
            assert.strictEqual(query.getWhere(), where);
        });

        it('should set expression as predicate', () => {
            const where  = () => undefined;
            query.where(where);
            assert.strictEqual(query.getWhere(), where);
        });

        it('should throw an error', () => {
            const where: any = 'where';
            assert.throws(() => {
                query.where(where);
            });
        });
    });

    describe('.join()', () => {
        it('should set join', () => {
            query.join(
                'Customers',
                {id: 'customerId'},
                {
                    customerName: 'name',
                    customerEmail: 'email'
                }
            );
            assert.equal(query.getJoin().length, 1);
        });
    });
});

describe('Types/_source/Query:Join', () => {
    let select: IHashMap<string>;
    let on: IHashMap<string>;
    let as: string;
    let resource: string;
    let inner: boolean;
    let join: Join;

    beforeEach(() => {
        select = {id: 'id', name: 'name'};
        on = {id: 'productId'};
        as = 'prod';
        resource = 'product';
        inner = true;
        join = new Join({
            resource,
            as,
            on,
            select,
            inner
        });
    });

    afterEach(() => {
        select = undefined;
        on = undefined;
        as = undefined;
        resource = undefined;
        inner = undefined;
        join = undefined;
    });

    describe('.getResource()', () => {
        it('should return resource', () => {
            assert.equal(join.getResource(), resource);
        });
    });

    describe('.getAs()', () => {
        it('should return as', () => {
            assert.equal(join.getAs(), as);
        });
    });
    describe('.getOn()', () => {
        it('should return on', () => {
            assert.deepEqual(join.getOn(), on);
        });
    });

    describe('.getSelect()', () => {
        it('should return select', () => {
            assert.deepEqual(join.getSelect(), select);
        });
    });

    describe('.isInner', () => {
        it('should return inner', () => {
            assert.equal(join.isInner(), inner);
        });
    });
});

describe('Types/_source/Query.Order', () => {
    describe('.getSelector()', () => {
        it('should return empty string by default', () => {
            const order = new Order();
            assert.strictEqual(order.getSelector(), '');
        });

        it('should return value passed to the constructor', () => {
            const order = new Order({
                selector: 'test'
            });
            assert.equal(order.getSelector(), 'test');
        });
    });

    describe('.getOrder()', () => {
        it('should return false by default', () => {
            const order = new Order();
            assert.isFalse(order.getOrder());
        });

        it('should return boolean value passed to the constructor', () => {
            const order = new Order({
                selector: 'foo',
                order: false
            });
            assert.isFalse(order.getOrder());
        });

        it('should return false from string "ASC" passed to the constructor', () => {
            const orderA = new Order({
                selector: 'foo',
                order: 'ASC'
            });
            assert.isFalse(orderA.getOrder());

            const orderB = new Order({
                selector: 'foo',
                order: 'asc'
            });
            assert.isFalse(orderB.getOrder());

            const orderC = new Order({
                selector: 'foo',
                order: 'Asc'
            });
            assert.isFalse(orderC.getOrder());
        });

        it('should return true from string "DESC" passed to the constructor', () => {
            const orderA = new Order({
                selector: 'foo',
                order: 'DESC'
            });
            assert.isTrue(orderA.getOrder());

            const orderB = new Order({
                selector: 'foo',
                order: 'desc'
            });
            assert.isTrue(orderB.getOrder());

            const orderC = new Order({
                selector: 'foo',
                order: 'Desc'
            });
            assert.isTrue(orderC.getOrder());
        });
    });

    describe('.getNullPolicy()', () => {
        it('should return false by default', () => {
            const order = new Order();
            assert.isTrue(order.getNullPolicy());
        });

        it('should return value opposite to "order" option', () => {
            const orderAsc = new Order({
                selector: 'foo',
                order: false
            });
            assert.isTrue(orderAsc.getNullPolicy());

            const orderDesc = new Order({
                selector: 'foo',
                order: true
            });
            assert.isFalse(orderDesc.getNullPolicy());
        });

        it('should return value passed to the constructor', () => {
            const orderWithTrue = new Order({
                selector: 'foo',
                nullPolicy: true
            });
            assert.isTrue(orderWithTrue.getNullPolicy());

            const orderWithFalse = new Order({
                selector: 'foo',
                nullPolicy: false
            });
            assert.isFalse(orderWithFalse.getNullPolicy());

            const orderWithOption = new Order({
                selector: 'foo',
                nullPolicy: true,
                order: true
            });
            assert.isTrue(orderWithOption.getNullPolicy());
        });
    });
});

describe('Types/_source/Query.playExpression()', () => {
    function playToStack<T>(expr: WhereExpression<T>): Array<string | object> {
        const stack = [];
        playExpression(
            expr,
            (key, value) => stack.push([key, value]),
            (type) => stack.push('>' + type),
            (type) => stack.push('<' + type)
        );
        return stack;
    }

    it('should play an object as and-expression', () => {
        const stack = playToStack({a: 1, b: 2});
        assert.deepEqual(stack, [
            '>and',
            ['a', 1],
            ['b', 2],
            '<and'
        ]);
    });

    it('should play an array within an object as or-expression', () => {
        const stack = playToStack({
            a: 1,
            b: [2, 3],
            c: 4
        });

        assert.deepEqual(stack, [
            '>and',
            ['a', 1],
            '>or',
            ['b', 2],
            ['b', 3],
            '<or',
            ['c', 4],
            '<and'
        ]);
    });

    it('should play and-expression', () => {
        const stack = playToStack(new AndExpression([
            {a: 1, b: 2},
            {c: 3},
            {d: 4}
        ]));

        assert.deepEqual(stack, [
            '>and',
            ['a', 1],
            ['b', 2],
            ['c', 3],
            ['d', 4],
            '<and'
        ]);
    });

    it('should play or-expression', () => {
        const stack = playToStack(new OrExpression([
            {a: 1},
            {b: 2},
            {c: 3}
        ]));

        assert.deepEqual(stack, [
            '>or',
            ['a', 1],
            ['b', 2],
            ['c', 3],
            '<or'
        ]);
    });

    it('should play and-expression within or-expression', () => {
        const stack = playToStack(new OrExpression([
            {a: 1},
            {b: 2, c: 3},
            {d: 4}
        ]));

        assert.deepEqual(stack, [
            '>or',
            ['a', 1],
            '>and',
            ['b', 2],
            ['c', 3],
            '<and',
            ['d', 4],
            '<or'
        ]);
    });

    it('should play mixture of expressions', () => {
        const stack = playToStack(new AndExpression<IAtoG>([
            {a: 1, b: 2},
            new OrExpression([
                {c: 3, d: 4},
                {e: 5, f: 6}
            ]),
            {g: 7}
        ]));

        assert.deepEqual(stack, [
            '>and',
            ['a', 1],
            ['b', 2],
            '>or',
            '>and',
            ['c', 3],
            ['d', 4],
            '<and',
            '>and',
            ['e', 5],
            ['f', 6],
            '<and',
            '<or',
            ['g', 7],
            '<and'
        ]);
    });
});
