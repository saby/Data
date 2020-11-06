import { EntityMarker, IDeferred } from '../_declarations';
import Deferred from './Deferred';
import { skipLogExecutionTime } from '../util';

/**
 * Миксин, позволяющий загружать некоторые зависимости лениво.
 * @mixin Types/_source/LazyMixin
 * @public
 * @author Мальцев А.А.
 */
export default abstract class LazyMixin {
    readonly '[Types/_source/LazyMixin]': EntityMarker;

    /**
     * Список зависимостей, которые нужно загружать лениво
     */
    protected _additionalDependencies: string[];

    /**
     * Проверяет, что дополнительные зависимости уже загружены
     * @protected
     */
    protected _areAdditionalDependenciesLoaded(): boolean {
        return this._additionalDependencies.reduce((prev, curr) => prev && require.defined(curr), true);
    }

    /**
     * Загружает дополнительные зависимости (по возможности "синхронно")
     * @param callback Функция обратного вызова при успешной загрузке зависимостей
     * @protected
     */
    protected _loadAdditionalDependenciesSync(callback: (err?: Error) => void): void {
        if (this._areAdditionalDependenciesLoaded()) {
            callback();
        } else {
            // XXX: this case isn't covering by tests because all dependencies are always loaded in tests
            require(
                this._additionalDependencies,
                () => callback(),
                (error: Error) => callback(error)
            );
        }
    }

    /**
     * Асинхронно загружает дополнительные зависимости
     * @protected
     */
    protected _loadAdditionalDependencies<T = void>(): Promise<T> {
        if (Deferred) {
            const result = new Deferred<T>();
            try {
                this._loadAdditionalDependenciesSync((err) => {
                    if (err) {
                        result.errback(err);
                    }
                    result.callback(undefined);
                });
            } catch (err) {
                result.errback(err);
            }
            return result;
        }

        return new Promise((resolve, reject) => {
            try {
                this._loadAdditionalDependenciesSync((err) => {
                    if (err) {
                        reject(err);
                    }
                    resolve();
                });
            } catch (err) {
                reject(err);
            }
        });
    }

    /**
     * Производит загрузку дополнительных зависимостей параллельно с вызовом метода.
     * @param main Основной вызов
     * @param additional Дополнительный вызов
     * @protected
     */
    protected _withAdditionalDependencies<TResult>(
        main: Promise<TResult>,
        additional: Promise<unknown>
    ): Promise<TResult> {
        if (Deferred && main instanceof Deferred && additional instanceof Deferred) {
            return main.addCallback(skipLogExecutionTime(
                (mainResult) => additional.addCallback(
                    skipLogExecutionTime(() => mainResult)
                )
            ));
        }

        const result = Promise.all([main, additional]).then(
            ([callResult]) => callResult
        ) as Promise<TResult>;

        if (!(result as IDeferred<TResult>).cancel) {
            (result as IDeferred<TResult>).cancel = () => {
                if ((main as IDeferred<TResult>).cancel) {
                    (main as IDeferred<TResult>).cancel();
                }
            };
        }

        return result;
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
