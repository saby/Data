/**
 * Библиотека, которая предоставляет различные виды сущностей.
 * @library Types/entity
 * @includes adapter Types/_entity/adapter
 * @includes CancelablePromise Types/_entity/applied/CancelablePromise
 * @includes compare Types/_entity/compare
 * @includes Date Types/_entity/applied/Date
 * @includes DateTime Types/_entity/applied/DateTime
 * @includes descriptor Types/_entity/descriptor
 * @includes factory Types/_entity/factory
 * @includes format Types/_entity/format
 * @includes functor Types/_entity/functor
 * @includes Guid Types/_entity/applied/Guid
 * @includes JSONML Types/_entity/applied/JSONML
 * @includes Identity Types/_entity/applied/Identity
 * @includes ICloneable Types/_entity/ICloneable
 * @includes IEquatable Types/_entity/IEquatable
 * @includes IInstantiable Types/_entity/IInstantiable
 * @includes IObject Types/_entity/IObject
 * @includes IObservableObject Types/_entity/IObservableObject
 * @includes IVersionable Types/_entity/IVersionable
 * @includes Model Types/_entity/Model
 * @includes ReactiveObject Types/_entity/applied/ReactiveObject
 * @includes Record Types/_entity/Record
 * @includes relation Types/_entity/relation
 * @includes Time Types/_entity/applied/Time
 * @includes TimeInterval Types/_entity/applied/TimeInterval
 * @public
 * @author Мальцев А.А.
 */

/*
 * Library that provides various kinds of entities.
 * @library Types/entity
 * @includes adapter Types/_entity/adapter
 * @includes CancelablePromise Types/_entity/applied/CancelablePromise
 * @includes compare Types/_entity/compare
 * @includes Date Types/_entity/applied/Date
 * @includes DateTime Types/_entity/applied/DateTime
 * @includes descriptor Types/_entity/descriptor
 * @includes factory Types/_entity/factory
 * @includes format Types/_entity/format
 * @includes functor Types/_entity/functor
 * @includes Guid Types/_entity/applied/Guid
 * @includes JSONML Types/_entity/applied/JSONML
 * @includes Identity Types/_entity/applied/Identity
 * @includes ICloneable Types/_entity/ICloneable
 * @includes IEquatable Types/_entity/IEquatable
 * @includes IInstantiable Types/_entity/IInstantiable
 * @includes IObject Types/_entity/IObject
 * @includes IObservableObject Types/_entity/IObservableObject
 * @includes IVersionable Types/_entity/IVersionable
 * @includes Model Types/_entity/Model
 * @includes ReactiveObject Types/_entity/applied/ReactiveObject
 * @includes Record Types/_entity/Record
 * @includes relation Types/_entity/relation
 * @includes Time Types/_entity/applied/Time
 * @includes TimeInterval Types/_entity/applied/TimeInterval
 * @public
 * @author Мальцев А.А.
 */

import * as adapter from './_entity/adapter';
export {adapter};
export {
    CancelablePromise,
    Date,
    DateTime,
    Guid,
    JSONML,
    IJSONML,
    PromiseCanceledError,
    ReactiveObject,
    Time,
    TimeInterval
} from './_entity/applied';
export {default as CloneableMixin} from './_entity/CloneableMixin';
import * as compare from './_entity/compare';
export {compare};
export {default as descriptor, DescriptorValidator} from './_entity/descriptor';
export {default as DestroyableMixin} from './_entity/DestroyableMixin';
import * as factory from './_entity/factory';
export {factory};
import * as format from './_entity/format';
export {format};
export {
    default as FormattableMixin,
    AdapterDescriptor,
    FormatDescriptor,
    IOptions as IFormattableOptions,
    ISerializableState as IFormattableSerializableState
} from './_entity/FormattableMixin';
import * as functor from './_entity/functor';
export {functor};
export {default as ICloneable} from './_entity/ICloneable';
export {default as IEquatable} from './_entity/IEquatable';
export {default as IInstantiable} from './_entity/IInstantiable';
export {default as InstantiableMixin} from './_entity/InstantiableMixin';
export {default as IObject, IObjectConstructor} from './_entity/IObject';
export {default as IObservableObject} from './_entity/IObservableObject';
export {default as IProducible} from './_entity/IProducible';
export {default as ISerializable} from './_entity/ISerializable';
export {default as IVersionable} from './_entity/IVersionable';
export {default as ManyToManyMixin} from './_entity/ManyToManyMixin';
export {default as Model, IProperty as IModelProperty} from './_entity/Model';
export {default as OptionsToPropertyMixin, getMergeableProperty} from './_entity/OptionsToPropertyMixin';
export {default as ObservableMixin, IOptions as IObservableMixinOptions} from './_entity/ObservableMixin';
export {default as ReadWriteMixin, IOptions as IReadWriteMixinOptions} from './_entity/ReadWriteMixin';
export {default as Record, State as RecordState} from './_entity/Record';
import * as relation from './_entity/relation';
export {relation};
export {
    default as SerializableMixin,
    ISignature as ISerializableSignature,
    IState as ISerializableState
} from './_entity/SerializableMixin';
export {
    default as VersionableMixin,
    IOptions as IVersionableMixinOptions,
    VersionCallback as VersionableMixinVersionCallback
} from './_entity/VersionableMixin';
