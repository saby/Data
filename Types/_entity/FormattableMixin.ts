import {Field, fieldsFactory, UniversalField, IFieldDeclaration, FormatDeclaration} from './format';
import {Cow as CowAdapter, IAdapter, ITable, IRecord, IDecorator, IMetaData} from './adapter';
import ISerializable from './ISerializable';
import {IState as IDefaultSerializableState} from './SerializableMixin';
import {resolve, create, isRegistered} from '../di';
import {format} from '../collection';
import {object, logger} from '../util';

const defaultAdapter = 'Types/entity:adapter.Json';

export type FormatDescriptor = format.Format | FormatDeclaration;
export type AdapterDescriptor = IAdapter | string;
type GenericAdapter = ITable | IRecord | IDecorator | IMetaData;

export interface IOptions {
   adapter?: AdapterDescriptor;
   rawData?: any;
   format?: FormatDescriptor;
   cow?: boolean;
}

export interface ISerializableState<T = IOptions> extends IDefaultSerializableState<T> {
    $options: T;
}

/**
 * Создает формат путем объединения неполного формата с форматом, полученным из необработанных данных.
 * @param partialFormat Неполный формат.
 * @param rawDataFormat Формат, полученный из необработанных данных.
 */

/*
 * Builds format by join partial format with format taken from raw data.
 * @param partialFormat Partial format
 * @param rawDataFormat Format taken from raw data
 */
function buildFormatFromObject(partialFormat: object, rawDataFormat: format.Format): format.Format {
    let field;
    let fieldIndex;
    for (const name in partialFormat) {
        if (!partialFormat.hasOwnProperty(name)) {
            continue;
        }

        field = partialFormat[name];
        if (typeof field !== 'object') {
            field = {type: field};
        }
        if (!(field instanceof Field)) {
            field = fieldsFactory(field);
        }
        field.setName(name);

        fieldIndex = rawDataFormat.getFieldIndex(name);
        if (fieldIndex === -1) {
            rawDataFormat.add(field);
        } else {
            rawDataFormat.replace(field, fieldIndex);
        }
    }

    return rawDataFormat;
}

/**
 * Строит формат по необработанным данным.
 */

/*
 * Builds format by raw data.
 */
function buildFormatByRawData(this: FormattableMixin): format.Format {
    const format = create<format.Format>('Types/collection:format.Format');
    const adapter = this._getRawDataAdapter() as ITable;
    const fields = this._getRawDataFields();
    const count = fields.length;

    for (let i = 0; i < count; i++) {
        format.add(
            adapter.getFormat(fields[i])
        );
    }

    return format;
}

interface IDeprecated {
    /**
     * Старомодные параметры.
     * @deprecated
     */

    /*
     * Old-fashioned options, bad stuff
     * @deprecated
     */
    _options: any;
}

/**
 * Миксин обеспечивает возможность определения формата полей и доступа к данным через специальный уровень абстракции, называемый адаптером.
 * @mixin Types/_entity/FormattableMixin
 * @public
 * @author Мальцев А.А.
 */

/*
 * This mixin provides an aspect of defining of fields format and accessing data via special abstraction layer named as adapter.
 * @mixin Types/_entity/FormattableMixin
 * @public
 * @author Мальцев А.А.
 */
export default abstract class FormattableMixin {
    '[Types/_entity/FormattableMixin]': boolean;

   /**
    * @cfg {Object} Данные в необработанном формате, которые могут быть распознаны через определенный адаптер.
    * @name Types/_entity/FormattableMixin#rawData
    * @see getRawData
    * @remark
    * Данные должны быть в определенном формате, который поддерживается соответствующим адаптером ({@link adapter}).
    * Данные должны содержать только примитивные значения, массивы и простые объекты для совместного использования, копирования и сериализации.
    * @example
    * Создадим запись сотрудника:
    * <pre>
    *    import {Record} from 'Types/entity';
    *    const employee = new Record({
    *       rawData: {
    *          id: 1,
    *          firstName: 'John',
    *          lastName: 'Smith'
    *       }
    *    });
    *
    *    console.log(employee.get('id')); // 1
    *    console.log(employee.get('firstName')); // John
    *    console.log(employee.get('lastName')); // Smith
    * </pre>
    * Создадим набор записей с персонажами фильма:
    * <pre>
    *    import {RecordSet} from 'Types/collection';
    *    const characters = new RecordSet({
    *       rawData: [{
    *          id: 1,
    *          firstName: 'John',
    *          lastName: 'Connor',
    *          part: 'Savior'
    *       }, {
    *          id: 2,
    *          firstName: 'Sarah',
    *          lastName: 'Connor',
    *          part: 'Mother'
    *       }, {
    *          id: 3,
    *          firstName: '-',
    *          lastName: 'T-800',
    *          part: 'A human-like robot from the future'
    *       }]
    *    });
    *
    *    console.log(characters.at(0).get('firstName'));// John
    *    console.log(characters.at(0).get('lastName'));// Connor
    *    console.log(characters.at(1).get('firstName'));// Sarah
    *    console.log(characters.at(1).get('lastName'));// Connor
    * </pre>
    */

