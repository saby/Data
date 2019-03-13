/**
 * Guid
 * @class Types/_entity/Guid
 * @public
 * @author Мальцев А.А.
 */
export default class Guid {
   /**
    * return random numbers that look like GUIDs
    * @return {String}
    */
   static create(): Guid {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
         // tslint:disable-next-line:no-bitwise
         const r = Math.random() * 16 | 0;
         // tslint:disable-next-line:no-bitwise
         const v = c === 'x' ? r : (r & 0x3 | 0x8);
         return v.toString(16);
      });
   }
}
