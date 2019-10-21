import Field from './Field';

/**
 * Формат поля для строки в формате XML.
 * @remark
 * Создадим поле c типом "XML":
 * <pre>
 *     var field = {
 *         name: 'foo',
 *         type: 'xml'
 *     };
 * </pre>
 * @class Types/_entity/format/XmlField
 * @extends Types/_entity/format/Field
 * @public
 * @author Мальцев А.А.
 */
export default class XmlField extends Field {
    _$defaultValue: string;
}

Object.assign(XmlField.prototype, {
    '[Types/_entity/format/XmlField]': true,
    _moduleName: 'Types/entity:format.XmlField',
    _typeName: 'Xml',
    _$defaultValue: '',
});
