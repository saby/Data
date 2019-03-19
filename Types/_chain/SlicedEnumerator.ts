import {IEnumerator} from '../collection';
import Abstract from './Abstract';

/**
 * Вырезающий энумератор
 * @author Мальцев А.А.
 */
export default class SlicedEnumerator<T> implements IEnumerator<T> {
   readonly '[Types/_collection/IEnumerator]': boolean = true;
   private previous: Abstract<T>;
   private begin: number;
   private end: number;
   private now: number;
   private enumerator: IEnumerator<T>;

   /**
    * Конструктор вырезающего энумератора.
    * @param previous Предыдущее звено.
    * @param begin Индекс, по которому начинать извлечение
    * @param end Индекс, по которому заканчивать извлечение (будут извлечены элементы с индексом меньше end)
    */
   constructor(previous: Abstract<T>, begin: number, end: number) {
      this.previous = previous;
      this.begin = begin;
      this.end = end;
      this.reset();
   }

   getCurrent(): any {
      return this.enumerator.getCurrent();
   }

   getCurrentIndex(): any {
      return this.enumerator.getCurrentIndex();
   }

   moveNext(): boolean {
      while (this.now < this.begin - 1 && this.enumerator.moveNext()) {
         this.now++;
      }

      const next = this.now + 1;
      if (
         next >= this.begin &&
         next < this.end &&
         this.enumerator.moveNext()
      ) {
         this.now = next;
         return true;
      }

      return false;
   }

   reset(): void {
      this.enumerator = this.previous.getEnumerator();
      this.now = -1;
   }
}

Object.assign(SlicedEnumerator.prototype, {
   previous: null,
   now: 0,
   begin: 0,
   end: 0,
   enumerator: null
});
