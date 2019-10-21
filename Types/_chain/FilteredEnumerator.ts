import {IEnumerator} from '../collection';
import Abstract from './Abstract';

type CallbackFunc = (item: any, index: number) => boolean;

/**
 * Фильтрующий энумератор.
 * @public
 * @author Мальцев А.А.
 */
export default class FilteredEnumerator<T> implements IEnumerator<T> {
    readonly '[Types/_collection/IEnumerator]': boolean = true;
    private previous: Abstract<T>;
    private callback: CallbackFunc;
    private callbackContext: Object;
    private enumerator: IEnumerator<T>;

    /**
     * Конструктор фильтрующего энумератора.
     * @param previous Предыдущее звено.
     * @param callback Фильтр
     * @param [callbackContext] Контекст вызова callback
     */
    constructor(previous: Abstract<T>, callback: CallbackFunc, callbackContext: object) {
        this.previous = previous;
        this.callback = callback;
        this.callbackContext = callbackContext;
        this.reset();
    }

    getCurrent(): any {
        return this.enumerator.getCurrent();
    }

    getCurrentIndex(): any {
        return this.enumerator.getCurrentIndex();
    }

    moveNext(): boolean {
        while (this.enumerator.moveNext()) {
            if (this.callback.call(
                this.callbackContext,
                this.enumerator.getCurrent(),
                this.enumerator.getCurrentIndex(),
            )) {
                return true;
            }
        }

        return false;
    }

    reset(): void {
        this.enumerator = this.previous.getEnumerator();
    }
}

Object.assign(FilteredEnumerator.prototype, {
    previous: null,
    callback: null,
    callbackContext: null,
    enumerator: null,
});
