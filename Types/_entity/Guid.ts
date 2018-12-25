///<amd-module name="Types/_entity/Guid" />
/**
 * Guid
 * @class Types/Entity/Guid
 * @public
 * @author Мальцев А.А.
 */
export default class Guid {
   /**
    * return random numbers that look like GUIDs
    * @return {String}
    */
   static create() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
         let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
         return v.toString(16);
      });
   }
}
