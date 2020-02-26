import {Date as TheDate, Time, DateTime} from 'Types/entity';
import {dateToSql, TO_SQL_MODE} from 'Types/formatter';
import {ExtendDate, IExtendDateConstructor} from '../_declarations';

interface ISerializableObject {
    getRawData?: (shared?: boolean) => object;
}

interface ISerializableObject {
    getRawData?: (shared?: boolean) => object;
}

function jsonizePlainObject(obj: object): object {
    const result = {};

    const proto = Object.getPrototypeOf(obj);
    if (proto !== null && proto !== Object.prototype) {
        throw new TypeError('Unsupported object type. Only plain objects can be processed.');
    }

    const keys = Object.keys(obj);
    let hasChanges = false;
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const oldValue = obj[key];
        const newValue = jsonize(oldValue);
        if (oldValue !== newValue) {
            hasChanges = true;
        }
        result[key] = newValue;
    }
    return hasChanges ? result : obj;
}

function jsonizeObject(obj: ISerializableObject | Date | ExtendDate): object | string {
    if (typeof (obj as ISerializableObject).getRawData === 'function') {
        // Deal with Types/_entity/FormattableMixin and Types/_source/DataSet
        return jsonize((obj as ISerializableObject).getRawData(true));
    } else if (obj instanceof Date) {
        // Deal with Date and its subclasses
        let mode = TO_SQL_MODE.DATETIME;
        if (obj instanceof TheDate) {
            mode = TO_SQL_MODE.DATE;
        } else if (obj instanceof Time) {
            mode = TO_SQL_MODE.TIME;
        } else if (obj instanceof DateTime) {
            mode = TO_SQL_MODE.DATETIME;
        } else if ((obj as ExtendDate).getSQLSerializationMode) {
            // Support for monkey patched Date at Core/Date
            switch ((obj as ExtendDate).getSQLSerializationMode()) {
                case (Date as IExtendDateConstructor).SQL_SERIALIZE_MODE_DATE:
                    mode = TO_SQL_MODE.DATE;
                    break;
                case (Date as IExtendDateConstructor).SQL_SERIALIZE_MODE_TIME:
                    mode = TO_SQL_MODE.TIME;
                    break;
            }
        }
        return dateToSql(obj, mode);
    } else {
        let result = obj;
        // Check if it's a scalar value wrapper
        if (obj.valueOf) {
            result = obj.valueOf();
        }

        // Deal with plain object.
        if (result && typeof result === 'object') {
            result = jsonizePlainObject(result);
        }

        return result;
    }
}

function jsonizeArray(arr: object[]): Array<object | string> {
    let hasChanges = false;
    const result = arr.map((oldValue) => {
        const newValue = jsonize(oldValue);
        if (oldValue !== newValue) {
            hasChanges = true;
        }
        return newValue;
    });
    return hasChanges ? result : arr;
}

/**
 * Prepares data before send to the remote service by transforming certain types into its simplified representation.
 * @class Types/_source/jsonize
 * @protected
 * @author Мальцев А.А.
 */
export default function jsonize<T = object>(data: T | object): T {
    /**
     * It used to be 'if (data instanceof Array)' but we faced a problem in FireFox managed under Selenium:
     * https://online.sbis.ru/opendoc.html?guid=640a4b89-79f2-4de0-9ac3-27f4b215131e
     * The point is that here we have an object looks like an array, swims like an array, and quacks like an array, so
     * it probably is an array, but it doesn't pass an instanceof check. I have no idea what it is, maybe it's something
     * to do with an array instantiated in another namespace (document or window) such as iframe.
     * Nevertheless, the check via Array.isArray() is passing successfully for those array-like-not-like objects.
     */
    if (Array.isArray(data)) {
        return jsonizeArray(data) as any;
    } else if (data && typeof data === 'object') {
        return jsonizeObject(data) as any;
    } else {
        return data as T;
    }
}
