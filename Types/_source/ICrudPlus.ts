import { Record } from '../entity';
import { EntityKey } from './ICrud';
import { EntityMarkerCompat as EntityMarker } from '../_declarations';

/**
 * Интерфейс источника данных, поддерживающего расширенный контракт CRUD - операции merge, copy и move.
 * @interface Types/_source/ICrudPlus
 * @public
 * @author Мальцев А.А.
 */
export default interface ICrudPlus {
    readonly '[Types/_source/ICrudPlus]': EntityMarker;

    /** @typedef {String} MovePosition
     *  @variant {String} before Вставить перед целевой записью
     *  @variant {String} after Вставить после целевой записи
     *  @variant {String} on Вставить внутрь целевой записи
     */

    /** @typedef {Object} MoveMetaConfig
     * @property {MovePosition} position Определяет как позиционировать запись относительно target.
     * @property {String} parentProperty Название поля иерархии.
     */

    /**
     * Объединяет одну запись с другими
     * @param target Первичный ключ записи-приёмника
     * @param merged Первичный ключ записи-источника (или нескольких записей), при успешном объедининии записи будут удалены
     * @return Асинхронный результат выполнения: в случае успеха ничего не вернет, в случае ошибки вернет Error.
     * @example
     * Объединим статью с ключом 'article-from' со статьей с ключом 'article-to':
     * <pre>
     *     const dataSource = new CrudPlusSource({
     *         endpoint: '/articles/',
     *         keyProperty: 'code'
     *     });
     *     dataSource.merge('article-from', 'article-to').then(() => {
     *         console.log('The articles has been merged successfully');
     *     }).catch((error) => {
     *         console.error('Can\'t merge the articles', error);
     *     });
     * </pre>
     */
    merge(target: EntityKey, merged: EntityKey | EntityKey[]): Promise<void>;

    /**
     * Создает копию записи
     * @param key Первичный ключ записи
     * @param [meta] Дополнительные мета данные
     * @return Асинхронный результат выполнения: в случае успеха вернет {@link Types/_entity/Record} - скопированную запись, в случае ошибки - Error.
     * @example
     * Скопируем статью с ключом 'what-about-to-copy-me':
     * <pre>
     *     const dataSource = new CrudPlusSource({
     *         endpoint: '/articles/',
     *         keyProperty: 'code'
     *     });
     *     dataSource.copy('what-about-to-copy-me').then((copy) => {
     *         console.log('The article has been copied successfully. The new id is: ' + copy.getKey());
     *     }).catch((error) => {
     *         console.error('Can\'t copy the article', error);
     *     });
     * </pre>
     */
    copy(key: EntityKey, meta?: object): Promise<Record>;

    /**
     * Производит перемещение записи.
     * @param items Перемещаемая запись.
     * @param target Идентификатор целевой записи, относительно которой позиционируются перемещаемые.
     * @param {MoveMetaConfig} [meta] Дополнительные мета данные.
     * @return Асинхронный результат выполнения: в случае успеха ничего не вернет, в случае ошибки вернет Error.
     */
    move(items: EntityKey | EntityKey[], target: EntityKey, meta?: object): Promise<void>;
}
