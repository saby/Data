import Abstract from './Abstract';

export interface ITrack {
    readonly propertyName: string;
}

/**
 * Функтор, который указывает на отслеживание и содержит имя свойства, которое сохраняет значение отслеживания.
 * @example
 * Определим функтор, который указывает на значение отслеживания, связанное со свойством '_foo':
 * <pre>
 *     import {functor} from 'Types/entity';
 *
 *     const storage = {foo: null};
 *     const setFoo = functor.Track.create(
 *         (value) => {storage.foo = value},
 *         'foo'
 *     );
 *
 *     setFoo('bar');
 *     console.log(storage[setFoo.propertyName]); // 'bar'
 * </pre>
 * @class Types/_entity/functor/Track
 * @public
 * @author Мальцев А.А.
 */

/*
 * A functor that points at tracking and holds property name which saves tracking value.
 * @example
 * Let's define a functor which points at tracking value related to '_foo' property:
 * <pre>
 *     import {functor} from 'Types/entity';
 *
 *     const storage = {foo: null};
 *     const setFoo = functor.Track.create(
 *         (value) => {storage.foo = value},
 *         'foo'
 *     );
 *
 *     setFoo('bar');
 *     console.log(storage[setFoo.propertyName]); // 'bar'
 * </pre>
 * @class Types/_entity/functor/Track
 * @public
 * @author Мальцев А.А.
 */
export default class Track<T> extends Abstract<T> implements ITrack {
    readonly propertyName: string;

    /**
     * Создает функтор.
     * @param fn Функция для вызова.
     * @param [propertyName] Имя объекта отслеживания.
     */

    /*
     * Creates the functor.
     * @param fn Function to call
     * @param [propertyName] Property name to track
     */
    static create<T = Function>(fn: T, propertyName?: string): T & ITrack {
        const result = Abstract.create.call(this, fn);

        Object.defineProperty(result, 'propertyName', {
            get(): string {
                return propertyName;
            }
        });

        return result;
    }
}
