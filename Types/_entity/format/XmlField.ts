import Field from './Field';
import {register} from '../../di';

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
 * @author Кудрявцев И.С.
 */
export default class XmlField extends Field {
    protected _$defaultValue: string;
}

Object.assign(XmlField.prototype, {
    '[Types/_entity/format/XmlField]': true,
    _moduleName: 'Types/entity:format.XmlField',
    _typeName: 'Xml',
    _$defaultValue: ''
});

register('Types/entity:format.XmlField', XmlField, {instantiate: false});
