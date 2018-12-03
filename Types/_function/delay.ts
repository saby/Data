/// <amd-module name="Types/_function/delay" />

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
 * @class Types/_function/delay
 * @public
 * @author Мальцев А.А.
 */
export default function runDelayed(original: Function) {
   const win = typeof window !== 'undefined' ? window : null;
   if (win && win.requestAnimationFrame) {
      win.requestAnimationFrame(<FrameRequestCallback>original);
   } else {
      setTimeout(original, 0);
   }
}
