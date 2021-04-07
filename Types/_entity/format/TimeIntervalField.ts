import Field from './Field';
import {register} from '../../di';

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
 * @author Кудрявцев И.С.
 */
export default class TimeIntervalField extends Field {
    protected _$defaultValue: number;
}

Object.assign(TimeIntervalField.prototype, {
    '[Types/_entity/format/TimeIntervalField]': true,
    _moduleName: 'Types/entity:format.TimeIntervalField',
    _typeName: 'TimeInterval',
    _$defaultValue: 0
});

register('Types/entity:format.TimeIntervalField', TimeIntervalField, {instantiate: false});
