import {ICloneable, OptionsToPropertyMixin} from '../entity';
import {IHashMap} from '../_declarations';

export enum ExpandMode {
    None,
    Nodes,
    Leaves,
    All
}

export enum NavigationType {
    Page = 'Page',
    Offset = 'Offset',
    Position = 'Position'
}

export interface IMeta extends IHashMap<unknown> {
    expand?: ExpandMode;
    navigationType?: NavigationType;
}

export type FilterFunction<T> = (item: T, index: number) => boolean;
export type FilterExpression = IHashMap<unknown> | FilterFunction<unknown>;

export abstract class PartialExpression<T = FilterExpression> {
    readonly type: string;
    constructor(readonly conditions: Array<T | PartialExpression<T>>) {
    }
}

export type SelectExpression = IHashMap<string> | string[] | string;
export type WhereExpression<T> = FilterExpression | PartialExpression<T>;
export type OrderSelector = string | IHashMap<boolean> | Array<IHashMap<boolean>> | Array<[string, boolean, boolean]>;

type AtomDeclaration = [string, any];

class AtomExpression<T = AtomDeclaration> extends PartialExpression<T> {
    readonly type: string = 'atom';
    constructor(readonly conditions: AtomDeclaration) {
        super(conditions);
    }
}

class AndExpression<T> extends PartialExpression<T> {
    readonly type: string = 'and';
}

class OrExpression<T> extends PartialExpression<T> {
    readonly type: string = 'or';
}

export function andExpression<T>(...conditions: Array<T | PartialExpression<T>>): AndExpression<T> {
    return new AndExpression(conditions);
}

export function orExpression<T>(...conditions: Array<T | PartialExpression<T>>): OrExpression<T> {
    return new OrExpression(conditions);
}

type AtomAppearCallback<T = unknown> = (key: string, value: T, type: string) => void;
type GroupBeginCallback<T> = (type: string, conditions: Array<T | PartialExpression<T>>) => void;
type GroupEndCallback = (type: string, restoreType: string) => void;

function playExpressionInner<T>(
    expression: PartialExpression<T>,
    onAtomAppears: AtomAppearCallback,
    onGroupBegins: GroupBeginCallback<T>,
    onGroupEnds: GroupEndCallback,
    stack: Array<PartialExpression<unknown>>
): void {
    if (expression instanceof AtomExpression) {
        // Notify about atom
        onAtomAppears(expression.conditions[0], expression.conditions[1], expression.type);
    } else {
        // If there is no atom that means there is a group
        stack.push(expression);
        onGroupBegins(expression.type, expression.conditions);

        // Play each condition
        expression.conditions.forEach((condition) => {
            // If condition is an expression just play it
            if (condition instanceof PartialExpression) {
                return playExpressionInner(condition, onAtomAppears, onGroupBegins, onGroupEnds, stack);
            }

            // Otherwise it's an object
            const keys = Object.keys(condition);

            // If condition is an object with several keys and it's the part of or-expression that means that it's
            // actually the new and-expression
            if (expression.type === 'or' && keys.length > 1) {
                return playExpressionInner(
                    new AndExpression([condition]),
                    onAtomAppears,
                    onGroupBegins,
                    onGroupEnds,
                    stack
                );
            }

            // If condition is an object just take a look on each part of it
            keys.forEach((key) => {
                const value = condition[key];

                // If part is an expression just play it
                if (value instanceof PartialExpression) {
                    return playExpressionInner(
                        value,
                        onAtomAppears,
                        onGroupBegins,
                        onGroupEnds,
                        stack
                    );
                }

                // If part is an array that means that it's actually the new or-expression
                if (value instanceof Array) {
                    return playExpressionInner(
                        new OrExpression(
                            value.length
                                ? value.map((subValue) => new AtomExpression([key, subValue]))
                                : [new AtomExpression([key, undefined])]
                        ),
                        onAtomAppears,
                        onGroupBegins,
                        onGroupEnds,
                        stack
                    );
                }

                // All another values are just atoms
                playExpressionInner(
                    new AtomExpression([key, value]),
                    onAtomAppears,
                    onGroupBegins,
                    onGroupEnds,
                    stack
                );
            });
        });

        stack.pop();
        onGroupEnds(expression.type, stack.length && stack[stack.length - 1].type);
    }
}

