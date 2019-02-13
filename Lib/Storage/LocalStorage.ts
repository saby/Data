class LocalStorage {
   protected readonly prefix: string;

   constructor(prefix: string) {
      this.prefix = prefix;
   }

   getItem<T>(key: string): T {
      throw new Error('Not supported');
   }

   setItem<T>(key: string, value: T): void {
      throw new Error('Not supported');
   }

   removeItem(key: string): void {
      throw new Error('Not supported');
   }
}

export = LocalStorage;
