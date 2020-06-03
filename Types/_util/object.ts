/**
 * Набор утилит для работы с объектами
 * @public
 * @author Мальцев А.А.
 */

import {IObject, ICloneable} from '../entity';
import {jsonReplacer, jsonReviverWithConfig} from '../formatter';
import {Set} from '../shim';

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
            return JSON.parse(
                JSON.stringify(original, jsonReplacer),
                jsonReviverWithConfig({resolveDates: false})
            );
        }
    } else {
        return original;
    }
}

/**
 * Реурсивно клонирует простые простые объекты и массивы. Сложные объекты передаются по ссылке.
 * @param original Объект для клонирования
 * @param [processCloneable=false] Обрабатывать объекты, поддерживающие интерфейс Types/_entity/ICloneable
 * @return Клон объекта
 */
export function clonePlain<T>(original: T | ICloneable, processCloneable?: boolean, processing?: Set<Object>): T {
    let result;
    let checkedProcessing = processing;

    if (!checkedProcessing) {
        checkedProcessing = new Set();
    }
    if (checkedProcessing.has(original)) {
        return original as T;
    }

    if (original instanceof Array) {
        checkedProcessing.add(original);
        result = original.map((item) => clonePlain<T>(item, processCloneable, checkedProcessing));
        checkedProcessing.delete(original);
    } else if (original instanceof Object) {
        if (Object.getPrototypeOf(original) === Object.prototype) {
            checkedProcessing.add(original);
            result = {};
            Object.keys(original).forEach((key) => {
                result[key] = clonePlain(original[key], processCloneable, checkedProcessing);
            });
            checkedProcessing.delete(original);
        } else if (original['[Types/_entity/ICloneable]']) {
            result = (original as ICloneable).clone<T>();
        } else {
            result = original;
        }
    } else {
        result = original;
    }

    return result;
}
