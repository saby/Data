/**
 * Формат поля для массива значений.
 *
 * Создадим поле с типом "Массив значений":
 * <pre>
 *    var field = {
 *       name: 'foo',
 *       type: 'array',
 *       kind: 'integer'
 *    };
 * </pre>
 * @class Types/_entity/format/ArrayField
 * @extends Types/_entity/format/Field
 * @public
 * @author Мальцев А.А.
 */

import Field from './Field';

export default class ArrayField extends Field /** @lends Types/_entity/format/ArrayField.prototype */{
    /**
     * @cfg {String} Тип элементов
     * @name Types/_entity/format/ArrayField#kind
     * @see getKind
     */
    _$kind: string;

    // region Public methods

    /**
     * Возвращает тип элементов
     * @return {String}
     * @see dictionary
     */
    getKind(): string {
       return this._$kind;
    }

    // endregion Public methods
}

ArrayField.prototype['[Types/_entity/format/ArrayField]'] = true;
ArrayField.prototype._moduleName = 'Types/entity:format.ArrayField';
ArrayField.prototype._typeName = 'Array';
ArrayField.prototype._$kind = '';
