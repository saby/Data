import Deferred = require('Core/Deferred');

// tslint:disable-next-line:ban-comma-operator
const global = (0, eval)('this');
const DeferredCanceledError = global.DeferredCanceledError;

/**
 * Миксин, позволяющий загружать некоторые зависимости лениво.
 * @mixin Types/_source/LazyMixin
 * @public
 * @author Мальцев А.А.
 */
export default abstract class LazyMixin {
    readonly '[Types/_source/LazyMixin]': boolean;

    /**
     * Список зависимостей, которые нужно загружать лениво
     */
    protected _additionalDependencies: string[];

    /**
     * Загружает дополнительные зависимости
     * @param [callback] Функция обратного вызова при успешной загрузке зависимостей
     * @protected
     */
    // tslint:disable-next-line:ban-types
    protected _loadAdditionalDependencies(callback?: (ready: Deferred<any>) => void): Deferred<any> {
        const deps = this._additionalDependencies;
        const depsLoaded = deps.reduce((prev, curr) => prev && require.defined(curr), true);
        const result = new Deferred();

        if (depsLoaded) {
            if (callback) {
                callback.call(this, result);
            } else {
                result.callback();
            }
        } else {
            // XXX: this case isn't covering by tests because all dependencies are always loaded in tests
            require(deps, () => {
                // Don't call callback() if deferred has been cancelled during require
                if (
                    callback &&
                    (!result.isReady() || !(result.getResult() instanceof DeferredCanceledError))
                ) {
                    callback.call(this, result);
                } else {
                    result.callback();
                }
            }, (error: Error) => result.errback(error));
        }

        return result;
    }

    /**
     * Связывает два деферреда, назначая результат работы ведущего результом ведомого.
     * @param master Ведущий
     * @param slave Ведомый
     * @protected
     */
    // tslint:disable-next-line:ban-types
    protected _connectAdditionalDependencies(master: Deferred<any>, slave: Deferred<any>): void {
        // Cancel master on slave cancelling
        if (!slave.isCallbacksLocked()) {
            slave.addErrback((err) => {
                if (err instanceof DeferredCanceledError) {
                    master.cancel();
                }
                return err;
            });
        }

        // Connect master's result with slave's result
        master.addCallbacks((result) => {
            slave.callback(result);
            return result;
        }, (err) => {
            slave.errback(err);
            return err;
        });
    }
}

Object.assign(LazyMixin.prototype, {
    '[Types/_source/LazyMixin]': true,
    _additionalDependencies: [
        'Types/source',
        'Types/entity',
        'Types/collection'
    ]
});
