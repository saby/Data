import DateTime from './DateTime';
import {register} from '../../di';

/**
 * Тип "время".
 * @class Types/_entity/applied/Time
 * @public
 * @author Мальцев А.А.
 */

/*
 * Time type
 * @class Types/_entity/applied/Time
 * @public
 * @author Мальцев А.А.
 */
export default class Time extends DateTime {
    protected get _proto(): object {
        return Time.prototype;
    }
}

Object.assign(Time.prototype, {
    '[Types/_entity/applied/Time]': true,
    _moduleName: 'Types/entity:Time'
});

register('Types/entity:Time', Time, {instantiate: false});
