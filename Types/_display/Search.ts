/// <amd-module name="Types/_display/Search" />
/**
 * Проекция для режима поиска. Объединяет развернутые узлы в один элемент с "хлебной крошкой" внутри.
 * @class Types/Display/Search
 * @extends Types/Display/Tree
 * @public
 * @author Мальцев А.А.
 */

import Tree from './Tree';
import SearchStrategy from './itemsStrategy/Search';
import {register} from '../di';

export default class Search extends Tree /** @lends Types/Display/Search.prototype */{
   _createComposer() {
      let composer = super._createComposer();
      composer.append(SearchStrategy);

      return composer;
   }
}

Search.prototype._moduleName = 'Types/display:Search';
Search.prototype['[Types/_display/Search]'] = true;

register('Types/display:Search', Search);