   /*
    * @cfg {Object} Data in raw format which can be recognized via certain adapter.
    * @name Types/_entity/FormattableMixin#rawData
    * @see getRawData
    * @remark
    * Data should be in certain format which supported by associated {@link adapter}.
    * Data should contain only primitive values, arrays and plain objects due to sharing, coping and serialization objectives.
    * @example
    * Let's create an employee record:
    * <pre>
    *    import {Record} from 'Types/entity';
    *    const employee = new Record({
    *       rawData: {
    *          id: 1,
    *          firstName: 'John',
    *          lastName: 'Smith'
    *       }
    *    });
    *
    *    console.log(employee.get('id')); // 1
    *    console.log(employee.get('firstName')); // John
    *    console.log(employee.get('lastName')); // Smith
    * </pre>
    * Let's create recordset with movie characters:
    * <pre>
    *    import {RecordSet} from 'Types/collection';
    *    const characters = new RecordSet({
    *       rawData: [{
    *          id: 1,
    *          firstName: 'John',
    *          lastName: 'Connor',
    *          part: 'Savior'
    *       }, {
    *          id: 2,
    *          firstName: 'Sarah',
    *          lastName: 'Connor',
    *          part: 'Mother'
    *       }, {
    *          id: 3,
    *          firstName: '-',
    *          lastName: 'T-800',
    *          part: 'A human-like robot from the future'
    *       }]
    *    });
    *
    *    console.log(characters.at(0).get('firstName'));// John
    *    console.log(characters.at(0).get('lastName'));// Connor
    *    console.log(characters.at(1).get('firstName'));// Sarah
    *    console.log(characters.at(1).get('lastName'));// Connor
    * </pre>
    */
   protected _$rawData: any;

    /**
     * Работа с необработанными данными в режиме Copy-On-Write.
     */

    /*
     * Work with raw data in Copy-On-Write mode.
     */
    protected _$cow: boolean;

   /**
    * @cfg {String|Types/_entity/adapter/IAdapter} Адаптер, обеспечивающий доступ к необработанным данным определенного формата. По умолчанию поддерживаются необработанные данные в формате {@link Types/_entity/adapter/Json}.
    * @name Types/_entity/FormattableMixin#adapter
    * @see getAdapter
    * @see Types/_entity/adapter/Json
    * @see Types/di
    * @remark
    * Адаптер должен быть определен для работы с форматом {@link rawData необработанных данных}.
    * @example
    * Создадим запись с адаптером для формата данных сервера приложений СБИС:
    * <pre>
    *    import {Record, adapter} from 'Types/entity';
    *    const user = new Record({
    *       adapter: new adapter.Sbis(),
    *       format: [
    *          {name: 'login', type: 'string'},
    *          {name: 'email', type: 'string'}
    *       ]
    *    });
    *    user.set({
    *       login: 'root',
    *       email: 'root@server.name'
    *    });
    * </pre>
    */

   /*
    * @cfg {String|Types/_entity/adapter/IAdapter} Adapter that provides access to raw data of certain format. By default raw data in {@link Types/_entity/adapter/Json} format are supported.
    * @name Types/_entity/FormattableMixin#adapter
    * @see getAdapter
    * @see Types/_entity/adapter/Json
    * @see Types/di
    * @remark
    * Adapter should be defined to deal with certain  {@link rawData raw data} format.
    * @example
    * Let's create record with adapter for data format of Saby application server:
    * <pre>
    *    import {Record, adapter} from 'Types/entity';
    *    const user = new Record({
    *       adapter: new adapter.Sbis(),
    *       format: [
    *          {name: 'login', type: 'string'},
    *          {name: 'email', type: 'string'}
    *       ]
    *    });
    *    user.set({
    *       login: 'root',
    *       email: 'root@server.name'
    *    });
    * </pre>
    */
   protected _$adapter: IAdapter | IDecorator | string;

