/// <amd-module name="Types/_entity/adapter/SbisFieldType" />
/**
 * @class Types/_entity/adapter/SbisFieldType
 * @description Класс используют, чтобы для строкового названия типа данных WS получить соответствующее ему строковое название типа данных, которое применяется в серверном фреймворке.
 * @remark Строковые названия типов данных WS:
 * <ul>
 *     <li>integer. Описывается классом {@link https://wi.sbis.ru/docs/js/WS/Types/_entity/format/IntegerField/ Types/_entity/format/IntegerField};</li>
 *     <li>money. Описывается классом {@link https://wi.sbis.ru/docs/js/WS/Types/_entity/format/MoneyField/ Types/_entity/format/MoneyField};</li>
 *     <li>array. Описывается классом {@link https://wi.sbis.ru/docs/js/WS/Types/_entity/format/ArrayField/ Types/_entity/format/ArrayField};</li>
 *     <li>binary. Описывается классом {@link https://wi.sbis.ru/docs/js/WS/Types/_entity/format/BinaryField/ Types/_entity/format/BinaryField};</li>
 *     <li>boolean. Описывается классом {@link https://wi.sbis.ru/docs/js/WS/Types/_entity/format/BooleanField/ Types/_entity/format/BooleanField};</li>
 *     <li>date. Описывается классом {@link https://wi.sbis.ru/docs/js/WS/Types/_entity/format/MoneyField/ Types/_entity/format/MoneyField};</li>
 *     <li>dateTime. Описывается классом {@link https://wi.sbis.ru/docs/js/WS/Types/_entity/format/DateTimeField/ Types/_entity/format/DateTimeField};</li>
 *     <li>dictionary. Описывается классом {@link https://wi.sbis.ru/docs/js/WS/Types/_entity/format/DictionaryField/ Types/_entity/format/DictionaryField};</li>
 *     <li>enum. Описывается классом {@link https://wi.sbis.ru/docs/js/WS/Types/_entity/format/EnumField/ Types/_entity/format/EnumField};</li>
 *     <li>flags. Описывается классом {@link https://wi.sbis.ru/docs/js/WS/Types/_entity/format/FlagsField/ Types/_entity/format/FlagsField};</li>
 *     <li>identity. Описывается классом {@link https://wi.sbis.ru/docs/js/WS/Types/_entity/format/IdentityField/ Types/_entity/format/IdentityField};</li>
 *     <li>object. Описывается классом {@link https://wi.sbis.ru/docs/js/WS/Types/_entity/format/ObjectField/ Types/_entity/format/ObjectField};</li>
 *     <li>real. Описывается классом {@link https://wi.sbis.ru/docs/js/WS/Types/_entity/format/RealField/ Types/_entity/format/RealField};</li>
 *     <li>record. Описывается классом {@link https://wi.sbis.ru/docs/js/WS/Types/_entity/format/RecordField/ Types/_entity/format/RecordField};</li>
 *     <li>recordset. Описывается классом {@link https://wi.sbis.ru/docs/js/WS/Types/_entity/format/RecordSetField/ Types/_entity/format/RecordSetField};</li>
 *     <li>rpcfile. Описывается классом {@link https://wi.sbis.ru/docs/js/WS/Types/_entity/format/RpcFileField/ Types/_entity/format/RpcFileField};</li>
 *     <li>string. Описывается классом {@link https://wi.sbis.ru/docs/js/WS/Types/_entity/format/StringField/ Types/_entity/format/StringField};</li>
 *     <li>time. Описывается классом {@link https://wi.sbis.ru/docs/js/WS/Types/_entity/format/TimeField/ Types/_entity/format/TimeField};</li>
 *     <li>uuid. Описывается классом {@link https://wi.sbis.ru/docs/js/WS/Types/_entity/format/UuidField/ Types/_entity/format/UuidField};</li>
 *     <li>timeinterval. Описывается классом {@link https://wi.sbis.ru/docs/js/WS/Types/_entity/format/TimeIntervalField/ Types/_entity/format/TimeIntervalField};</li>
 *     <li>xml. Описывается классом {@link https://wi.sbis.ru/docs/js/WS/Types/_entity/format/XmlField/ Types/_entity/format/XmlField}.</li>
 *
 * </pre>
 * @public
 * @author Мальцев А.А.
 */

const SbisFieldType = {
   boolean: 'Логическое',
   integer: 'Число целое',
   real: 'Число вещественное',
   money: 'Деньги',
   string: 'Строка',
   xml: 'XML-файл',
   datetime: 'Дата и время',
   date: 'Дата',
   time: 'Время',
   timeinterval: 'Временной интервал',
   link: 'Связь', // deprecated
   identity: 'Идентификатор',
   enum: 'Перечисляемое',
   flags: 'Флаги',
   record: 'Запись',
   recordset: 'Выборка',
   binary: 'Двоичное',
   uuid: 'UUID',
   rpcfile: 'Файл-rpc',
   object: 'JSON-объект',
   array: 'Массив'
};

export default SbisFieldType;
