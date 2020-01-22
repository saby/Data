import Field from './Field';
import {register} from '../../di';

/**
 * Формат поля иерархии
 * @class Types/_entity/format/HierarchyField
 * @extends Types/_entity/format/Field
 * @author Мальцев А.А.
 */
export default class HierarchyField extends Field {
    /**
     * @cfg {String} Тип элементов
     * @name Types/_entity/format/HierarchyField#kind
     * @see getKind
     */
    _$kind: string;

    // region Public methods

    /**
     * Возвращает тип элементов
     * @return {String}
     * @see dictionary
     */
    getKind(): string {
        return this._$kind;
    }

    getDefaultValue(): any {
        if (this._$kind && this._$kind === 'Identity') {
            return [null];
        }
        return null;
    }

    // endregion Public methods
}

Object.assign(HierarchyField.prototype, {
    '[Types/_entity/format/HierarchyField]': true,
    _moduleName: 'Types/entity:format.HierarchyField',
    _typeName: 'Hierarchy',
    _$kind: ''
});

register('Types/entity:format.HierarchyField', HierarchyField, {instantiate: false});
