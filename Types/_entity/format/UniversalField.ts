export interface IDateTimeMeta {
    withoutTimeZone: boolean;
}

export interface IDictionaryMeta {
    dictionary: any[];
    localeDictionary?: any[];
}

export interface IRealMeta {
    precision: number;
}

export interface IMoneyMeta extends IRealMeta {
    large: boolean;
}

export interface IIdentityMeta {
    separator: string;
}

export interface IArrayMeta {
    kind: string;
}

export type IMeta = IDateTimeMeta | IDictionaryMeta | IRealMeta | IMoneyMeta | IIdentityMeta | IArrayMeta | {};

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
