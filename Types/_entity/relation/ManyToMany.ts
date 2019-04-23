import DestroyableMixin from '../DestroyableMixin';
import {Map, Set} from '../../shim';

/**
 * The kind of clear
 */
export enum ClearType {
   All,
   Masters,
   Slaves
}

/**
 * Check instance doesn't destroyed.
 */
function isAlive(entity: any): boolean {
   return entity instanceof Object && entity['[Types/_entity/DestroyableMixin]'] ? !entity.destroyed : true;
}

/**
 * Mediator which provides "many-to-many" relationship model.
 * @class Types/_entity/relation/ManyToMany
 * @mixes Types/_entity/DestroyableMixin
 * @author Мальцев А.А.
 */
export default class ManyToMany extends DestroyableMixin {
   /**
    * master -> [slave, slave, ...]
    */
   _hasMany: Map<object, Set<object>>;

   /**
    * master -> [name, name, ...]
    */
   _hasManyName: Map<object, Map<object, string>>;

   /**
    * slave -> [master, master, ...]
    */
   _belongsTo: Map<object, Set<object>>;

   /**
    * slave -> [name, name, ...]
    */
   _belongsToName: Map<object, Map<object, string>>;

   constructor() {
      super();
      this._hasMany = new Map();
      this._hasManyName = new Map();
      this._belongsTo = new Map();
      this._belongsToName = new Map();
   }

   destroy(): void {
      this._hasMany = null;
      this._hasManyName = null;
      this._belongsTo = null;
      this._belongsToName = null;
      super.destroy();
   }

   // region Public methods

   /**
    * Adds an relationship between two entities
    * @param master Master entity
    * @param slave Slave entity
    * @param [name] Relationship name
    */
   addRelationship(master: object, slave: object, name?: string): void {
      this._addHasMany(master, slave, name);
      this._addBelongsTo(slave, master, name);
   }

   /**
    * Removes an relationship between two entities
    * @param master Master entity
    * @param slave Slave entity
    */
   removeRelationship(master: object, slave: object): void {
      this._removeHasMany(master, slave);
      this._removeBelongsTo(slave, master);
   }

   /**
    * Removes all relationships for given entity
    * @param entity Entity
    * @param which Kind of relationships
    */
   clear(entity: object, which: ClearType = ClearType.All): void {
      if ((which === ClearType.All || which === ClearType.Slaves) && this._hasMany.has(entity)) {
         this._hasMany.get(entity).forEach((slave) => {
            this._removeBelongsTo(slave, entity);
         });
         this._hasMany.delete(entity);
         this._hasManyName.delete(entity);
      }

      if ((which === ClearType.All || which === ClearType.Masters) && this._belongsTo.has(entity)) {
         this._belongsTo.get(entity).forEach((master) => {
            this._removeHasMany(master, entity);
         });
         this._belongsTo.delete(entity);
         this._belongsToName.delete(entity);
      }
   }

   /**
    * Returns all slaves for master
    * @param master Master entity
    * @param callback Callback to pass each slave entity
    */
   hasMany(master: object, callback: Function): void {
      if (this._hasMany.has(master)) {
         const names = this._hasManyName.get(master);
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
    * Returns all masters for slave
    * @param master Slave entity
    * @param callback Callback to pass each master entity
    */
   belongsTo(slave: object, callback: Function): void {
      if (this._belongsTo.has(slave)) {
         const names = this._belongsToName.get(slave);
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

   // endregion Public methods

   // region Protected methods

   /**
    * Adds relationship with kind "hasMany"
    * @param master Master entity
    * @param slave Slave entity
    * @param name Relationship name
    * @protected
    */
   protected _addHasMany(master: object, slave: object, name: string): void {
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
    * Removes relationship with kind "hasMany"
    * @param master Master entity
    * @param slave Slave entity
    * @protected
    */
   protected _removeHasMany(master: object, slave: object): void {
      if (this._hasMany.has(master)) {
         const slaves = this._hasMany.get(master);
         slaves.delete(slave);
         this._hasManyName.get(master).delete(slave);

         if (slaves.size === 0) {
            this._hasMany.delete(master);
            this._hasManyName.delete(master);
         }
      }
   }

   /**
    * Adds relationship with kind "belongsTo"
    * @param master Master entity
    * @param slave Slave entity
    * @param name Relationship name
    * @protected
    */
   protected _addBelongsTo(slave: object, master: object, name: string): void {
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
    * Removes relationship with kind "belongsTo"
    * @param master Master entity
    * @param slave Slave entity
    * @protected
    */
   protected _removeBelongsTo(slave: object, master: object): void {
      if (this._belongsTo.has(slave)) {
         const masters = this._belongsTo.get(slave);
         masters.delete(master);
         this._belongsToName.get(slave).delete(master);

         if (masters.size === 0) {
            this._belongsTo.delete(slave);
            this._belongsToName.delete(slave);
         }
      }
   }

   // endregion Protected methods
}

ManyToMany.prototype['[Types/_entity/relation/ManyToMany]'] = true;
ManyToMany.prototype._hasMany = null;
ManyToMany.prototype._hasManyName = null;
ManyToMany.prototype._belongsTo = null;
ManyToMany.prototype._belongsToName = null;
