import DateTime from './DateTime';
import {register} from '../di';

/**
 * Date type
 * @class Types/_entity/Date
 * @public
 * @author Мальцев А.А.
 */
export default class Date extends DateTime {
     protected get _proto(): object {
          return Date.prototype;
     }
}

Object.assign(Date.prototype, {
    '[Types/_entity/Date]': true,
    _moduleName: 'Types/entity:Date'
});

register('Types/entity:Date', Date, {instantiate: false});
