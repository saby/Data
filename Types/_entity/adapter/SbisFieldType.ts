/// <amd-module name="Types/_entity/adapter/SbisFieldType" />
/**
 * @class Types/_entity/adapter/SbisFieldType
 * @description Класс используют, чтобы для строкового названия типа данных WS получить соответствующее ему строковое название типа данных, которое применяется в серверном фреймворке.
 * @remark Строковые названия типов данных WS:
 * <ul>
 *     <li>integer. Описывается классом {@link https://wi.sbis.ru/docs/js/WS/Types/Format/IntegerField/ Types/Format/IntegerField};</li>
 *     <li>money. Описывается классом {@link https://wi.sbis.ru/docs/js/WS/Types/Format/MoneyField/ Types/Format/MoneyField};</li>
 *     <li>array. Описывается классом {@link https://wi.sbis.ru/docs/js/WS/Types/Format/ArrayField/ Types/Format/ArrayField};</li>
 *     <li>binary. Описывается классом {@link https://wi.sbis.ru/docs/js/WS/Types/Format/BinaryField/ Types/Format/BinaryField};</li>
 *     <li>boolean. Описывается классом {@link https://wi.sbis.ru/docs/js/WS/Types/Format/BooleanField/ Types/Format/BooleanField};</li>
 *     <li>date. Описывается классом {@link https://wi.sbis.ru/docs/js/WS/Types/Format/MoneyField/ Types/Format/MoneyField};</li>
 *     <li>dateTime. Описывается классом {@link https://wi.sbis.ru/docs/js/WS/Types/Format/DateTimeField/ Types/Format/DateTimeField};</li>
 *     <li>dictionary. Описывается классом {@link https://wi.sbis.ru/docs/js/WS/Types/Format/DictionaryField/ Types/Format/DictionaryField};</li>
 *     <li>enum. Описывается классом {@link https://wi.sbis.ru/docs/js/WS/Types/Format/EnumField/ Types/Format/EnumField};</li>
 *     <li>flags. Описывается классом {@link https://wi.sbis.ru/docs/js/WS/Types/Format/FlagsField/ Types/Format/FlagsField};</li>
 *     <li>identity. Описывается классом {@link https://wi.sbis.ru/docs/js/WS/Types/Format/IdentityField/ Types/Format/IdentityField};</li>
 *     <li>object. Описывается классом {@link https://wi.sbis.ru/docs/js/WS/Types/Format/ObjectField/ Types/Format/ObjectField};</li>
 *     <li>real. Описывается классом {@link https://wi.sbis.ru/docs/js/WS/Types/Format/RealField/ Types/Format/RealField};</li>
 *     <li>record. Описывается классом {@link https://wi.sbis.ru/docs/js/WS/Types/Format/RecordField/ Types/Format/RecordField};</li>
 *     <li>recordset. Описывается классом {@link https://wi.sbis.ru/docs/js/WS/Types/Format/RecordSetField/ Types/Format/RecordSetField};</li>
 *     <li>rpcfile. Описывается классом {@link https://wi.sbis.ru/docs/js/WS/Types/Format/RpcFileField/ Types/Format/RpcFileField};</li>
 *     <li>string. Описывается классом {@link https://wi.sbis.ru/docs/js/WS/Types/Format/StringField/ Types/Format/StringField};</li>
 *     <li>time. Описывается классом {@link https://wi.sbis.ru/docs/js/WS/Types/Format/TimeField/ Types/Format/TimeField};</li>
 *     <li>uuid. Описывается классом {@link https://wi.sbis.ru/docs/js/WS/Types/Format/UuidField/ Types/Format/UuidField};</li>
 *     <li>timeinterval. Описывается классом {@link https://wi.sbis.ru/docs/js/WS/Types/Format/TimeIntervalField/ Types/Format/TimeIntervalField};</li>
 *     <li>xml. Описывается классом {@link https://wi.sbis.ru/docs/js/WS/Types/Format/XmlField/ Types/Format/XmlField}.</li>
 *
 * </pre>
 * @public
 * @author Мальцев А.А.
 */

const SbisFieldType = {
   'boolean': 'Логическое',
   integer: 'Число целое',
   real: 'Число вещественное',
   money: 'Деньги',
   string: 'Строка',
   xml: 'XML-файл',
   datetime: 'Дата и время',
   date: 'Дата',
   time: 'Время',
   timeinterval: 'Временной интервал',
   link: 'Связь', //deprecated
   identity: 'Идентификатор',
   'enum': 'Перечисляемое',
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
