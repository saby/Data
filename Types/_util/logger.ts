import {IoC} from 'Env/Env';

const STACK_DETECTOR = /:[0-9]+:[0-9]+/;
const SELF_STACK_DEPTH = 2;

const stackPoints = {};

/**
 * Logger
 * @public
 * @author Мальцев А.А.
 */
const logger = {

   /**
    * Пишет в лог сообщение
    * @param tag Метка
    * @param message Сообщение
    */
   log(tag: string, message?: string): void {
      if (arguments.length === 1) {
         message = tag;
         tag = 'Log';
      }
      IoC.resolve('ILogger').log(tag, message || '');
   },

   /**
    * Пишет в лог сообщение об ошибке
    * @param tag Метка
    * @param message Сообщение
    */
   error(tag: string, message?: string | Error): void {
      if (arguments.length === 1) {
         message = tag;
         tag = 'Critical';
      }
      IoC.resolve('ILogger').error(tag, message || '');
   },

   /**
    * Пишет в лог информационное сообщение
    * @param tag Метка
    * @param message Сообщение
    * @static
    */
   info(tag: string, message?: string): void {
      if (arguments.length === 1) {
         message = tag;
         tag = 'Warning';
      }
      IoC.resolve('ILogger').warn(tag, message || '');
   },

   /**
    * Пишет в лог предупреждение с указанием файла, спровоцировавшего это предупреждение.
    * Для каждой точки файла предупреждение выводится только один раз.
    * @param message Сообщение
    * @param [offset=0] Смещение по стеку
    * @param [level=info] Уровень логирования
    */
   stack(message: string, offset?: number, level?: string): void {
      offset = offset || 0;
      level = level || 'info';
      const error = new Error(message);
      let at = SELF_STACK_DEPTH + offset; // this scope -> logStack() called scope -> error scope
      let callStack = '';
      let hash = '';

      if ('stack' in error) {
         const stack = String(error.stack).split('\n');
         if (!STACK_DETECTOR.test(stack[0])) {
            // Error text may be at first row
            at++;
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
