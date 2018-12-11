/// <amd-module name="Types/_source/OptionsMixin" />
/**
 * Миксин, позволяющий задавать опциональные настройки источника данных.
 * @mixin Types/Source/OptionsMixin
 * @public
 * @author Мальцев А.А.
 */

export interface IOptions {
   debug?: boolean
}

interface IConstructorOptions {
   options?: IOptions
}

const OptionsMixin = /** @lends Types/Source/OptionsMixin.prototype */{
   '[Types/_source/OptionsMixin]': true,

   /**
    * @cfg {Object} Дополнительные настройки источника данных.
    * @name Types/Source/OptionsMixin#options
    */
   _$options: {

      /**
       * @cfg {Boolean} Режим отладки.
       * @name Types/Source/OptionsMixin#options.debug
       */
      debug: false
   },

   constructor(options?: IConstructorOptions) {
      if (options && options.options instanceof Object) {
         this._$options = Object.assign({}, this._$options || {}, options.options);
         delete options.options;
      }
   },

   /**
    * Возвращает дополнительные настройки источника данных.
    * @return {Object}
    * @see options
    */
   getOptions(): Object {
      return Object.assign({}, this._$options);
   },

   setOptions(options: Object) {
      this._$options = Object.assign({}, this._$options, options || {});
   },

   /**
    * Объединяет набор опций суперкласса с наследником
    * @param {Types/Source/OptionsMixin} Super Суперкласс
    * @param {Object} options Опции наследника
    * @return {Object}
    * @static
    */
   addOptions(Super: Function, options: Object) {
      return Object.assign({}, Super.prototype._$options, options);
   }
};

export default OptionsMixin;
