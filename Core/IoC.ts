class IoC {
   protected bindings: Map<string, any> = new Map();

   resolve<T>(name: string): T {
      return this.bindings.get(name);
   }

   bind<T>(name: string, value: T): void {
      this.bindings.set(name, value);
   }

   bindSingle<T>(name: string, value: T): void {
      this.bindings.set(name, value);
   }
}

const ioc = new IoC();

export = ioc;
