/// <amd-module name="Types/_chain/Flattened" />
/**
 * Разворачивающее звено цепочки.
 * @class Types/Chain/Flattened
 * @extends Types/Chain/Abstract
 * @public
 * @author Мальцев А.А.
 */

import Abstract from './Abstract';
import FlattenedEnumerator from './FlattenedEnumerator';

export default class Flattened<T> extends Abstract<T> /** @lends Types/Chain/Flattened.prototype */{
   // region Types/_collection/IEnumerable

   getEnumerator(): FlattenedEnumerator<T> {
      return new FlattenedEnumerator(
         this._previous
      );
   }

   // endregion Types/_collection/IEnumerable
}

Flattened.prototype['[Types/_chain/Flattened]'] = true;
