/**
 * Guid
 * @class Types/_entity/Guid
 * @public
 * @author Мальцев А.А.
 */
export default class Guid {
   /**
    * Returns a string filled with random numbers which looks like GUID
    */
   static create(): string {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
         // tslint:disable-next-line:no-bitwise
         const r = Math.random() * 16 | 0;
         // tslint:disable-next-line:no-bitwise
         const v = c === 'x' ? r : (r & 0x3 | 0x8);
         return v.toString(16);
      });
   }
}