/**
 * Plays expression by calling given callbacks for each part of it
 * @param expression Expression to play
 * @param onAtomAppears In atom value appears
 * @param onGroupBegins On group of atom value begins
 * @param onGroupEnds On group of atom value ends
 */
export function playExpression<T>(
    expression: WhereExpression<T>,
    onAtomAppears: AtomAppearCallback,
    onGroupBegins: GroupBeginCallback<T>,
    onGroupEnds: GroupEndCallback
): void {
    playExpressionInner(
        expression instanceof PartialExpression ? expression : andExpression(expression as unknown as T),
        onAtomAppears,
        onGroupBegins,
        onGroupEnds,
        []
    );
}

/**
 * Clones object
 * @param data Object to clone
 */
function duplicate<T>(data: T): T {
    if (data['[Types/_entity/ICloneable]']) {
        return (data as unknown as ICloneable).clone();
    }
    if (data && typeof data === 'object') {
        return {...data};
    }
    return data;
}

/**
 * Parses expression from fields set
 * @param expression Expression with fields set
 */
function parseSelectExpression(expression: SelectExpression): IHashMap<string> {
    if (typeof expression === 'string') {
        expression = expression.split(/[ ,]/);
    }

    if (expression instanceof Array) {
        const orig = expression;
        expression = {};
        for (let i = 0; i < orig.length; i++) {
            expression[orig[i]] = orig[i];
        }
    }

    if (typeof expression !== 'object') {
        throw new TypeError('Invalid argument "expression"');
    }

    return expression;
}

interface IJoinOptions {
    resource: string;
    as?: string;
    on: IHashMap<string>;
    select: IHashMap<string>;
    inner?: boolean;
}

/**
 * An object which defines a way of joining of sets.
 * @class Types/_source/Query/Join
 * @mixes Types/_entity/OptionsToPropertyMixin
 * @public
 */
export class Join extends OptionsToPropertyMixin {
    /**
     * @cfg {String} The right set name
     * @name Types/_source/Query/Join#resource
     */
    protected _$resource: string = '';

    /**
     * @cfg {String} The alias of the right set name
     * @name Types/_source/Query/Join#as
     */
    protected _$as: string = '';

    /**
     * @cfg {Object} Join rule
     * @name Types/_source/_source/Query/Join#on
     */
    protected _$on: IHashMap<string> = {};

    /**
     * @cfg {Object} Field names to select
     * @name Types/_source/Query/Join#select
     */
    protected _$select: IHashMap<string> = {};

    /**
     * @cfg {Boolean} It's an inner join
     * @name Types/_source/Query/Join#inner
     */
    protected _$inner: boolean = true;

    constructor(options?: IJoinOptions) {
        super();
        OptionsToPropertyMixin.call(this, options);
    }

    /**
     * Returns the right set name
     */
    getResource(): string {
        return this._$resource;
    }

    /**
     * Returns the alias of the right set name
     */
    getAs(): string {
        return this._$as;
    }

    /**
     * Returns join rule
     */
    getOn(): IHashMap<string> {
        return this._$on;
    }

    /**
     * Returns field names to select
     */
    getSelect(): IHashMap<string> {
        return this._$select;
    }

    /**
     * Returns flag that it's an inner join
     */
    isInner(): boolean {
        return this._$inner;
    }
}

interface IOrderOptions {
   selector: string;
   order?: boolean | string;
   nullPolicy?: boolean;
}

/**
 * An object which defines a way of sorting of sets.
 * @class Types/_source/Query/Order
 * @mixes Types/_entity/OptionsToPropertyMixin
 * @public
 */
