import { EntityMarker } from '../_declarations';

/**
 * Интерфейс уведомлений об изменении к свойств объекта.
 * @interface Types/_entity/IObservableObject
 * @public
 * @author Кудрявцев И.С.
 */
export default interface IObservableObject {
    readonly '[Types/_entity/IObservableObject]': EntityMarker;

    /**
     * @event После изменения набора свойств объекта.
     * @name Types/_entity/IObservableObject#onPropertyChange
     * @param {Env/Event.Object} event Дескриптор события.
     * @param {Object} properties Названия и новые значения изменившихся свойств.
     * @example
     * <pre>
     *     var human = new Record({
     *         rawData: {
     *             firstName: 'Laurence',
     *             lastName: 'Wachowski',
     *             born: 'June 21, 1965',
     *             gender: 'Male'
     *         }
     *     });
     *
     *     human.subscribe('onPropertyChange', function(event, properties) {
     *         if ('gender' in properties) {
     *             Di.resolve('the.big.brother').getRegistry('Transgenders').add(event.getTarget());
     *         }
     *     });
     *
     *     human.set({
     *         firstName: 'Lana',
     *         gender: 'Female'
     *     })
     * </pre>
     */
}
