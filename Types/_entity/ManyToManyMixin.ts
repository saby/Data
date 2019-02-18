/// <amd-module name="Types/_entity/ManyToManyMixin" />
/**
 * Миксин, позволяющий сущности строить отношения "многие ко многим"
 * @mixin Types/_entity/ManyToManyMixin
 * @public
 * @author Мальцев А.А.
 */

import ManyToMany from './relation/ManyToMany';

const ManyToManyMixin = /** @lends Types/_entity/ManyToManyMixin.prototype */{
   '[Types/_entity/ManyToManyMixin]': true,

   //FIXME: backward compatibility for check via Core/core-instance::instanceOfMixin()
   '[WS.Data/Entity/ManyToManyMixin]': true,

   /**
    * @property {Types/_entity/relation/ManyToMany} Медиатор, отвечающий за связи между сущностями
    */
   _mediator: null,

   //region Public methods

   destroy() {
      let mediator = this._getMediator();
      let slaves = [];

      mediator.hasMany(this, (slave) => {
         slaves.push(slave);
      });

      mediator.clear(this);

      let slave;
      for (let i = 0, count = slaves.length; i < count; i++) {
         slave = slaves[i];
         if (slave.destroy && !slave.destroyed) {
            slave.destroy();
         }
      }

      this._setMediator(null);
   },

   //endregion Public methods

   //region Protected methods

   /**
    * Добавляет отношение с другой сущностью
    * @param {Types/_entity/relation/IReceiver} child Другая сущность
    * @param {String} [name] Название отношения
    * @protected
    */
   _addChild(child, name) {
      if (child instanceof Object) {
         let mediator = this._getMediator();
         mediator.addRelationship(this, child, name);


         if (child['[Types/_entity/ManyToManyMixin]'] &&
            !child._hasSameMediator(mediator)
         ) {
            if (!child._hasMediator()) {
               child._setMediator(this._createMediator());
            }
            child._getMediator().addRelationship(this, child, name);
         }
      }
   },

   /**
    * Удаляет отношение с другой сущностью
    * @param {Types/_entity/relation/IReceiver} child Другая сущность
    * @protected
    */
   _removeChild(child) {
      if (child instanceof Object) {
         let mediator = this._getMediator();
         mediator.removeRelationship(this, child);

         if (child['[Types/_entity/ManyToManyMixin]'] &&
            child._hasMediator() &&
            !child._hasSameMediator(mediator)
         ) {
            child._getMediator().removeRelationship(this, child);
         }
      }
   },

   /**
    * Уведомляет дочерние сущности об изменении родительской
    * @param {*} [data] Данные об изменениях
    * @protected
    */
   _parentChanged(data) {
      let which = {
         target: this,
         data: data,
         original: data
      };
      this._getMediator().hasMany(this, (slave, name) => {
         if (slave['[Types/_entity/relation/IReceiver]']) {
            slave.relationChanged(which, [name]);
         }
      });
   },

   /**
    * Рекурсивно уведомляет родительские сущности об изменении дочерней
    * @param {*} [data] Данные об изменениях
    * @protected
    */
   _childChanged(data) {
      let original = data;
      let notifyParent = (mediator, child, route) => {
         mediator.belongsTo(child, (parent, name) => {
            let childRoute = route.slice(),
               which = {
                  target: child,
                  data: data,
                  original: original
               },
               parentWhich;

            childRoute.unshift(name);
            if (parent['[Types/_entity/relation/IReceiver]']) {
               parentWhich = parent.relationChanged(which, childRoute);

               //Replace data with parent's data
               if (parentWhich !== undefined) {
                  data = parentWhich.data;
               }
            }

            notifyParent(parent._getMediator(), parent, childRoute);
         });
      };

      notifyParent(this._getMediator(), this, []);
   },

   /**
    * Возвращает признак наличия посредника
    * @return {Boolean}
    * @protected
    */
   _hasMediator() {
      return !!this._mediator;
   },

   /**
    * Возвращает признак наличия одинакового посредника
    * @param {Types/_entity/relation/ManyToMany} mediator
    * @return {Boolean}
    * @protected
    */
   _hasSameMediator(mediator) {
      return this._mediator === mediator;
   },

   /**
    * Создает посредника для установления отношений с детьми
    * @return {Types/_entity/relation/ManyToMany}
    * @protected
    */
   _createMediator() {
      return new ManyToMany();
   },

   /**
    * Возвращает посредника для установления отношений с детьми
    * @return {Types/_entity/relation/ManyToMany}
    * @protected
    */
   _getMediator() {
      return this._mediator || (this._mediator = this._createMediator());
   },

   /**
    * Устанавливает посредника для установления отношений с детьми
    * @param {Types/_entity/relation/ManyToMany|null} mediator
    * @protected
    */
   _setMediator(mediator) {
      this._mediator = mediator;
   }

   //endregion Protected methods
};

export default ManyToManyMixin;
