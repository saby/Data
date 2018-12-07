/// <amd-module name="Types/_util/protect" />
/**
 * Возвращает имя для защищенного свойства
 * @param {String} property Название свойства.
 * @return {Symbol|String} Защищенное имя
 * @public
 * @author Мальцев А.А.
 */
export default function protect(property: string): symbol|string {
   return typeof Symbol === 'undefined' ? `$${property}` : Symbol(property);
}
