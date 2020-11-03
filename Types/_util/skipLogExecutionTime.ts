/**
 * Hides an async callback in call logs
 * @param callback Callback to hide
 */
export default function skipLogExecutionTime<T = Function>(callback: T): T {
    if (!require.defined('Core/Deferred')) {
        return callback;
    }

    const Deferred = require('Core/Deferred');
    return Deferred.skipLogExecutionTime(callback);
}
