class Deferred<T> {
   protected wrapper: Promise<T>;
   protected resolver: Function;
   protected rejecter: Function;
   protected result: T;

   constructor() {
      this.wrapper = new Promise((resolve, reject) => {
         this.resolver = (result) => {
            this.result = result;
            resolve(result);
         };
         this.rejecter = (result) => {
            this.result = result;
            reject(result);
         };
      });
   }

   cancel() {
      this.rejecter(new Error('Cancelled'));
   }

   callback(res?: T): Deferred<T> {
      this.resolver(res);
      return this;
   }

   errback(res: T): Deferred<T> {
      this.rejecter(res);
      return this;
   }

   addCallback(fn): Deferred<T> {
      this.wrapper.then(fn);
      return this;
   }

   addErrback(fn): Deferred<T> {
      this.wrapper.catch(fn);
      return this;
   }

   addCallbacks(cb, eb): Deferred<T> {
      this.wrapper.then(cb, eb);
      return this;
   }

   dependOn(master): Deferred<T> {
      master.then(this.resolver, this.rejecter);
      return this;
   }

   createDependent(): Deferred<T> {
      const dependent = new Deferred<T>();
      return dependent.dependOn(this);
   }

   isReady(): boolean {
      return this.result !== undefined;
   }

   getResult(): T {
      return this.result;
   }

   static success<T>(result?: T): Deferred<T> {
      return new Deferred<T>().callback(result);
   }

   static fail(result: string | Error): Deferred<Error> {
      const err = result instanceof Error ? result : new Error(result ? String(result) : '');
      return new Deferred<Error>().errback(err);
   }

}

export = Deferred;