    /**
     * @cfg {Types/_collection/format/Format|
     * Array.<Types/_entity/format/fieldsFactory/FieldDeclaration.typedef>|
     * Object.<String,String>|
     * Object.<String,Function>|
     * Object.<String,Types/_entity/format/fieldsFactory/FieldDeclaration.typedef>|
     * Object.<String,Types/_entity/format/Field>
     * } Формат полей. Это может быть либо полный формат (в этом случае он должен быть определен как массив или экземпляр класса {@link Types/_collection/format/Format Format}), либо как частичный формат (в этом случае он должен быть определен как простой объект).
     * @name Types/_entity/FormattableMixin#format
     * @see getFormat
     * @remark
     * Имеются следующие правила {@link getFormat построения конечного формата} в зависимости от типа значения, переданного в данную опцию:
     * <ul>
     *     <li>формат будет построен из необработанных данных, если опцию не удалось определить;</li>
     *     <li>если опция определяет полную версию формата, тогда он будет взят за основу;</li>
     *     <li>если опция определяет частичную версию формата, тогда конечный формат будет построен из необработанных данных с добавлением данного частичного формата согласно следующим правилам:
     *         <ul>
     *             <li>если поле с полученным именем существует в формате необработанных данных, тогда его объявление в неполном формате заменит соответствующее объявление в формате необработанных данных;</li>
     *             <li>в противном случае объявление будет добавлено в конец формата необработанных данных.</li>
     *         </ul>
     *     </li>
     * </ul>
     * Пример:
     * @example
     * Создадим запись с декларативным форматом:
     * <pre>
     *     import {Record} from 'Types/entity';
     *     const user = new Record({
     *         format: [{
     *             name: 'id',
     *             type: 'integer'
     *         }, {
     *             name: 'login',
     *             type: 'string'
     *         }, {
     *             name: 'amount',
     *             type: 'money',
     *             precision: 4
     *         }]
     *     });
     * </pre>
     * Создадим набор записей с внедренным экземпляром формата:
     * <pre>
     *     // My/Format/user.ts
     *     import {format as fields} from 'Types/entity';
     *     import {format} from 'Types/collection';
     *     const format = new format.Format();
     *     format.add(new fields.IntegerField({name: 'id'}));
     *     format.add(new fields.StringField({name: 'login'}));
     *     format.add(new fields.StringField({name: 'email'}));
     *
     *     export default format;
     *
     *     // My/Models/Users.ts
     *     import userFormat from 'My/Format/user';
     *     import {RecordSet} from 'Types/collection';
     *     const users = new RecordSet({
     *         format: userFormat
     *     });
     * </pre>
     * Создадим запись с неполным декларативным форматом:
     * <pre>
     *     import {Record} from 'Types/entity';
     *     const user = new Record({
     *         rawData: {
     *             id: 256,
     *             login: 'dr.strange',
     *             amount: 15739.45
     *         },
     *         format: {
     *             id: 'integer',
     *             amount: {type: 'money', precision: 4}
     *         }]
     *     });
     * </pre>
     * Создадим запись с неполным форматом, которая содержит экземпляр поля:
     * <pre>
     *     import {Record} from 'Types/entity';
     *     const amountField = new entity.format.MoneyField({precision: 4}),
     *     const user = new Record({
     *         format: {
     *             amount: amountField
     *         }]
     *     });
     * </pre>
     * Создадим запись с неполным форматом, который содержит встроенные типы:
     * <pre>
     *     import {Record} from 'Types/entity';
     *     const user = new entity.Record({
     *         format: {
     *             id: Number,
     *             lastLogin: Date
     *         }
     *     });
     * </pre>
     * Добавим набор записей с пользовательской моделью в одно из полей записи:
     * <pre>
     *     //MyApplication/Models/ActivityModel.ts
     *     import {Model} from 'Types/entity';
     *     export default class ActivityModel extends Model{
     *         //...
     *     }
     *
     *     //MyApplication/Models/ActivityRecordSet.ts
     *     import ActivityModel from './ActivityModel';
     *     import {RecordSet} from 'Types/collection';
     *     export default class ActivityRecordSet extends RecordSet {
     *         _$model: ActivityModel
     *     }
     *
     *     //MyApplication/Controllers/ActivityController.ts
     *     import ActivityRecordSet from '../Models/ActivityRecordSet';
     *     import {Record} from 'Types/entity';
     *     const user = new Record({
     *         format: {
     *             activity: ActivityRecordSet
     *         }
     *     });
     * </pre>
     * Создадим запись корзины покупок, которая использует формат данных сервера приложения СБИС:
     * <pre>
     *     import {Record, adapter} from 'Types/entity';
     *     import {RecordSet} from 'Types/collection';
     *
     *     const order = new Record({
     *         adapter: new adapter.Sbis(),
     *         format: [{
     *             name: 'id',
     *             type: 'integer',
     *             defaultValue: 0
     *         }, {
     *             name: 'items',
     *             type: 'recordset'
     *         }]
     *     });
     *
     *     const orderItems = new RecordSet({
     *         adapter: new adapter.Sbis(),
     *         format: [{
     *             name: 'goods_id',
     *             type: 'integer',
     *             defaultValue: 0
     *         }, {
     *             name: 'price',
     *             type: 'real',
     *             defaultValue: 0
     *         }, {
     *             name: 'count',
     *             type: 'integer',
     *             defaultValue: 0
     *         }]
     *     });
     *
     *     order.set('items', orderItems);
     * </pre>
     */

