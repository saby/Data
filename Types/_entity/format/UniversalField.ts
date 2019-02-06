/// <amd-module name="Types/_entity/format/UniversalField" />

/**
 * Универсальное поле.
 * @class Types/_entity/format/UniversalField
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

export default class UniversalField /** @lends Types/_entity/format/UniversalField.prototype */{
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

Object.assign(UniversalField.prototype, {
   '[Types/_entity/format/UniversalField]': true,
   _moduleName: 'Types/entity:format.UniversalField',
   type: '',
   name: '',
   defaultValue: null,
   nullable: false,
   meta: null
});
