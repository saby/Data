/// <amd-module name="Types/_display/itemsStrategy/MaterializedPath" />
/**
 * Стратегия получения элементов проекции по материализованному пути из порядковых номеров элементов в коллекции
 * @class Types/_display/ItemsStrategy/MaterializedPath
 * @extends Types/_display/ItemsStrategy/Abstract
 * @author Мальцев А.А.
 */

import AbstractStrategy, {IOptions as IAbstractOptions} from './AbstractStrategy';
import CollectionItem from '../CollectionItem';
import {IEnumerable, IList} from '../../collection';
import {object} from '../../util';

interface IOptions extends IAbstractOptions {
   childrenProperty: string;
   root: string | Function;
}

interface ISortOptions {
   indexToPath: string[];
}

interface ISorter {
   name: string;
   enabled: boolean;
   method: Function;
   options: () => object;
}

export default class MaterializedPath
   extends AbstractStrategy /** @lends Types/_display/ItemsStrategy/MaterializedPath.prototype */ {
   /**
    * @typedef {Object} Options
    * @property {Types/_display/Collection} display Проекция
    * @property {String} childrenProperty Имя свойства, хранящего вложенных детей узла
    * @property {String} nodeProperty Имя свойства, хранящего признак "узел/лист"
    * @property {Types/_display/TreeItem} root Корень
    */

   protected _options: IOptions;

   /**
    * Соответствие "индекс в коллекции" - "путь"
    */
   protected _indexToPath: number[][] = [];

   constructor(options: IOptions) {
      super(options);
   }

   getSorters(): ISorter[] {
      const sorters: ISorter[] = [];

      sorters.push({
         name: 'tree',
         enabled: true,
         method: MaterializedPath.sortItems,
         options: () => {
            return {indexToPath: this._indexToPath};
         }
      });

      return sorters;
   }

   // region IItemsStrategy

   get count(): number {
      let index = 0;
      while (this.at(index) !== undefined) {
         index++;
      }
      return index;
   }

   get items(): CollectionItem[] {
      let index = 0;
      while (this.at(index) !== undefined) {
         index++;
      }
      return this._getItems();
   }

   at(index: number): CollectionItem {
      const items = this._getItems();
      if (!items[index]) {
         const collection = this._getCollection();
         const path = this._getPathTo(collection, index);
         let contents;

         if (path) {
            contents = this._getItemByPath(collection, path);
         }

         if (contents) {
            items[index] = this.options.display.createItem({
               contents,
               parent: this._getParent(index, path)
            });
         }
      }

      return items[index];
   }

   splice(start: number): CollectionItem[] {
      this._getItems().length = start;
      this._indexToPath.length = start;
      return [];
   }

   // endregion

   // region Protected

   /**
    * Возвращает путь до элемента с порядковым номером
    * @param {Array|Types/_collection/IList|Types/_collection/IEnumerable} collection Коллекция
    * @param {Number} index Порядковый номер
    * @return {Array.<Number>}
    * @protected
    */
   protected _getPathTo(collection: IEnumerable<any>, index: number): number[] {
      if (this._indexToPath[index]) {
         return this._indexToPath[index];
      }

      const childrenProperty = this._options.childrenProperty;
      let current;
      let path;

      const iterator = (search, parent, path) => {
         const isArray = parent instanceof Array;
         const isList = parent['[Types/_collection/IList]'];
         const isEnumerable = parent['[Types/_collection/IEnumerable]'];
         let enumerator;
         let isLast;
         let item;
         let children;
         let sub;

         let index = 0;
         for (;;) {
            if (isArray) {
               isLast = parent.length <= index;
               if (!isLast) {
                  item = parent[index];
               }
            } else if (isList) {
               isLast = parent.getCount() <= index;
               if (!isLast) {
                  item = parent.at(index);
               }
            } else if (isEnumerable) {
               if (!enumerator) {
                  enumerator = parent.getEnumerator();
               }
               item = enumerator.moveNext() ? enumerator.getCurrent() : undefined;
               isLast = item === undefined;
            } else {
               throw new TypeError('Unsupported object type: only Array, Types/_collection/IList or ' +
                  'Types/_collection/IEnumerable are supported.');
            }

            if (isLast) {
               break;
            }

            if (search === current) {
               return path.concat(index);
            }

            current++;

            children = object.getPropertyValue(item, childrenProperty);
            if (children instanceof Object) {
               sub = iterator(search, children, path.concat(index));
               if (sub) {
                  return sub;
               }

            }

            index++;
         }
      };

      current = 0;
      path = iterator(index, collection, []);
      if (path) {
         this._indexToPath[index] = path;
      }

      return path;
   }

   /**
    * Возвращает элемент, находящийся по указанному пути
    * @param {Array|Types/_collection/IList|Types/_collection/IEnumerable} collection Коллекция
    * @param {Array.<Number>} path Путь до элемента
    * @return {*}
    * @protected
    */
   protected _getItemByPath(collection: IEnumerable<any>, path: number[]): any {
      const childrenProperty = this._options.childrenProperty;
      let item = collection;

      for (let level = 0; level < path.length;) {
         item = this._getItemAt(collection, path[level]);
         level++;
         if (level < path.length) {
            collection = object.getPropertyValue(item, childrenProperty);
         }
      }
      return item;
   }

   /**
    * Возвращает родителя элемента с указанными порядковым номером и путем
    * @param {Number} index Порядковый номер элемента
    * @param {Array.<Number>} path Путь до элемента
    * @return {Types/_display/CollectionItem} Родитель элемента
    * @protected
    */
   protected _getParent(index: number, path: number[]): CollectionItem {
      const parentPath = path.slice(0, path.length - 1);
      if (parentPath.length) {
         const items = this._getItems();
         const parentContents = this._getItemByPath(this._getCollection(), parentPath);
         if (parentContents) {
            for (let i = index - 1; i >= 0; i--) {
               if (items[i] && items[i].getContents() === parentContents) {
                  return items[i];
               }
            }
         }
      } else {
         return typeof this._options.root === 'function' ? this._options.root() : this._options.root;
      }
   }

   /**
    * Возвращает элемент по индексу в родителе
    * @param {Array|Types/_collection/IList|Types/_collection/IEnumerable} collection Родитель
    * @param {Number} at Индекс элемента
    * @return {*}
    * @protected
    */
   protected _getItemAt(collection: any[] | IEnumerable<any> | IList<any>, at: number): any {
      const isArray = collection instanceof Array;
      const isList = collection['[Types/_collection/IEnumerable]'];
      const isEnumerable = collection['[Types/_collection/IEnumerable]'];
      let item;

      if (isArray) {
         item = collection[at];
      } else if (isList) {
         item = (<IList<any>> collection).at(at);
      } else if (isEnumerable) {
         const enumerator = (<IEnumerable<any>> collection).getEnumerator();
         let current;
         let index = 0;
         while (enumerator.moveNext()) {
            current = enumerator.getCurrent();
            if (index === at) {
               item = current;
               break;
            }
            index++;
         }
      } else {
         throw new TypeError('Unsupported object type: only Array, Types/_collection/IList or ' +
            'Types/_collection/IEnumerable are supported.');
      }

      if (item === undefined) {
         throw new ReferenceError('Item at ' + at + ' is out of range.');
      }

      return item;
   }

   // endregion

   // region Statics

   /**
    * Создает индекс сортировки по материализованному пути - от корневой вершины вглубь до конечных вершин
    * @param {Array.<Types/_display/CollectionItem>} items Элементы проекции.
    * @param {Array.<Number>} current Текущий индекс сортировки
    * @param {Object} options Опции
    * @return {Array.<Number>}
    */
   static sortItems(items: CollectionItem[], current: number[], options: ISortOptions): number[] {
      const indexToPath = options.indexToPath;
      let stringIndexToPath;
      const stringPathToIndex = {};
      const pathToString = (path) => {
         return path.join('.');
      };
      const getIndexByPath = (path) => {
         return stringPathToIndex[pathToString(path)];
      };
      const comparePaths = (pathA, pathB) => {
         const realIndexA = getIndexByPath(pathA);
         const realIndexB = getIndexByPath(pathB);

         return current.indexOf(realIndexA) - current.indexOf(realIndexB);
      };

      stringIndexToPath = indexToPath.map(pathToString);

      stringIndexToPath.forEach((path, index) => {
         stringPathToIndex[path] = index;
      });

      return current.slice().sort((indexA, indexB) => {
         const pathA = indexToPath[indexA];
         const pathB = indexToPath[indexB];
         const pathALength = pathA.length;
         const pathBLength = pathB.length;
         const minLength = Math.min(pathALength, pathBLength);
         let result = 0;

         // Going deep into path and compare each level
         for (let level = 0; level < minLength; level++) {
            // Same paths are equal
            if (pathA[level] === pathB[level]) {
               continue;
            }

            // Different paths possibly are not equal
            result = comparePaths(
               pathA.slice(0, 1 + level),
               pathB.slice(0, 1 + level)
            );

            if (result !== 0) {
               // Paths are not equal
               break;
            }
         }

         // Equal paths but various level: child has deeper level than parent, child should be after parent
         if (result === 0 && pathALength !== pathBLength) {
            result = pathALength - pathBLength;
         }

         return result;
      });
   }

   // endregion
}

MaterializedPath.prototype._moduleName = 'Types/display:itemsStrategy.MaterializedPath';
MaterializedPath.prototype['[Types/_display/itemsStrategy/MaterializedPath]'] = true;
