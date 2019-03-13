/**
 * Реверсивное звено цепочки.
 * @class Types/_chain/Reversed
 * @extends Types/_chain/Abstract
 * @public
 * @author Мальцев А.А.
 */

import Abstract from './Abstract';
import ReversedEnumerator from './ReversedEnumerator';

export default class Reversed<T> extends Abstract<T> /** @lends Types/_chain/Reversed.prototype */{
   // region Types/_collection/IEnumerable

   getEnumerator(): ReversedEnumerator<T> {
      return new ReversedEnumerator(
         this._previous
      );
   }

   // endregion Types/_collection/IEnumerable
}

Reversed.prototype['[Types/_chain/Reversed]'] = true;
