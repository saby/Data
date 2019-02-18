/// <amd-module name="Types/di" />
/**
 * Dependency Injection через Service Locator. Работает через алиасы.
 * @author Мальцев А.А.
 */

const SINGLETONE_MAP_INDEX = 2;
const map = {};

/**
 * Проверяет валидность названия зависимости
 * @param {String} alias Название зависимости
 */
function checkAlias(alias: string): void {
   if (typeof alias !== 'string') {
      throw new TypeError('Alias should be a string');
   }
   if (!alias) {
      throw new TypeError('Alias is empty');
   }
}

/**
 * @typedef {Object} DependencyOptions
 * @property {Boolean} [single=false] Инстанциировать только один объект
 * @property {Boolean} [instantiate=true] Создавать новый экземпляр или использовать переданный инстанс
 */

/**
 * Регистрирует зависимость
 * @param {String} alias Название зависимости
 * @param {Function|Object} factory Фабрика объектов или готовый инстанс
 * @param {DependencyOptions} [options] Опции
 * @example
 * Зарегистрируем модель пользователя:
 * <pre>
 *    var User = Model.extend({});
 *    di.register('model.$user', User, {instantiate: false});
 *    di.register('model.user', User);
 * </pre>
 * Зарегистрируем экземпляр текущего пользователя системы:
 * <pre>
 *    var currentUser = new Model();
 *    di.register('app.user', currentUser, {instantiate: false});
 * </pre>
 * Зарегистрируем логер, который будет singleton:
 * <pre>
 *    define(['Core/core-extend'], function(CoreExtend) {
 *       var Logger = CoreExtend.extend({
 *          log: function() {}
 *       });
 *       di.register('app.logger', Logger, {single: true});
 *    });
 * </pre>
 * Зарегистрируем модель пользователя с переопределенными аргументами конструктора:
 * <pre>
 *    define(['Core/core-merge'], function(coreMerge) {
 *       di.register('model.crm-user', function(options) {
 *          return new User(coreMerge(options, {
 *             context: 'crm',
 *             dateFormat: 'Y/m/d'
 *          }));
 *       });
 *    });
 * </pre>
 */
export function register(alias: string, factory: Function|Object, options?: Object): void {
   checkAlias(alias);
   map[alias] = [factory, options];
}

/**
 * Удаляет регистрацию зависимости
 * @param {String} alias Название зависимости
 * @example
 * <pre>
 *    di.unregister('model.user');
 * </pre>
 */
export function unregister(alias: string): void {
   checkAlias(alias);
   delete map[alias];
}

/**
 * Проверяет регистрацию зависимости
 * @param {String} alias Название зависимости
 * @return Boolean
 * @example
 * <pre>
 *    var userRegistered = di.isRegistered('model.user');
 * </pre>
 */
export function isRegistered(alias: string): boolean {
   checkAlias(alias);
   return map.hasOwnProperty(alias);
}

/**
 * Создает экземпляр зарегистрированной зависимости.
 * @param {String|Function|Object} alias Название зависимости, или конструктор объекта или инстанс объекта
 * @param {Object} [options] Опции конструктора
 * @return Object
 * @example
 * <pre>
 *    var User = Model.extend();
 *    di.register('model.$user', User, {instantiate: false});
 *    //...
 *    var newUser = di.create('model.$user', {
 *       rawData: {}
 *    });
 * </pre>
 */
export function create<T>(alias: string|Function|Object, options?: Object): T {
   const result = resolve<T>(alias, options);
   if (typeof result === 'function') {
      return resolve(result, options);
   }
   return result;
}

/**
 * Разрешает зависимость
 * @param {String|Function|Object} alias Название зависимости, или конструктор объекта или инстанс объекта
 * @param {Object} [options] Опции конструктора
 * @return {Object|Function}
 * @example
 * <pre>
 *    var User = Model.extend();
 *    di.register('model.$user', User, {instantiate: false});
 *    di.register('model.user', User);
 *    //...
 *    var User = di.resolve('model.$user'),
 *       newUser = new User({
 *       rawData: {}
 *    });
 *    //...or...
 *    var newUser = di.resolve('model.user', {
 *       rawData: {}
 *    });
 * </pre>
 */
export function resolve<T>(alias: string|Function|Object, options?: Object): T {
   const aliasType = typeof alias;
   let Factory;
   let config;
   let singleInst;

   switch (aliasType) {
      case 'function':
         Factory = alias;
         break;
      case 'object':
         Factory = alias;
         config = { instantiate: false };
         break;
      default:
         if (!isRegistered(alias as string)) {
            throw new ReferenceError(`Alias "${alias}" does not registered`);
         }
         [Factory, config, singleInst] = map[alias as string];
   }

   if (config) {
      if (config.instantiate === false) {
         return Factory;
      }
      if (config.single === true) {
         if (singleInst === undefined) {
            singleInst = map[alias as string][SINGLETONE_MAP_INDEX] = new Factory(options);
         }
         return singleInst;
      }
   }

   return new Factory(options);
}
