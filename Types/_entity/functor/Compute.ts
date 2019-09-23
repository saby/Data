export interface IFunctor {
    readonly functor: Function;
    readonly properties: string[];
}

/**
 * Функтор, хранящий информацию о свойствах, от значения которых зависит результат вычислений.
 * Создадим и выполним функтор, вычисляющий 20% налог на заказ в магазине:
 * <pre>
 *     requirejs(['Types/entity'], function(entity) {
 *         var getTax = new entity.functor.Compute(function(totals, percent) {
 *                 return totals.amount * percent / 100;
 *             }, ['amount']),
 *             tax;
 *
 *         tax = getTax({
 *             count: 5,
 *             amount: 250
 *         }, 20);
 *         console.log(tax);//50
 *         console.log(getTax.properties);//['amount']
 *     });
 * </pre>
 * @class Types/_entity/functor/Compute
 * @public
 * @author Мальцев А.А.
 */
class Compute implements IFunctor {
   readonly functor: Function;
   readonly properties: string[];

    /**
     * Конструктор функтора.
     * @param fn Функция, производящая вычисления
     * @param properties Свойства, от которых зависит результат вычисления
     */
    constructor(fn: Function, properties?: string[]) {
        properties = properties || [];
        if (!(fn instanceof Function)) {
            throw new TypeError('Argument "fn" be an instance of Function');
        }
        if (!(properties instanceof Array)) {
            throw new TypeError('Argument "properties" be an instance of Array');
        }

        Object.defineProperty(fn, 'functor', {
            get(): Function {
                return Compute;
            }
        });
        Object.defineProperty(fn, 'properties', {
            get(): string[] {
                return properties;
            }
        });

        return fn as any;
    }

    static isFunctor(fn: any): boolean {
        return fn && fn.functor === Compute;
    }
}

interface ICompute<T extends Function = Function> {
    readonly prototype: Compute;
    isFunctor: (fn: any) => boolean;
    new<T>(fn: T, properties?: string[]): T;
}

export default Compute as ICompute;
