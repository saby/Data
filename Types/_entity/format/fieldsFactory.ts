import BooleanField from './BooleanField';
import IntegerField from './IntegerField';
import RealField from './RealField';
import MoneyField from './MoneyField';
import StringField from './StringField';
import XmlField from './XmlField';
import DateTimeField from './DateTimeField';
import DateField from './DateField';
import TimeField from './TimeField';
import TimeIntervalField from './TimeIntervalField';
import LinkField from './LinkField';
import IdentityField from './IdentityField';
import EnumField from './EnumField';
import FlagsField from './FlagsField';
import RecordField from './RecordField';
import RecordSetField from './RecordSetField';
import BinaryField from './BinaryField';
import UuidField from './UuidField';
import RpcFileField from './RpcFileField';
import ObjectField from './ObjectField';
import ArrayField from './ArrayField';
import Field from './Field';
import {isRegistered, resolve} from '../../di';
import {logger} from '../../util';

export interface IDeclaration {
    name: string;
    type: string | Function;
    kind?: string;
}

/**
 * Creates field format by its declarative definition.
 * @remark
 * <h2>Параметры функции</h2>
 * <ul>
 *      <li><b>declaration</b> {@link FieldDeclaration Declarative definition}</li>
 * </ul>
 * <h2>Возвращает</h2>
 * {@link Types/_entity/format/Field} Field format.
 * @class Types/_entity/format/fieldsFactory
 * @param declaration Declarative definition
 * @public
 * @author Мальцев А.А.
 */
export default function(declaration: IDeclaration): Field {
     /**
      * @typedef {String} FieldType
      * @variant boolean Logical
      * @variant integer Integer number
      * @variant real Real number
      * @variant money Money
      * @variant string String
      * @variant xml String in XML format
      * @variant datetime Date and time
      * @variant date Date
      * @variant time Time
      * @variant timeinterval Time interval
      * @variant identity Database identity
      * @variant enum Enum
      * @variant flags Flags
      * @variant record Record
      * @variant model Model
      * @variant recordset RecordSet
      * @variant binary Binary data
      * @variant uuid UUID
      * @variant rpcfile RPC file
      * @variant object JSON object
      * @variant array Array
      */

     /**
      * @typedef {Object} FieldDeclaration
      * @property {String} name Field name
      * @property {FieldType|Function|String} type Field type (type name or type constructor)
      * @property {*} defaultValue Default value
      * @property {Boolean} nullable Value can be null
      * @property {*} [*] Any constructor options of desired type (Types/_entity/format/*Field) are available.
      * For instance, option "precision" for type @{link Types/_entity/format/MoneyField money}:
      * {name: 'amount', type: 'money', precision: 4}
      */

    if (Object.getPrototypeOf(declaration) !== Object.prototype) {
        throw new TypeError('Types/_entity/format/fieldsFactory: declaration should be an instance of Object');
    }

    let type = declaration.type;
    if (typeof type === 'string') {
        switch (type.toLowerCase()) {
            case 'boolean':
                return new BooleanField(declaration);
            case 'integer':
                return new IntegerField(declaration);
            case 'real':
                return new RealField(declaration);
            case 'money':
                return new MoneyField(declaration);
            case 'string':
                return new StringField(declaration);
            case 'text':
                logger.error(
                    'Types/_entity/format/fieldsFactory',
                    'Type "text" has been removed in 3.18.10. Use "string" instead.'
                );
                declaration.type = 'string';
                return new StringField(declaration);
            case 'xml':
                return new XmlField(declaration);
            case 'datetime':
                return new DateTimeField(declaration);
            case 'date':
                return new DateField(declaration);
            case 'time':
                return new TimeField(declaration);
            case 'timeinterval':
                return new TimeIntervalField(declaration);
            case 'link':
                return new LinkField(declaration);
            case 'identity':
                return new IdentityField(declaration);
            case 'enum':
                return new EnumField(declaration);
            case 'flags':
                return new FlagsField(declaration);
            case 'record':
            case 'model':
                return new RecordField(declaration);
            case 'recordset':
                return new RecordSetField(declaration);
            case 'binary':
                return new BinaryField(declaration);
            case 'uuid':
                return new UuidField(declaration);
            case 'rpcfile':
                return new RpcFileField(declaration);
            case 'hierarchy':
                logger.error(
                    'Types/_entity/format/fieldsFactory',
                    'Type "hierarchy" has been removed in 3.18.10. Use "identity" instead.'
                );
                declaration.type = 'identity';
                return new IdentityField(declaration);
            case 'object':
                return new ObjectField(declaration);
            case 'array':
                return new ArrayField(declaration);
        }

        if (isRegistered(type)) {
            type = resolve(type);
        }
    }

    if (typeof type === 'function') {
        const inst = Object.create(type.prototype);
        if (inst['[Types/_entity/IObject]'] && inst['[Types/_entity/FormattableMixin]']) {
            // Yes it's Types/_entity/Record
            return new RecordField(declaration);
        } else if (inst['[Types/_collection/IList]'] && inst['[Types/_entity/FormattableMixin]']) {
            // Yes it's Types/_collection/RecordSet
            return new RecordSetField(declaration);
        } else if (inst['[Types/_collection/IEnum]']) {
            return new EnumField(declaration);
        } else if (inst['[Types/_collection/IFlags]']) {
            return new FlagsField(declaration);
        } else if (inst instanceof Array) {
            return new ArrayField(declaration);
        } else if (inst instanceof Date) {
            return new DateField(declaration);
        } else if (inst instanceof String) {
            return new StringField(declaration);
        } else if (inst instanceof Number) {
            return new RealField(declaration);
        } else if (type === Object) {
            return new ObjectField(declaration);
        }
    }

    throw new TypeError(
        'Types/_entity/format/fieldsFactory: ' +
        `unsupported field type ${typeof type === 'function' ? type.name : '"' + type + '"'}`
    );
}
