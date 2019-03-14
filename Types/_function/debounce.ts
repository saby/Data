/**
 * Модуль, в котором описана функция <b>debounce(original, delay, first)</b>.
 *
 * Откладывает выполнение функции на период задержки.
 * <br/>
 * Алгоритм работы следующий:
 * <ol>
 *    <li>При первом вызове функции её выполнение откладывается на время, заданное параметром delay. Если за это время
 *        происходит второй вызов функции, то он также откладывается на время delay, а первая функция не будет
 *        выполнена вообще. И так далее по аналогии.</li>
 *    <li>Если параметр first=true, то первая функция из серии вызовов будет выполнена до начала задержки.</li>
 * </ol>
 *
 * <h2>Параметры функции</h2>
 * <ul>
 *     <li><b>original</b> {Function} - исходная функция, вызов которой нужно отложить.</li>
 *     <li><b>delay</b> {Number} - период задержки в мс.</li>
 *     <li><b>[first=false]</b> {Boolean} - определяет необходимость выполнения первой функции из серии вызовов до
 *         начала задержки.</li>
 * </ul>
 *
 * <h2>Возвращает</h2>
 * {Function} Результирующая функция.
 *
 * <h2>Пример использования</h2>
 * Будем рассчитывать итоги по корзине покупателя не при каждом добавлении товара, а только один раз:
 * <pre>
 * require(['Core/helpers/Function/debounce'], function(debounce) {
 *    var cart = {
 *          items: [
 *             {name: 'Milk', price: 1.99, qty: 2},
 *             {name: 'Butter', price: 2.99, qty: 1},
 *             {name: 'Ice Cream', price: 0.49, qty: 2}
 *          ],
 *          totals: {},
 *          calc: function() {
 *             var totals = this.totals = {
 *                amount: 0,
 *                qty: 0
 *             };
 *             this.items.forEach(function(item) {
 *                totals.amount += item.price * item.qty;
 *                totals.qty += item.qty;
 *             });
 *             console.log('Cart totals:', totals);
 *          },
 *       },
 *       calcCartDebounced = debounce(cart.calc, 200),
 *       interval;
 *
 *    interval = setInterval(function() {
 *       cart.items.push({name: 'Something else', price: 1.05, qty: 1});
 *       console.log('Cart items count: ' + cart.items.length);
 *       calcCartDebounced.call(cart);
 *       if (cart.items.length > 9) {
 *          clearInterval(interval);
 *       }
 *    }, 100);
 * });
 * </pre>
 *
 * @function Core/helpers/Function/debounce
 * @public
 * @author Мальцев А.А.
 * @example
 */
export default function debounce(original: Function, delay: number|String, first?: boolean): Function {
   let wait = false;
   let timer;

   return function(...args: any[]): void {
      if (wait) {
         return;
      }

      if (first && !timer) {
         original.apply(this, args);
         wait = true;
         setTimeout(() => {
            wait = false;
         }, delay as number);
         return;
      }

      if (timer) {
         clearTimeout(timer);
      }

      // original.bind(this, arg1, arg2, arg3, ...);
      timer = setTimeout(original.bind(this, ...args), delay as number);
   };
}
