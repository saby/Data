/// <amd-module name="Types/_display/IBind" />
/**
 * Интерфейс привязки к проекции коллекции
 * @interface Types/Display/IBindCollection
 * @public
 * @author Мальцев А.А.
 */

import {IObservable as IObservableCollection} from '../collection';

const IBind = /** @lends Types/Display/IBindCollection.prototype */ {
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
    * @param {Core/EventObject} event Дескриптор события.
    * @param {Types/Collection/IBind#ChangeAction} action Действие, приведшее к изменению.
    * @param {Types/Display/CollectionItem[]} newItems Новые элементы коллекции.
    * @param {Number} newItemsIndex Индекс, в котором появились новые элементы.
    * @param {Types/Display/CollectionItem[]} oldItems Удаленные элементы коллекции.
    * @param {Number} oldItemsIndex Индекс, в котором удалены элементы.
    * @param {String} groupId Идентификатор группы, в которой произошли изменения
    * @example
    * <pre>
    *    define([
    *       'Types/Collection/ObservableList',
    *       'Types/Display/Collection',
    *       'Types/Display/IBindCollection'
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
