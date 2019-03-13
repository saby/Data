/**
 * Миксин, позволяющий сериализовать и десериализовать инастансы различных модулей.
 * Для корректной работы необходимо определить в прототипе каждого модуля свойство _moduleName, в котором прописать
 * имя модуля для requirejs.
 * @example
 * <pre>
 * define('My.SubModule', ['My.SuperModule'], function (SuperModule) {
 *    'use strict';
 *
 *    var SubModule = SuperModule.extend({
 *      _moduleName: 'My.SubModule'
 *    });
 *
 *    return SubModule;
 * });
 * </pre>
 * @mixin Types/_entity/SerializableMixin
 * @public
 * @author Мальцев А.А.
 */

import {protect, logger} from '../util';

/**
 * @const {Symbol} Свойство, хранящее признак десериализованного экземпляра
 */
const $unserialized = protect('unserialized');

/**
 * {Boolean} Поддерживается ли свойство __proto__ экземпляром Object
 */
// @ts-ignore
const isProtoSupported = typeof ({}).__proto__ === 'object';

/**
 * {Boolean} Поддерживается вывод места определения функции через getFunctionDefinition()
 */
// @ts-ignore
const isFunctionDefinitionSupported = typeof getFunctionDefinition === 'function';

/**
 * {Number} Счетчик экземляров
 */
let instanceCounter = 0;

export interface IState {
   $options?: Object;
}

interface ISignature {
   '$serialized$': string;
   module: string;
   id: number;
   state: IState;
}

/**
 * Возвращает уникальный номер инстанса
 * @return {Number}
 */
function getInstanceId(): number {
   return this._instanceNumber || (this._instanceNumber = ++instanceCounter);
}

/**
 * Сериализует код модуля, чтобы его можно было идентифицировать.
 * @param {Object} instance Экземпляр модуля
 */
function serializeCode(instance: object): string {
   const proto = Object.getPrototypeOf(instance);
   const processed = [];

   return '{' + Object.keys(proto).map((name) => {
      return [name, JSON.stringify(proto[name], (key, value) => {
         if (value && typeof value === 'object') {
            if (processed.indexOf(value) === -1) {
               processed.push(value);
               if (value.$serialized$) {
                  return '{*serialized*}';
               }
            } else {
               return '{*recursion*}';
            }
         }
         if (typeof value === 'function') {
            // @ts-ignore
            return isFunctionDefinitionSupported ? getFunctionDefinition(value) : String(value);
         }
         return value;
      })];
   }).map((pair) => {
      return `${pair[0]}: ${pair[1]}`;
   }).join(',') + '}';
}

/**
 * Создает ошибку сериализации
 * @param {Object} instance Экземпляр объекта
 * @param {Boolean} [critical=false] Выбросить исключение либо предупредить
 * @param {Number} [skip=3] Сколько уровней пропустить при выводе стека вызова метода
 */
function createModuleNameError(instance: object, critical?: boolean, skip?: number): void {
   const text = `Property "_moduleName" with module name for RequireJS's define() is not found` +
      ` in this prototype: "${serializeCode(instance)}"`;
   if (critical) {
      throw new ReferenceError(text);
   } else {
      logger.stack(text, skip === undefined ? 3 : skip);
   }
}

export default class SerializableMixin /** @lends Types/_entity/SerializableMixin.prototype */ {
   /**
    * Уникальный номер инстанса
    */
   protected _instanceNumber: number;

   /**
    * Class module name
    */
   protected _moduleName: string;

   /**
    * Nonstandard prototype getter
    */
   private '__proto__': this;

   /**
    * Method implemented in OptionsToPropertyMixin
    */
   private _getOptions: () => Object;

   // region Public methods

   constructor(options?: any) {
      // Just for signature
   }

   /**
    * Конструирует экземпляр класса из сериализованного состояния
    * @param {Object} data Сериализованное состояние
    * @return {Object}
    * @static
    * @example
    * Сериализуем сущность:
    * <pre>
    *    //data = {$serialized$: 'inst', module: ...}
    *    var instance = Entity.prototype.fromJSON.call(Entity, data);
    *    instance instanceof Entity;//true
    * </pre>
    */
   static fromJSON(data: ISignature): SerializableMixin {
      const initializer = this.prototype._setSerializableState(data.state);
      const instance = new this(data.state.$options);
      if (initializer) {
         initializer.call(instance);
      }
      return instance;
   }

   /**
    * Возвращает сериализованный экземпляр класса
    * @return {Object}
    * @example
    * Сериализуем сущность:
    * <pre>
    *    var instance = new Entity(),
    *       data = instance.toJSON();//{$serialized$: 'inst', module: ...}
    * </pre>
    */
   toJSON(): ISignature {
      this._checkModuleName(true);

      return {
         $serialized$: 'inst',
         module: this._moduleName,
         id: getInstanceId.call(this),
         state: this._getSerializableState({})
      };
   }

   /**
    * Возвращает всё, что нужно сложить в состояние объекта при сериализации, чтобы при десериализации вернуть его в
    * это же состояние
    * @param {Object} state Cостояние
    * @return {Object}
    * @protected
    */
   _getSerializableState(state: IState): IState {
      state.$options = typeof this._getOptions === 'function' ? this._getOptions() : {};
      return state;
   }

   /**
    * Проверяет сериализованное состояние перед созданием инстанса. Возвращает метод, востанавливающий состояние объекта
    * после создания инстанса.
    * @param {Object} state Cостояние
    * @return {Function}
    * @protected
    */
   _setSerializableState(state?: Object): Function {
      return function(): void {
         this[$unserialized] = true;
      };
   }

   // endregion

   // region Protected methods

   /**
    * Проверяет, что в прототипе указано имя модуля для RequireJS, иначе не будет работать десериализация
    * @param critical Отсутствие имени модуля критично
    * @param [skip] Сколько уровней пропустить при выводе стека вызова метода
    * @protected
    */
   protected _checkModuleName(critical: boolean, skip?: number): void {
      let proto = this;
      if (!proto._moduleName) {
         createModuleNameError(this, critical, skip);
         return;
      }

      // TODO: refactor to Object.getPrototypeOf(this) after migration to pure prototypes
      if (!isProtoSupported) {
         return;
      }
      proto = this.__proto__;
      if (!proto.hasOwnProperty('_moduleName')) {
         createModuleNameError(this, critical, skip);
      }
   }

   // endregion
}

Object.assign(SerializableMixin.prototype, {
   '[Types/_entity/SerializableMixin]': true,
   _instanceNumber: null
});

// FIXME: Core/Serializer is looking for dynamic method
// @ts-ignore
SerializableMixin.prototype.fromJSON = SerializableMixin.fromJSON;
