import Abstract from './Abstract';
import MappedEnumerator from './MappedEnumerator';
import {IEnumerator} from '../collection';

type MapFunc = (item: any, index: number) => any;

/**
 * Преобразующее звено цепочки.
 * @class Types/_chain/Mapped
 * @extends Types/_chain/Abstract
 * @public
 * @author Мальцев А.А.
 */
export default class Mapped<T> extends Abstract<T> {
    /**
     * Функция, возвращающая новый элемент
     */
    protected _callback: MapFunc;

    /**
     * Контекст вызова _callback
     */
    protected _callbackContext: object;

   /**
    * Конструктор преобразующего звена цепочки.
    * @param source Предыдущее звено.
    * @param callback Функция, возвращающая новый элемент.
    * @param [callbackContext] Контекст вызова callback
    */
   constructor(source: Abstract<T>, callback: MapFunc, callbackContext?: object) {
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

    getEnumerator(): IEnumerator<T> {
        return new MappedEnumerator(
            this._previous,
            this._callback,
            this._callbackContext
        );
    }

    // endregion
}

Object.assign(Mapped.prototype, {
    ['[Types/_chain/Mapped]']: true,
    _callback: null,
    _callbackContext: null
});