    /*
     * @cfg {Types/_collection/format/Format|
     * Array.<Types/_entity/format/fieldsFactory/FieldDeclaration.typedef>|
     * Object.<String,String>|
     * Object.<String,Function>|
     * Object.<String,Types/_entity/format/fieldsFactory/FieldDeclaration.typedef>|
     * Object.<String,Types/_entity/format/Field>
     * } Fields format. It can be either full format (in this case it should be defined as an array or an instance of {@link Types/_collection/format/Format Format}) or partial format (in this case it should be defined as plain object).
     * @name Types/_entity/FormattableMixin#format
     * @see getFormat
     * @remark
     * Here are next rules of {@link getFormat building final format} depend on type of value passed to this option:
     * <ul>
     *     <li>if option is omitted then format will be built by raw data;</li>
     *     <li>if option defines full format then this format will be used;</li>
     *     <li>if option defines partial format then final format will be built by raw data with addition of partial format follow by these rules:
     *         <ul>
     *             <li>if field with given name exists in raw data's format then its declaration from partial format replaces raw data's declaration;</li>
     *             <li>otherwise field declaration be added to the end of raw data's format.</li>
     *         </ul>
     *     </li>
     * </ul>
     * See examples for details.
     */
    protected _$format: FormatDescriptor;

    /**
     * Окончательно построенный формат.
     */

    /*
     * Finally built format
     */
    protected _format: format.Format;

    /**
     * Копия _format, которая используется для кэширования в getFormat()
     */

    /*
     * Clone of the _format, uses for caching in getFormat()
     */
    protected _formatClone: format.Format;

     /**
      * Значение _$format не связано с исходным значением.
      */

     /*
      * Value of _$format is unlinked from original value
      */
    protected _formatUnlinked: boolean;

    /**
     * Экземпляр адаптера для работы с необработанными данными.
     */

    /*
     * Adapter instance to deal with raw data
     */
    protected _rawDataAdapter: GenericAdapter;

    /**
     * Список имен полей, взятых из адаптера необработанных данных.
     */

    /*
     * List of field names taken from raw data adapter
     */
    protected _rawDataFields: string[];

    constructor() {
        // FIXME: get rid of _options
        if (!this._$format &&
            (this as unknown as IDeprecated)._options &&
            (this as unknown as IDeprecated)._options.format
        ) {
            this._$format = (this as unknown as IDeprecated)._options.format;
        }
    }

    // region SerializableMixin

    _getSerializableState(state: ISerializableState): ISerializableState {
        state.$options.rawData = this._getRawData();
        return state;
    }

    _setSerializableState(state: ISerializableState): Function {
        // tslint:disable-next-line:only-arrow-functions no-empty
        return function(): void {};
    }

    // endregion

    // region Public methods

    /**
     * Возвращает необработанные данные (клонирует, если есть объект).
     * @see rawData
     * @example
     * Пример:
     * <pre>
     *     import {Record} from 'Types/entity';
     *     const data = {id: 1, title: 'Article 1'};
     *     const article = new Record({
     *         rawData: data
     *     });
     *
     *     console.log(article.getRawData()); // {id: 1, title: 'Article 1'}
     *     console.log(article.getRawData() === data); // false
     *     console.log(JSON.stringify(article.getRawData()) === JSON.stringify(data)); // true
     * </pre>
     */

    /*
     * Returns raw data (clone if there are an object).
     * @see rawData
     * @example
     * Let's read the raw data:
     * <pre>
     *     import {Record} from 'Types/entity';
     *     const data = {id: 1, title: 'Article 1'};
     *     const article = new Record({
     *         rawData: data
     *     });
     *
     *     console.log(article.getRawData()); // {id: 1, title: 'Article 1'}
     *     console.log(article.getRawData() === data); // false
     *     console.log(JSON.stringify(article.getRawData()) === JSON.stringify(data)); // true
     * </pre>
     */
    getRawData(shared?: boolean): any {
        return shared ? this._getRawData() : object.clone(this._getRawData());
    }

    /**
     * Устанавливает необработанные данные.
     * @param data Необработанные данные.
     * @see getRawData
     * @see rawData
     * @example
     * Пример:
     * <pre>
     *     import {Record} from 'Types/entity';
     *     const article = new Record();
     *     article.setRawData({id: 1, title: 'Article 1'});
     *     console.log(article.get('title'));// Article 1
     * </pre>
     */

