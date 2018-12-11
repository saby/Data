/// <amd-module name="Types/_collection/factory/list" />
/**
 * Фабрика для получения списка из Types/Collection/IEnumerable.
 * @class Types/Collection/Factory/List
 * @public
 * @author Мальцев А.А.
 */

import IEnumerable from '../IEnumerable';
import List from '../List';

/**
 * @alias Types/Collection/Factory/List
 * @param {Types/Collection/IEnumerable} items Коллекция
 * @return {Types/Collection/List}
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
