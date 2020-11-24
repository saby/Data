const win = typeof window !== 'undefined' ? window : null;
const doc = typeof document !== 'undefined' ? document : null;
const getHiddenName = () => {
    const hiddenPossibleNames = ['hidden', 'msHidden', 'webkitHidden'];
    return doc && hiddenPossibleNames.find((name) => typeof doc[name] !== 'undefined');
};
const hiddenName = getHiddenName();

/**
 * Метод Вызывает функцию асинхронно, через requestAnimationFrame, или на крайний случай setTimeout.
 * @remark
 * Если вкладка скрыта, то есть окно браузера свёрнуто или активна другая вкладка развёрнутого окна, requestAnimationFrame выполнится только когда вкладка снова станет видимой. В этом случае тоже используем setTimeout, чтобы функция выполнилась прямо на скрытой вкладке, и очередь асинхронных функций не копилась.
 *
 * @param original Исходная функция, вызов которой нужно асинхронно
 * @returns Результирующая функция
 * @public
 * @author Мальцев А.А.
 */
export default function delay(original: Function): void {
    if (win && win.requestAnimationFrame && !(hiddenName && doc[hiddenName])) {
        win.requestAnimationFrame(original as FrameRequestCallback);
    } else {
        setTimeout(original, 0);
    }
}