    /*
     * Sets raw data.
     * @param data Raw data
     * @see getRawData
     * @see rawData
     * @example
     * Let's set the raw data:
     * <pre>
     *     import {Record} from 'Types/entity';
     *     const article = new Record();
     *     article.setRawData({id: 1, title: 'Article 1'});
     *     console.log(article.get('title'));// Article 1
     * </pre>
     */
    setRawData(data: any): void {
        this._resetRawDataAdapter(data);
        this._resetRawDataFields();
        this._clearFormatClone();
    }

    /**
     * Возвращает адаптер для обработки необработанных данных.
     * @see adapter
     * @example
     * Пример:
     * <pre>
     *     import {Record, adapter} from 'Types/entity';
     *     const article = new Record();
     *     console.log(article.getAdapter() instanceof adapter.Json); // true
     * </pre>
     */

    /*
     * Returns adapter to deal with raw data.
     * @see adapter
     * @example
     * Let's checkout the default adapter:
     * <pre>
     *     import {Record, adapter} from 'Types/entity';
     *     const article = new Record();
     *     console.log(article.getAdapter() instanceof adapter.Json); // true
     * </pre>
     */
    getAdapter(): IAdapter {
        let adapter = this._getAdapter();
        if (adapter['[Types/_entity/adapter/IDecorator]']) {
            adapter = (adapter as IDecorator).getOriginal() as IAdapter;
        }
        return adapter as IAdapter;
    }

    /**
     * Возвращает флаг, который указывает на то, что формат был объявлен напрямую.
     */

    /*
     * Returns flag which indicates the fact that format was declared directly.
     */
    hasDeclaredFormat(): boolean {
        return !!this._$format;
    }

    /**
     * Возвращает формат поля в режиме "только для чтения".
     * @see format
     * @example
     * Получим формат, построенный по декларативному описанию:
     * <pre>
     *     import {Record} from 'Types/entity';
     *     const article = new Record({
     *         format: [
     *             {name: 'id', type: 'integer'},
     *             {name: 'title', type: 'string'}
     *         ]
     *     });
     *     const format = article.getFormat();
     *
     *     console.log(format.at(0).getName());// 'id'
     *     console.log(format.at(1).getName());// 'title'
     * </pre>
     * Получим формат, построенный на необработанных данных:
     * <pre>
     *     import {Record} from 'Types/entity';
     *     const article = new Record({
     *         rawData: {
     *             id: 1,
     *             title: 'What About Livingstone'
     *         }
     *     });
     *     const format = article.getFormat();
     *
     *     console.log(format.at(0).getName());// 'id'
     *     console.log(format.at(1).getName());// 'title'
     * </pre>
     */

    /*
     * Returns fields format in read only mode.
     * @see format
     * @example
     * Let's get the format built by declarative description:
     * <pre>
     *     import {Record} from 'Types/entity';
     *     const article = new Record({
     *         format: [
     *             {name: 'id', type: 'integer'},
     *             {name: 'title', type: 'string'}
     *         ]
     *     });
     *     const format = article.getFormat();
     *
     *     console.log(format.at(0).getName());// 'id'
     *     console.log(format.at(1).getName());// 'title'
     * </pre>
     * Let's get the format built by raw data:
     * <pre>
     *     import {Record} from 'Types/entity';
     *     const article = new Record({
     *         rawData: {
     *             id: 1,
     *             title: 'What About Livingstone'
     *         }
     *     });
     *     const format = article.getFormat();
     *
     *     console.log(format.at(0).getName());// 'id'
     *     console.log(format.at(1).getName());// 'title'
     * </pre>
     */
    getFormat(shared?: boolean): format.Format {
        if (shared) {
            return this._getFormat(true);
        }
        if (!this._formatClone) {
            this._formatClone = this._getFormat(true).clone(true);
        }
        return this._formatClone;
    }

    /**
     * Добавляет поле в формат.
     * @remark
     * Если поле с указанным именем уже существует, выдает исключение.
     * @param format Формат поля.
     * @param [at] Положение поля. Если опущено или определено как -1, то будет добавлено в конец.
     * @see format
     * @see removeField
     * @example
     * Добавим поле как декларацию:
     * <pre>
     *     import {Record} from 'Types/entity';
     *     const record = new Record();
     *     record.addField({name: 'login', type: 'string'});
     *     record.addField({name: 'amount', type: 'money', precision: 3});
     * </pre>
     * Добавим поле как экземпляр:
     * <pre>
     *     import {RecordSet} from 'Types/collection';
     *     import {format} from 'Types/entity';
     *     const recordset = new RecordSet();
     *     recordset.addField(new format.StringField({name: 'login'}));
     *     recordset.addField(new format.MoneyField({name: 'amount', precision: 3}));
     * </pre>
     */

