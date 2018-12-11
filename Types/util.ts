/// <amd-module name="Types/util" />
/**
 * Библиотека утилит.
 * @library Types/util
 * @includes object Types/_util/object
 * @includes logger Types/_util/logger
 * @includes mixin Types/_util/mixin
 * @includes protect Types/_util/protect
 * @public
 * @author Мальцев А.А.
 */

export {default as logger} from './_util/logger';
export {default as object} from './_util/object';
export {mixin, applyMixins} from './_util/mixin';
export {default as protect} from './_util/protect';
