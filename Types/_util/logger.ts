/// <amd-module name="Types/_util/logger" />
/**
 * Logger
 * @public
 * @author Мальцев А.А.
 */

// @ts-ignore
import { IoC } from 'Env/Env';

const STACK_DETECTOR = /:[0-9]+:[0-9]+/;

let stackPoints = {};

const logger = {

   /**
    * Пишет в лог сообщение
    * @param {String} tag Метка
    * @param {String} message Сообщение
    */
   log(tag: string, message: any) {
      if (arguments.length === 1) {
         message = tag;
         tag = 'Log';
      }
      IoC.resolve('ILogger').log(tag, message || '');
   },

   /**
    * Пишет в лог сообщение об ошибке
    * @param {String} tag Метка
    * @param {String} message Сообщение
    */
   error(tag: string, message: any) {
      if (arguments.length === 1) {
         message = tag;
         tag = 'Critical';
      }
      IoC.resolve('ILogger').error(tag, message || '');
   },

   /**
    * Пишет в лог информационное сообщение
    * @param {String} tag Метка
    * @param {String} message Сообщение
    * @static
    */
   info(tag: string, message?: any) {
      if (arguments.length === 1) {
         message = tag;
         tag = 'Warning';
      }
      IoC.resolve('ILogger').warn(tag, message || '');
   },

   /**
    * Пишет в лог предупреждение с указанием файла, спровоцировавшего это предупреждение.
    * Для каждой точки файла предупреждение выводится только один раз.
    * @param {String} message Сообщение
    * @param {Number} [offset=0] Смещение по стеку
    * @param {String} [level=info] Уровень логирования
    */
   stack(message: string, offset?: number, level?: string) {
      offset = offset || 0;
      level = level || 'info';
      let error = new Error(message);
      let at = 2 + offset; //this scope -> logStack() called scope -> error scope
      let callStack = '';
      let hash = '';

      if ('stack' in error) {
         let stack = String(error.stack).split('\n');
         if (!STACK_DETECTOR.test(stack[0])) {
            at++;//Error text may be at first row
         }

         callStack = stack.slice(at).join('\n').trim();

         // Don't repeat the same message
         hash = message + callStack;
         if (stackPoints.hasOwnProperty(hash)) {
            return;
         }
         stackPoints[hash] = true;
      }

      IoC.resolve('ILogger')[level](error.message, callStack);
   }
};

export default logger;
