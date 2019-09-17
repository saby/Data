import OptionsToPropertyMixin from './OptionsToPropertyMixin';
import ObservableMixin from './ObservableMixin';
import ManyToManyMixin from './ManyToManyMixin';
import {protect} from '../util';

const hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * Свойство, хранящее признак возможности записи
 */
const $writable = protect('writable');

/**
 * Миксин, позволяющий ограничивать запись и чтение.
 * @remark
 * Подмешивается после Types/_entity/ObservableMixin и после Types/_entity/ManyToManyMixin, перекрывая часть их методов
 * @mixin Types/_entity/ReadWriteMixin
 * @public
 * @author Мальцев А.А.
 */
export default abstract class ReadWriteMixin {
    '[Types/_entity/ReadWriteMixin]': boolean;

    /**
     * @deprecated Old-fashioned options
     */
    protected _options: any;

    get writable(): boolean {
        return this[$writable];
    }

    constructor(options?: any) {
        if (this._options && hasOwnProperty.call(this._options, 'writable')) {
            this[$writable] = this._options.writable;
        }
        if (options && hasOwnProperty.call(options, 'writable')) {
            this[$writable] = options.writable;
        }
        if (this[$writable]) {
            ObservableMixin.apply(this, arguments);
        }
    }

    destroy(): void {
        if (this[$writable]) {
            ObservableMixin.prototype.destroy.call(this);
            ManyToManyMixin.prototype.destroy.call(this);
        }
    }

    // endregion

    // region ObservableMixin

    subscribe(event: string, handler: Function, ctx?: object): void {
        if (this[$writable]) {
            return ObservableMixin.prototype.subscribe.call(this, event, handler, ctx);
        }
    }

    unsubscribe(event: string, handler: Function, ctx?: object): void {
        if (this[$writable]) {
            return ObservableMixin.prototype.unsubscribe.call(this, event, handler, ctx);
        }
    }

   protected _publish(): void {
      if (this[$writable]) {
         return (ObservableMixin.prototype as any)._publish.apply(this, arguments);
      }
   }

   protected _notify(): void {
      if (this[$writable]) {
         return (ObservableMixin.prototype as any)._notify.apply(this, arguments);
      }
   }

    // endregion

    // region OptionsToPropertyMixin

   protected _getOptions(): object {
      const options = (OptionsToPropertyMixin.prototype as any)._getOptions.call(this);

        // Delete "writable" property received from _options
        delete options.writable;
        return options;
    }

    // endregion
}

Object.assign(ReadWriteMixin.prototype, {
    '[Types/_entity/ReadWriteMixin]': true
});

const IS_BROWSER = typeof window !== 'undefined';
const IS_TESTING = !!(typeof global !== 'undefined' && global.assert && global.assert.strictEqual);

/**
 * @property {Boolean} Объект можно модифицировать.
 * Запрет модификации выключит механизмы генерации событий (ObservableMixin).
 */
Object.defineProperty(ReadWriteMixin.prototype, $writable, {
    writable: true,
    value: IS_BROWSER || IS_TESTING
});
