/// <amd-module name="Types/_chain/Reversed" />
/**
 * Реверсивное звено цепочки.
 * @class Types/Chain/Reversed
 * @extends Types/Chain/Abstract
 * @public
 * @author Мальцев А.А.
 */

import Abstract from './Abstract';
import ReversedEnumerator from './ReversedEnumerator';

export default class Reversed<T> extends Abstract<T> /** @lends Types/Chain/Reversed.prototype */{
   // region Types/_collection/IEnumerable

   getEnumerator(): ReversedEnumerator<T> {
      return new ReversedEnumerator(
         this._previous
      );
   }

   // endregion Types/_collection/IEnumerable
}

Reversed.prototype['[Types/_chain/Reversed]'] = true;