    /*
     * Adds field to the format.
     * @remark
     * If field with given name already exists it throws an exception.
     * @param format Field format.
     * @param [at] Field position. If omitted or defined as -1 then would be added at the end.
     * @see format
     * @see removeField
     * @example
     * Let's add fields as declaration:
     * <pre>
     *     import {Record} from 'Types/entity';
     *     const record = new Record();
     *     record.addField({name: 'login', type: 'string'});
     *     record.addField({name: 'amount', type: 'money', precision: 3});
     * </pre>
     * Let's add fields as instance:
     * <pre>
     *     import {RecordSet} from 'Types/collection';
     *     import {format} from 'Types/entity';
     *     const recordset = new RecordSet();
     *     recordset.addField(new format.StringField({name: 'login'}));
     *     recordset.addField(new format.MoneyField({name: 'amount', precision: 3}));
     * </pre>
     */
    addField(format: Field, at?: number): void {
        format = this._buildField(format);
        this._$format = this._getFormat(true);
        this._unlinkFormatOption();

        (this._getRawDataAdapter() as ITable).addField(format, at);
        this._$format.add(format, at);
        this._resetRawDataFields();
        this._clearFormatClone();
    }

    /**
     * Удаляет поле из формата по его имени.
     * @remark
     * Если поле с указанным именем не существует, выдает исключение.
     * @param name Имя поля.
     * @see format
     * @see addField
     * @see removeFieldAt
     * @example
     * <pre>
     *     import {Record} from 'Types/entity';
     *     // create record somehow
     *     record.removeField('login');
     * </pre>
     */

    /*
     * Removes field from the format by its name.
     * @remark
     * If field with given name doesn't exist it throws an exception.
     * @param name Field name
     * @see format
     * @see addField
     * @see removeFieldAt
     * @example
     * <pre>
     *     import {Record} from 'Types/entity';
     *     // create record somehow
     *     record.removeField('login');
     * </pre>
     */
    removeField(name: string): void {
        this._$format = this._getFormat(true);
        this._unlinkFormatOption();

        (this._getRawDataAdapter() as ITable).removeField(name);
        this._$format.removeField(name);
        this._resetRawDataFields();
        this._clearFormatClone();
    }

    /**
     * Удаляет поле из формата по его позиции.
     * @param at Позиция поля.
     * @see format
     * @see addField
     * @see removeField
     * @example
     * <pre>
     *     import {Record} from 'Types/entity';
     *     // create record somehow
     *     record.removeFieldAt(0);
     * </pre>
     */

    /*
     * Removes field from the format by its position.
     * @remark
     * If given position is out of capacity it throws an exception.
     * @param at Field position
     * @see format
     * @see addField
     * @see removeField
     * @example
     * <pre>
     *     import {Record} from 'Types/entity';
     *     // create record somehow
     *     record.removeFieldAt(0);
     * </pre>
     */
    removeFieldAt(at: number): void {
        this._$format = this._getFormat(true);
        this._unlinkFormatOption();

        (this._getRawDataAdapter() as ITable).removeFieldAt(at);
        this._$format.removeAt(at);
        this._resetRawDataFields();
        this._clearFormatClone();
    }

    // endregion

    // region Protected methods

    /**
     * Возвращает необработанные данные из адаптера.
     */

    /*
     * Returns raw data from adapter.
     */
    protected _getRawData(): any {
        const shouldUseAdapter = this._rawDataAdapter || this.hasDeclaredFormat();
        return shouldUseAdapter
            ? (this._getRawDataAdapter() as (IRecord | ITable)).getData()
            : this._getRawDataFromOption();
    }

    /**
     * Возвращает исходные данные, введенные через параметр.
     */

    /*
     * Returns original data injected via option.
     */
    protected _getRawDataFromOption(): any {
        return typeof this._$rawData === 'function' ? this._$rawData() : this._$rawData;
    }

    /**
     * Возвращает адаптер по умолчанию, как это и должно быть.
     * @deprecated Метод _getDefaultAdapter() устарел. Вместо этого используйте опцию 'adapter'.
     */

    /*
     * Returns default adapter as it was supposed to be.
     * @deprecated Method _getDefaultAdapter() is deprecated. Use 'adapter' option instead.
     */
    protected _getDefaultAdapter(): string {
        return defaultAdapter;
    }

    /**
     * Возвращает общий экземпляр адаптера.
     */

    /*
     * Returns common adapter instance.
     */
    protected _getAdapter(): IAdapter | IDecorator {
        if (
           this._$adapter === defaultAdapter &&
           FormattableMixin.prototype._getDefaultAdapter !== this._getDefaultAdapter
        ) {
            this._$adapter = this._getDefaultAdapter();
        }

        if (this._$adapter && !(this._$adapter instanceof Object)) {
            this._$adapter = create<IAdapter>(this._$adapter);
        }

        if (this._$cow && !this._$adapter['[Types/_entity/adapter/IDecorator]']) {
            this._$adapter = new CowAdapter(this._$adapter as IAdapter);
        }

        return this._$adapter as IAdapter;
    }

