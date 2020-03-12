/**
 * Library that provides various kinds of entities.
 * @library Types/entity
 * @includes adapter Types/_entity/adapter
 * @includes CancelablePromise Types/_entity/CancelablePromise
 * @includes compare Types/_entity/compare
 * @includes Date Types/_entity/Date
 * @includes DateTime Types/_entity/DateTime
 * @includes descriptor Types/_entity/descriptor
 * @includes factory Types/_entity/factory
 * @includes format Types/_entity/format
 * @includes functor Types/_entity/functor
 * @includes Guid Types/_entity/Guid
 * @includes Identity Types/_entity/Identity
 * @includes ICloneable Types/_entity/ICloneable
 * @includes IEquatable Types/_entity/IEquatable
 * @includes IInstantiable Types/_entity/IInstantiable
 * @includes IObject Types/_entity/IObject
 * @includes IObservableObject Types/_entity/IObservableObject
 * @includes IProducible Types/_entity/IProducible
 * @includes IVersionable Types/_entity/IVersionable
 * @includes Model Types/_entity/Model
 * @includes ReactiveObject Types/_entity/ReactiveObject
 * @includes Record Types/_entity/Record
 * @includes relation Types/_entity/relation
 * @includes Time Types/_entity/Time
 * @includes TimeInterval Types/_entity/TimeInterval
 * @includes JSONML Types/_entity/JSONML
 * @public
 * @author Мальцев А.А.
 */

import * as adapter from './_entity/adapter';
export {adapter};
export {
    default as CancelablePromise,
    PromiseCanceledError
} from './_entity/CancelablePromise';
export {default as CloneableMixin} from './_entity/CloneableMixin';
import * as compare from './_entity/compare';
export {compare};
export {default as Date} from './_entity/Date';
export {default as DateTime} from './_entity/DateTime';
export {default as descriptor, DescriptorValidator} from './_entity/descriptor';
export {default as DestroyableMixin} from './_entity/DestroyableMixin';
export {default as factory} from './_entity/factory';
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
export {default as Guid} from './_entity/Guid';
export {default as Identity} from './_entity/Identity';
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
export {default as ReactiveObject} from './_entity/ReactiveObject';
export {default as ReadWriteMixin, IOptions as IReadWriteMixinOptions} from './_entity/ReadWriteMixin';
export {default as Record, State as RecordState} from './_entity/Record';
import * as relation from './_entity/relation';
export {relation};
export {
    default as SerializableMixin,
    ISignature as ISerializableSignature,
    IState as ISerializableState
} from './_entity/SerializableMixin';
export {default as Time} from './_entity/Time';
export {default as TimeInterval} from './_entity/TimeInterval';
export {
    default as VersionableMixin,
    IOptions as IVersionableMixinOptions,
    VersionCallback as VersionableMixinVersionCallback
} from './_entity/VersionableMixin';
export {default as JSONML, IJSONML} from './_entity/JSONML';
