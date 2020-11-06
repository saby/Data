/**
 * Hides an async callback in call logs
 * @param callback Callback to hide
 */
export default function skipLogExecutionTime<T = Function>(callback: T): T {
    if (!requirejs.defined('Core/Deferred')) {
        return callback;
    }

    const Deferred = requirejs('Core/Deferred');
    return Deferred.skipLogExecutionTime(callback);
}
