import Abstract from './Abstract';
import FilteredEnumerator from './FilteredEnumerator';

type CallbackFunc = (item: any, index: number) => boolean;

/**
 * Фильтрующее звено цепочки.
 * @class Types/_chain/Filtered
 * @extends Types/_chain/Abstract
 * @public
 * @author Кудрявцев И.С.
 */
export default class Filtered<T> extends Abstract<T> {
    /**
     * Фильтр
     */
    protected _callback: CallbackFunc;

    /**
     * Контекст вызова _callback
     */
    protected _callbackContext: object;

    /**
     * Конструктор фильтрующего звена цепочки.
     * @param source Предыдущее звено.
     * @param callback Фильтр
     * @param [callbackContext] Контекст вызова callback
     */
    constructor(source: Abstract<T>, callback: CallbackFunc, callbackContext: object) {
        super(source);
        this._callback = callback;
        this._callbackContext = callbackContext;
    }

    destroy(): void {
        this._callback = null;
        this._callbackContext = null;
        super.destroy();
    }

    // region IEnumerable

    getEnumerator(): FilteredEnumerator<T> {
        return new FilteredEnumerator(
            this._previous,
            this._callback,
            this._callbackContext
        );
    }

    // endregion
}

Filtered.prototype['[Types/_chain/Filtered]'] = true;
