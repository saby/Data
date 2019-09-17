import Field from './Field';

/**
 * Формат поля временной интервал.
 * @remark
 * Создадим поле c типом "Временной интервал":
 * <pre>
 *     var field = {
 *         name: 'foo',
 *         type: 'timeinterval'
 *     };
 * </pre>
 * @class Types/_entity/format/TimeIntervalField
 * @extends Types/_entity/format/Field
 * @public
 * @author Мальцев А.А.
 */
export default class TimeIntervalField extends Field {
    _$defaultValue: number;
}

Object.assign(TimeIntervalField.prototype, {
    '[Types/_entity/format/TimeIntervalField]': true,
    _moduleName: 'Types/entity:format.TimeIntervalField',
    _typeName: 'TimeInterval',
    _$defaultValue: 0
});
