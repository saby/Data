import ManyToMany from './relation/ManyToMany';
import IReceiver from './relation/IReceiver';

/**
 * Миксин, позволяющий сущности строить отношения "многие ко многим"
 * @mixin Types/_entity/ManyToManyMixin
 * @public
 * @author Мальцев А.А.
 */
export default abstract class ManyToManyMixin {
    '[Types/_entity/ManyToManyMixin]': boolean;

    /**
     * Медиатор, отвечающий за связи между сущностями
     */
    _mediator: ManyToMany;

    // region Public methods

    // This method calls implicitly when mixing in a row with DestroyableMixin
    destroy(...args: unknown[]): void {
        const mediator = this._getMediator();
        const slaves = [];

        mediator.hasMany(this, (slave) => {
            slaves.push(slave);
        });

        mediator.clear(this);

        let slave;
        for (let i = 0, count = slaves.length; i < count; i++) {
            slave = slaves[i];
            if (slave['[Types/_entity/DestroyableMixin]'] && !slave.destroyed) {
                slave.destroy();
            }
        }

        this._setMediator(null);
    }

    // endregion

    // region Protected methods

    /**
     * Добавляет отношение с другой сущностью
     * @param child Другая сущность
     * @param [name] Название отношения
     * @protected
     */
    protected _addChild(child: IReceiver | any, name?: string): void {
        if (child instanceof Object) {
            const mediator = this._getMediator();
            mediator.addRelationship(this, child, name);

            if (child['[Types/_entity/ManyToManyMixin]'] &&
                !(child)._hasSameMediator(mediator)
            ) {
                if (!child._hasMediator()) {
                    child._setMediator(this._createMediator());
                }
                child._getMediator().addRelationship(this, child, name);
            }
        }
    }

    /**
     * Удаляет отношение с другой сущностью
     * @param child Другая сущность
     * @protected
     */
    protected _removeChild(child: IReceiver | any): void {
        if (child instanceof Object) {
            const mediator = this._getMediator();
            mediator.removeRelationship(this, child);

            if (child['[Types/_entity/ManyToManyMixin]'] &&
                child._hasMediator() &&
                !child._hasSameMediator(mediator)
            ) {
                child._getMediator().removeRelationship(this, child);
            }
        }
    }

    /**
     * Уведомляет дочерние сущности об изменении родительской
     * @param data Данные об изменениях
     * @protected
     */
    protected _parentChanged(data: any): void {
        const which = {
            target: this,
            data,
            original: data
        };
        this._getMediator().hasMany(this, (slave, name) => {
            if (slave['[Types/_entity/relation/IReceiver]']) {
                slave.relationChanged(which, [name]);
            }
        });
    }

    /**
     * Рекурсивно уведомляет родительские сущности об изменении дочерней
     * @param [data] Данные об изменениях
     * @protected
     */
    protected _childChanged(data?: any): void {
        const original = data;
        const notifyParent = (mediator, child, route) => {
            mediator.belongsTo(child, (parent, name) => {
                const childRoute = route.slice();
                const which = {
                    target: child,
                    data,
                    original
                };
                let parentWhich;

                childRoute.unshift(name);
                if (parent['[Types/_entity/relation/IReceiver]']) {
                    parentWhich = parent.relationChanged(which, childRoute);

                    // Replace data with parent's data
                    if (parentWhich !== undefined) {
                        data = parentWhich.data;
                    }
                }

                notifyParent(parent._getMediator(), parent, childRoute);
            });
        };

        notifyParent(this._getMediator(), this, []);
    }

    /**
     * Возвращает признак наличия посредника
     * @protected
     */
    protected _hasMediator(): boolean {
        return !!this._mediator;
    }

    /**
     * Возвращает признак наличия одинакового посредника
     * @protected
     */
    protected _hasSameMediator(mediator: ManyToMany): boolean {
        return this._mediator === mediator;
    }

    /**
     * Создает посредника для установления отношений с детьми
     * @protected
     */
    protected _createMediator(): ManyToMany {
        return new ManyToMany();
    }

    /**
     * Возвращает посредника для установления отношений с детьми
     * @protected
     */
    protected _getMediator(): ManyToMany {
        return this._mediator || (this._mediator = this._createMediator());
    }

    /**
     * Устанавливает посредника для установления отношений с детьми
     * @protected
     */
    protected _setMediator(mediator: ManyToMany): void {
        this._mediator = mediator;
    }

    // endregion
}

Object.assign(ManyToManyMixin.prototype, {
    '[Types/_entity/ManyToManyMixin]': true,
    _mediator: null
});
