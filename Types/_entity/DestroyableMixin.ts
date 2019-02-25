/// <amd-module name="Types/_entity/DestroyableMixin" />
/**
 * Миксин, добавляющий аспект состояния "экземпляр разрушен".
 * Это абстрактный класс, не предназначенный для создания самостоятельных экземпляров.
 * @mixin Types/_entity/DestroyableMixin
 * @public
 * @author Мальцев А.А.
 */

import {protect} from '../util';

const $destroyed = protect('destroyed');

function dontTouchDeads(): void {
   throw new ReferenceError('This class instance is destroyed.');
}

export default abstract class DestroyableMixin /** @lends Types/_entity/DestroyableMixin.prototype */{
   /**
    * Экземпляр был разрушен
    */
   get destroyed(): boolean {
      return Boolean(this[$destroyed]);
   }

   /**
    * Разрушает экземпляр
    */
   destroy(): void {
      this[$destroyed] = true;

      // tslint:disable-next-line:forin
      for (const key in this) {
         switch (key) {
            case 'destroy':
            case 'destroyed':
            case 'isDestroyed':
               break;
            default:
               if (typeof this[key] === 'function') {
                  this[key as string] = dontTouchDeads;
               }
         }
      }
   }

   // FIXME: deprecated
   private isDestroyed(): boolean {
      return this.destroyed;
   }
}

DestroyableMixin.prototype['[Types/_entity/DestroyableMixin]'] = true;
