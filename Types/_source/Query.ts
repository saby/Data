/// <amd-module name="Types/_source/Query" />
/**
 * Запрос на выборку.
 *
 * Выберем 100 заказов за последние сутки и отсортируем их по возрастанию номера:
 * <pre>
 *    require(['Types/Query/Query'], function (Query) {
 *       var query = new Query(),
 *          date = new Date();
 *
 *       date.setDate(date.getDate() - 1);
 *
 *       query
 *          .select(['id', 'date', 'customerId'])
 *          .from('Orders')
 *          .where(function(order) {
 *             return order.date - date >= 0;
 *          })
 *          .orderBy('id')
 *          .limit(100);
 *    });
 * </pre>
 * @class Types/_source/Query
 * @implements Types/_entity/ICloneable
 * @mixes Types/_entity/OptionsMixin
 * @public
 * @author Мальцев А.А.
 */

import {ICloneable, OptionsToPropertyMixin} from '../entity';
import {mixin} from '../util';

declare type Where = Object | ((item: any, index: number) => boolean);
declare type Expression = Object | Array<string> | string;

/**
 * Clones object
 * @param data Object to clone
 * @return {Object}
 */
function duplicate(data: any): Object {
   if (data['[Types/_entity/ICloneable]']) {
      return data.clone();
   }
   if (data && typeof data === 'object') {
      return Object.assign({}, data);
   }
   return data;
}

/**
 * Parses expression from fields set
 * @param expression Expression with fields set
 * @return {Object}
 */
