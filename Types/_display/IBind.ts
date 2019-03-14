import {IObservable as IObservableCollection} from '../collection';

/**
 * Интерфейс привязки к проекции коллекции
 * @interface Types/_display/IBind
 * @public
 * @author Мальцев А.А.
 */
const IBind = /** @lends Types/_display/IBind.prototype */ {
   '[Types/_display/IBind]': true,

   /**
    * @const {String} Изменение коллекции: добавлены элементы
    */
   ACTION_ADD: IObservableCollection.ACTION_ADD,

   /**
    * @const {String} Изменение коллекции: удалены элементы
    */
   ACTION_REMOVE: IObservableCollection.ACTION_REMOVE,

   /**
    * @const {String} Изменение коллекции: изменены элементы
    */
   ACTION_CHANGE: IObservableCollection.ACTION_CHANGE,

   /**
    * @const {String} Изменение коллекции: заменены элементы
    */
   ACTION_REPLACE: IObservableCollection.ACTION_REPLACE,

   /**
    * @const {String} Изменение коллекции: перемещены элементы
    */
   ACTION_MOVE: IObservableCollection.ACTION_MOVE,

   /**
    * @const {String} Изменение коллекции: значительное изменение
    */
   ACTION_RESET: IObservableCollection.ACTION_RESET

   /**
    * @event onCollectionChange После изменения коллекции
    * @param {Env/Event.Object} event Дескриптор события.
    * @param {Types/_collection/IBind#ChangeAction} action Действие, приведшее к изменению.
    * @param {Types/_display/CollectionItem[]} newItems Новые элементы коллекции.
    * @param {Number} newItemsIndex Индекс, в котором появились новые элементы.
    * @param {Types/_display/CollectionItem[]} oldItems Удаленные элементы коллекции.
    * @param {Number} oldItemsIndex Индекс, в котором удалены элементы.
    * @param {String} groupId Идентификатор группы, в которой произошли изменения
    * @example
    * <pre>
    *    define([
    *       'Types/_collection/ObservableList',
    *       'Types/_display/Collection',
    *       'Types/_display/IBindCollection'
    *    ], function(
    *       ObservableList,
    *       CollectionDisplay,
    *       IBindCollection
    *    ) {
    *       var list = new ObservableList(),
    *          display = new CollectionDisplay({
    *             collection: list
    *          });
    *
    *       display.subscribe('onCollectionChange', function(eventObject, action){
    *          if (action == IBindCollection.ACTION_REMOVE){
    *             //Do something with removed items
    *          }
    *       });
    *    });
    * </pre>
    */
};

export default IBind;