export class Order extends OptionsToPropertyMixin {
    /**
     * @cfg {String} Field name to apply the sorting for
     * @name Types/_source/Query/Order#selector
     */
    protected _$selector: string = '';

    /**
     * @cfg {Boolean} Order of the sorting
     * @name Types/_source/Query/Order#order
     */
    protected _$order: boolean | string = false;

    /**
     * @cfg {Boolean} NULL-like values positioning policy (undefined - depending on 'order' option, false - in the beginning, true - in the end)
     * @name Types/_source/Query/Order#nullPolicy
     */
    protected _$nullPolicy: boolean = undefined;

    constructor(options?: IOrderOptions) {
        super();
        OptionsToPropertyMixin.call(this, options);

        let order = this._$order;
        if (typeof order === 'string') {
            order = order.toUpperCase();
        }
        switch (order) {
            case Order.SORT_DESC:
            case Order.SORT_DESC_STR:
                this._$order = Order.SORT_DESC;
                break;
            default:
                this._$order = Order.SORT_ASC;
        }
    }

    /**
     * Returns field name to apply the sorting for
     */
    getSelector(): string {
        return this._$selector;
    }

    /**
     * Returns order of the sorting
     */
    getOrder(): boolean | string {
        return this._$order;
    }

    /**
     * Returns NULL-like values positioning policy (undefined - depending on 'order' option, false - in the beginning, true - in the end)
     */
    getNullPolicy(): boolean {
        return this._$nullPolicy === undefined ? !this.getOrder() : this._$nullPolicy;
    }

    // region Static

    /**
     * 'Ascending' sort order
     */
    static get SORT_ASC(): boolean {
        return false;
    }

    /**
     * 'Descending' sort order
     */
    static get SORT_DESC(): boolean {
        return true;
    }

    /**
     * 'Ascending' sort order as a string
     */
    static get SORT_ASC_STR(): string {
        return 'ASC';
    }

    /**
     * 'Descending' sort order as a string
     */
    static get SORT_DESC_STR(): string {
        return 'DESC';
    }

    /**
     * NULL-like values positioning policy: in the beginning
     */
    static get NULL_POLICY_FIRST(): boolean {
        return false;
    }

    /**
     * NULL-like values positioning policy: in the end
     */
    static get NULL_POLICY_LAST(): boolean {
        return true;
    }

    // endregion
}

/**
 * Query to build a selection from multiple sets within data source.
 * @remark
 * Let's select 100 shop orders from last twenty-four hours and sort them by ascending of order number:
 * <pre>
 *     import {Query} from 'Types/source';
 *
 *     const twentyFourHoursAgo = new Date();
 *     twentyFourHoursAgo.setDate(twentyFourHoursAgo.getDate() - 1);
 *
 *     const query = new Query();
 *     query
 *         .select(['id', 'date', 'customerId'])
 *         .from('Orders')
 *         .where((order) => order.date - twentyFourHoursAgo >= 0)
 *         .orderBy('id')
 *         .limit(100);
 * </pre>
 * @class Types/_source/Query
 * @implements Types/_entity/ICloneable
 * @public
 * @author Мальцев А.А.
 */
export default class Query<T = unknown> implements ICloneable {
    /**
     * Field names to select
     */
    protected _select: IHashMap<string> = {};

    /**
     * The name of the set to select data from
     */
    protected _from: string = '';

    /**
     * Alias of the set to select data from
     */
    protected _as: string = '';

    /**
     * Rules for join data from another sets
     */
    protected _join: Join[] = [];

    /**
     * Rules for filtering data
     */
    protected _where: WhereExpression<T> = {};

    /**
     * Rules for grouping data
     */
    protected _groupBy: string[] = [];

    /**
     * Rules for sorting data
     */
    protected _orderBy: Order[] = [];

    /**
     * Offset to slice the selection from the beginning
     */
    protected _offset: number = 0;

    /**
     * Maximum rows count in the selection
     */
    protected _limit: number = undefined;

