/**
 * Ограничивает число вызовов функции в заданный период времени.
 * @remark
 * Исходная функция может быть вызвана последовательно несколько раз. С помощью throttle можно выполнить только первый
 * её вызов, а затем проигнорировать остальные в течение периода задержки.
 * <br/>
 * Алгоритм работы следующий:
 * <ol>
 *    <li>Сначала происходит выполнение функции.</li>
 *    <li>Далее генерируется задержка на время, указанное параметром delay.</li>
 *    <li>Если за время задержки происходит очередной вызов функции, то она не выполняется.</li>
 *    <li>Если параметр last=true, и за время задержки была вызвана функция, то она выполнится по окончании задержки.
 *        После выполнения также генерируется задержка.</li>
 *    <li>Если параметр last=true и за время delay функция была вызвана несколько раз, то по окончании будет выполнена
 *        последняя из серии вызовов.</li>
 * </ol>
 *
 *
 * <h2>Параметры функции</h2>
 * <ul>
 *     <li><b>original</b> {Function} - исходная функция, число вызовов которой нужно ограничить.</li>
 *     <li><b>delay</b> {Number} - период задержки в мс.</li>
 *     <li><b>[last=false]</b> {Boolean} - устанавливает необходимость выполнения последней функции из серии вызовов по
 *         окончании задержки.
 *     </li>
 * </ul>
 *
 * <h2>Возвращает</h2>
 * {Function} Результирующая функция.
 *
 * <h2>Пример использования</h2>
 * Будем рассчитывать итоги по корзине покупателя не при каждом добавлении товара, а раз в 200 миллисекунд:
 * <pre>
 *    import {throttle} from 'Types/function';
 *    const cart = {
 *       items: [
 *          {name: 'Milk', price: 1.99, qty: 2},
 *          {name: 'Butter', price: 2.99, qty: 1},
 *          {name: 'Ice Cream', price: 0.49, qty: 2}
 *       ],
 *       totals: {},
 *       calc: () => {
 *          this.totals = {
 *             amount: 0,
 *             qty: 0
 *          };
 *          this.items.forEach((item) => {
 *             this.totals.amount += item.price * item.qty;
 *             this.totals.qty += item.qty;
 *          });
 *          console.log('Cart totals:', this.totals);
 *       },
 *    };
 *    const calcCartThrottled = throttle(cart.calc, 200);
 *
 *    const interval = setInterval(() => {
 *       cart.items.push({name: 'Something else', price: 1.05, qty: 1});
 *       console.log('Cart items count: ' + cart.items.length);
 *       calcCartThrottled.call(cart);
 *       if (cart.items.length > 9) {
 *          clearInterval(interval);
 *       }
 *    }, 100);
 * });
 * </pre>
 *
 * @class Types/_function/throttle
 * @public
 * @author Мальцев А.А.
 */
export default function throttle(original: Function, delay: number, last?: boolean): Function {
   let state = true;
   let next;

   return function(...args: any[]): any {
      if (state) {
         original.apply(this, arguments);
         state = false;
         setTimeout(() => {
            state = true;
            if (last && next) {
               next();
               next = null;
            }
         }, delay);
      } else if (last) {
         next = original.bind(this, ...args);
      }
   };
}
