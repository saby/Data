import SbisFormatFinder from './SbisFormatFinder';

export default interface IFormatController {
   readonly '[Types/_entity/format/IFormatController]': boolean;

   /**
    *
    * @param data
    * @param controller
    */
   _setFormatController(data: unknown, controller?: SbisFormatFinder): void;
}