    /**
     * Additional metadata to send to the data source
     */
    protected _meta: unknown | IMeta = {};

    // region ICloneable

    readonly '[Types/_entity/ICloneable]': boolean;

    clone<U = this>(): U {
        // TODO: deeper clone?
        const clone = new Query<T>();
        clone._select = duplicate(this._select);
        clone._from = this._from;
        clone._as = this._as;
        clone._join = this._join.slice();
        clone._where = duplicate(this._where);
        clone._groupBy = this._groupBy.slice();
        clone._orderBy = this._orderBy.slice();
        clone._offset = this._offset;
        clone._limit = this._limit;
        clone._meta = duplicate(this._meta);

        return clone as unknown as U;
    }

    // endregion

    // region Public methods

    /**
     * Resets all the previously defined settings
     */
    clear(): this {
        this._select = {};
        this._from = '';
        this._as = '';
        this._join = [];
        this._where = {};
        this._groupBy = [];
        this._orderBy = [];
        this._offset = 0;
        this._limit = undefined;
        this._meta = {};

        return this;
    }

    /**
     * Returns field names to select
     * @example
     * Get field names to select:
     * <pre>
     *     import {Query} from 'Types/source';
     *     const query = new Query()
     *         .select(['id', 'date']);
     *     console.log(query.getSelect()); // {id: 'id', date: 'date'}
     * </pre>
     */
    getSelect(): IHashMap<string> {
        return this._select;
    }

    /**
     * Sets field names to select
     * @param expression Field names to select
     * @example
     * Let's select shop orders with certain fields set:
     * <pre>
     *     import {Query} from 'Types/source';
     *     const query = new Query()
     *         .select(['id', 'date', 'customerId' ])
     *         .from('Orders');
     * </pre>
     * Let's select shop orders with all available fields:
     * <pre>
     *     import {Query} from 'Types/source';
     *     const query = new Query()
     *         .select('*')
     *         .from('Orders');
     * </pre>
     */
    select(expression: SelectExpression): this {
        this._select = parseSelectExpression(expression);

        return this;
    }

    /**
     * Returns the name of the set to select data from
     * @example
     * Get the name of the set:
     * <pre>
     *     import {Query} from 'Types/source';
     *     const query = new Query()
     *         .select(['id', 'date'])
     *         .from('Orders');
     *     console.log(query.getFrom()); // 'Orders'
     * </pre>
     */
    getFrom(): string {
        return this._from;
    }

    /**
     * Returns alias of the set to select data from
     * @example
     * Get the alias of the set:
     * <pre>
     *     import {Query} from 'Types/source';
     *     const query = new Query()
     *         .select(['o.id', 'o.date'])
     *         .from('Orders', 'o');
     *     console.log(query.getAs()); // 'o'
     * </pre>
     */
    getAs(): string {
        return this._as;
    }

    /**
     * Sets the name (and the alias if necessary) of the set to select data from
     * @param name The name of the set
     * @param [as] The alias of the set
     * @example
     * Let's select shop orders with defining the alias:
     * <pre>
     *     import {Query} from 'Types/source';
     *     const query = new Query()
     *         .select(['o.id', 'o.date', 'o.customerId'])
     *         .from('Orders', 'o');
     * </pre>
     */
    from(name: string, as?: string): this {
        this._from = name;
        this._as = as;

        return this;
    }

    /**
     * Returns rules for join data from another sets
     * @example
     * Get the rules for joining with 'Customers' set:
     * <pre>
     *     import {Query} from 'Types/source';
     *     const query = new Query()
     *         .select('*')
     *         .from('Orders')
     *         .join(
     *             'Customers',
     *             {id: 'customerId'},
     *             ['name', 'email']
     *         );
     *
     *     const join = query.getJoin()[0];
     *     console.log(join.getResource()); // 'Customers'
     *     console.log(join.getSelect()); // {name: 'name', email: 'email'}
     * </pre>
     */
    getJoin(): Join[] {
        return this._join;
    }

