/**
 * Библиотека, которая обеспечивает доступ к источникам данных.
 * @library Types/source
 * @includes Base Types/_source/Base
 * @includes DataSet Types/_source/DataSet
 * @includes HierarchicalMemory Types/_source/HierarchicalMemory
 * @includes ICrud Types/_source/ICrud
 * @includes ICrudPlus Types/_source/ICrudPlus
 * @includes IData Types/_source/IData
 * @includes IProvider Types/_source/IProvider
 * @includes IProviderEndpoint Types/_source/IProvider#IEndpoint
 * @includes IRpc Types/_source/IRpc
 * @includes Local Types/_source/Local
 * @includes Memory Types/_source/Memory
 * @includes PrefetchProxy Types/_source/PrefetchProxy
 * @includes Query Types/_source/Query
 * @includes queryAndExpression Types/_source/Query#andExpression
 * @includes queryOrExpression Types/_source/Query#orExpression
 * @includes QueryJoin Types/_source/Query#Join
 * @includes QueryOrder Types/_source/Query#Order
 * @includes Remote Types/_source/Remote
 * @includes Rpc Types/_source/Rpc
 * @includes SbisService Types/_source/SbisService
 * @includes sbisServicePositionExpression Types/_source/SbisService#positionExpression
 * @public
 * @author Мальцев А.А.
 */

/*
 * Library that provides access to data sources
 * @library Types/source
 * @includes Base Types/_source/Base
 * @includes DataSet Types/_source/DataSet
 * @includes HierarchicalMemory Types/_source/HierarchicalMemory
 * @includes ICrud Types/_source/ICrud
 * @includes ICrudPlus Types/_source/ICrudPlus
 * @includes IData Types/_source/IData
 * @includes IProvider Types/_source/IProvider
 * @includes IProviderEndpoint Types/_source/IProvider#IEndpoint
 * @includes IRpc Types/_source/IRpc
 * @includes Local Types/_source/Local
 * @includes Memory Types/_source/Memory
 * @includes PrefetchProxy Types/_source/PrefetchProxy
 * @includes Query Types/_source/Query
 * @includes queryAndExpression Types/_source/Query#andExpression
 * @includes queryOrExpression Types/_source/Query#orExpression
 * @includes QueryJoin Types/_source/Query#Join
 * @includes QueryOrder Types/_source/Query#Order
 * @includes Remote Types/_source/Remote
 * @includes Rpc Types/_source/Rpc
 * @includes SbisService Types/_source/SbisService
 * @public
 * @author Мальцев А.А.
 */

export {default as Base} from './_source/Base';
export {default as BindingMixin} from './_source/BindingMixin';
import {default as DataSet} from './_source/DataSet';
export {DataSet};
export {default as HierarchicalMemory} from './_source/HierarchicalMemory';
export {default as ICrud, EntityKey as CrudEntityKey} from './_source/ICrud';
export {default as ICrudPlus} from './_source/ICrudPlus';
export {default as IData} from './_source/IData';
export {default as IDecorator} from './_source/IDecorator';
export {default as IProvider, IEndpoint as  IProviderEndpoint} from './_source/IProvider';
export {default as IRpc} from './_source/IRpc';
export {default as Local, MOVE_POSITION as LOCAL_MOVE_POSITION} from './_source/Local';
import {default as Memory, IOptions as IMemoryOptions} from './_source/Memory';
export {Memory, IMemoryOptions};
export {default as PrefetchProxy} from './_source/PrefetchProxy';
import * as provider from './_source/provider';
export {provider};
export {
    andExpression as queryAndExpression,
    default as Query,
    ExpandMode as QueryExpandMode,
    Join as QueryJoin,
    IMeta as IQueryMeta,
    NavigationType as QueryNavigationType,
    Order as QueryOrder,
    OrderSelector as QueryOrderSelector,
    orExpression as queryOrExpression,
    SelectExpression as QuerySelectExpression,
    WhereExpression as QueryWhereExpression
} from './_source/Query';
export {default as Remote} from './_source/Remote';
export {default as Rpc} from './_source/Rpc';
import {default as SbisService} from './_source/SbisService';
export {SbisService};
export {
    getQueryArguments as sbisServiceGetQueryArguments,
    IOptions as ISbisServiceOptions
} from './_source/SbisService';

import {register} from './di';

register('Types/source:DataSet', DataSet, {instantiate: false});
register('Types/source:provider.SbisBusinessLogic', provider.SbisBusinessLogic, {instantiate: false});
register('Types/source:Memory', Memory, {instantiate: false});
register('Types/source:SbisService', SbisService, {instantiate: false});
