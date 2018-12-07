/// <amd-module name="Types/_chain/SortWrapper" />
/**
 * Обертка для элемента коллекции, позволяющая сохранить информацию о его индексе в коллекции.
 * @param {*} item Элемент коллекции.
 * @param {*} index Индекс элемента коллекции.
 * @protected
 */

import { protect } from '../util';

export default class SortWrapper {
   static indexKey: string | Symbol;
   private item: any;
   private index: number;

   constructor(item: any, index: number) {
      if (item instanceof Object) {
         item[<string>SortWrapper.indexKey] = index;
         return item;
      }
      this.item = item;
      this.index = index;
   }

   valueOf(): any {
      return this.item;
   }

   indexOf(): number {
      return this.index;
   }

   static valueOf(item): any {
      return item instanceof SortWrapper ? item.valueOf() : item;
   }

   static indexOf(item): number {
      return item instanceof SortWrapper ? item.indexOf() : item[<string>SortWrapper.indexKey];
   }

   static clear(item) {
      if (!(item instanceof SortWrapper)) {
         delete item[<string>SortWrapper.indexKey];
      }
   }
}

SortWrapper.indexKey = protect('[]');