    /**
     * Sets rule to join data from another set
     * @param name The name (and alias if necessary) of the another set
     * @param on Joining conditions
     * @param expression Field names (and aliases if necessary) to select from another set
     * @param [inner=true] It is an inner or outer join
     * @example
     * <pre>
     *     import {Query} from 'Types/source';
     *
     *     const query = new Query()
     *         .select('*')
     *         .from('Orders')
     *         .join(
     *             'Customers',
     *             {id: 'customerId'},
     *             '*'
     *         );
     *
     *     const query = new Query()
     *         .select('*')
     *         .from('Orders')
     *         .join(
     *             'Customers',
     *             {id: 'customerId'},
     *             {customerName: 'name', customerEmail: 'email'}
     *         );
     * </pre>
     */
    join(name: string | string[], on: IHashMap<string>, expression: SelectExpression, inner?: boolean): this {
        if (typeof name === 'string') {
            name = name.split(' ');
        }

        if (!(name instanceof Array)) {
            throw new Error('Invalid argument "name"');
        }

        this._join.push(new Join({
            resource: name.shift(),
            as: name.shift() || '',
            on,
            select: parseSelectExpression(expression),
            inner: inner === undefined ? true : inner
        }));

        return this;
    }

    /**
     * Returns rules for filtering data
     * @example
     * Get rules for filtering data:
     * <pre>
     *     import {Query} from 'Types/source';
     *
     *     const query = new Query()
     *         .select('*')
     *         .from('Orders')
     *         .where({host: 'my.store.com'});
     *
     *     console.log(query.getWhere()); // {'host': 'my.store.com'}
     *
     *     const twentyFourHoursAgo = new Date();
     *     twentyFourHoursAgo.setDate(twentyFourHoursAgo.getDate() - 1);
     *     const dynamicQuery = new Query();
     *         .select(['id', 'date', 'customerId'])
     *         .from('Orders')
     *         .where((order) => order.date - twentyFourHoursAgo >= 0)
     *         .orderBy('id')
     *         .limit(100);
     * </pre>
     */
    getWhere(): WhereExpression<T> {
        return this._where;
    }

    /**
     * Sets rules for filtering data
     * @remark
     * If argument 'expression' is a Function it would receive following arguments: an item of the selection and its ordering number.
     * @param expression Rules for filtering data
     * @example
     * Let's select landed flights to Moscow "Sheremetyevo" (SVO) airport from New York or Los Angeles:
     * <pre>
     *     import {Query} from 'Types/source';
     *     const query = new Query()
     *         .select('*')
     *         .from('AirportsSchedule')
     *         .where({
     *             to: 'SVO',
     *             state: 'Landed',
     *             fromCity: ['New York', 'Los Angeles']
     *         });
     * </pre>
     * Let's select flights arriving to Moscow "Sheremetyevo" (SVO) from New York "JFK" with "Delta" (DL) airline or from Paris "CDG" with "Air France" (AF) airline:
     * <pre>
     *     import {Query, queryAndExpression, queryOrExpression} from 'Types/source';
     *     const query = new Query()
     *         .select('*')
     *         .from('AirportsSchedule')
     *         .where(queryAndExpression({
     *             to: 'SVO',
     *             state: 'Scheduled'
     *         }, queryOrExpression(
     *             {from: 'JFK', airline: 'DL'},
     *             {from: 'CDG', airline: 'AF'}
     *         )));
     * </pre>
     * Let's select 100 shop orders from last twenty-four hours and sort them by ascending of order number:
     * <pre>
     *     import {Query} from 'Types/source';
     *     const twentyFourHoursAgo = new Date();
     *     twentyFourHoursAgo.setDate(twentyFourHoursAgo.getDate() - 1);
     *     const dynamicQuery = new Query();
     *         .select(['id', 'date', 'customerId'])
     *         .from('Orders')
     *         .where((order) => order.date - twentyFourHoursAgo >= 0)
     *         .orderBy('id')
     *         .limit(100);
     * </pre>
     */
    where(expression: WhereExpression<T> | object): this {
        expression = expression || {};
        const type = typeof expression;
        if (type !== 'object' && type !== 'function') {
            throw new TypeError('Invalid argument "expression"');
        }

        this._where = expression as WhereExpression<T>;

        return this;
    }

