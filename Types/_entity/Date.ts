import DateTime from './DateTime';

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