    /**
     * Возвращает экземпляр адаптера для определенного типа данных.
     */

    /*
     * Returns adapter instance for certain data kind.
     */
    protected _getRawDataAdapter(): GenericAdapter {
        if (!this._rawDataAdapter) {
            this._rawDataAdapter = this._createRawDataAdapter();
            this._initRawDataAdapter(this._rawDataAdapter);
        }

        return this._rawDataAdapter;
    }

    /**
     * Создает экземпляр адаптера для определенного типа данных (таблица, запись, декоратор или метаданные).
     */

    /*
     * Creates adapter instance for certain data kind (table, record, decorator or meta data).
     */
    protected _createRawDataAdapter(): GenericAdapter {
        throw new Error('Method must be implemented');
    }

    /**
     * Инициализирует экземпляр адаптера.
     */

    /*
     * Initializes adapter instance.
     */
    protected _initRawDataAdapter(adapter: GenericAdapter): void {
        // Sync raw data fields with declared format if necessary
        if (this.hasDeclaredFormat()) {
            // Unwrap decorated adapter
            if (adapter['[Types/_entity/adapter/IDecorator]']) {
                adapter = (adapter as IDecorator).getOriginal() as ITable | IRecord;
            }

            // TODO: cope with the problem of data normalization
            if ((adapter as any)._touchData) {
                (adapter as any)._touchData();
            }

            // Add fields from format which don't exists in raw data
            const fields = (adapter as IRecord & ITable).getFields();
            this._getFormat().each((fieldFormat) => {
                try {
                    if (fields.indexOf(fieldFormat.getName()) === -1) {
                        (adapter as ITable | IRecord).addField(fieldFormat);
                    }
                } catch (err) {
                    logger.info(`${(this as unknown as ISerializable)._moduleName}::constructor(): can't add raw data field (${err.message})`);
                }
            });
        }
    }

    /**
     * Сбрасывает экземпляр адаптера для определенного типа данных.
     * @param [data] Необработанные данные.
     */

    /*
     * Resets adapter instance for certain data kind.
     * @param [data] Raw data to deal with
     */
    protected _resetRawDataAdapter(data?: any): void {
        if (data === undefined) {
            if (this._rawDataAdapter && typeof this._$rawData !== 'function') {
                // Save possible rawData changes
                this._$rawData = (this._rawDataAdapter as ITable | IRecord).getData();
            }
        } else {
            this._$rawData = data;
        }

        this._rawDataAdapter = null;
    }

    /**
     * Проверяет совместимость адаптеров.
     * @param foreign Внешний адаптер, который следует проверить.
     */

    /*
     * Check adapters compatibility.
     * @param foreign Foreign adapter that should be checked
     */
    protected _checkAdapterCompatibility(foreign: IAdapter | IDecorator): void {
        let internal = this._getAdapter();

        if (foreign['[Types/_entity/adapter/IDecorator]']) {
            foreign = (foreign as IDecorator).getOriginal() as IAdapter;
        }
        if (internal['[Types/_entity/adapter/IDecorator]']) {
            internal = (internal as IDecorator).getOriginal() as IAdapter;
        }

        const internalProto = Object.getPrototypeOf(internal);
        if (!internalProto.isPrototypeOf(foreign)) {
            throw new TypeError(
                `The foreign adapter "${(foreign as any)._moduleName}" is incompatible with the internal adapter ` +
                `"${(internal as any)._moduleName}"`
            );
        }
    }

    /**
     * Возвращает список имен полей, взятых из адаптера необработанных данных.
     */

    /*
     * Returns list of field names taken from raw data adapter
     */
    protected _getRawDataFields(): string[] {
        return this._rawDataFields || (this._rawDataFields = (this._getRawDataAdapter() as ITable).getFields());
    }

    /**
     * Добавляет поле в _rawDataFields.
     * @param name Field name
     */

    /*
     * Adds field to the _rawDataFields
     * @param name Field name
     */
    protected _addRawDataField(name: string): void {
        this._getRawDataFields().push(name);
    }

    /**
     * Сбрасывает _rawDataFields.
     */

    /*
     * Resets _rawDataFields
     */
    protected _resetRawDataFields(): void {
        this._rawDataFields = null;
    }

    /**
     * Возвращает формат поля.
     * @param [build=false] Принудительная сборка формата, если он еще не создан.
     */

