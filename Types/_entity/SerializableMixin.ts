import {protect, logger} from '../util';
import {IHashMap} from '../_declarations';

/**
 * Свойство, хранящее признак десериализованного экземпляра
 */
const $unserialized = protect('unserialized');

/**
 * Поддерживается ли свойство __proto__ экземпляром Object
 */
const isProtoSupported: boolean = typeof ({} as any).__proto__ === 'object';

/**
 * Поддерживается вывод места определения функции через getFunctionDefinition()
 */
// @ts-ignore
const isFunctionDefinitionSupported: boolean = typeof getFunctionDefinition === 'function';

/**
 * Счетчик экземляров
 */
let instanceCounter = 0;

export interface IState<T = any> {
   $options?: T;
}

export interface ISignature<T = any> {
   '$serialized$': string;
   module: string;
   id: number;
   state: IState<T>;
}

export interface IOptions<T> {
    [key: string]: T;
}

/**
 * Возвращает уникальный номер инстанса
 */
function getInstanceId(): number {
   return this._instanceNumber || (this._instanceNumber = ++instanceCounter);
}

/**
 * Сериализует код модуля, чтобы его можно было идентифицировать.
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
 * @param instance Экземпляр объекта
 * @param [critical=false] Выбросить исключение либо предупредить
 * @param [skip=3] Сколько уровней пропустить при выводе стека вызова метода
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

/**
 * Миксин, позволяющий сериализовать и десериализовать инастансы различных модулей.
 * @remark
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
export default class SerializableMixin<T = any> {
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
   protected _getOptions: () => T;

   constructor(options?: IOptions<T>) {
      // Just for signature
   }

   /**
    * Возвращает сериализованный экземпляр класса
    * @example
    * Сериализуем сущность:
    * <pre>
    *    var instance = new Entity(),
    *       data = instance.toJSON();//{$serialized$: 'inst', module: ...}
    * </pre>
    * @remark Сериализует только указанный объект, без учета его инфраструктуры. Не рекомендуется использовать toJSON в
    * прикладном коде.
    */
   toJSON(): ISignature<T> {
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
    * @param state Cостояние
    * @protected
    */
   _getSerializableState(state: IState<T>): IState<T> {
      state.$options = this['[Types/_entity/OptionsToPropertyMixin]'] ? this._getOptions() : {} as T;
      return state;
   }

   /**
    * Проверяет сериализованное состояние перед созданием инстанса. Возвращает метод, востанавливающий состояние объекта
    * после создания инстанса.
    * @param state Cостояние
    * @protected
    */
   _setSerializableState(state?: IState<T>): Function {
      return function(): void {
         this[$unserialized] = true;
      };
   }

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

   /**
    * Конструирует экземпляр класса из сериализованного состояния
    * @param data Сериализованное состояние
    * @static
    * @example
    * Сериализуем сущность:
    * <pre>
    *    //data = {$serialized$: 'inst', module: ...}
    *    var instance = Entity.fromJSON(data);
    *    instance instanceof Entity;//true
    * </pre>
    */
   static fromJSON<T = SerializableMixin, K = any>(data: ISignature<K>): T {
      const initializer = this.prototype._setSerializableState(data.state);
      const instance = new this(data.state.$options);
      if (initializer) {
         initializer.call(instance);
      }
      return instance as any as T;
   }
}

Object.assign(SerializableMixin.prototype, {
   '[Types/_entity/SerializableMixin]': true,
   _instanceNumber: null
});

// FIXME: For subclasses created via Core/core-extend
// @ts-ignore
SerializableMixin.prototype.fromJSON = SerializableMixin.fromJSON;
