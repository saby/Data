import Field from './Field';
import {dateToSql, TO_SQL_MODE} from '../../formatter';
import {register} from '../../di';

/**
 * Формат поля для даты.
 * @remark
 * Создадим поле c типом "Дата":
 * <pre>
 *    var field = {
 *       name: 'foo',
 *       type: 'date'
 *    };
 * </pre>
 * @class Types/_entity/format/DateField
 * @extends Types/_entity/format/Field
 * @public
 * @author Кудрявцев И.С.
 */
export default class DateField extends Field {
    protected _$defaultValue: string | Date;

    // region Public methods

    getDefaultValue(serialize: boolean = false): string | Date {
        if (serialize && this._$defaultValue instanceof Date) {
            return dateToSql(this._$defaultValue, TO_SQL_MODE.DATE);
        }

        return this._$defaultValue;
    }

    // endregion Public methods
}

Object.assign(DateField.prototype, {
    '[Types/_entity/format/DateField]': true,
    _moduleName: 'Types/entity:format.DateField',
    _typeName: 'Date'
});

register('Types/entity:format.DateField', DateField, {instantiate: false});
