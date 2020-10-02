import IEnumerable from './IEnumerable';
import { EnumeratorCallback } from './IEnumerable';
import IEnumerator from './IEnumerator';
import { IIndex } from './IEnum';
import ArrayEnumerator from './enumerator/Arraywise';
import Objectwise from './enumerator/Objectwise';
import {
    IEquatable,
    DestroyableMixin,
    OptionsToPropertyMixin,
    ObservableMixin,
    format
} from '../entity';
import { mixin } from '../util';
import { IHashMap, EntityMarker } from '../_declarations';

type DictionaryValues<T> = T[] | IHashMap<T>;

/**
 * Абстрактная сущность, в которой словарь представляет собой набор ключей и значений.
 * @class Types/_collection/Dictionary
 * @implements Types/_collection/IEnumerable
 * @implements Types/_entity/IEquatable
 * @mixes Types/_entity/OptionsMixin
 * @mixes Types/_entity/ObservableMixin
 * @public
 * @author Мальцев А.А.
 * @remark
 * Это абстрактный класс, и у него не может быть экземпляров.
 */

/*
 * An abstract enity which have the dictionary as collection of keys and values.
 * It's an abstract class and it's can't have instances.
 * @class Types/_collection/Dictionary
 * @implements Types/_collection/IEnumerable
 * @implements Types/_entity/IEquatable
 * @mixes Types/_entity/OptionsMixin
 * @mixes Types/_entity/ObservableMixin
 * @public
 * @author Мальцев А.А.
 */
export default abstract class Dictionary<T> extends mixin<
    DestroyableMixin,
    OptionsToPropertyMixin,
    ObservableMixin
