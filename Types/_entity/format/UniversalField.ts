/// <amd-module name="Types/_entity/format/UniversalField" />
/**
 * Универсальное поле.
 * @class Types/Format/UniversalField
 * @author Мальцев А.А.
 */

interface IDateTimeMeta {
   withoutTimeZone: boolean
}

interface IDictionaryMeta {
   dictionary: Array<any>
}

interface IRealdMeta {
   precision: number
}

interface IMoneyMeta extends IRealdMeta {
   large: boolean
}

interface IMeta extends IDateTimeMeta, IDictionaryMeta, IMoneyMeta {
}

export default class UniversalField /** @lends Types/Format/UniversalField.prototype */{
   /**
    * Field type
    */
   type: string;

   /**
    * Field name
    */
   name: string;

   /**
    * Default value
    */
   defaultValue: any;

   /**
    * Value can be null
    */
   nullable: boolean;

   /**
    * Metadata
    */
   meta: IMeta;
}

UniversalField.prototype['[Types/_entity/format/UniversalField]'] = true;
// @ts-ignore
UniversalField.prototype._moduleName = 'Types/entity:format.UniversalField';
UniversalField.prototype.type = '';
UniversalField.prototype.name = '';
UniversalField.prototype.defaultValue = null;
UniversalField.prototype.nullable = false;
UniversalField.prototype.meta = null;
