import {IHashMap} from './_declarations';

/**
 * Dependency Injection через Service Locator. Работает через алиасы.
 * @public
 * @author Мальцев А.А.
 *
 */

const SINGLETONE_MAP_INDEX = 2;
const map = {};

interface IOptions {
    /**
     * Инстанциировать только один объект
     */
    instantiate?: boolean;

    /**
     * Создавать новый экземпляр или использовать переданный инстанс
     */
    single?: boolean;
}

/**
 * Проверяет валидность названия зависимости
 * @param alias Название зависимости
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
 * Регистрирует зависимость
 * @param alias Название зависимости
 * @param factory Фабрика объектов или готовый инстанс
 * @param [options] Опции
 * @example
 * Зарегистрируем модель пользователя:
 * <pre>
 *     import {register} from 'Types/di';
 *     import {Model} from 'Types/entity';
 *
 *     class User extends Model {
 *         // ...
 *     }
 *
 *     register('My/User', User, {instantiate: false});
 *     register('My/user', User);
 * </pre>
 * Зарегистрируем экземпляр текущего пользователя системы:
 * <pre>
 *     import {register} from 'Types/di';
 *     import {Model} from 'Types/entity';
 *
 *     const currentUser = new Model();
 *     register('application/user', currentUser, {instantiate: false});
 * </pre>
 * Зарегистрируем логер, который будет singleton:
 * <pre>
 *     import {register} from 'Types/di';
 *     import {Model} from 'Types/entity';
 *
 *     class Logger {
 *         log() {
 *             // ...
 *         }
 *     }
 *
 *     register('application/logger', Logger, {single: true});
 * </pre>
 * Зарегистрируем модель пользователя с переопределенными аргументами конструктора:
 * <pre>
 *     import {register} from 'Types/di';
 *     import {Model} from 'Types/entity';
 *
 *     class User extends Model {
 *         // ...
 *     }
 *
 *     register('application/models/user/crm', (options) => new User({...options, {
 *        context: 'crm',
 *        dateFormat: 'Y/m/d'
 *     }}));
 * </pre>
 */
export function register(alias: string, factory: Function | object, options?: IOptions): void {
    checkAlias(alias);
    map[alias] = [factory, options];
}

/**
 * Удаляет регистрацию зависимости
 * @param alias Название зависимости
 * @example
 * <pre>
 *     import {unregister} from 'Types/di';
 *     unregister('application/user');
 * </pre>
 */
export function unregister(alias: string): void {
    checkAlias(alias);
    delete map[alias];
}

/**
 * Проверяет регистрацию зависимости с указанным названием
 * @param alias Название зависимости
 * @example
 * <pre>
 *     import {isRegistered} from 'Types/di';
 *     console.log(isRegistered('application/user'));
 * </pre>
 */
export function isRegistered(alias: string): boolean {
    checkAlias(alias);
    return map.hasOwnProperty(alias);
}

/**
 * Возвращает занчение флага 'instantiate', с которым зарегистрирована зависимость
 * @param alias Название зависимости
 * @example
 * <pre>
 *     import {register, isInstantiable} from 'Types/di';
 *
 *     class Foo {
 *         // ...
 *     }
 *     register('foo', Foo);
 *     console.log(isInstantiable('Foo')); // true
 *
 *
 *     class Bar {
 *         // ...
 *     }
 *     register('Bar', Bar, {instantiate: false});
 *     console.log(isInstantiable('Bar')); // false
 * </pre>
 */
export function isInstantiable(alias: string): boolean {
    if (isRegistered(alias)) {
        const config = map[alias][1];
        return (config && config.instantiate) !== false;
    }
}

/**
 * Создает экземпляр зарегистрированной зависимости.
 * @param alias Название зависимости, или конструктор объекта или инстанс объекта
 * @param [options] Опции конструктора
 * @example
 * <pre>
 *     import {register, create} from 'Types/di';
 *
 *     class User {
 *         // ...
 *     }
 *
 *     register('application/User', User, {instantiate: false});
 *
 *     const newUser = create<User>('application/User', {
 *         login: 'root'
 *     });
 * </pre>
 */
export function create<TResult, TOptions = IHashMap<any>>(
    alias: string | Function | object,
    options?: TOptions
): TResult {
    const result = resolve<TResult>(alias, options);
    if (typeof result === 'function') {
        return resolve(result, options);
    }
    return result;
}

/**
 * Разрешает зависимость
 * @param alias Название зависимости, или конструктор объекта или инстанс объекта
 * @param Опции конструктора
 * @example
 * <pre>
 *     import {register, resolve} from 'Types/di';
 *
 *     class User {
 *         // ...
 *     }
 *
 *     register('application/User', User, {instantiate: false});
 *     register('application/user', User);
 *
 *     // ...
 *
 *     const User = di.resolve('application/User');
 *     const newUserA = new User({
 *         login: 'root'
 *     });
 *     // ...or the same result via:
 *     const newUserB = di.resolve('application/user', {
 *         login: 'root'
 *     });
 * </pre>
 */
export function resolve<TResult, TOptions = IHashMap<any>>(
    alias: string | Function | object,
    options?: TOptions
): TResult {
    const aliasType = typeof alias;
    let Factory;
    let config: IOptions;
    let singleInst;

    switch (aliasType) {
        case 'function':
            Factory = alias;
            break;
        case 'object':
            Factory = alias;
            config = {instantiate: false};
            break;
        default:
            if (!isRegistered(alias as string)) {
                throw new ReferenceError(`Alias "${alias}" is not registered`);
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
