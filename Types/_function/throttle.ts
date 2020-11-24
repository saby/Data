/**
 * Позволяет вызывать функцию не чаще, чем один раз в течение указанного периода времени.
 * @remark
 * Алгоритм работы следующий:
 * <ol>
 *     <li>Сначала происходит выполнение функции.</li>
 *     <li>Далее генерируется задержка на время, указанное параметром delay.</li>
 *     <li>Если за время задержки происходит очередной вызов функции, то она игнорируется.</li>
 *     <li>Если параметр last=true, и за время delay функция была вызвана несколько раз, то по окончании будет выполнен последний из серии вызовов.</li>
 * </ol>
 *
 * См. также функцию {@link Types/_function/debounce debounce} которая позволяет игноририровать вызовы функции до тех пор, пока пока они не перестанут повторяться в течение указанного периода.
 *
 * <h2>Пример использования</h2>
 * Будем рассчитывать итоги по корзине покупателя не при каждом добавлении товара, а раз в 200 миллисекунд:
 * <pre>
 *     import {throttle} from 'Types/function';
 *     const cart = {
 *         items: [
 *             {name: 'Milk', price: 1.99, qty: 2},
 *             {name: 'Butter', price: 2.99, qty: 1},
 *             {name: 'Ice Cream', price: 0.49, qty: 2}
 *         ],
 *         totals: {},
 *         calc: () => {
 *             this.totals = {
 *                 amount: 0,
 *                 qty: 0
 *             };
 *             this.items.forEach((item) => {
 *                 this.totals.amount += item.price * item.qty;
 *                 this.totals.qty += item.qty;
 *             });
 *             console.log('Cart totals:', this.totals);
 *         },
 *     };
 *     const calcCartThrottled = throttle(cart.calc, 200);
 *
 *     const interval = setInterval(() => {
 *         cart.items.push({name: 'Something else', price: 1.05, qty: 1});
 *         console.log('Cart items count: ' + cart.items.length);
 *         calcCartThrottled.call(cart);
 *         if (cart.items.length > 9) {
 *             clearInterval(interval);
 *         }
 *     }, 100);
 * });
 * </pre>
 *
 * @param original Функция, число вызовов которой нужно ограничить
 * @param delay Период задержки в мс
 * @param first Выполнить последний вызов по окончании задержки
 * @returns Результирующая функция
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
