import Field from '../format/Field';
import { EntityMarker } from '../../_declarations';

/**
 * Интерфейс адаптера для работы с метаданными
 * @interface Types/_entity/adapter/IMetaData
 * @public
 * @author Мальцев А.А.
 */
export default interface IMetaData {
    readonly '[Types/_entity/adapter/IMetaData]': EntityMarker;

    /**
     * Возвращает описание метаданных
     */
    getMetaDataDescriptor(): Field[];

    /**
     * Возвращает значение из метаданных по имени
     * @param name Поле метаданных
     */
    getMetaData(name: string): any;

    /**
     * Сохраняет значение в метаданных с указанным именем
     * @param name Поле метаданных
     * @param value Значение
     */
    setMetaData(name: string, value: any): void;
}
