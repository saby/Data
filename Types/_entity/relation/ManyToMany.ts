/// <amd-module name="Types/_entity/relation/ManyToMany" />
/**
 * Посредник, реализующий отношения "многие ко многим".
 * @class Types/_entity/relation/ManyToMany
 * @mixes Types/_entity/DestroyableMixin
 * @author Мальцев А.А.
 */

import DestroyableMixin from '../DestroyableMixin';
import {Map, Set} from '../../shim';

/**
 * Проверяет, что объект "живой" (не был уничтожен)
 * @param {Object} entity Объект
 * @return {Boolean}
 */
function isAlive(entity): boolean {
   return entity instanceof Object && entity['[Types/_entity/DestroyableMixin]'] ? !entity.destroyed : true;
}

export default class ManyToMany extends DestroyableMixin /** @lends Types/_entity/relation/ManyToMany.prototype */{
   /**
    * @property {Map<Object, Set<Object>>} master -> [slave, slave, ...]
    */
   _hasMany: any;

   /**
    * @property {Map<Object, Map<Object, String>>} master -> [name, name, ...]
    */
   _hasManyName: any;

   /**
    * @property {Map<Object, Set<Object>>} slave -> [master, master, ...]
    */
   _belongsTo: any;

   /**
    * @property {Map<Object, Map<Object, String>>} slave -> [name, name, ...]
    */
   _belongsToName: any;

   constructor() {
      super();
      this._hasMany = new Map();
      this._hasManyName = new Map();
      this._belongsTo = new Map();
      this._belongsToName = new Map();
   }

   destroy() {
      this._hasMany = null;
      this._hasManyName = null;
      this._belongsTo = null;
      this._belongsToName = null;
      super.destroy();
   }

   //region Public methods

   /**
    * Добавляет отношение между двумя сущностями
    * @param {Object} master Главная сущность
    * @param {Object} slave Зависимая сущность
    * @param {String} [name] Название отношения
    */
   addRelationship(master, slave, name) {
      this._addHasMany(master, slave, name);
      this._addBelongsTo(slave, master, name);
   }

   /**
    * Удаляет отношение между двумя сущностями
    * @param {Object} master Главная сущность
    * @param {Object} slave Зависимая сущность
    */
   removeRelationship(master, slave) {
      this._removeHasMany(master, slave);
      this._removeBelongsTo(slave, master);
   }

   /**
    * Очищает все отношения указанной сущности
    * @param {Object} entity Сущность
    */
   clear(entity) {
      if (this._hasMany.has(entity)) {
         this._hasMany.get(entity).forEach((slave) => {
            this._removeBelongsTo(slave, entity);
         });
         this._hasMany.delete(entity);
         this._hasManyName.delete(entity);
      }

      if (this._belongsTo.has(entity)) {
         this._belongsTo.get(entity).forEach((master) => {
            this._removeHasMany(master, entity);
         });
         this._belongsTo.delete(entity);
         this._belongsToName.delete(entity);
      }
   }

   /**
    * Возвращает все зависимые сущности
    * @param {Object} master Главная сущность
    * @param {Function(Object, String)} callback Функция обратного вызова для каждой зависимой сущности
    */
   hasMany(master, callback) {
      if (this._hasMany.has(master)) {
         let names = this._hasManyName.get(master);
         this._hasMany.get(master).forEach((slave) => {
            if (isAlive(slave)) {
               callback.call(
                  this,
                  slave,
                  names.get(slave)
               );
            }
         });
      }
   }

   /**
    * Возвращает все главные сущности
    * @param {Object} slave Зависимая сущность
    * @param {Function(Object, String)} callback Функция обратного вызова для каждой главной сущности
    */
   belongsTo(slave, callback) {
      if (this._belongsTo.has(slave)) {
         let names = this._belongsToName.get(slave);
         this._belongsTo.get(slave).forEach((master) => {
            if (isAlive(master)) {
               callback.call(
                  this,
                  master,
                  names.get(master)
               );
            }
         });
      }
   }

   //endregion Public methods

   //region Protected methods

   /**
    * Добавляет отношение вида hasMany
    * @param {Object} master Главная сущность
    * @param {Object} slave Зависимая сущность
    * @param {String} name Название отношения
    * @protected
    */
   protected _addHasMany(master, slave, name) {
      let slaves;
      let names;
      if (this._hasMany.has(master)) {
         slaves = this._hasMany.get(master);
         names = this._hasManyName.get(master);
      } else {
         slaves = new Set();
         names = new Map();
         this._hasMany.set(master, slaves);
         this._hasManyName.set(master, names);
      }
      slaves.add(slave);
      names.set(slave, name);
   }

   /**
    * Удаляет отношение вида hasMany
    * @param {Object} master Главная сущность
    * @param {Object} slave Зависимая сущность
    * @protected
    */
   protected _removeHasMany(master, slave) {
      if (this._hasMany.has(master)) {
         let slaves = this._hasMany.get(master);
         slaves.delete(slave);
         this._hasManyName.get(master).delete(slave);

         if (slaves.size === 0) {
            this._hasMany.delete(master);
            this._hasManyName.delete(master);
         }
      }
   }

   /**
    * Добавляет отношение вида belongsTo
    * @param {Object} master Главная сущность
    * @param {Object} slave Зависимая сущность
    * @param {String} name Название отношения
    * @protected
    */
   protected _addBelongsTo(slave, master, name) {
      let masters;
      let names;
      if (this._belongsTo.has(slave)) {
         masters = this._belongsTo.get(slave);
         names = this._belongsToName.get(slave);
      } else {
         masters = new Set();
         names = new Map();
         this._belongsTo.set(slave, masters);
         this._belongsToName.set(slave, names);
      }
      masters.add(master);
      names.set(master, name);
   }

   /**
    * Удаляет отношение вида belongsTo
    * @param {Object} master Главная сущность
    * @param {Object} slave Зависимая сущность
    * @protected
    */
   protected _removeBelongsTo(slave, master) {
      if (this._belongsTo.has(slave)) {
         let masters = this._belongsTo.get(slave);
         masters.delete(master);
         this._belongsToName.get(slave).delete(master);

         if (masters.size === 0) {
            this._belongsTo.delete(slave);
            this._belongsToName.delete(slave);
         }
      }
   }

   //endregion Protected methods
}

ManyToMany.prototype['[Types/_entity/relation/ManyToMany]'] = true;
ManyToMany.prototype._hasMany = null;
ManyToMany.prototype._hasManyName = null;
ManyToMany.prototype._belongsTo = null;
ManyToMany.prototype._belongsToName = null;
