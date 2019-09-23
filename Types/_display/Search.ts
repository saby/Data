import Tree from './Tree';
import TreeItem from './TreeItem';
import SearchStrategy from './itemsStrategy/Search';
import ItemsStrategyComposer from './itemsStrategy/Composer';
import {register} from '../di';

/**
 * Проекция для режима поиска. Объединяет развернутые узлы в один элемент с "хлебной крошкой" внутри.
 * @class Types/_display/Search
 * @extends Types/_display/Tree
 * @public
 * @author Мальцев А.А.
 */
export default class Search<S, T extends TreeItem<S> = TreeItem<S>> extends Tree<S, T> {
    protected _createComposer(): ItemsStrategyComposer<S, T> {
        const composer = super._createComposer();
        composer.append(SearchStrategy);

        return composer;
    }
}

Object.assign(Search.prototype, {
    _moduleName: 'Types/display:Search',
    '[Types/_display/Search]': true
});

register('Types/display:Search', Search);
