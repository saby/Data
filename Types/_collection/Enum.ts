import IEnum, {IIndex} from './IEnum';
import Dictionary from './Dictionary';
import {
   IProducible,
   ManyToManyMixin,
   SerializableMixin,
   CloneableMixin,
   format
} from '../entity';
import {register} from '../di';
import {mixin} from '../util';

interface IProduceOptions {
    format?: format.Field | format.UniversalField;
}

/**
 * Enumerable type. It's an enumerable collection of keys and values and one of them can be selected or not.
 * @class Types/_collection/Enum
 * @extends Types/_collection/Dictionary
 * @implements Types/_collection/IEnum
 * @implements Types/_entity/IProducible
 * @mixes Types/_entity/ManyToManyMixin
 * @mixes Types/_entity/SerializableMixin
 * @mixes Types/_entity/CloneableMixin
 * @public
 * @author Мальцев А.А.
 */
export default class Enum<T> extends mixin<
    Dictionary<any>,
    ManyToManyMixin,
    SerializableMixin,
    CloneableMixin
>(
   Dictionary,
   ManyToManyMixin,
   SerializableMixin,
   CloneableMixin
) implements IEnum<T>, IProducible {
   /**
    * @cfg {Number|sting|null} Key of the selected item
    * @name Types/_collection/Enum#index
    */
   protected _$index: IIndex;

    protected _childChanged: (data: any) => void;

    constructor(options?: object) {
        super(options);
        SerializableMixin.call(this);
        this._publish('onChange');
        this._checkIndex();
    }

    destroy(): void {
        ManyToManyMixin.prototype.destroy.call(this);
        super.destroy();
    }

    // region IEnum

    readonly '[Types/_collection/IEnum]': boolean;

    get(): IIndex {
        return this._$index;
    }

    set(index: IIndex): void {
        const value = this._$dictionary[index];
        const defined = value !== undefined;
        const changed = this._$index !== index;

        if (index === null || defined) {
            this._$index = index;
            this._checkIndex();
        } else {
            throw new ReferenceError(`${this._moduleName}::set(): the index "${index}" is out of range`);
        }

        if (changed) {
            this._notifyChange(this._$index, this.getAsValue());
        }
    }

    getAsValue(localize?: boolean): T {
        return this._getValue(this._$index, localize);
    }

    setByValue(value: T, localize?: boolean): void {
        const index = this._getIndex(value, localize);
        const changed = index !== this._$index;

        if (value === null) {
            this._$index = value as null;
        } else if (index === undefined) {
            throw new ReferenceError(
                `${this._moduleName}::setByValue(): the value "${value}" doesn't found in dictionary`
            );
        } else {
            this._$index = index;
        }

        if (changed) {
            this._notifyChange(index, value);
        }
    }

    // endregion

    // region IProducible

    readonly '[Types/_entity/IProducible]': boolean;

    static produceInstance<T>(data?: any, options?: IProduceOptions): Enum<T> {
        return new this({
            dictionary: this.prototype._getDictionaryByFormat(options && options.format),
            localeDictionary: this.prototype._getLocaleDictionaryByFormat(options && options.format),
            index: data
        });
    }

    // endregion

    // region IEquatable

    isEqual(to: object): boolean {
        if (!(to instanceof Enum)) {
            return false;
        }

        if (!Dictionary.prototype.isEqual.call(this, to)) {
            return false;
        }

        return this.get() === to.get();
    }

    // endregion

    // region ObservableMixin

    protected _publish: (...events: string[]) => void;
    protected _notify: (event: string, ...args: any[]) => void;

    // endregion

    // region Public methods

    valueOf(): IIndex {
        return this.get();
    }

    toString(): string {
        const value = this.getAsValue();
        return value === undefined || value === null ? '' : String(value);
    }

    // endregion

    // region Protected methods

    /**
     * Converts key to the Number type
     * @protected
     */
    protected _checkIndex(): void {
        if (this._$index === null) {
            return;
        }
        this._$index = parseInt(String(this._$index), 10);
    }

    /**
     * Triggers a change event
     * @param {Number} index Key of selected item
     * @param {String} value Value of selected item
     * @protected
     */
    protected _notifyChange(index: IIndex, value: T): void {
        const data = {};
        data[index] = value;
        this._childChanged(data);
        this._notify('onChange', index, value);
    }

    // endregion
}

Object.assign(Enum.prototype, {
   '[Types/_collection/Enum]': true,
   '[Types/_collection/IEnum]': true,
   '[Types/_entity/IProducible]': true,
   _moduleName: 'Types/collection:Enum',
   _$index: null,
   _type: 'enum'
});

register('Types/collection:Enum', Enum, {instantiate: false});
