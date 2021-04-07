/**
 * Библиотека отношений.
 * @library Types/_entity/relation
 * @includes Hierarchy Types/_entity/relation/Hierarchy
 * @includes IReceiver Types/_entity/relation/IReceiver
 * @author Кудрявцев И.С.
 */

/*
 * Relations library.
 * @library Types/_entity/relation
 * @includes Hierarchy Types/_entity/relation/Hierarchy
 * @includes IReceiver Types/_entity/relation/IReceiver
 * @author Кудрявцев И.С.
 */

export {default as Hierarchy} from './relation/Hierarchy';
export {default as IReceiver} from './relation/IReceiver';
export {ClearType as ManyToManyClearType} from './relation/ManyToMany';
