import { getMergeableProperty } from '../entity';
import { EntityMarker } from '../_declarations';

export interface IBinding {
    create?: string;
    read?: string;
    update?: string;
    destroy?: string;
    query?: string;
    copy?: string;
    merge?: string;
    move?: string;
}

export interface IOptions {
    binding?: IBinding;
}

/**
 * Миксин, позволяющий задавать привязку CRUD к контракту источника.
 * @mixin Types/_source/BindingMixin
 * @public
 * @author Кудрявцев И.С.
 */
export default abstract class BindingMixin {
    readonly '[Types/_source/BindingMixin]': EntityMarker;

    /**
     * @cfg {Object} Соответствие методов CRUD контракту. Определяет, как именно источник реализует каждый метод CRUD.
     * @name Types/_source/BindingMixin#binding
     * @see getBinding
     * @see create
     * @see read
     * @see destroy
     * @see query
     * @see copy
     * @see merge
     * @example
     * Подключаем пользователей через HTTP API, для каждого метода CRUD укажем путь в URL:
     * <pre>
     *     var dataSource = new HttpSource({
     *         endpoint: {
     *             address: '//some.server/',
     *             contract: 'users/'
     *         },
     *         binding: {
     *             create: 'add/',//dataSource.create() calls //some.server/users/add/ via HTTP
     *             read: 'load/',//dataSource.read() calls //some.server/users/load/ via HTTP
     *             update: 'save/',//dataSource.update() calls //some.server/users/save/ via HTTP
     *             destroy: 'delete/',//dataSource.destroy() calls //some.server/users/delete/ via HTTP
     *             query: 'list/'//dataSource.query() calls //some.server/users/list/ via HTTP
     *         }
     *     });
     * </pre>
     * Подключаем пользователей через RPC, для каждого метода CRUD укажем суффикс в имени удаленного метода:
     * <pre>
     *     var dataSource = new RpcSource({
     *         endpoint: {
     *             address: '//some.server/rpc-gate/',
     *             contract: 'Users'
     *         },
     *         binding: {
     *             create: 'Add',//dataSource.create() calls UsersAdd() via RPC
     *             read: 'Load',//dataSource.read() calls UsersLoad() via RPC
     *             update: 'Save',//dataSource.update() calls UsersSave() via RPC
     *             destroy: 'Delete',//dataSource.destroy() calls UsersDelete() via RPC
     *             query: 'List'//dataSource.query() calls UsersList() via RPC
     *         }
     *     });
     * </pre>
     */
    protected _$binding: IBinding;

    /**
     * @cfg {String} Операция создания записи через метод {@link create}.
     * @name Types/_source/BindingMixin#binding.create
     */

    /**
     * @cfg {String} Операция чтения записи через метод {@link read}.
     * @name Types/_source/BindingMixin#binding.read
     */

    /**
     * @cfg {String} Операция обновления записи через метод {@link update}.
     * @name Types/_source/BindingMixin#binding.update
     */

    /**
     * @cfg {String} Операция удаления записи через метод {@link destroy}.
     * @name Types/_source/BindingMixin#binding.destroy
     */

    /**
     * @cfg {String} Операция получения списка записей через метод {@link query}.
     * @name Types/_source/BindingMixin#binding.query
     */

    /**
     * @cfg {String} Операция копирования записей через метод {@link copy}.
     * @name Types/_source/BindingMixin#binding.copy
     */

    /**
     * @cfg {String} Операция объединения записей через метод {@link merge}.
     * @name Types/_source/BindingMixin#binding.merge
     */

    /**
     * @cfg {String} Операция перемещения записи через метод {@link move}.
     * @name Types/_source/BindingMixin#binding.move
     */

    /**
     * Возвращает соответствие методов CRUD контракту источника.
     * @return {Object}
     * @example
     * Получим имя метода, отвечающего за чтение списка сотрудников:
     * <pre>
     *      var dataSource = new SbisService({
     *          endpoint: 'Employee',
     *          binding: {
     *             query: 'MyCustomList'
     *          }
     *      });
     *      console.log(dataSource.getBinding().query);//'MyCustomList'
     * </pre>
     * Выполним вызов, который вернет данные статьи:
     * <pre>
     *     var articlesSource = new RestSource({
     *         binding: {
     *             create: '/api/article/add/',
     *             read: '/api/article/read/',
     *             update: '/api/article/save/',
     *             destroy: '/api/article/remove/'
     *         },
     *         keyProperty: 'id'
     *     });
     *     console.log('Calling read() method via ' + dataSource.getBinding().read);
     *     //'Calling read() method via /api/article/read/'
     *     articlesSource.read(13);
     *    //Cause HTTP request to /api/article/read/?id=13
     * </pre>
     */
    getBinding(): IBinding {
        return {...this._$binding};
    }

    setBinding(binding: IBinding): void {
        this._$binding = binding;
    }
}

Object.assign(BindingMixin.prototype, {
    '[Types/_source/BindingMixin]': true,
    _$binding: getMergeableProperty<IBinding>({
        create: 'create',
        read: 'read',
        update: 'update',
        destroy: 'delete',
        query: 'query',
        copy: 'copy',
        merge: 'merge',
        move: 'move'
    })
});
