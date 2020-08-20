/**
 * Возвращает оболочку для защищенного свойства.
 * @param property Наименование свойства.
 * @public
 * @author Мальцев А.А.
 */

const isSymbolSupported = typeof Symbol !== 'undefined';
// Even tough we have a Polyfill for Symbol we still struggle with IE here
// Long story short: https://online.sbis.ru/opendoc.html?guid=24a0d4c6-bf5c-45b5-acf7-428cc251a6ba
const isNativeSymbolSupported = isSymbolSupported ?
    String(Symbol).indexOf('Symbol is not a constructor') === -1 :
    false;

/*
 * Returns wrapper for protected property
 * @param property Property name
 * @public
 * @author Мальцев А.А.
 */
export default function protect(property: string): symbol | string {
    return isNativeSymbolSupported ? Symbol(property) : `$${property}`;
}
