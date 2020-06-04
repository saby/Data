/**
 * Набор утилит для работы с объектами
 * @public
 * @author Мальцев А.А.
 */

import {IObject, ICloneable} from '../entity';
import {Set} from '../shim';
import Serializer = require('Core/Serializer');

interface IOptions {
    keepUndefined?: boolean;
    processCloneable?: boolean;
}

const defaultOtions: IOptions = {
    keepUndefined: true,
    processCloneable: true
}

const PLAIN_OBJECT_PROTOTYPE = Object.prototype;
const PLAIN_OBJECT_STRINGIFIER = Object.prototype.toString;

function getPropertyMethodName(property: string, prefix: string): string {
    return prefix + property.substr(0, 1).toUpperCase() + property.substr(1);
}

/**
 * Возвращает значение свойства объекта
 * @param obj Объект.
 * @param property Название свойства.
 */
export function getPropertyValue<T>(obj: unknown | IObject, property: string): T {
    if (!obj  || typeof obj !== 'object') {
        return undefined;
    }

    const checkedProperty = property || '';

    if (checkedProperty in obj) {
        return obj[checkedProperty];
    }

    if (obj['[Types/_entity/IObject]']) {
        return (obj as IObject).get(checkedProperty);
    }

    const getter = getPropertyMethodName(checkedProperty as string, 'get');
    if (typeof obj[getter] === 'function' && !obj[getter].deprecated) {
        return obj[getter]();
    }

    return undefined;
}

/**
 * Устанавливает значение свойства объекта
 * @param obj Объект.
 * @param property Название свойства.
 * @param value Значение свойства.
 */
export function setPropertyValue<T>(obj: unknown | IObject, property: string, value: T): void {
    if (!obj  || typeof obj !== 'object') {
        throw new TypeError('Argument object should be an instance of Object');
    }

    const checkedProperty = property || '';

    if (checkedProperty in obj) {
        obj[checkedProperty] = value;
        return;
    }

    if (obj['[Types/_entity/IObject]'] && (obj as IObject).has(checkedProperty as string)) {
        (obj as IObject).set(checkedProperty, value);
        return;
    }

    const setter = getPropertyMethodName(checkedProperty as string, 'set');
    if (typeof obj[setter] === 'function' && !obj[setter].deprecated) {
        obj[setter](value);
        return;
    }

    throw new ReferenceError(`Object doesn't have setter for property "${property}"`);
}

/**
 * Клонирует объект путем сериализации в строку и последующей десериализации.
 * @param original Объект для клонирования
 * @return Клон объекта
 */
export function clone<T>(original: T | ICloneable): T {
    if (original instanceof Object) {
        if (original['[Types/_entity/ICloneable]']) {
            return (original as ICloneable).clone<T>();
        } else {
            const serializer = new Serializer();
            return JSON.parse(
                JSON.stringify(original, serializer.serialize),
                serializer.deserialize
            );
        }
    } else {
        return original;
    }
}

/**
 * Рекурсивно клонирует простые простые объекты и массивы. Сложные объекты передаются по ссылке.
 * @param original Объект для клонирования
 * @param [options] Опции клонирования
 * @return Клон объекта
 */
export function clonePlain<T>(original: T | ICloneable, options?: IOptions | boolean): T {
    const normalizedOptions: IOptions = options === false ?
        {processCloneable: false} :
        options === true ? {} : options;

    return clonePlainInner(
        original,
        {...defaultOtions, ...normalizedOptions || {}},
        new Set()
    );
}

function clonePlainInner<T>(original: T | ICloneable, options: IOptions, inProgress: Set<Object>): T {
    // Avoid recursion through repeatable objects
    if (inProgress.has(original)) {
        return original as T;
    }

    let result;

    if (PLAIN_OBJECT_STRINGIFIER.call(original) === '[object Array]') {
        inProgress.add(original);
        result = (original as unknown as T[]).map(
            (item) => clonePlainInner<T>(item, options, inProgress)
        );
        inProgress.delete(original);
    } else if (original && typeof original === 'object') {
        if (Object.getPrototypeOf(original) === PLAIN_OBJECT_PROTOTYPE) {
            inProgress.add(original);
            result = {};
            Object.entries(original).forEach(([key, value]) => {
                // Skip undefined as JSON.stringify() does
                if (!options.keepUndefined && value === undefined) {
                    return;
                }

                result[key] = clonePlainInner(value, options, inProgress);
            });
            inProgress.delete(original);
        } else if (options.processCloneable && original['[Types/_entity/ICloneable]']) {
            result = (original as ICloneable).clone<T>();
        } else {
            result = original;
        }
    } else {
        result = original;
    }

    return result;
}
