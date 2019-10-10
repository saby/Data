import DataSet from './DataSet';
import {ExtendPromise} from '../_declarations';

/**
 * Интерфейс источника данных, поддерживающего {@link https://en.wikipedia.org/wiki/Remote_procedure_call RPC}.
 * @remark
 * Заставим тигра прыгнуть:
 * <pre>
 *     const dataSource = new RpcSource({
 *         endpoint: 'Tiger'
 *     });
 *     dataSource.call('jump', {height: '3 meters'}).then((result) => {
 *         console.log(result);
 *     }).catch(console.error);
 * </pre>
 * @interface Types/_source/IRpc
 * @public
 * @author Мальцев А.А.
 */
export default interface IRpc {
    readonly '[Types/_source/IRpc]': boolean;

    /**
     *
     * Вызывает удаленный метод.
     * @param {String} command Имя метода
     * @param {Object} [data] Аргументы метода
     * @return {Promise.<Types/_source/DataSet>} Асинхронный результат выполнения: в случае успеха вернет {@link Types/_source/DataSet}, в случае ошибки - Error.
     * @see Types/_source/DataSet
     * @example
     * Раздаем подарки сотрудникам, у которых сегодня день рождения. Также посчитаем их количество:
     * <pre>
     *     const dataSource = new RpcSource({
     *         endpoint: 'Employee'
     *     });
     *     dataSource.call('giveAGift', {
     *         birthDate: new Date(),
     *         giftCode: 'a-ticket-to-the-bowling'
     *     }).then((dataSet) => {
     *         const todaysBirthdayTotal = dataSet.getAll().getCount();
     *     }).catch(console.error);
     * </pre>
     */
    call(command: string, data?: object): ExtendPromise<DataSet>;
}
