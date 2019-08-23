import FormatController from './FormatController';

export default interface IFormatController {
   readonly '[Types/_entity/format/IFormatController]': boolean;

   /**
    *
    * @param controller
    */
   setFormatController(controller: FormatController): void;
}
