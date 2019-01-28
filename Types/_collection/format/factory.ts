/// <amd-module name="Types/_collection/format/factory" />
/**
 * Фабрика форматов - конструирует формат по декларативному описанию
 * @author Мальцев А.А.
 */

import Format from './Format';
import {format} from '../../entity';
import {register} from '../../di';

/**
 * Конструирует формат полей по декларативному описанию
 * @param {Array.<Types/_entity/format/FieldsFactory/FieldDeclaration.typedef>} declaration Декларативное описание
 * @return {Types/_entity/format/Format}
 */
export default function factory(declaration) {
   if (!declaration || !(declaration instanceof Array)) {
      throw new TypeError('Types/_collection/format/factory: declaration should be an instance of Array');
   }
   let instance = new Format();
   for (let i = 0; i < declaration.length; i++) {
      instance.add(format.fieldsFactory(declaration[i]));
   }
   return instance;
}

register('Types/collection:format.factory', factory, {instantiate: false});
