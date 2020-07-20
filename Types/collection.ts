/**
 * Библиотека, которая предоставляет различные виды коллекций.
 * @library Types/collection
 * @includes enumerableComparator Types/_collection/enumerableComparator
 * @includes Enum Types/_collection/Enum
 * @includes enumerator Types/_collection/enumerator
 * @includes factory Types/_collection/factory
 * @includes format Types/_collection/format
 * @includes Flags Types/_collection/Flags
 * @includes IEnum Types/_collection/IEnum
 * @includes IFlags Types/_collection/IFlags
 * @includes IEnumerable Types/_collection/IEnumerable
 * @includes IEnumerator Types/_collection/IEnumerator
 * @includes IList Types/_collection/IList
 * @includes IObservable Types/_collection/IObservable
 * @includes List Types/_collection/List
 * @includes ObservableList Types/_collection/ObservableList
 * @includes RecordSet Types/_collection/RecordSet
 * @public
 * @author Мальцев А.А.
 */

/*
 * Library that provides various kinds of collections
 * @library Types/collection
 * @includes enumerableComparator Types/_collection/enumerableComparator
 * @includes Enum Types/_collection/Enum
 * @includes enumerator Types/_collection/enumerator
 * @includes factory Types/_collection/factory
 * @includes format Types/_collection/format
 * @includes Flags Types/_collection/Flags
 * @includes IEnum Types/_collection/IEnum
 * @includes IFlags Types/_collection/IFlags
 * @includes IEnumerable Types/_collection/IEnumerable
 * @includes IEnumerator Types/_collection/IEnumerator
 * @includes IList Types/_collection/IList
 * @includes IObservable Types/_collection/IObservable
 * @includes List Types/_collection/List
 * @includes ObservableList Types/_collection/ObservableList
 * @includes RecordSet Types/_collection/RecordSet
 * @public
 * @author Мальцев А.А.
 */

import {register} from './di';

export {
   default as enumerableComparator,
   ISession as IEnumerableComparatorSession
} from './_collection/enumerableComparator';
import {default as Enum} from './_collection/Enum';
import * as factory from './_collection/factory';
import * as format from './_collection/format';
import {default as Flags} from './_collection/Flags';
export {Enum, factory, format, Flags};
import * as enumerator from './_collection/enumerator';
export {enumerator};
export {default as EventRaisingMixin} from './_collection/EventRaisingMixin';
export {default as IEnum} from './_collection/IEnum';
export {default as IFlags, IValue as IFlagsValue} from './_collection/IFlags';
export {default as IEnumerable, EnumeratorIndex, EnumeratorCallback} from './_collection/IEnumerable';
export {default as IEnumerator} from './_collection/IEnumerator';
export {default as IList, IListConstructor} from './_collection/IList';
export {default as IndexedEnumeratorMixin} from './_collection/IndexedEnumeratorMixin';
export {default as IObservable} from './_collection/IObservable';
import {default as List, IOptions as IListOptions} from './_collection/List';
export {List, IListOptions};
import {default as ObservableList} from './_collection/ObservableList';
export {ObservableList};
import {default as RecordSet} from './_collection/RecordSet';
export {RecordSet};

register('Types/collection:format.Format', format.Format, {instantiate: false});
register('Types/collection:format.factory', format.factory, {instantiate: false});
register('Types/collection:Enum', Enum, {instantiate: false});
register('Types/collection:Flags', Flags, {instantiate: false});
register('Types/collection:List', List, {instantiate: false});
register('Types/collection:ObservableList', ObservableList, {instantiate: false});
register('Types/collection:RecordSet', RecordSet, {instantiate: false});
register('Types/collection:enumerator.Arraywise', enumerator.Arraywise, {instantiate: false});
