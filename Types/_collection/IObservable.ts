/// <amd-module name="Types/_collection/IObservable" />
/**
 * Интерфейс привязки к коллекции.
 * Позволяет узнавать об изменения, происходящих с элементами коллекции.
 * @interface Types/_collection/IBind
 * @public
 * @author Мальцев А.А.
 */

const IObservable = /** @lends Types/_collection/IBind.prototype */{
   '[Types/_collection/IObservable]': true,

   /**
    * @const {String} Изменение коллекции: добавлены элементы
    */
   ACTION_ADD: 'a',

   /**
    * @const {String} Изменение коллекции: удалены элементы
    */
   ACTION_REMOVE: 'rm',

   /**
    * @const {String} Изменение коллекции: изменены элементы
    */
   ACTION_CHANGE: 'ch',

   /**
    * @const {String} Изменение коллекции: заменены элементы
    */
   ACTION_REPLACE: 'rp',

   /**
    * @const {String} Изменение коллекции: перемещены элементы
    */
   ACTION_MOVE: 'm',

   /**
    * @const {String} Изменение коллекции: значительное изменение
    */
   ACTION_RESET: 'rs'

   /**
    * @typedef {String} ChangeAction
    * @variant a Добавлены элементы
    * @variant rm Удалены элементы
    * @variant ch Изменены элементы
    * @variant rp Заменены элементы
    * @variant m Перемещены элементы
    * @variant rs Значительное изменение
    */

   /**
    * @event onCollectionChange После изменения коллекции
    * @param {Env/Event.Object} event Дескриптор события.
    * @param {ChangeAction} action Действие, приведшее к изменению.
    * @param {Array} newItems Новые элементы коллекции.
    * @param {Number} newItemsIndex Индекс, в котором появились новые элементы.
    * @param {Array} oldItems Удаленные элементы коллекции.
    * @param {Number} oldItemsIndex Индекс, в котором удалены элементы.
    * @example
    * <pre>
    * define([
    *    'Types/collection'
    * ], function(collection) {
    *    var list = new collection.ObservableList({
    *       items: [1, 2, 3]
    *    });
    *
    *    list.subscribe(
    *       'onCollectionChange',
    *      function(eventObject, action, newItems, newItemsIndex, oldItems, oldItemsIndex) {
    *          if (action == collection.IObservable.ACTION_REMOVE){
    *             console.log(oldItems);//[1]
    *             console.log(oldItemsIndex);//0
    *          }
    *       }
    *    );
    *
    *    list.removeAt(0);
    * });
    * </pre>
    */

   /**
    * @event onCollectionItemChange После изменения элемента коллекции
    * @param {Env/Event.Object} event Дескриптор события.
    * @param {*} item Измененный элемент коллекции.
    * @param {Number} index Индекс измененного элемента.
    * @param {Object} [properties] Изменившиеся свойства
    * @example
    * Отследим изменение свойства title:
    * <pre>
    *    var records = [new Record(), new Record(), new Record()],
    *       list = new ObservableList({
    *          items: records
    *       });
    *
    *    list.subscribe('onCollectionItemChange', function(eventObject, item, index, properties) {
    *       console.log(item === records[2]);//true
    *       console.log(index);//2
    *       console.log('title' in properties);//true
    *    });
    *
    *    records[2].set('title', 'test');
    * </pre>
    */
};

export default IObservable;
