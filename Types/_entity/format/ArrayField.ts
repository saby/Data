import Field from './Field';

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
export default class ArrayField extends Field {
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

Object.assign(ArrayField.prototype, {
   '[Types/_entity/format/ArrayField]': true,
   _moduleName: 'Types/entity:format.ArrayField',
   _typeName: 'Array',
   _$kind: ''
});
