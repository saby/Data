import IItemsStrategy from '../IItemsStrategy';
import {DestroyableMixin, SerializableMixin} from '../../entity';
import {mixin} from '../../util';

/**
 * Компоновщик стратегий; оборачивает стратегии одну в другую в заданном порядке
 * @class Types/_display/ItemsStrategy/Composer
 * @mixes Types/_entity/DestroyableMixin
 * @mixes Types/_entity/SerializableMixin
 * @author Мальцев А.А.
 */
export default class Composer extends mixin(DestroyableMixin, SerializableMixin) {
   /**
    * Композируемые модули
    */
   protected _modules: Function[] = [];

   /**
    * Параметры конструкторов композируемых модулей
    */
   protected _options: object[] = [];

   /**
    * Результат композиции
    */
   protected _result: IItemsStrategy;

   constructor() {
      super();
   }

   destroy(): void {
      this._modules = null;
      this._options = null;
      this._result = null;

      super.destroy();
   }

   /**
    * Добавляет стратегию в конец
    * @param Module Конструктор стратегии
    * @param [options] Опции конструктора
    * @param [after] После какой стратегии добавить (по умолчанию в конец)
    */
   append(Module: Function, options?: object, after?: Function): this {
      let index = this._modules.indexOf(after);
      if (index === -1) {
         index = this._modules.length;
      } else {
         index++;
      }

      this._modules.splice(index, 0, Module);
      this._options.splice(index, 0, options);
      this._reBuild(index, true);

      return this;
   }

   /**
    * Добавляет стратегию в начало
    * @param Module Конструктор стратегии
    * @param options Опции конструктора
    * @param [before] Перед какой стратегией добавить (по умолчанию в начало)
    */
   prepend(Module: Function, options: object, before?: Function): this {
      let index = this._modules.indexOf(before);
      if (index === -1) {
         index = 0;
      }

      this._modules.splice(index, 0, Module);
      this._options.splice(index, 0, options);
      this._reBuild(index, true);

      return this;
   }

   /**
    * Удалает стратегию
    * @param Module Конструктор стратегии
    */
   remove(Module: Function): IItemsStrategy {
      const index = this._modules.indexOf(Module);
      if (index === -1) {
         return;
      }

      const instance = this._getInstance(index);
      this._modules.splice(index, 1);
      this._options.splice(index, 1);
      this._reBuild(index);

      return instance;
   }

   /**
    * Сбрасывает компоновщик
    */
   reset(): this {
      this._modules.length = 0;
      this._options.length = 0;
      this._result = null;

      return this;
   }

   /**
    * Возвращает экземпляр стратегии
    * @param Module Конструктор стратегии
    */
   getInstance(Module: Function): IItemsStrategy {
      const index = this._modules.indexOf(Module);
      if (index === -1) {
         return;
      }

      return this._getInstance(index);
   }

   /**
    * Возвращает результат компоновки
    */
   getResult(): IItemsStrategy {
      return this._result;
   }

   // endregion Public members

   // region SerializableMixin

   protected _getSerializableState(state: any): void {
      state = SerializableMixin.prototype._getSerializableState.call(this, state);

      state.$options = {};
      state._modules = this._modules;
      state._options = this._options;
      state._result = this._result;

      return state;
   }

   protected _setSerializableState(state: any): Function {
      const fromSerializableMixin = SerializableMixin.prototype._setSerializableState(state);
      return function(): void {
         fromSerializableMixin.call(this);

         this._modules = state._modules;
         this._options = state._options;
         this._result = state._result;
      };
   }

   // endregion

   // region Protected members

   protected _reBuild(index: number, onAdd?: boolean): void {
      const wrap = (source, Module, defaults) => {
         const options = {...(defaults || {})};
         if (source) {
            options.source = source;
         }
         return new Module(options);
      };

      // Just add or remove if last item affected
      if (this._result && index === this._modules.length + (onAdd ? -1 : 0)) {
         if (onAdd) {
            this._result = wrap(this._result, this._modules[index], this._options[index]);
         } else {
            this._result = this._result.source;
         }
         return;
      }

      this._result = this._modules.reduce((memo, Module, index) => {
         return wrap(memo, Module, this._options[index]);
      }, null);
   }

   protected _getInstance(index: number): IItemsStrategy {
      const target = this._modules.length - index - 1;
      let current = 0;
      let item = this._result;

      while (target > current) {
         item = item.source;
         current++;
      }

      return item;
   }

   // endregion
}

Object.assign(Composer.prototype, {
   '[Types/_display/itemsStrategy/Composer]': true,
   _moduleName: 'Types/display:itemsStrategy.Composer',
   _result: null
});
