import DateTime from './DateTime';
import {register} from '../di';

/**
 * Time type
 * @class Types/_entity/Time
 * @public
 * @author Мальцев А.А.
 */
export default class Time extends DateTime {
    protected get _proto(): object {
        return Time.prototype;
    }
}

Object.assign(Time.prototype, {
    _moduleName: 'Types/entity:Time'
});

register('Types/entity:Time', Time, {instantiate: false});
