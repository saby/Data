/// <amd-module name="Types/collection" />
/**
 * Библиотека коллекций.
 * @library Types/collection
 * @includes Array Types/_collection/Array
 * @includes enumerableComparator Types/_collection/enumerableComparator
 * @includes Dictionary Types/_collection/Dictionary
 * @includes Enum Types/_collection/Enum
 * @includes factory Types/_collection/factory
 * @includes format Types/_collection/format
 * @includes Flags Types/_collection/Flags
 * @includes IObservable Types/_collection/IObservable
 * @includes IEnum Types/_collection/IEnum
 * @includes IFlags Types/_collection/IFlags
 * @includes IEnumerable Types/_collection/IEnumerable
 * @includes IEnumerator Types/_collection/IEnumerator
 * @includes IList Types/_collection/IList
 * @includes IndexedEnumeratorMixin Types/_collection/IndexedEnumeratorMixin
 * @includes List Types/_collection/List
 * @includes Mapwise Types/_collection/Mapwise
 * @includes Objectwise Types/_collection/Objectwise
 * @includes ObservableList Types/_collection/ObservableList
 * @includes RecordSet Types/_collection/RecordSet
 * @public
 * @author Мальцев А.А.
 */

export {default as enumerableComparator} from './_collection/enumerableComparator';
export {default as Enum} from './_collection/Enum';
import * as enumerator from './_collection/enumerator';
export {enumerator};
export {default as EventRaisingMixin} from './_collection/EventRaisingMixin';
import * as factory from './_collection/factory';
export {factory};
import * as format from './_collection/format';
export {format};
export {default as Flags} from './_collection/Flags';
export {default as IEnum} from './_collection/IEnum';
export {default as IFlags, IValue as IFlagsValue} from './_collection/IFlags';
export {default as IEnumerable, EnumeratorCallback} from './_collection/IEnumerable';
export {default as IEnumerator} from './_collection/IEnumerator';
export {default as IList} from './_collection/IList';
export {default as IndexedEnumeratorMixin} from './_collection/IndexedEnumeratorMixin';
export {default as IObservable} from './_collection/IObservable';
export {default as List, IOptions as IListOptions} from './_collection/List';
export {default as ObservableList} from './_collection/ObservableList';
export {default as RecordSet} from './_collection/RecordSet';