    /**
     * Returns rules for sorting data
     * @example
     * Get the rules for sorting:
     * <pre>
     *     import {Query} from 'Types/source';
     *     const query = new Query()
     *         .select('*')
     *         .from('Orders')
     *         .orderBy('id');
     *
     *     const order = query.getOrderBy()[0];
     *     console.log(order.getSelector()); // 'id'
     *     console.log(order.getOrder()); // false
     * </pre>
     */
    getOrderBy(): Order[] {
        return this._orderBy;
    }

    /**
     * Sets rules for sorting data
     * @param selector Field name of field names and sorting directions for each of them (false - ascending,
     * true - descending)
     * @param [desc=false] Sort by descending (of selector is a string)
     * @param [nullPolicy] NULL-like values positioning policy (undefined - depending on 'order' option, false - in the beginning, true - in the end)
     * @example
     * Let's sort orders by ascending values of field 'id':
     * <pre>
     *     import {Query} from 'Types/source';
     *     const query = new Query()
     *         .select('*')
     *         .from('Orders')
     *         .orderBy('id');
     * </pre>
     * Let's sort orders by descending values of field 'id':
     * <pre>
     *     import {Query} from 'Types/source';
     *     const query = new Query()
     *         .select('*')
     *         .from('Orders')
     *         .orderBy('id', true);
     * </pre>
     * Let's sort orders by ascending values of field 'customerId' first and then by descending values of field 'date':
     * <pre>
     *     import {Query, QueryOrder} from 'Types/source';
     *     const query = new Query()
     *         .select('*')
     *         .from('Orders')
     *         .orderBy([
     *             {customerId: QueryOrder.SORT_ASC},
     *             {date: QueryOrder.SORT_DESC}
     *         ]);
     * </pre>
     * Let's sort orders use various null policies for each field:
     * <pre>
     *     import {Query, QueryOrder} from 'Types/source';
     *     const query = new Query()
     *         .select('*')
     *         .from('Orders')
     *         .orderBy([
     *             ['customerId', QueryOrder.SORT_DESC, QueryOrder.NULL_POLICY_FIRST],
     *             [date, QueryOrder.SORT_ASC, QueryOrder.NULL_POLICY_LAST]
     *         ]);
     * </pre>
     */
    orderBy(
        selector: OrderSelector,
        desc?: boolean,
        nullPolicy?: boolean
    ): this {
        if (desc === undefined) {
            desc = true;
        }

        this._orderBy = [];

        if (typeof selector === 'object') {
            const processObject = (obj) => {
                if (!obj) {
                    return;
                }
                for (const key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        this._orderBy.push(new Order({
                            selector: key,
                            order: obj[key]
                        }));
                    }
                }
            };

            if (selector instanceof Array) {
                for (let i = 0; i < selector.length; i++) {
                    const selectorItem = selector[i];
                    if (selectorItem instanceof Array) {
                        const [
                            selectorField,
                            selectorOrder,
                            selectorNullPolicy
                        ]: [
                            string,
                            boolean,
                            boolean
                        ] = selectorItem;

                        this._orderBy.push(new Order({
                            selector: selectorField,
                            order: selectorOrder,
                            nullPolicy: selectorNullPolicy
                        }));
                    } else {
                        processObject(selectorItem);
                    }
                }
            } else {
                processObject(selector);
            }
        } else if (selector) {
            this._orderBy.push(new Order({
                selector,
                order: desc,
                nullPolicy
            }));
        }

