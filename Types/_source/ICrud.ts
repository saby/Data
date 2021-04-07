import Query from './Query';
import DataSet from './DataSet';
import { Record } from '../entity';
import { RecordSet } from '../collection';
import { EntityMarkerCompat as EntityMarker } from '../_declarations';

export type EntityKey = number | string;

/**
 * Интерфейс источника данных, поддерживающиего контракт {@link https://en.wikipedia.org/wiki/Create,_read,_update_and_delete CRUD}, применяемый к объекту предметной области.
 * @remark
 * Создадим новую статью:
 * <pre>
 *     const dataSource = new CrudSource();
 *     dataSource.create().then((article) => {
 *         console.log(article.getKey());
 *     }).catch(console.error);
 * </pre>
 * Прочитаем статью:
 * <pre>
 *     const dataSource = new CrudSource();
 *     dataSource.read('article-1').then((article) => {
 *         console.log(article.get('title'));
 *     }).catch(console.error);
 * </pre>
 * Сохраним статью:
 * <pre>
 *     const dataSource = new CrudSource();
 *     const article = new Record({
 *         rawData: {
 *             id: 'article-1',
 *             title: 'Article 1'
 *         }
 *     });
 *
 *     dataSource.update(article).then(() => {
 *         console.log('Article updated!');
 *     }).catch(console.error);
 * </pre>
 * Удалим статью:
 * <pre>
 *     const dataSource = new CrudSource();
 *     dataSource.destroy('article-1').then((article) => {
 *         console.log('Article deleted!');
 *     }).catch(console.error);
 * </pre>
 * @interface Types/_source/ICrud
 * @public
 * @author Кудрявцев И.С.
 */
export default interface ICrud {
    readonly '[Types/_source/ICrud]': EntityMarker;

    /**
     * Создает пустую запись через источник данных (при этом она не сохраняется в хранилище)
     * @param [meta] Дополнительные мета данные, которые могут понадобиться для создания записи
     * @return Асинхронный результат выполнения: в случае успеха вернет {@link Types/_entity/Record} - созданную запись, в случае ошибки - Error.
     * @see Types/_entity/Record
     * @example
     * Создадим новую статью:
     * <pre>
     *     const dataSource = new CrudSource({
     *         endpoint: '/articles/',
     *         keyProperty: 'id'
     *     });
     *     dataSource.create().then((article) => {
     *         console.log(article.get('id')), // 01c5151e-21fe-5316-d118-cb13216c9412
     *         console.log(article.get('title')); // Untitled
     *     }).catch((error) => {
     *         console.error('Can\'t create an article', error);
     *     });
     * </pre>
     * Создадим нового сотрудника:
     * <pre>
     *      const dataSource = new SbisService({
     *          endpoint: 'Employee',
     *          keyProperty: '@Employee'
     *      });
     *      dataSource.create().then((employee) => {
     *          console.log(employee.get('Name'));
     *      }).catch((error) => {
     *          console.error('Can\'t create an employee', error);
     *     });
     * </pre>
     */
    create(meta?: object): Promise<Record>;

    /**
     * Читает запись из источника данных
     * @param key Первичный ключ записи
     * @param [meta] Дополнительные мета данные
     * @return Асинхронный результат выполнения: в случае успеха вернет {@link Types/_entity/Record} - прочитанную запись, в случае ошибки - Error.
     * @example
     * Прочитаем статью с ключом 'how-to-read-an-item':
     * <pre>
     *     const dataSource = new CrudSource({
     *         endpoint: '/articles/',
     *         keyProperty: 'code'
     *     });
     *     dataSource.read('how-to-read-an-item').then((article) => {
     *         console.log(article.get('code')), // how-to-read-an-item
     *         console.log(article.get('title')); // How to read an item
     *     }).catch((error) => {
     *         console.error('Can\'t read the article', error);
     *     });
     * </pre>
     * Прочитаем данные сотрудника с идентификатором 123321:
     * <pre>
     *      const dataSource = new SbisService({
     *          endpoint: 'Employee',
     *          keyProperty: '@Employee'
     *      });
     *      dataSource.read(123321).then((employee) => {
     *         console.log(employee.get('Name'));
     *      }).catch((error) => {
     *         console.error('Can\'t read the employee', error);
     *     });
     * </pre>
     */
    read(key: EntityKey, meta?: object): Promise<Record>;

