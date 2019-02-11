class RPCJSON {
   callMethod<T>(name: string, args: any[]): T {
      throw new Error(`RPCJSON::callMethod(${name}, ${args})`);
   }
}

export = RPCJSON;
