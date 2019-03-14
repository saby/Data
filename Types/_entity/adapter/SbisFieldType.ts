/**
 * @class Types/_entity/adapter/SbisFieldType
 * @description Класс используют, чтобы для строкового названия типа данных WS получить соответствующее ему строковое
 * название типа данных, которое применяется в серверном фреймворке.
 * @remark Строковые названия типов данных по классам:
 * <ul>
 *   <li>integer - {@link https://wi.sbis.ru/docs/js/WS/Types/_entity/format/IntegerField/ IntegerField};</li>
 *   <li>money - {@link https://wi.sbis.ru/docs/js/WS/Types/_entity/format/MoneyField/ MoneyField};</li>
 *   <li>array - {@link https://wi.sbis.ru/docs/js/WS/Types/_entity/format/ArrayField/ ArrayField};</li>
 *   <li>binary - {@link https://wi.sbis.ru/docs/js/WS/Types/_entity/format/BinaryField/ BinaryField};</li>
 *   <li>boolean - {@link https://wi.sbis.ru/docs/js/WS/Types/_entity/format/BooleanField/ BooleanField};</li>
 *   <li>date - {@link https://wi.sbis.ru/docs/js/WS/Types/_entity/format/MoneyField/ MoneyField};</li>
 *   <li>dateTime - {@link https://wi.sbis.ru/docs/js/WS/Types/_entity/format/DateTimeField/ DateTimeField};</li>
 *   <li>dictionary - {@link https://wi.sbis.ru/docs/js/WS/Types/_entity/format/DictionaryField/ DictionaryField};</li>
 *   <li>enum - {@link https://wi.sbis.ru/docs/js/WS/Types/_entity/format/EnumField/ EnumField};</li>
 *   <li>flags - {@link https://wi.sbis.ru/docs/js/WS/Types/_entity/format/FlagsField/ FlagsField};</li>
 *   <li>identity - {@link https://wi.sbis.ru/docs/js/WS/Types/_entity/format/IdentityField/ IdentityField};</li>
 *   <li>object - {@link https://wi.sbis.ru/docs/js/WS/Types/_entity/format/ObjectField/ ObjectField};</li>
 *   <li>real - {@link https://wi.sbis.ru/docs/js/WS/Types/_entity/format/RealField/ RealField};</li>
 *   <li>record - {@link https://wi.sbis.ru/docs/js/WS/Types/_entity/format/RecordField/ RecordField};</li>
 *   <li>recordset - {@link https://wi.sbis.ru/docs/js/WS/Types/_entity/format/RecordSetField/ RecordSetField};</li>
 *   <li>rpcfile - {@link https://wi.sbis.ru/docs/js/WS/Types/_entity/format/RpcFileField/ RpcFileField};</li>
 *   <li>string - {@link https://wi.sbis.ru/docs/js/WS/Types/_entity/format/StringField/ StringField};</li>
 *   <li>time - {@link https://wi.sbis.ru/docs/js/WS/Types/_entity/format/TimeField/ TimeField};</li>
 *   <li>uuid - {@link https://wi.sbis.ru/docs/js/WS/Types/_entity/format/UuidField/ UuidField};</li>
 *   <li>timeinterval - {@link https://wi.sbis.ru/docs/js/WS/Types/_entity/format/TimeIntervalField/ TimeIntervalField};
 *   </li>
 *   <li>xml - {@link https://wi.sbis.ru/docs/js/WS/Types/_entity/format/XmlField/ XmlField}.</li>
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