function parseSelectExpression(expression: Expression) {
   if (typeof expression === 'string') {
      expression = expression.split(/[ ,]/);
   }

   if (expression instanceof Array) {
      let orig = expression;
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

/**
 * Объект, задающий способ объединения множеств.
 * @class Types/Query/Join
 * @mixes Types/_entity/OptionsMixin
 * @public
 */
export class Join extends mixin(Object, OptionsToPropertyMixin) {
   /**
    * @cfg {String} Правое множество
    * @name Types/Query/Join#resource
    */
   protected _$resource: string = '';

   /**
    * @cfg {String} Синоним правого множества
    * @name Types/Query/Join#as
    */
   protected _$as: string = '';

   /**
    * @cfg {Object} Правило объединения
    * @name Types/Query/Join#on
    */
   protected _$on: Object = {};

   /**
    * @cfg {Object} Выбираемые поля
    * @name Types/Query/Join#select
    */
   protected _$select: Object = {};

   /**
    * @cfg {Boolean} Внутреннее объединение
    * @name Types/Query/Join#inner
    */
   protected _$inner: boolean = true;

   constructor(options?: Object) {
      super();
      OptionsToPropertyMixin.call(this, options);
   }

   /**
    * Возвращает правое множество
    * @return {String}
    */
   getResource(): string {
      return this._$resource;
   }

   /**
    * Возвращает синоним правого множества
    * @return {String}
    */
   getAs(): string {
      return this._$as;
   }

   /**
    * Возвращает правило объеднения
    * @return {Object}
    */
   getOn(): Object {
      return this._$on;
   }

   /**
    * Возвращает правило объеднения
    * @return {Object}
    */
   getSelect(): Object {
      return this._$select;
   }

   /**
    * Это внутреннее объединение
    * @return {Boolean}
    */
   isInner(): boolean {
      return this._$inner;
   }
}

/**
 * Объект, задающий способ сортировки множества
 * @class Types/Query/Order
 * @mixes Types/_entity/OptionsMixin
 * @public
 */
export class Order extends mixin(Object, OptionsToPropertyMixin) {
   /**
    * @typedef {Boolean} Order
    * @variant false По возрастанию
    * @variant true По убыванию
    */

   /**
    * @cfg {String} Объект сортировки
    * @name Types/Query/Order#selector
    */
   protected _$selector: string = '';

   /**
    * @cfg {Order} Порядок сортировки
    * @name Types/Query/Order#order
    */
   protected _$order: boolean | string = false;

   constructor(options?: Object) {
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
    * Возвращает Объект сортировки
    * @return {String}
    */
   getSelector(): string {
      return this._$selector;
   }

   /**
    * Возвращает порядок сортировки
    * @return {Order}
    */
   getOrder(): boolean | string {
      return this._$order;
   }

   //region Static

   /**
    * Сортировка по возрастанию
    */
   static get SORT_ASC(): boolean {
      return false;
   }

   /**
    * Сортировка по убыванию
    */
   static get SORT_DESC(): boolean {
      return true;
   }

   /**
    * Сортировка по возрастанию (для строки)
    */
   static get SORT_ASC_STR(): string {
      return 'ASC';
   }

   /**
    * Сортировка по убыванию (для строки)
    */
   static get SORT_DESC_STR(): string {
      return 'DESC';
   }

   //endregion Static
}

/**
 * Query implementation
 */
export default class Query extends mixin(Object, OptionsToPropertyMixin) implements ICloneable /** @lends Types/_source/Query.prototype */{
   /**
    * Выбираемые поля
    */
   protected _select: Object = {};

   /**
    * Объект выборки
    */
   protected _from: string = '';

   /**
    * Псеводним объекта выборки
    */
   protected _as: string = '';

   /**
    * Объединения с другими выборками
    */
   protected _join: Join[] = [];

   /**
    * Способ фильтрации
    */
   protected _where: Where = {};

   /**
    * Способ группировки
    */
   protected _groupBy: string[] = [];

   /**
    * Способы сортировки
    */
   protected _orderBy: Order[] = [];

   /**
    * Смещение
    */
   protected _offset: number = 0;

   /**
    * Максимальное кол-во записей
    */
   protected _limit: number = undefined;

   /**
    * Мета-данные запроса
    */
   protected _meta: Object = {};

   constructor(options?: Object) {
      super();
      OptionsToPropertyMixin.call(this, options);
   }

   //region ICloneable

   readonly '[Types/_entity/ICloneable]': boolean = true;

   clone(): Query {
      //TODO: deeper clone?
      let clone = new Query();
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

      return clone;
   }

   //endregion ICloneable

   //region Public methods

   /**
    * Сбрасывает все параметры запроса
    * @return {Types/_source/Query}
    */
   clear(): Query {
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
    * Возвращает поля выборки
    * @return {Object.<String>}
    * @example
    * Получим поля выборки:
    * <pre>
    *    require(['Types/Query/Query'], function (Query) {
    *       var query = new Query()
    *          .select(['id', 'date']);
    *       console.log(query.getSelect());//{id: 'id', date: 'date'}
    *    });
    * </pre>
    */
   getSelect(): Object {
      return this._select;
   }

   /**
    * Устанавливает поля выборки
    * @param {Array.<String>|Object.<String>|String} expression Выбираемые поля
    * @return {Types/_source/Query}
    * @example
    * Выбираем все заказы с определенным набором полей:
    * <pre>
    *    require(['Types/Query/Query'], function (Query) {
    *       var query = new Query()
    *          .select(['id', 'date', 'customerId' ])
    *          .from('Orders');
    *    });
    * </pre>
    * Выбираем все заказы со всеми полями:
    * <pre>
    *    require(['Types/Query/Query'], function (Query) {
    *       var query = new Query()
    *          .select('*')
    *          .from('Orders');
    *    });
    * </pre>
    */
   select(expression: Expression): Query {
      this._select = parseSelectExpression(expression);

      return this;
   }

   /**
    * Возвращает объект выборки
    * @return {String}
    * @example
    * Получим объект выборки:
    * <pre>
    *    require(['Types/Query/Query'], function (Query) {
    *       var query = new Query()
    *          .select(['id', 'date'])
    *          .from('Orders');
    *       console.log(query.getFrom());//'Orders'
    *    });
    * </pre>
    */
   getFrom(): string {
      return this._from;
   }

   /**
    * Возвращает псеводним выборки
    * @return {String}
    * @example
    * Получим псеводним выборки:
    * <pre>
    *    require(['Types/Query/Query'], function (Query) {
    *       var query = new Query()
    *          .select(['id', 'date'])
    *          .from('Orders', 'o');
    *       console.log(query.getAs());//'o'
    *    });
    * </pre>
    */
   getAs(): string {
      return this._as;
   }

   /**
    * Устанавливает объект выборки
    * @param {String} resource Объект выборки
    * @param {String} [as] Псеводним объекта выборки
    * @return {Types/_source/Query}
    * @example
    * Выбираем заказы с указанием полей через псеводним:
    * <pre>
    *    require(['Types/Query/Query'], function (Query) {
    *       var query = new Query()
    *          .select(['o.id', 'o.date', 'o.customerId'])
    *          .from('Orders', 'o');
    *    });
    * </pre>
    */
   from(resource: string, as?: string): Query {
      this._from = resource;
      this._as = as;

      return this;
   }

   /**
    * Возвращает способы объединения
    * @return {Types/Query/Join[]}
    * @example
    * Получим способ объединения c объектом Customers:
    * <pre>
    *    require(['Types/Query/Query'], function (Query) {
    *       var query = new Query()
    *          .select('*')
    *          .from('Orders')
    *          .join(
    *             'Customers',
    *             {id: 'customerId'},
    *             ['name', 'email']
    *          );
    *
    *       var join = query.getJoin()[0];
    *       console.log(join.getResource());//'Customers'
    *       console.log(join.getSelect());//{name: 'name', email: 'email'}
    *    });
    * </pre>
    */
   getJoin(): Join[] {
      return this._join;
   }

   /**
    * Устанавливает объединение выборки с другой выборкой
    * @param {String|Array} resource Объект выборки для объединения и его псеводним
    * @param {Object} on Правило объединения
    * @param {Object|Array|String} expression Выбираемые поля
    * @param {Boolean} [inner=true] Внутреннее или внешнее объединение
    * @return {Types/_source/Query}
    * @example
    * <pre>
    *    require(['Types/Query/Query'], function (Query) {
    *       var query = new Query()
    *          .select('*')
    *          .from('Orders')
    *          .join(
    *             'Customers',
    *             {id: 'customerId'},
    *             '*'
    *          );
    *
    *       var query = new Query()
    *          .select('*')
    *          .from('Orders')
    *          .join(
    *             'Customers',
    *             {id: 'customerId'},
    *             {customerName: 'name', customerEmail: 'email'}
    *          );
    *    });
    * </pre>
    */
   join(resource: string | Array<string>, on: any, expression: Expression, inner?: boolean): Query {
      if (typeof resource === 'string') {
         resource = resource.split(' ');
      }

      if (!(resource instanceof Array)) {
         throw new Error('Invalid argument "resource"');
      }

      this._join.push(new Join({
         resource: resource.shift(),
         as: resource.shift() || '',
         on: on,
         select: parseSelectExpression(expression),
         inner: inner === undefined ? true : inner
      }));

      return this;
   }

   /**
    * Возвращает способ фильтрации
    * @return {Object.<String>|Function(*, Number):Boolean}
    * @example
    * Получим способ фильтрации выборки:
    * <pre>
    *    require(['Types/Query/Query'], function (Query) {
    *       var query = new Query()
    *          .select('*')
    *          .from('Orders')
    *          .where({host: 'my.store.com'});
    *
    *       console.log(query.getWhere());//{'host': 'my.store.com'}
    *    });
    * </pre>
    */
   getWhere(): Where {
      return this._where;
   }

   /**
    * Устанавливает фильтр выборки.
    * @remark
    * Если expression передан в виде функции, то она принимает аргументы: элемент коллекции и его порядковый номер.
    * @param {Object.<String>|Function(*, Number): Boolean} expression Условие фильтрации
    * @return {Types/_source/Query}
    * @example
    * Выберем рейсы, приземлившиеся в аэропорту "Шереметьево", прибывшие из Нью-Йорка или Лос-Анджелеса:
    * <pre>
    *    var query = new Query()
    *       .select('*')
    *       .from('AirportsSchedule')
    *       .where({
    *          iata: 'SVO',
    *          direction: 'Arrivals',
    *          state: 'Landed',
    *          fromCity: ['New York', 'Los Angeles']
    *       });
    * </pre>
    * Выберем все заказы с номером больше 10, сделанные до текущего момента:
    * <pre>
    *    require(['Types/Query/Query'], function (Query) {
    *       var query = new Query()
    *          .select('*')
    *          .from('Orders')
    *          .where(function(order) {
    *             return order.id > 10 && Number(order.date) < Date.now();
    *          });
    *    });
    * </pre>
    */
   where(expression: Where): Query {
      expression = expression || {};
      let type = typeof expression;
      if (type !== 'object' && type !== 'function') {
         throw new TypeError('Invalid argument "expression"');
      }

      this._where = expression;

      return this;
   }

   /**
    * Возвращает способы сортировки
    * @return {Array.<Types/Query/Order>}
    * @example
    * Получим способы сортировки выборки:
    * <pre>
    *    require(['Types/Query/Query'], function (Query) {
    *       var query = new Query()
    *          .select('*')
    *          .from('Orders')
    *          .orderBy('id');
    *
    *       var order = query.getOrderBy()[0];
    *       console.log(order.getSelector());//'id'
    *       console.log(order.getOrder());//false
    *    });
    * </pre>
    */
   getOrderBy(): Order[] {
      return this._orderBy;
   }

   /**
    * Устанавливает порядок сортировки выборки
    * @param {String|Array.<Object.<Types/Query/Order/Order.typedef>>} selector Название поле сортировки или набор полей и направление сортировки в каждом (false - по возрастанию, true - по убыванию)
    * @param {Types/Query/Order/Order.typedef} [desc=false] По убыванию
    * @return {Types/_source/Query}
    * @example
    * Отсортируем заказы по полю id по возрастанию:
    * <pre>
    *    require(['Types/Query/Query'], function (Query) {
    *       var query = new Query()
    *          .select('*')
    *          .from('Orders')
    *          .orderBy('id');
    *    });
    * </pre>
    * Отсортируем заказы по полю id по убыванию:
    * <pre>
    *    require(['Types/Query/Query'], function (Query) {
    *       var query = new Query()
    *          .select('*')
    *          .from('Orders')
    *          .orderBy('id', true);
    *    });
    * </pre>
    * Отсортируем заказы сначала по полю customerId по возрастанию, затем по полю date по убыванию:
    * <pre>
    *    require(['Types/Query/Query'], function (Query) {
    *       var query = new Query()
    *          .select('*')
    *          .from('Orders')
    *          .orderBy([
    *             {customerId: false},
    *             {date: true}
    *          ]);
    *    });
    * </pre>
    */
   orderBy(selector: string | boolean[], desc?: boolean) {
      if (desc === undefined) {
         desc = true;
      }

      this._orderBy = [];

      if (typeof selector === 'object') {
         let processObject = (obj) => {
            if (!obj) {
               return;
            }
            for (let key in obj) {
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
               processObject(selector[i]);
            }
         } else {
            processObject(selector);
         }
      } else if (selector) {
         this._orderBy.push(new Order({
            selector: selector,
            order: desc
         }));
      }

      return this;
   }

   /**
    * Возвращает способ группировки
    * @return {Array.<String>}
    * @example
    * Получим способ группировки выборки:
    * <pre>
    *    require(['Types/Query/Query'], function (Query) {
    *       var query = new Query()
    *          .select('*')
    *          .from('Orders')
    *          .groupBy('customerId');
    *
    *       console.log(query.getGroupBy());//['customerId']
    *    });
    * </pre>
    */
   getGroupBy(): string[] {
      return this._groupBy;
   }

   /**
    * Устанавливает способ группировки выборки
    * @param {String|Array.<String>} expression Способ группировки элементов
    * @return {Types/_source/Query}
    * @example
    * <pre>
    *    require(['Types/Query/Query'], function (Query) {
    *       var query = new Query()
    *          .select('*')
    *          .from('Orders')
    *          .groupBy('customerId');
    *
    *       var query = new Query()
    *          .select('*')
    *          .from('Orders')
    *          .groupBy(['date', 'customerId']);
    *    });
    * </pre>
    */
   groupBy(expression: string | string[]): Query {
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
    * Возвращает смещение
    * @return {Number}
    * @example
    * Получим смещение выборки:
    * <pre>
    *    require(['Types/Query/Query'], function (Query) {
    *       var query = new Query()
    *          .select('*')
    *          .from('Orders')
    *          .offset(50);
    *
    *       query.getOffset();//50
    *    });
    * </pre>
    */
   getOffset(): number {
      return this._offset;
   }

   /**
    * Устанавливает смещение первого элемента выборки
    * @param {Number} start Смещение первого элемента выборки
    * @return {Types/_source/Query}
    * @example
    * Выберем все заказы, начиная с пятидесятого:
    * <pre>
    *    require(['Types/Query/Query'], function (Query) {
    *       var query = new Query()
    *          .select('*')
    *          .from('Orders')
    *          .offset(50);
    *    });
    * </pre>
    */
   offset(start: number | string): Query {
      this._offset = parseInt(<string>start, 10) || 0;

      return this;
   }

   /**
    * Возвращает максимальное количество записей выборки
    * @return {Number}
    * @example
    * Получим максимальное количество записей выборки:
    * <pre>
    *    require(['Types/Query/Query'], function (Query) {
    *       var query = new Query()
    *          .select('*')
    *          .from('Orders')
    *          .limit(10);
    *
    *       console.log(query.getLimit());//10
    *    });
    * </pre>
    */
   getLimit(): number {
      return this._limit;
   }

   /**
    * Устанавливает ограничение кол-ва элементов выборки
    * @param {Number} count Максимальное кол-во элементов выборки
    * @return {Types/_source/Query}
    * @example
    * Выберем первые десять заказов:
    * <pre>
    *    require(['Types/Query/Query'], function (Query) {
    *       var query = new Query()
    *          .select('*')
    *          .from('Orders')
    *          .limit(10);
    *    });
    * </pre>
    */
   limit(count: number): Query {
      this._limit = count;

      return this;
   }

   /**
    * Возвращает мета-данные выборки
    * @return {Object}
    * @example
    * Получим мета-данные выборки:
    * <pre>
    *    require(['Types/Query/Query'], function (Query) {
    *       var query = new Query()
    *          .select('*')
    *          .from('Catalogue')
    *          .meta({selectBreadCrumbs: true});
    *
    *       console.log(query.getMeta());//{selectBreadCrumbs: true}
    *    });
    * </pre>
    */
   getMeta(): Object {
      return this._meta;
   }

   /**
    * Устанавливает мета-данные выборки
    * @param {Object} data Мета-данные
    * @return {Types/_source/Query}
    * @example
    * Укажем, что в результатах запроса хочем дополнительно получить "хлебные крошки":
    * <pre>
    *    require(['Types/Query/Query'], function (Query) {
    *       var query = new Query()
    *          .select('*')
    *          .from('Catalogue')
    *          .where({'parentId': 10})
    *          .meta({selectBreadCrumbs: true});
    *    });
    * </pre>
    */
   meta(data: Object): Query {
      data = data || {};
      if (typeof data !== 'object') {
         throw new TypeError('Invalid argument "data"');
      }

      this._meta = data;

      return this;
   }

   //endregion Public methods
}

Query.prototype['[Types/_source/Query]'] = true;
