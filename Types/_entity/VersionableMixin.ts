import IVersionable from './IVersionable';
import ManyToMany from './relation/ManyToMany';
import { EntityMarker } from '../_declarations';

export type VersionCallback = (version: number) => void;

export interface IOptions {
    versionCallback?: VersionCallback;
}

/**
 * Миксин, позволяющий получать и изменять номер версии объекта.
 * @remark
 * Для активации опции {@link versionCallback} требуется подмешать {@link Types/_entity/OptionsToPropertyMixin}.
 * @mixin Types/_entity/VersionableMixin
 * @implements Types/_entity/IVersionable
 * @public
 * @author Мальцев А.А.
 */
export default abstract class VersionableMixin implements IVersionable {
    readonly '[Types/_entity/VersionableMixin]': EntityMarker;

    // Номер версии объекта
    protected _version: number;

    // Номер зафиксированной версии
    protected _lockedVersion: number;

    // Возвращает признак, что версия объекта зафиксирована (не будет меняться до момента снятия фиксации)
    get versionLocked(): boolean {
        return this._lockedVersion !== undefined;
    }

    /**
     * @cfg {Function} Обработчик изменения версии
     * @name Types/_entity/VersionableMixin#versionCallback
     */
    protected _$versionCallback: VersionCallback;

    // region ManyToManyMixin

    protected _getMediator: () => ManyToMany;

    // endregion

    // region IVersionable

    readonly '[Types/_entity/IVersionable]': EntityMarker;

    getVersion(): number {
        return this._version;
    }

    // endregion

    // Фиксирует версию объекта
    lockVersion(): void {
        if (this._lockedVersion !== undefined) {
            throw new Error('Can\'t lock version because it\'s already locked');
        }
        this._lockedVersion = this._version;
    }

    // Снимает фиксацию версии объекта
    unlockVersion(silent: boolean = false): void {
        if (this._lockedVersion === undefined) {
            throw new Error('Can\'t unlock version because it\'s not locked yet');
        }
        if (!silent) {
            this._version = this._lockedVersion;
        }
        this._lockedVersion = undefined;
    }

    protected _nextVersion(): void {
        if (this._lockedVersion !== undefined) {
            this._lockedVersion++;
            return;
        }

        this._version++;
        if (this._$versionCallback) {
            this._$versionCallback(this._version);
        }

        if (this['[Types/_entity/ManyToManyMixin]']) {
            this._getMediator().belongsTo(this, (parent) => {
                if (parent && parent['[Types/_entity/IVersionable]']) {
                    parent._nextVersion();
                }
            });
        }
    }

    // endregion
}

Object.assign(VersionableMixin.prototype, {
    '[Types/_entity/VersionableMixin]': true,
    '[Types/_entity/IVersionable]': true,
    _version: 0,
    _lockedVersion: undefined,
    _$versionCallback: null
});

// Deprecated implementation
Object.assign(VersionableMixin, VersionableMixin.prototype);