>(
    DestroyableMixin,
    OptionsToPropertyMixin,
    ObservableMixin
) implements IEnumerable<T>, IEquatable {
    /**
     * @cfg Коллекция ключей и значений.
     * @name Types/_collection/Dictionary#dictionary
     */

    /*
     * @cfg Collection of keys and values
     * @name Types/_collection/Dictionary#dictionary
     */
    protected _$dictionary: DictionaryValues<T>;

    /**
     * @cfg Локализованная коллекция ключей и значений.
     * @name Types/_collection/Dictionary#localeDictionary
     */

    /*
     * @cfg Localized collection of keys and values
     * @name Types/_collection/Dictionary#localeDictionary
     */
    protected _$localeDictionary: DictionaryValues<T>;

    /**
     * Название конкретного типа, который использовался при сериализации. Должен быть переопределен.
     */

    /*
     * Name of the concrete type which used during the serialization. Should be overrided.
     */
    protected _type: string;

    constructor(options?: object) {
        super();
        OptionsToPropertyMixin.call(this, options);
        ObservableMixin.call(this, options);
        this._$dictionary = this._$dictionary || [];
    }

    destroy(): void {
        ObservableMixin.prototype.destroy.call(this);
        super.destroy();
    }

    // region IEnumerable

    readonly '[Types/_collection/IEnumerable]': EntityMarker;

    getEnumerator(localize?: boolean): IEnumerator<T> {
        const dictionary = localize && this._$localeDictionary ? this._$localeDictionary : this._$dictionary;
        const enumerator = dictionary instanceof Array
            ? new ArrayEnumerator<T>(dictionary)
            : new Objectwise<T>(dictionary);

        enumerator.setFilter((item: any, index: any): boolean => {
            return index !== 'null';
        });

        return enumerator;
    }

    each(callback: EnumeratorCallback<T>, context?: object, localize?: boolean): void {
        context = context || this;
        const enumerator = this.getEnumerator(localize);
        while (enumerator.moveNext()) {
            callback.call(
                context,
                enumerator.getCurrent(),
                enumerator.getCurrentIndex()
            );
        }
    }

    // endregion

    // region IEquatable

    readonly '[Types/_entity/IEquatable]': EntityMarker;

    isEqual(to: any): boolean {
        if (!(to instanceof Dictionary)) {
            return false;
        }

        const enumerator = this.getEnumerator();
        const toEnumerator = to.getEnumerator();
        let item;
        let hasItem;
        let toItem;
        let hasToItem;

        do {
            hasItem = enumerator.moveNext();
            hasToItem = toEnumerator.moveNext();
            item = hasItem ? enumerator.getCurrent() : undefined;
            toItem = hasToItem ? toEnumerator.getCurrent() : undefined;
            if (item !== toItem) {
                return false;
            }
            if (enumerator.getCurrentIndex() !== toEnumerator.getCurrentIndex()) {
                return false;
            }
        } while (hasItem || hasToItem);

        return true;
    }

    // endregion

    // region Public methods

    /**
     * Возвращает коллекцию ключей и значений.
     * @param [localize=false] Should return localized version
     * @protected
     */

    /*
     * Returns collection of keys and values
     * @param [localize=false] Should return localized version
     * @protected
     */
    getDictionary(localize?: boolean): DictionaryValues<T> {
        const dictionary = localize && this._$localeDictionary ? this._$localeDictionary : this._$dictionary;
        return dictionary
            ? (Array.isArray(dictionary) ? dictionary.slice() : {...dictionary})
            : dictionary;
    }

    // endregion

    // region Protected methods

    /**
     * Возвращает ключ значения в словаре.
     * @param name Значение для поиска.
     * @param [localize=false] Является ли локализованным значение.
     * @protected
     */

    /*
     * Returns key of the value in dictionary
     * @param name Value for lookup
     * @param [localize=false] Is the localized value
     * @protected
     */
    protected _getIndex(name: T, localize?: boolean): IIndex {
        const enumerator = this.getEnumerator(localize);
        while (enumerator.moveNext()) {
            if (enumerator.getCurrent() === name) {
                return enumerator.getCurrentIndex();
            }
        }
        return undefined;
    }

    /**
     * Возвращает значение ключа в словаре.
     * @param index Ключ для поиска.
     * @param [localize=false] Должен вернуть локализованное значение.
     * @protected
     */

    /*
     * Returns value of the key in dictionary
     * @param index Key for lookup
     * @param [localize=false] Should return the localized value
     * @protected
     */
    protected _getValue(index: IIndex, localize?: boolean): any {
        return localize && this._$localeDictionary ? this._$localeDictionary[index] : this._$dictionary[index];
    }

    /**
     * Извлекает словарь из формата поля.
     * @param format Формат поля.
     * @protected
     */

    /*
     * Extracts dictionary from the field format.
     * @param format Field format
     * @protected
     */
    protected _getDictionaryByFormat(format: format.Field | format.UniversalField): any[] | IHashMap<any> {
        if (!format) {
            return [];
        }
        return (
            (format as format.DictionaryField).getDictionary
                ? (format as format.DictionaryField).getDictionary()
                : (format as format.UniversalField).meta &&
                    ((format as format.UniversalField).meta as format.IUniversalFieldDictionaryMeta).dictionary
        ) || [];
    }

    /**
     * Извлекает словарь из формата поля.
     * @param format Формат поля.
     * @protected
     */

    /*
     * Extracts dictionary from the field format.
     * @param format Field format
     * @protected
     */
    protected _getLocaleDictionaryByFormat(format: format.Field | format.UniversalField): any[] | IHashMap<any> {
        if (!format) {
            return;
        }
        return (
            (format as format.DictionaryField).getLocaleDictionary
                ? (format as format.DictionaryField).getLocaleDictionary()
                : (format as format.UniversalField).meta
                    && ((format as format.UniversalField).meta as format.IUniversalFieldDictionaryMeta).localeDictionary
        ) || undefined;
    }

    // endregion
}

Object.assign(Dictionary.prototype, {
    '[Types/_collection/Dictionary]': true,
    '[Types/_collection/IEnumerable]': true,
    '[Types/_entity/IEquatable]': true,
    _$dictionary: undefined,
    _$localeDictionary: undefined,
    _type: undefined
});
