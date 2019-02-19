/// <amd-module name="Types/_entity/ReadWriteMixin" />
/**
 * Миксин, позволяющий ограничивать запись и чтение.
 * Подмешивается после Types/_entity/ObservableMixin и после Types/_entity/ManyToManyMixin, перекрывая часть их методов
 * @mixin Types/_entity/ReadWriteMixin
 * @public
 * @author Мальцев А.А.
 */

import OptionsToPropertyMixin from './OptionsToPropertyMixin';
import ObservableMixin from  './ObservableMixin';
import ManyToManyMixin from  './ManyToManyMixin';
import {protect} from '../util';

const hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * Свойство, хранящее признак возможности записи
 */
const $writable = protect('writable');

const ReadWriteMixin = /** @lends Types/_entity/ReadWriteMixin.prototype */{
   '[Types/_entity/ReadWriteMixin]': true,

   // region Types/_entity/ReadWriteMixin

   get writable() {
      return this[$writable];
   },

   constructor(options) {
      if (this._options && hasOwnProperty.call(this._options, 'writable')) {
         this[$writable] = this._options.writable;
      }
      if (options && hasOwnProperty.call(options, 'writable')) {
         this[$writable] = options.writable;
      }
      if (this[$writable]) {
         ObservableMixin.apply(this, arguments);
      }
   },

   destroy() {
      if (this[$writable]) {
         ObservableMixin.prototype.destroy.call(this);
         ManyToManyMixin.destroy.call(this);
      }
   },

   // endregion Types/_entity/ReadWriteMixin

   // region Types/_entity/ObservableMixin

   subscribe(event, handler, ctx) {
      if (this[$writable]) {
         return ObservableMixin.prototype.subscribe.call(this, event, handler, ctx);
      }
   },

   unsubscribe(event, handler, ctx) {
      if (this[$writable]) {
         return ObservableMixin.prototype.unsubscribe.call(this, event, handler, ctx);
      }
   },

   _publish() {
      if (this[$writable]) {
         // @ts-ignore
         return ObservableMixin.prototype._publish.apply(this, arguments);
      }
   },

   _notify() {
      if (this[$writable]) {
         // @ts-ignore
         return ObservableMixin.prototype._notify.apply(this, arguments);
      }
   },

   // endregion Types/_entity/ObservableMixin

   // region Types/_entity/OptionsToPropertyMixin

   _getOptions() {
      // @ts-ignore
      const options = OptionsToPropertyMixin.prototype._getOptions.call(this);

      // Delete "writable" property received from _options
      delete options.writable;
      return options;
   }

   // endregion Types/_entity/OptionsToPropertyMixin
};

// @ts-ignore
const IS_BROWSER = typeof window !== 'undefined';
// @ts-ignore
const IS_TESTING = !!(typeof global !== 'undefined' && global.assert && global.assert.strictEqual);

/**
 * @property {Boolean} Объект можно модифицировать. Запрет модификации выключит механизмы генерации событий (ObservableMixin).
 */
Object.defineProperty(ReadWriteMixin, $writable, {
   writable: true,
   value: IS_BROWSER || IS_TESTING
});

export default ReadWriteMixin;
