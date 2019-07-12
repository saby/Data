import DateTime from './DateTime';

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
