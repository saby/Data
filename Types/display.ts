/// <amd-module name="Types/display" />
/**
 * Library that provides various views over collections
 * @library Types/display
 * @includes DestroyableMixin Types/_display/DestroyableMixin
 * @includes Collection Types/_display/Collection
 * @includes Enum Types/_display/Enum
 * @includes Flags Types/_display/Flags
 * @includes Ladder Types/_display/Ladder
 * @includes Search Types/_display/Search
 * @includes Tree Types/_display/Tree
 * @author Мальцев А.А.
 */

/**
 * Library that provides various views over collections
 * @class
 * @name Types/display
 * @public
 * @author Мальцев А.А.
 */

/**
 * Класс {@link Types/_display/Collection}.
 * @class
 * @name Types/display:Collection
 * @public
 */

/**
 * Класс {@link Types/_display/Enum}.
 * @class
 * @name Types/display:Enum
 * @public
 */

/**
 * Класс {@link Types/_display/Flags}.
 * @class
 * @name Types/display:Flags
 * @public
 */

/**
 * Класс {@link Types/_display/Ladder}.
 * @class
 * @name Types/display:Ladder
 * @public
 */

/**
 * Класс {@link Types/_display/Tree}.
 * @class
 * @name Types/display:Tree
 * @public
 */

export {default as Abstract} from './_display/Abstract';
export {default as Collection} from './_display/Collection';
export {default as CollectionItem} from './_display/CollectionItem';
export {default as Enum} from './_display/Enum';
export {default as Flags} from './_display/Flags';
export {default as FlagsItem} from './_display/FlagsItem';
export {default as GroupItem} from './_display/GroupItem';
import * as itemsStrategy from './_display/itemsStrategy';
export {itemsStrategy};
export {default as Ladder} from './_display/Ladder';
export {default as Search} from './_display/Search';
export {default as Tree} from './_display/Tree';
export {default as TreeItem} from './_display/TreeItem';
