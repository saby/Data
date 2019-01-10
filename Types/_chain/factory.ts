/// <amd-module name="Types/_chain/factory" />
/**
 * Создает последовательную цепочку вызовов, обрабатывающих коллекции различных типов.
 *
 * Выберем из массива имена персонажей женского пола, отсортированные по имени:
 * <pre>
 * requirejs(['Types/Chain'], function(chain) {
 *    chain([
 *       {name: 'Philip J. Fry', gender: 'M'},
 *       {name: 'Turanga Leela', gender: 'F'},
 *       {name: 'Professor Farnsworth', gender: 'M'},
 *       {name: 'Amy Wong', gender: 'F'},
 *       {name: 'Bender Bending Rodriguez', gender: 'R'}
 *    ]).filter(function(item) {
 *       return item.gender === 'F';
 *    }).map(function(item) {
 *       return item.name;
 *    }).sort(function(a, b) {
 *       return a > b;
 *    }).value();
 *    //['Amy Wong', 'Turanga Leela']
 * });
 * </pre>
 * Выберем из рекордсета персонажей женского пола, отсортированных по имени:
 * <pre>
 * requirejs([
 *    'Types/Chain',
 *    'Types/Collection/RecordSet'
 * ], function(
 *    chain,
 *    RecordSet
 * ) {
 *    chain(new RecordSet({rawData: [
 *       {name: 'Philip J. Fry', gender: 'M'},
 *       {name: 'Turanga Leela', gender: 'F'},
 *       {name: 'Professor Farnsworth', gender: 'M'},
 *       {name: 'Amy Wong', gender: 'F'},
 *       {name: 'Bender Bending Rodriguez', gender: 'R'}
 *    ]})).filter(function(item) {
 *       return item.get('gender') === 'F';
 *    }).sort(function(a, b) {
 *       return a.get('name') > b.get('name');
 *    }).value();
 *    //[Model(Amy Wong), Model(Turanga Leela)]
 * });
 * </pre>
 * Другие примеры смотрите в описании методов класса {@link Types/Chain/Abstract}.
 *
 * @class Types/Chain
 * @public
 * @author Мальцев А.А.
 */

/**
 * @alias Types/Chain
 * @param {Array|Object|Types/Collection/IEnumerable|Types/Chain/Abstract|Function} source Коллекция, обрабатываемая цепочкой
 * @return {Types/Chain/Abstract}
 */

import di from '../_di';
import Abstract from './Abstract';
import Arraywise from './Arraywise';
import Objectwise from './Objectwise';
import Enumerable from './Enumerable';
import Concatenated from './Concatenated';
import Counted from './Counted';
import Filtered from './Filtered';
import Flattened from './Flattened';
import Grouped from './Grouped';
import Mapped from './Mapped';
import Reversed from './Reversed';
import Sliced from './Sliced';
import Sorted from './Sorted';
import Uniquely from './Uniquely';
import Zipped from './Zipped';

di.register('Types/chain:DestroyableMixin', Abstract, { instantiate: false });
di.register('Types/chain:Arraywise', Arraywise, { instantiate: false });
di.register('Types/chain:Concatenated', Concatenated, { instantiate: false });
di.register('Types/chain:Counted', Counted, { instantiate: false });
di.register('Types/chain:Enumerable', Enumerable, { instantiate: false });
di.register('Types/chain:Filtered', Filtered, { instantiate: false });
di.register('Types/chain:Flattened', Flattened, { instantiate: false });
di.register('Types/chain:Grouped', Grouped, { instantiate: false });
di.register('Types/chain:Mapped', Mapped, { instantiate: false });
di.register('Types/chain:Objectwise', Objectwise, { instantiate: false });
di.register('Types/chain:Reversed', Reversed, { instantiate: false });
di.register('Types/chain:Sliced', Sliced, { instantiate: false });
di.register('Types/chain:Sorted', Sorted, { instantiate: false });
di.register('Types/chain:Uniquely', Uniquely, { instantiate: false });
di.register('Types/chain:Zipped', Zipped, { instantiate: false });

export default function factory(source: any): Abstract<any> {
   if (source instanceof Abstract) {
      return source;
   } else if (source && source['[Types/_collection/IEnumerable]']) {
      return new Enumerable(source);
   } else if (source instanceof Array) {
      return new Arraywise(source);
   } else if (source instanceof Object) {
      return new Objectwise(source);
   }
   throw new TypeError(`Unsupported source type "${source}": only Array or Object are supported.`);
}
