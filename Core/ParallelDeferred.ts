import Deferred = require('./Deferred');

class ParallelDeferred<T> {
   push(item: Deferred<T>): void {

   }

   done(): ParallelDeferred<T> {
      return this;
   }

   getResult(): Deferred<T> {
      return new Deferred<T>();
   }
}

export = ParallelDeferred;
