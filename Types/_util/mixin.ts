/**
 * Inherits static class members
 */
function inheritStatic<T>(Base: T, Sub: Function): void {
    // Don't inherit from plain object
    if ((Base as any) === Object) {
        return;
    }

    Object.getOwnPropertyNames(Base).forEach((key) => {
        switch (key) {
            case 'arguments':
            case 'caller':
            case 'length':
            case 'name':
            case 'prototype':
                // Skip some valuable keys of type Function
                break;
            default:
                if (!Sub.hasOwnProperty(key)) {
                    Object.defineProperty(Sub, key, Object.getOwnPropertyDescriptor(Base, key));
                }
        }
    });
}

/**
 * Puts mixins into given class
 */
export function applyMixins(Sub: Function, ...mixins: Function[]): void {
    // FIXME: to fix behaviour of Core/core-instance::instanceOfMixin()
    if (mixins.length && !Sub.prototype._mixins) {
        Sub.prototype._mixins = [];
    }

    mixins.forEach((mixin: Function) => {
        const isClass = typeof mixin === 'function';
        const proto = isClass ? (mixin as any).prototype : mixin;

        if (isClass) {
            inheritStatic(mixin as any, Sub);
        }

        const inject = (name) => {
            Object.defineProperty(Sub.prototype, name, Object.getOwnPropertyDescriptor(proto, name));
        };

        Object.getOwnPropertyNames(proto).forEach(inject);
        if (Object.getOwnPropertySymbols) {
            Object.getOwnPropertySymbols(proto).forEach(inject);
        }
    });
}

type MixinConstructor1<M1> = new (...args: any[]) => M1;
type MixinConstructor2<M1, M2> = new (...args: any[]) => M1 & M2;
type MixinConstructor3<M1, M2, M3> = new (...args: any[]) => M1 & M2 & M3;
type MixinConstructor4<M1, M2, M3, M4> = new (...args: any[]) => M1 & M2 & M3 & M4;
type MixinConstructor5<M1, M2, M3, M4, M5> = new (...args: any[]) => M1 & M2 & M3 & M4 & M5;
type MixinConstructor6<M1, M2, M3, M4, M5, M6> = new (...args: any[]) => M1 & M2 & M3 & M4 & M5 & M6;
type MixinConstructor7<M1, M2, M3, M4, M5, M6, M7> = new (...args: any[]) => M1 & M2 & M3 & M4 & M5 & M6 & M7;
type MixinConstructor8<
    M1, M2, M3, M4, M5, M6, M7, M8
> = new (...args: any[]) => M1 & M2 & M3 & M4 & M5 & M6 & M7 & M8;
type MixinConstructor9<
    M1, M2, M3, M4, M5, M6, M7, M8, M9
> = new (...args: any[]) => M1 & M2 & M3 & M4 & M5 & M6 & M7 & M8 & M9;

export function mixin<M1>(...mixins: Function[]): MixinConstructor1<M1>;
export function mixin<M1, M2>(...mixins: Function[]): MixinConstructor2<M1, M2>;
export function mixin<M1, M2, M3>(...mixins: Function[]): MixinConstructor3<M1, M2, M3>;
export function mixin<M1, M2, M3, M4>(...mixins: Function[]): MixinConstructor4<M1, M2, M3, M4>;
export function mixin<M1, M2, M3, M4, M5>(...mixins: Function[]): MixinConstructor5<M1, M2, M3, M4, M5>;
export function mixin<M1, M2, M3, M4, M5, M6>(...mixins: Function[]): MixinConstructor6<M1, M2, M3, M4, M5, M6>;
export function mixin<M1, M2, M3, M4, M5, M6, M7>(...mixins: Function[]): MixinConstructor7<M1, M2, M3, M4, M5, M6, M7>;
export function mixin<
    M1, M2, M3, M4, M5, M6, M7, M8
>(...mixins: Function[]): MixinConstructor8<M1, M2, M3, M4, M5, M6, M7, M8>;
export function mixin<
    M1, M2, M3, M4, M5, M6, M7, M8, M9
>(...mixins: Function[]): MixinConstructor9<M1, M2, M3, M4, M5, M6, M7, M8, M9>;

/**
 * Creates a subclass with given mixins
 */
export function mixin(Base: Function, ...mixins: Function[]): Function {
    class Sub extends (Base as any)  {
        constructor(...args: any[]) {
            if (Base !== Object) {
                super(...args);
            }
        }
    }

    inheritStatic(Base, Sub);
    applyMixins(Sub, ...mixins);

    return Sub;
}
