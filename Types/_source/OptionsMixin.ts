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
const OptionsMixin = /** @lends Types/_source/OptionsMixin.prototype */{
   '[Types/_source/OptionsMixin]': true,

   /**
    * @cfg {Object} Дополнительные настройки источника данных.
    * @name Types/_source/OptionsMixin#options
    */
   _$options: {

      /**
       * @cfg {Boolean} Режим отладки.
       * @name Types/_source/OptionsMixin#options.debug
       */
      debug: false
   },

   constructor(options?: IOptions): void {
      if (options && options.options instanceof Object) {
         this._$options = {...(this._$options || {}), ...options.options};
         delete options.options;
      }
   },

   /**
    * Возвращает дополнительные настройки источника данных.
    * @see options
    */
   getOptions(): IOptionsOption {
      return {...this._$options};
   },

   setOptions(options: IOptionsOption): void {
      this._$options = {...this._$options, ...(options || {})};
   },

   /**
    * Объединяет набор опций суперкласса с наследником
    * @param Super Суперкласс
    * @param options Опции наследника
    * @static
    */
   addOptions<T>(Super: Function, options: T): T {
      return {...Super.prototype._$options, ...options};
   }
};

export default OptionsMixin;
