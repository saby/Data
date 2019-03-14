const win = typeof window !== 'undefined' ? window : null;

/**
 * Модуль, в котором описана функция <b>delay(fn)</b>.
 *
 * Метод Вызывает функцию асинхронно, через requestAnimationFrame, или на крайний случай setTimeout
 *
 * <h2>Параметры функции</h2>
 * <ul>
 *     <li><b>fn</b> {Function} - исходная функция, вызов которой нужно асинхронно.</li>
 * </ul>
 *
 * @function Types/_function/delay
 * @public
 * @author Мальцев А.А.
 */
export default function delay(original: Function): void {
   if (win && win.requestAnimationFrame) {
      win.requestAnimationFrame(original as FrameRequestCallback);
   } else {
      setTimeout(original, 0);
   }
}
