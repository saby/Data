/**
 * Миксин, позволяющий задавать опциональные настройки источника данных.
 * @mixin Types/_source/OptionsMixin
 * @public
 * @author Мальцев А.А.
 */

export interface IOptions {
   debug?: boolean;
}

interface IConstructorOptions {
   options?: IOptions;
}

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

   constructor(options?: IConstructorOptions): void {
      if (options && options.options instanceof Object) {
         this._$options = {...(this._$options || {}), ...options.options};
         delete options.options;
      }
   },

   /**
    * Возвращает дополнительные настройки источника данных.
    * @return {Object}
    * @see options
    */
   getOptions(): object {
      return {...this._$options};
   },

   setOptions(options: object): void {
      this._$options = {...this._$options, ...(options || {})};
   },

   /**
    * Объединяет набор опций суперкласса с наследником
    * @param {Types/_source/OptionsMixin} Super Суперкласс
    * @param {Object} options Опции наследника
    * @return {Object}
    * @static
    */
   addOptions(Super: Function, options: object): object {
      return {...Super.prototype._$options, ...options};
   }
};

export default OptionsMixin;
