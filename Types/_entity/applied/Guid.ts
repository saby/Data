/**
 * Тип GUID.
 * @class Types/_entity/applied/Guid
 * @public
 * @author Кудрявцев И.С.
 */

/*
 * Guid type
 * @class Types/_entity/applied/Guid
 * @public
 * @author Кудрявцев И.С.
 */
export default class Guid {
    /**
     * Возвращает строку, заполненную случайными числами, которая выглядит, как GUID.
     * @example
     * <pre>
     * import {applied} from 'Types/entity';
     *
     * const guid = applied.Guid.create();
     * </pre>
     */

    /*
     * Returns a string filled with random numbers which looks like GUID
     */
    static create(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            // tslint:disable-next-line:no-bitwise
            const r = Math.random() * 16 | 0;
            // tslint:disable-next-line:no-bitwise
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}
