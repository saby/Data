import {protect} from '../util';

const $destroyed = protect('destroyed');

function dontTouchDeads(): void {
   throw new ReferenceError('This class instance is destroyed.');
}

/**
 * Миксин, добавляющий аспект состояния "экземпляр разрушен".
 * @remark
 * Это абстрактный класс, не предназначенный для создания самостоятельных экземпляров.
 * @mixin Types/_entity/DestroyableMixin
 * @public
 * @author Мальцев А.А.
 */
export default abstract class DestroyableMixin {
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

   /**
    * @deprecated
    */
   protected isDestroyed(): boolean {
      return this.destroyed;
   }
}

DestroyableMixin.prototype['[Types/_entity/DestroyableMixin]'] = true;
