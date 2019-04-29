/**
 * Library that provides access to data sources
 * @library Types/source
 * @includes Base Types/_source/Base
 * @includes DataSet Types/_source/DataSet
 * @includes HierarchicalMemory Types/_source/HierarchicalMemory
 * @includes ICrud Types/_source/ICrud
 * @includes ICrudPlus Types/_source/ICrudPlus
 * @includes IData Types/_source/IData
 * @includes IProvider Types/_source/IProvider
 * @includes IRpc Types/_source/IRpc
 * @includes Local Types/_source/Local
 * @includes Memory Types/_source/Memory
 * @includes PrefetchProxy Types/_source/PrefetchProxy
 * @includes Query Types/_source/Query
 * @includes Remote Types/_source/Remote
 * @includes Rpc Types/_source/Rpc
 * @includes SbisService Types/_source/SbisService
 * @public
 * @author Мальцев А.А.
 */

export {default as Base} from './_source/Base';
export {default as DataSet} from './_source/DataSet';
export {default as HierarchicalMemory} from './_source/HierarchicalMemory';
export {default as ICrud} from './_source/ICrud';
export {default as ICrudPlus} from './_source/ICrudPlus';
export {default as IData} from './_source/IData';
export {default as IDecorator} from './_source/IDecorator';
export {default as IProvider} from './_source/IProvider';
export {default as IRpc} from './_source/IRpc';
export {default as Local} from './_source/Local';
export {default as Memory} from './_source/Memory';
export {default as PrefetchProxy} from './_source/PrefetchProxy';
import * as provider from './_source/provider';
export {provider};
export {
   default as Query,
   NavigationType as QueryNavigationType,
   ExpandMode as QueryExpandMode,
   IMeta as IQueryMeta
} from './_source/Query';
export {default as Remote} from './_source/Remote';
export {default as Rpc} from './_source/Rpc';
export {default as SbisService} from './_source/SbisService';
