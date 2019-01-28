/// <amd-module name="Types/_collection/factory/list" />
/**
 * Фабрика для получения списка из Types/_collection/IEnumerable.
 * @class Types/_collection/Factory/List
 * @public
 * @author Мальцев А.А.
 */

import IEnumerable from '../IEnumerable';
import List from '../List';

/**
 * @alias Types/_collection/Factory/List
 * @param {Types/_collection/IEnumerable} items Коллекция
 * @return {Types/_collection/List}
 */
export default function list<T>(items: IEnumerable<T>): List<T> {
   if (!items || !(items['[Types/_collection/IEnumerable]'])) {
      throw new TypeError('Argument "items" should implement Types/collection:IEnumerable');
   }

   let itemsArray = [];
   items.each((item) => {
      itemsArray.push(item);
   });

   return new List({items: itemsArray});
}
