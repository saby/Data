import SbisFormatFinder from './SbisFormatFinder';

export default interface IFormatController {
   readonly '[Types/_entity/format/IFormatController]': boolean;

   /**
    *
    * @param controller
    */
   setFormatController(controller: SbisFormatFinder): void;
}
