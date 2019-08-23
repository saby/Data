import IVersionable from './IVersionable';
import ManyToMany from './relation/ManyToMany';

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
    readonly '[Types/_entity/VersionableMixin]': boolean;
    protected _version: number;

    /**
     * @cfg {Function} Обработчик изменения версии
     * @name Types/_entity/VersionableMixin#versionCallback
     */
    protected _$versionCallback: VersionCallback;

    // region IVersionable

    readonly '[Types/_entity/IVersionable]': boolean;

    getVersion(): number {
        return this._version;
    }

    protected _nextVersion(): void {
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

    // region ManyToManyMixin

    protected _getMediator: () => ManyToMany;

    // endregion
}

Object.assign(VersionableMixin.prototype, {
    '[Types/_entity/VersionableMixin]': true,
    '[Types/_entity/IVersionable]': true,
    _version: 0,
    _$versionCallback: null
});

// Deprecated implementation
Object.assign(VersionableMixin, VersionableMixin.prototype);
