/**
 * Возвращает оболочку для защищенного свойства.
 * @param property Наименование свойства.
 * @public
 * @author Мальцев А.А.
 */

/*
 * Returns wrapper for protected property
 * @param property Property name
 * @public
 * @author Мальцев А.А.
 */
export default function protect(property: string): symbol | string {
    return typeof Symbol === 'undefined' ? `$${property}` : Symbol(property);
}