    /*
     * Returns fields format
     * @param [build=false] Force format build if it was not created yet
     */
    protected _getFormat(build?: boolean): format.Format {
        if (!this._format) {
            if (this.hasDeclaredFormat()) {
                this._format = this._$format = FormattableMixin.prototype._buildFormat(
                    this._$format,
                    () => buildFormatByRawData.call(this)
                );
            } else if (build) {
                this._format = buildFormatByRawData.call(this);
            }
        }

        return this._format;
    }

    /**
     * Очищает формат полей. Это работает, только если формат не был объявлен.
     */

    /*
     * Clears fields format. It works only if format haven't been declared.
     */
    protected _clearFormat(): void {
        if (this.hasDeclaredFormat()) {
            throw new Error(`${(this as any)._moduleName}: format can't be cleared because it's defined directly`);
        }
        this._format = null;
        this._clearFormatClone();
    }

    /**
     * Очизает _formatClone.
     */
    protected _clearFormatClone(): void {
        this._formatClone = null;
    }

    /**
     * Разрыв связи _$format с исходным значением.
     */

    /*
     * Unlinks _$format with original value
     */
    protected _unlinkFormatOption(): void {
        if (!this._formatUnlinked && this._$format && this._$format['[Types/_collection/format/Format]']) {
            this._format = (this._$format as format.Format) = (this._$format as format.Format).clone(true);
            this._clearFormatClone();
            this._formatUnlinked = true;
        }
    }

    /**
     * Псевдоним для hasDeclaredFormat().
     * @deprecated
     */

    /*
     * Alias for hasDeclaredFormat()
     * @deprecated
     */
    protected _hasFormat(): boolean {
        return this.hasDeclaredFormat();
    }

    /**
     * Возвращает формат поля с указанным именем.
     * @param name Имя поля.
     * @param adapter Экземпляр адаптера.
     */

    /*
     * Returns format of field with given name
     * @param name Field name
     * @param adapter Adapter instance
     */
    protected _getFieldFormat(name: string, adapter: ITable | IRecord): Field | UniversalField {
        if (this.hasDeclaredFormat()) {
            const fields = this._getFormat();
            const index = fields.getFieldIndex(name);
            if (index > -1) {
                return fields.at(index);
            }
        }

        return adapter.getSharedFormat(name);
    }

    /**
     * Возвращает тип поля по его формату.
     * @param format Формат поля.
     */

    /*
     * Returns field type by its format.
     * @param format Field format
     */
    protected _getFieldType(format: Field | UniversalField): string | Function {
        let Type = (format as Field).getType ? (format as Field).getType() : (format as UniversalField).type;
        if (Type && typeof Type === 'string') {
            if (isRegistered(Type)) {
                Type = resolve(Type);
            }
        }
        return Type;
    }

    /**
     * Создает формат поля по его описанию.
     * @param format Описание поля.
     */

    /*
     * Builds field format by its declaration
     * @param format Field declaration
     */
    protected _buildField(format: Field | IFieldDeclaration): Field {
        if (
            typeof format === 'string' ||
            Object.getPrototypeOf(format) === Object.prototype
        ) {
            format = fieldsFactory(format as IFieldDeclaration);
        }
        if (!format || !(format instanceof Field)) {
            throw new TypeError(`${(this as any)._moduleName}: format should be an instance of Types/entity:format.Field`);
        }
        return format;
    }

    /**
     * Строит формат по описанию.
     * @param format Описание формата (полный или неполный).
     * @param fullFormatCallback Обратный вызов, который возвращает полный формат.
     */

    /*
     * Builds format by its declaration
     * @param format Fromat declaration (full or partial)
     * @param fullFormatCallback Callback which returns full format
     */
    protected _buildFormat(
        format: FormatDescriptor,
        fullFormatCallback?: Function
    ): format.Format {
        const Format = resolve<any>('Types/collection:format.Format');

        if (format) {
            const formatProto = Object.getPrototypeOf(format);
            if (formatProto === Array.prototype) {
                const factory = resolve<Function>('Types/collection:format.factory');
                // All of the fields in Array
                format = factory(format);
            } else if (formatProto === Object.prototype) {
                // Slice of the fields in Object
                format = buildFormatFromObject(format, fullFormatCallback ? fullFormatCallback() : new Format());
            }
        }

        if (!format || !(format instanceof Format)) {
            format = new Format();
        }

        return format as format.Format;
    }

    // endregion
}

Object.assign(FormattableMixin.prototype, {
    '[Types/_entity/FormattableMixin]': true,
    _moduleName: 'Types/entity:FormattableMixin',
    _$rawData: null,
    _$cow: false,
    _$adapter: defaultAdapter,
    _$format: null,
    _format: null,
    _formatClone: null,
    _rawDataAdapter: null,
    _rawDataFields: null,
    hasDecalredFormat: FormattableMixin.prototype.hasDeclaredFormat // Deprecated
});