        return this;
    }

    /**
     * Returns rules for grouping data
     * @example
     * <pre>
     *     import {Query} from 'Types/source';
     *     const query = new Query()
     *         .select('*')
     *         .from('Orders')
     *         .groupBy('customerId');
     *
     *     console.log(query.getGroupBy()); // ['customerId']
     * </pre>
     */
    getGroupBy(): string[] {
        return this._groupBy;
    }

    /**
     * Sets rules for grouping data
     * @param expression Rules for grouping data
     * @example
     * <pre>
     *     import {Query} from 'Types/source';
     *
     *     const querySimple = new source.Query()
     *         .select('*')
     *         .from('Orders')
     *         .groupBy('customerId');
     *
     *     const queryComplex = new Query()
     *         .select('*')
     *         .from('Orders')
     *         .groupBy(['date', 'customerId']);
     * </pre>
     */
    groupBy(expression: string | string[]): this {
        if (typeof expression === 'string') {
            expression = [expression];
        }

        if (!(expression instanceof Array)) {
            throw new Error('Invalid argument');
        }

        this._groupBy = expression;

        return this;
    }

    /**
     * Returns offset to slice the selection from the beginning
     * @example
     * <pre>
     *     import {Query} from 'Types/source';
     *     const query = new Query()
     *         .select('*')
     *         .from('Orders')
     *         .offset(50);
     *
     *     query.getOffset(); // 50
     * </pre>
     */
    getOffset(): number {
        return this._offset;
    }

    /**
     * Sets offset to slice the selection from the beginning
     * @param start Offset value
     * @example
     * Skip first 50 orders:
     * <pre>
     *     import {Query} from 'Types/source';
     *     const query = new Query()
     *         .select('*')
     *         .from('Orders')
     *         .offset(50);
     * </pre>
     */
    offset(start: number | string): this {
        this._offset = parseInt(start as string, 10) || 0;

        return this;
    }

    /**
     * Returns maximum rows count in the selection
     * @example
     * <pre>
     *     import {Query} from 'Types/source';
     *     const query = new Query()
     *         .select('*')
     *         .from('Orders')
     *         .limit(10);
     *
     *     console.log(query.getLimit()); // 10
     * </pre>
     */
    getLimit(): number {
        return this._limit;
    }

    /**
     * Sets maximum rows count in the selection
     * @param count Maximum rows count
     * @example
     * Get first 10 orders:
     * <pre>
     *     import {Query} from 'Types/source';
     *     const query = new Query()
     *         .select('*')
     *         .from('Orders')
     *         .limit(10);
     * </pre>
     */
    limit(count: number): this {
        this._limit = count;

        return this;
    }

    /**
     * Returns additional metadata
     * @example
     * <pre>
     *     import {Query, QueryNavigationType} from 'Types/source';
     *     const query = new Query()
     *         .select('*')
     *         .from('Catalogue')
     *         .meta({navigationType: QueryNavigationType.Offset});
     *
     *     console.log(query.getMeta()); // {navigationType: 'Offset'}
     * </pre>
     */
    getMeta<U = IMeta>(): U {
        return this._meta as U;
    }

    /**
     * Sets additional metadata to send to the data source.
     * Additional metadata provides information to the data source about desired behaviour in various aspects in the way of extracting data. Certain data source may not support those aspects so make sure it does if you want to use them.
     * @param data Metadata
     * @example
     * Let's set metadata field which point to desired navigation type in query:
     * <pre>
     *     import {Query, QueryNavigationType} from 'Types/source';
     *     const query = new Query()
     *         .select('*')
     *         .from('Catalogue')
     *         .where({'parentId': 10})
     *         .meta({navigationType: QueryNavigationType.Offset});
     * </pre>
     */
    meta<U = IMeta>(data: U): this {
        data = data || ({} as unknown as U);
        if (typeof data !== 'object') {
            throw new TypeError('Invalid argument "data"');
        }

        this._meta = data;

        return this;
    }

    // endregion
}

Object.assign(Query.prototype, {
    '[Types/_source/Query]': true,
    _moduleName: 'Types/source:Query'
});
