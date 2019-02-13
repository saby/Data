/// <amd-module name="Types/_entity/format/XmlField" />
/**
 * Формат поля для строки в формате XML.
 *
 * Создадим поле c типом "XML":
 * <pre>
 *    var field = {
 *       name: 'foo',
 *       type: 'xml'
 *    };
 * </pre>
 * @class Types/_entity/format/XmlField
 * @extends Types/_entity/format/Field
 * @public
 * @author Мальцев А.А.
 */

import Field from './Field';
import {register} from '../../di';

export default class XmlField extends Field /** @lends Types/_entity/format/XmlField.prototype */{
   _$defaultValue: string;
}

XmlField.prototype['[Types/_entity/format/XmlField]'] = true;
XmlField.prototype._moduleName = 'Types/entity:format.XmlField';
XmlField.prototype._typeName = 'Xml';
XmlField.prototype._$defaultValue = '';

register('Types/entity:format.XmlField', XmlField, {instantiate: false});
