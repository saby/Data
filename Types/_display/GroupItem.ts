import CollectionItem, {IOptions as ICollectionItemOptions} from './CollectionItem';
import ExpandableMixin, {IOptions as IExpandableMixinOptions} from './ExpandableMixin';
import {mixin} from '../util';
import {register} from '../di';

interface IOptions<T> extends ICollectionItemOptions<T>, IExpandableMixinOptions {
}

/**
 * Элемент коллекции "Группа"
 * @class Types/_display/GroupItem
 * @extends Types/_display/CollectionItem
 * @mixes Types/_display/ExpandableMixin
 * @public
 * @author Мальцев А.А.
 */
export default class GroupItem<T> extends mixin<
    CollectionItem<any>,
    ExpandableMixin
>(
    CollectionItem,
    ExpandableMixin
) {
    constructor(options?: IOptions<T>) {
        super(options);
        ExpandableMixin.call(this);
    }
}

Object.assign(GroupItem.prototype, {
    '[Types/_display/GroupItem]': true,
    _moduleName: 'Types/display:GroupItem',
    _instancePrefix: 'group-item-'
});

register('Types/display:GroupItem', GroupItem, {instantiate: false});
