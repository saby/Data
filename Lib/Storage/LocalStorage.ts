/// <amd-module name="Lib/Storage/LocalStorage" />
//@ts-ignore
import { LocalStorage } from 'Browser/Storage';
//@ts-ignore
import { IoC } from 'Env/Env';

IoC.resolve('ILogger').log("Lib/Storage/LocalStorage", 'module has been moved to "Browser/Storage:LocalStorage" and will be removed');

export = LocalStorage;