    /**
     * Обновляет запись в источнике данных
     * @param data Обновляемая запись или рекордсет
     * @param [meta] Дополнительные мета данные
     * @return Асинхронный результат выполнения: в случае успеха ничего не вернет, в случае ошибки - Error.
     * @example
     * Обновим статью с ключом 'how-to-update-an-item':
     * <pre>
     *     const dataSource = new CrudSource({
     *         endpoint: '/articles/',
     *         keyProperty: 'code'
     *     });
     *     const article = new Record({
     *         rawData: {
     *             code: 'how-to-update-an-item',
     *             title: 'How to update an item'
     *         }
     *     });
     *
     *     dataSource.update(article).then(() => {
     *         console.log('The article has been updated successfully');
     *     }).catch((error) => {
     *         console.error('Can\'t update the article', error);
     *     });
     * </pre>
     * Обновим данные сотрудника с идентификатором 123321:
     * <pre>
     *     import {SbisService} from 'Types/source';
     *     import {Record} from 'Types/entity';
     *
     *     const dataSource = new SbisService({
     *         endpoint: 'Employee'
     *         keyProperty: '@Employee'
     *     });
     *
     *     const employee = new Record({
     *         format: [
     *             {name: '@Employee', type: 'identity'},
     *             {name: 'Position', type: 'string'}
     *         ],
     *         adapter: dataSource.getAdapter()
     *     });
     *
     *     employee.set({
     *         '@Employee':  [123321],
     *         Position: 'Senior manager'
     *     });
     *
     *     dataSource.update(employee).then(() => {
     *         console.log('The employee has been updated successfully');
     *     }).catch((error) => {
     *         console.error('Can\'t update the article', error);
     *     });
     * </pre>
     */
    update(data: Record | RecordSet, meta?: object): Promise<void>;

    /**
     * Удаляет запись из источника данных
     * @param keys Первичный ключ, или массив первичных ключей записи
     * @param [meta] Дополнительные мета данные
     * @return Асинхронный результат выполнения: в случае успеха ничего не вернет, в случае ошибки - Error.
     * @example
     * Удалим статью с ключом 'article-id-to-destroy':
     * <pre>
     *     const dataSource = new CrudSource({
     *         endpoint: '/articles/',
     *         keyProperty: 'code'
     *     });
     *     dataSource.destroy('article-id-to-destroy').then(() => {
     *         console.log('The article has been deleted successfully');
     *     }).catch((error) => {
     *         console.error('Can\'t delete the article', error);
     *     });
     * </pre>
     * Удалим сотрудника с идентификатором 123321:
     * <pre>
     *      const dataSource = new SbisService({
     *          endpoint: 'Employee',
     *          keyProperty: '@Employee'
     *      });
     *      dataSource.destroy(123321).then(() => {
     *         console.log('The employee has been deleted successfully');
     *      }).catch((error) => {
     *         console.error('Can\'t delete the article', error);
     *      });
     * </pre>
     */
    destroy(keys: EntityKey | EntityKey[], meta?: object): Promise<void>;

    /**
     * Выполняет запрос на выборку
     * @param [query] Запрос
     * @return Асинхронный результат выполнения: в случае успеха вернет {@link Types/_source/DataSet} - прочитаннные данные, в случае ошибки - Error.
     * @see Types/_source/Query
     * @see Types/_source/DataSet
     * @example
     * Выберем новые книги опредленного жанра:
     * <pre>
     *     const dataSource = new CrudSource({
     *         endpoint: '/books/'
     *     });
     *     const query = new Query();
     *
     *     query
     *         .select(['id', 'name', 'author', 'genre'])
     *         .where({
     *             genre: ['Thriller', 'Detective']
     *         })
     *         .orderBy('date', false);
     *
     *     dataSource.query(query).then((dataSet) => {
     *         var books = dataSet.getAll();
     *         //Deal with the books
     *     }).catch((error) => {
     *         console.error('Can\'t read the books', error);
     *     });
     * </pre>
     * Найдем молодые таланты среди сотрудников:
     * <pre>
     *     const dataSource = new Memory({
     *         data: [
     *             //Some data here
     *         ]
     *     });
     *
     *     const query = new Query();
     *     query
     *         .select(['id', 'name', 'position' ])
     *         .where((employee) => employee.get('position') === 'TeamLead' && employee.get('age') <= 18)
     *         .orderBy('age');
     *
     *     dataSource.query(query).then((dataSet) => {
     *         if (dataSet.getAll().getCount() > 0) {
     *             //A new Mark Zuckerberg detected
     *         }
     *     }).catch((error) => {
     *         console.error('Can\'t read the employees', error);
     *     });
     * </pre>
     */
    query(query?: Query): Promise<DataSet>;
}
