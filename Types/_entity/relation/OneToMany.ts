/// <amd-module name="Types/_entity/relation/OneToMany" />
/**
 * Посредник, реализующий отношения "один ко многим".
 * @class Types/_entity/relation/OneToMany
 * @mixes Types/_entity/DestroyableMixin
 * @author Мальцев А.А.
 */

import DestroyableMixin from '../DestroyableMixin';
import {Map, Set} from '../../shim';

/**
 * Проверяет, что объект "живой" (не был уничтожен)
 * @param {Object} item Объект
 * @return {Boolean}
 */
function isAlive(item): boolean {
   return item instanceof Object && item['[Types/_entity/DestroyableMixin]'] ? !item.destroyed : true;
}

export default class OneToMany extends DestroyableMixin /** @lends Types/_entity/relation/OneToMany.prototype */{
   /**
    * @property {Map<Object, Set<Object>>} Родитель -> [Ребенок, Ребенок, ...]
    */
   _parentToChild: any;

   /**
    * @property {Map<Object, Object>} Ребенок -> Родитель
    */
   _childToParent: any;

   /**
    * @property {Map<Object, String>} Ребенок -> название отношения
    */
   _childToRelation: any;

   constructor() {
      super();
      this._parentToChild = new Map();
      this._childToParent = new Map();
      this._childToRelation = new Map();
   }

   destroy() {
      this._parentToChild = null;
      this._childToParent = null;
      this._childToRelation = null;
      super.destroy();
   }

   //region Public methods

   /**
    * Добавляет отношение "родитель - ребенок"
    * @param {Object} parent Родитель
    * @param {Object} child Ребенок
    * @param {String} [name] Название отношений
    */
   addTo(parent, child, name) {
      this._addForParent(parent, child);
      this._addForChild(child, parent, name);
   }

   /**
    * Удаляет отношение "родитель - ребенок"
    * @param {Object} parent Родитель
    * @param {Object} child Ребенок
    */
   removeFrom(parent, child) {
      this._removeForParent(parent, child);
      this._removeForChild(child, parent);
   }

   /**
    * Очищает все отношения c детьми у указанного родителя
    * @param {Object} parent Родитель
    */
   clear(parent) {
      if (this._parentToChild.has(parent)) {
         this._parentToChild.get(parent).forEach((child) => {
            this._removeForChild(child, parent);
         });
         this._parentToChild.delete(parent);
      }
   }

   /**
    * Возвращает всех детей для указанного родителя
    * @param {Object} parent Родитель
    * @param {Function(Object, String)} callback Функция обратного вызова для каждого ребенка
    */
   each(parent, callback) {
      if (this._parentToChild.has(parent)) {
         this._parentToChild.get(parent).forEach((child) => {
            if (isAlive(child)) {
               callback.call(
                  this,
                  child,
                  this._childToParent.get(child) === parent ? this._childToRelation.get(child) : undefined
               );
            }
         });
      }
   }

   /**
    * Возвращает родителя для указанного ребенка
    * @param {Object} child Ребенок
    * @return {Object}
    */
   getParent(child) {
      let parent = this._childToParent.get(child);
      return parent !== undefined && isAlive(parent) ? parent : undefined;
   }

   //endregion Public methods

   //region Protected methods

   /**
    * Добавляет ребенка в список родителя
    * @param {Object} parent Родитель
    * @param {Object} child Ребенок
    * @protected
    */
   _addForParent(parent, child) {
      let children;
      if (this._parentToChild.has(parent)) {
         children = this._parentToChild.get(parent);
      } else {
         children = new Set();
         this._parentToChild.set(parent, children);
      }
      children.add(child);
   }

   /**
    * Удаляет ребенка из списка родителя
    * @param {Object} parent Родитель
    * @param {Object} child Ребенок
    * @protected
    */
   _removeForParent(parent, child) {
      if (this._parentToChild.has(parent)) {
         let children = this._parentToChild.get(parent);
         children.delete(child);
         if (children.size === 0) {
            this._parentToChild.delete(parent);
         }
      }
   }

   /**
    * Добавляет связь ребенка с родителем
    * @param {Object} child Ребенок
    * @param {Object} parent Родитель
    * @param {String} name Название отношения
    * @protected
    */
   _addForChild(child, parent, name) {
      this._childToParent.set(child, parent);
      this._childToRelation.set(child, name);
   }

   /**
    * Удаляет связь ребенка с родителем
    * @param {Object} child Ребенок
    * @param {Object} parent Родитель
    * @protected
    */
   _removeForChild(child, parent) {
      if (this._childToParent.get(child) === parent) {
         this._childToParent.delete(child);
         this._childToRelation.delete(child);
      }
   }

   //endregion Protected methods
}

OneToMany.prototype['[Types/_entity/relation/OneToMany]'] = true;
OneToMany.prototype._parentToChild = null;
OneToMany.prototype._childToParent = null;
OneToMany.prototype._childToRelation = null;
