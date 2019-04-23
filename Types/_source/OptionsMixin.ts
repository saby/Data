import {getMergeableProperty} from '../entity';

export interface IOptionsOption {
   debug?: boolean;
}

export interface IOptions {
   options?: IOptionsOption;
}

/**
 * Миксин, позволяющий задавать опциональные настройки источника данных.
 * @mixin Types/_source/OptionsMixin
 * @public
 * @author Мальцев А.А.
 */
export default abstract class OptionsMixin {
   readonly '[Types/_source/OptionsMixin]': boolean;

   /**
    * Дополнительные настройки источника данных.
    */
   protected _$options: IOptionsOption;

   /**
    * Возвращает дополнительные настройки источника данных.
    * @see options
    */
   getOptions(): IOptionsOption {
      return {...this._$options};
   }

   setOptions(options: IOptionsOption): void {
      this._$options = {...this._$options, ...(options || {})};
   }

   /**
    * Объединяет набор опций суперкласса с наследником
    * @param Super Суперкласс
    * @param options Опции наследника
    * @static
    */
   static addOptions<T>(Super: Function, options: T): T {
      return {...Super.prototype._$options, ...options};
   }
}

Object.assign(OptionsMixin.prototype, {
   '[Types/_source/OptionsMixin]': true,

   /**
    * @cfg {Object} Дополнительные настройки источника данных.
    * @name Types/_source/OptionsMixin#options
    */
   _$options: getMergeableProperty<IOptionsOption>({
      /**
       * @cfg {Boolean} Режим отладки.
       * @name Types/_source/OptionsMixin#options.debug
       */
      debug: false
   })
});
