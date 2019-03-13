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
         item[SortWrapper.indexKey as string] = index;
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

   static valueOf(item: any): any {
      return item instanceof SortWrapper ? item.valueOf() : item;
   }

   static indexOf(item: any): number {
      return item instanceof SortWrapper ? item.indexOf() : item[SortWrapper.indexKey as string];
   }

   static clear(item: any): void {
      if (!(item instanceof SortWrapper)) {
         delete item[SortWrapper.indexKey as string];
      }
   }
}

SortWrapper.indexKey = protect('[]');
