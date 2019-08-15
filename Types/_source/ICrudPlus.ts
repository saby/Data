import {Record} from '../entity';
import {ExtendPromise} from '../_declarations';

/**
 * Интерфейс источника данных, поддерживающего расширенный контракт CRUD - операции merge, copy и move.
 * @interface Types/_source/ICrudPlus
 * @public
 * @author Мальцев А.А.
 */
export default interface ICrudPlus {
   readonly '[Types/_source/ICrudPlus]': boolean;

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
    * Объединяет одну запись с другой
    * @param from Первичный ключ записи-источника (при успешном объедининии запись будет удалена)
    * @param to Первичный ключ записи-приёмника
    * @return Асинхронный результат выполнения: в случае успеха ничего не вернет, в случае ошибки вернет Error.
    * @example
    * Объединим статью с ключом 'article-from' со статьей с ключом 'article-to':
    * <pre>
    *    var dataSource = new CrudPlusSource({
    *       endpoint: '/articles/',
    *       keyProperty: 'code'
    *    });
    *    dataSource.merge('article-from', 'article-to').addCallbacks(function() {
    *       console.log('The articles has been merged successfully');
    *    }, function(error) {
    *       console.error('Can\'t merge the articles', error);
    *    });
    * </pre>
    */
   merge(from: string | number, to: string | number): ExtendPromise<null>;

   /**
    * Создает копию записи
    * @param key Первичный ключ записи
    * @param [meta] Дополнительные мета данные
    * @return Асинхронный результат выполнения: в случае успеха вернет {@link Types/_entity/Record} - скопированную запись, в случае ошибки - Error.
    * @example
    * Скопируем статью с ключом 'what-about-to-copy-me':
    * <pre>
    *    var dataSource = new CrudPlusSource({
    *       endpoint: '/articles/',
    *       keyProperty: 'code'
    *    });
    *    dataSource.copy('what-about-to-copy-me').addCallbacks(function(copy) {
    *       console.log('The article has been copied successfully. The new id is: ' + copy.getId());
    *    }, function(error) {
    *       console.error('Can\'t copy the article', error);
    *    });
    * </pre>
    */
   copy(key: string | number, meta?: object): ExtendPromise<Record>;

   /**
    * Производит перемещение записи.
    * @param items Перемещаемая запись.
    * @param target Идентификатор целевой записи, относительно которой позиционируются перемещаемые.
    * @param {MoveMetaConfig} [meta] Дополнительные мета данные.
    * @return Асинхронный результат выполнения: в случае успеха ничего не вернет, в случае ошибки вернет Error.
    */
   move(items: Array<string | number>, target: string | number, meta?: object): ExtendPromise<null>;
}
