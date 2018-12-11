/// <amd-module name="Types/_entity/DestroyableMixin" />
/**
 * Миксин, добавляющий аспект состояния "экземпляр разрушен".
 * Это абстрактный класс, не предназначенный для создания самостоятельных экземпляров.
 * @mixin Types/Entity/DestroyableMixin
 * @public
 * @author Мальцев А.А.
 */

import {protect} from '../util';

const $destroyed = protect('destroyed');

function dontTouchDeads() {
   throw new ReferenceError('This class instance is destroyed.');
}

export default abstract class DestroyableMixin /** @lends Types/Entity/DestroyableMixin.prototype */{
   /**
    * Экземпляр был разрушен
    */
   public get destroyed(): boolean {
      return Boolean(this[$destroyed]);
   }

   /**
    * Разрушает экземпляр
    */
   public destroy() {
      this[$destroyed] = true;

      for (const key in this) {
         switch (key) {
            case 'destroy':
            case 'destroyed':
            case 'isDestroyed':
               break;
            default:
               if (typeof this[key] === 'function') {
                  this[<string>key] = dontTouchDeads;
               }
         }
      }
   }

   //FIXME: deprecated
   private isDestroyed(): boolean {
      return this.destroyed;
   }
}

DestroyableMixin.prototype['[Types/_entity/DestroyableMixin]'] = true;
