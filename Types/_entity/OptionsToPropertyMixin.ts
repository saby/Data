/// <amd-module name="Types/_entity/OptionsToPropertyMixin" />
/**
 * Примесь, позволяющая передавать в конструктор сущности набор опций (объект вида ключ-значение).
 * Для разделения защищенных свойств и опций последние должны именоваться определенным образом - имя должно
 * начинаться с префикса '_$':
 * <pre>
 *    var Device = Core.extend([OptionsToPropertyMixin], {
 *       _$vendor: '',
 *       getVendor: function () {
 *          return this._$vendor;
 *       }
 *    });
 * </pre>
 * Если класс-наследник имеет свой конструктор, обязательно вызовите конструктор примеси (или конструктор
 * родительского класса, если примесь уже есть у родителя):
 * <pre>
 *    var Device = Core.extend([OptionsToPropertyMixin], {
 *       _$vendor: '',
 *       constructor: function(options) {
 *          OptionsToPropertyMixin.constructor.call(this, options);
 *       },
 *       getVendor: function () {
 *          return this._$vendor;
 *       }
 *    });
 * </pre>
 * Потому что именно конструктор примеси OptionsToPropertyMixin раскладывает значения аргумента options по защищенным свойствам:
 * <pre>
 *    var hdd = new Device({
 *       vendor: 'Seagate'
 *    });
 *    hdd.getVendor();//Seagate
 * </pre>
 * @class Types/_entity/OptionsToPropertyMixin
 * @public
 * @author Мальцев А.А.
 */

const optionPrefix = '_$';
const optionPrefixLen = optionPrefix.length;

function defineProperty(instance: Object, name: string, key: string, scope: Object) {
   Object.defineProperty(instance, name, {
      enumerable: true,
      configurable: true,
      get: function() {
         delete instance[name];
         return (instance[name] = scope[key]);
      },
      set: function(value) {
         delete instance[name];
         instance[name] = value;
      }
   });
}

export default abstract class OptionsToPropertyMixin /** @lends Types/_entity/OptionsMixin.prototype */{
   protected _options: any;

   /**
    * Конструктор объекта, принимающий набор опций в качестве первого аргумента
    * @param {Object} [options] Значения опций
    */
   constructor(options?: Object) {
      if (options && typeof options === 'object') {
         let prefix = optionPrefix;
         let keys = Object.keys(options);
         let option;
         let property;
         for (let i = 0, count = keys.length; i < count; i++) {
            option = keys[i];
            property = prefix + option;
            if (property in this) {
               defineProperty(this, property, option, options);
            }
         }
      }
   }

   /**
    * Возвращает опции объекта
    * @return {Object} Значения опций
    * @protected
    */
   protected _getOptions(): Object {
      let options = {};
      let keys = Object.keys(this);
      let key;
      for (let i = 0, count = keys.length; i < count; i++) {
         key = keys[i];
         if (key.substr(0, optionPrefixLen) === optionPrefix) {
            options[key.substr(optionPrefixLen)] = this[key];
         }
      }

      //FIXME: get rid of _options
      if (this._options) {
         for (key in this._options) {
            if (this._options.hasOwnProperty(key) && !(key in options)) {
               options[key] = this._options[key];
            }
         }
      }

      return options;
   }
}

OptionsToPropertyMixin.prototype['[Types/_entity/OptionsToPropertyMixin]'] = true;
