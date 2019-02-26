/// <amd-module name="Types/entity" />
/**
 * Библиотека типов.
 * @library Types/entity
 * @includes adapter Types/_entity/adapter
 * @includes descriptor Types/_entity/descriptor
 * @includes DestroyableMixin Types/_entity/DestroyableMixin
 * @includes factory Types/_entity/factory
 * @includes format Types/_entity/format
 * @includes functor Types/_entity/functor
 * @includes Identity Types/_entity/Identity
 * @includes ICloneable Types/_entity/ICloneable
 * @includes IEquatable Types/_entity/IEquatable
 * @includes IInstantiable Types/_entity/IInstantiable
 * @includes IObject Types/_entity/IObject
 * @includes IObservableObject Types/_entity/IObservableObject
 * @includes IProducible Types/_entity/IProducible
 * @includes IVersionable Types/_entity/IVersionable
 * @includes Model Types/_entity/Model
 * @includes Record Types/_entity/Record
 * @includes relation Types/_entity/relation
 * @public
 * @author Мальцев А.А.
 */

import * as adapter from './_entity/adapter';
export {adapter};
export {default as CloneableMixin} from './_entity/CloneableMixin';
export {default as descriptor} from './_entity/descriptor';
export {default as DestroyableMixin} from './_entity/DestroyableMixin';
export {default as factory} from './_entity/factory';
import * as format from './_entity/format';
export {format};
export {
    default as FormattableMixin,
    IOptions as IFormattableOptions,
    ISerializableState as IFormattableSerializableState
} from './_entity/FormattableMixin';
import * as functor from './_entity/functor';
export {functor};
export {default as Identity} from './_entity/Identity';
export {default as ICloneable} from './_entity/ICloneable';
export {default as IEquatable} from './_entity/IEquatable';
export {default as IInstantiable} from './_entity/IInstantiable';
export {default as InstantiableMixin} from './_entity/InstantiableMixin';
export {default as IObject} from './_entity/IObject';
export {default as IObservableObject} from './_entity/IObservableObject';
export {default as IProducible} from './_entity/IProducible';
export {default as IVersionable} from './_entity/IVersionable';
export {default as ManyToManyMixin} from './_entity/ManyToManyMixin';
export {default as Model} from './_entity/Model';
export {default as OptionsToPropertyMixin} from './_entity/OptionsToPropertyMixin';
export {default as ObservableMixin} from './_entity/ObservableMixin';
export {default as ReadWriteMixin} from './_entity/ReadWriteMixin';
export {default as Record} from './_entity/Record';
import * as relation from './_entity/relation';
export {relation};
export {default as SerializableMixin, IState as ISerializableState} from './_entity/SerializableMixin';
export {default as VersionableMixin} from './_entity/VersionableMixin';
export {default as TimeInterval} from './_entity/TimeInterval';
export {default as Guid} from './_entity/Guid';
