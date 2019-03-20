interface IDateTimeMeta {
   withoutTimeZone: boolean;
}

interface IDictionaryMeta {
   dictionary: any[];
   localeDictionary?: any[];
}

interface IRealdMeta {
   precision: number;
}

interface IMoneyMeta extends IRealdMeta {
   large: boolean;
}

interface IArrayMeta {
   kind: string;
}

interface IMeta extends IDateTimeMeta, IDictionaryMeta, IMoneyMeta, IArrayMeta {
}

/**
 * Универсальное поле.
 * @class Types/_entity/format/UniversalField
 * @author Мальцев А.А.
 */
export default class UniversalField {
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
