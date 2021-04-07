import Format from './Format';
import {format} from '../../entity';
import {register} from '../../di';

/**
 * Конструирует формат полей по декларативному описанию
 * @param declaration Декларативное описание
 * @author Кудрявцев И.С.
 */
export default function factory(declaration: format.IFieldDeclaration[]): Format<format.Field> {
    if (!declaration || !(declaration instanceof Array)) {
        throw new TypeError('Types/_collection/format/factory: declaration should be an instance of Array');
    }
    const instance = new Format<format.Field>();
    for (let i = 0; i < declaration.length; i++) {
        instance.add(format.fieldsFactory(declaration[i]));
    }
    return instance;
}

register('Types/collection:format.factory', factory, {instantiate: false});
