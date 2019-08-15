import {IHashMap} from '../_declarations';

type Descriptor = string | Function;

type ValidationResult<T> = T | TypeError;
type ValidateFunc<T> = (value: T) => ValidationResult<T>;

interface IChained<T> {
   required?: RequiredValidator<T>;
   oneOf?: oneOfValidator<T>;
   not?: notValidator<T>;
   arrayOf?: arrayOfValidator<T>;
}

type ChainedValidator<T> = ValidateFunc<T> & IChained<T>;

/**
 * Normalizes type name.
 */
function normalizeType(type: Descriptor): Descriptor {
   if (typeof type === 'function') {
      switch (type) {
         case Boolean:
            type = 'boolean';
            break;
         case Number:
            type = 'number';
            break;
         case String:
            type = 'string';
            break;
      }
   }
   return type;
}

/**
 * Returns validator for composite type which must be suitable for one of given simple types
 * @param types Composite type descriptor
 */
function validateComposite<T>(...types: Descriptor[]): ValidateFunc<T> {
   const validators = types.map((type) => validate(type));

   return function validateCompoisiteFor(value: T): ValidationResult<T> {
      let hasSuitable = false;
      const errors = [];

      for (let index = 0; index < validators.length; index++) {
         const validator = validators[index];
         const result = validator(value);
         if (result instanceof Error) {
            errors.push(result);
         } else {
            hasSuitable = true;
            break;
         }
      }

      if (!hasSuitable) {
         return new TypeError(
            'There are following restrictions for composite type: ' +
            errors.map((err) => `"${err.message}"`).join(' or ')
         );
      }

      return value;
   };
}

/**
 * Returns validator for certain type.
 * @param type Type descriptor
 */
function validate<T>(type: Descriptor): ValidateFunc<T> {
   type = normalizeType(type);
   const typeName = typeof type;

   switch (type) {
      case null:
         return function validateNull(value: T): ValidationResult<T> {
            if (value === null) {
               return value;
            }
            return new TypeError(`Value "${value}" should be null`);
         };
   }

   switch (typeName) {
      case 'string':
         return function validateTypeName(value: T): ValidationResult<T> {
            if (value === undefined || typeof value === type || value instanceof String) {
               return value;
            }
            return new TypeError(`Value "${value}" should be type of ${type}`);
         };

      case 'function':
         return function validateTypeInstance(value: T): ValidationResult<T> {
            if (value === undefined || value instanceof (type as Function)) {
               return value;
            }
            return new TypeError(`Value "${value}" should be instance of ${type}`);
         };

      case 'object':
         return function validateTypeInterface(value: T): ValidationResult<T> {
            if (value === undefined) {
               return value;
            }

            const mixins = value && (value as IHashMap<any>)._mixins;
            if (mixins instanceof Array && mixins.indexOf(type) !== -1) {
               return value;
            }
            return new TypeError(`Value "${value}" should implement ${type}`);
         };
   }

   throw new TypeError(
       `Argument "type" should be one of following types: string, function or object but "${typeName}" received.`
   );
}

/**
 * Returns validator for required value.
 * @function
 * @name Types/_entity/descriptor#required
 * @example
 * Define necessity restriction:
 * <pre>
 * import {descriptor} from 'Types/entity';
 *
 * console.log(descriptor(Number).required()(1)); // 1
 * console.log(descriptor(Number).required()()); // TypeError
 * </pre>
 */
function required<T>(): ChainedValidator<T> {
   const prev: ValidateFunc<T> = this;

   return chain(function isRequired(value: T): ValidationResult<T> {
      if (value === undefined) {
         return new TypeError('Value is required');
      }
      return prev(value);
   });
}

type RequiredValidator<T> = () => ChainedValidator<T>;

/**
 * Returns validator for "One of" restriction.
 * @function
 * @name Types/_entity/descriptor#oneOf
 * @param values Allowed values
 * @example
 * Define inclusion restriction:
 * <pre>
 * import {descriptor} from 'Types/entity';
 *
 * console.log(descriptor(String).oneOf('foo', 'bar')('foo')); // 'foo'
 * console.log(descriptor(String).oneOf('foo', 'bar')('baz')); // TypeError
 * </pre>
 */
function oneOf<T>(values: T[]): ChainedValidator<T> {
   if (!(values instanceof Array)) {
      throw new TypeError('Argument values should be an instance of Array');
   }

   const prev: ValidateFunc<T> = this;

   return chain(function isOneOf(value: T): ValidationResult<T> {
      if (value !== undefined && values.indexOf(value) === -1) {
         return new TypeError(`Invalid value ${value}`);
      }
      return prev(value);
   });
}

type oneOfValidator<T> = (values: T[]) => ChainedValidator<T>;

/**
 * Returns validator for "Not" restriction.
 * @function
 * @name Types/_entity/descriptor#not
 * @param values Allowed values
 * @example
 * Define exclusion restriction:
 * <pre>
 * import {descriptor} from 'Types/entity';
 *
 * console.log(descriptor(String).not('foo', 'bar')('baz')); // 'baz'
 * console.log(descriptor(String).not('foo', 'bar')('bar')); // TypeError
 * </pre>
 */
function not<T>(values: T[]): ChainedValidator<T> {
   if (!(values instanceof Array)) {
      throw new TypeError('Argument values should be an instance of Array');
   }

   const prev: ValidateFunc<T> = this;

   return chain(function isNot(value: T): ValidationResult<T> {
      if (value !== undefined && values.indexOf(value) !== -1) {
         return new TypeError(`Invalid value ${value}`);
      }
      return prev(value);
   });
}

type notValidator<T> = (values: T[]) => ChainedValidator<T>;

/**
 * Returns validator for Array<T> restriction.
 * @function
 * @name Types/_entity/descriptor#arrayOf
 * @param type Type descriptor
 * @example
 * Define kind restriction for array:
 * <pre>
 * import {descriptor} from 'Types/entity';
 *
 * console.log(descriptor(Array).arrayOf(Boolean)([true])); // [true]
 * console.log(descriptor(Array).arrayOf(Boolean)([0])); // TypeError
 * </pre>
 */
function arrayOf<T>(type: Descriptor): ChainedValidator<T> {
   const prev: ValidateFunc<T> = this;
   const validator = validate(type);

   return chain(function isArrayOf(value: T): ValidationResult<T> {
      if (value !== undefined) {
         if (!(value instanceof Array)) {
            return new TypeError(`'Value "${value}" is not an Array`);
         }
         let valid;
         for (let i = 0; i < value.length; i++) {
            valid = validator(value[i]);
            if (valid instanceof Error) {
               return valid;
            }
         }
      }

      return prev(value);
   });
}

type arrayOfValidator<T> = (type: Descriptor) => ChainedValidator<T>;

/**
 * Creates chain element with all available validators.
 * @param parent Previous chain element
 */
function chain<T>(parent: ValidateFunc<T>): ChainedValidator<T> {
   const wrapper = (...args) => parent.apply(this, args);

   Object.defineProperties(wrapper, {
      required: {
         enumerable: true,
         value: required
      },
      oneOf: {
         enumerable: true,
         value: oneOf
      },
      not: {
         enumerable: true,
         value: not
      },
      arrayOf: {
         enumerable: true,
         value: arrayOf
      }
   });

   return wrapper as ChainedValidator<T>;
}

/**
 * Creates type descriptor which checks given value type.
 *
 * You can set the type restriction:
 * <pre>
 * import {descriptor} from 'Types/entity';
 *
 * console.log(descriptor(Number)(0)); // 0
 * console.log(descriptor(Number)('0')); // TypeError
 *
 * console.log(descriptor(Number, null)(0)); // 0
 * console.log(descriptor(Number, null)(null)); // null
 * console.log(descriptor(Number, null)('0')); // TypeError
 *
 * console.log(descriptor(Number, String)(0)); // 0
 * console.log(descriptor(Number, String)('0')); // '0'
 * console.log(descriptor(Number, String)(true)); // TypeError
 * </pre>
 *
 * - necessity restriction:
 * <pre>
 * import {descriptor} from 'Types/entity';
 *
 * console.log(descriptor(Number).required()(1)); // 1
 * console.log(descriptor(Number).required()()); // TypeError
 * </pre>
 *
 * - inclusion restriction:
 * <pre>
 * import {descriptor} from 'Types/entity';
 *
 * console.log(descriptor(String).oneOf('foo', 'bar')('foo')); // 'foo'
 * console.log(descriptor(String).oneOf('foo', 'bar')('baz')); // TypeError
 * </pre>
 *
 * - exclusion restriction:
 * <pre>
 * import {descriptor} from 'Types/entity';
 *
 * console.log(descriptor(String).not('foo', 'bar')('baz')); // 'baz'
 * console.log(descriptor(String).not('foo', 'bar')('bar')); // TypeError
 * </pre>
 *
 * - kind restriction for array:
 * <pre>
 * import {descriptor} from 'Types/entity';
 *
 * console.log(descriptor(Array).arrayOf(Boolean)([true])); // [true]
 * console.log(descriptor(Array).arrayOf(Boolean)([0])); // TypeError
 * </pre>
 *
 * - chained restriction:
 * <pre>
 * import {descriptor} from 'Types/entity';
 *
 * console.log(descriptor(Number).required().not(666)(0)); // 0
 * console.log(descriptor(Number).required().not(666)(666)); // TypeError
 * </pre>
 * @class Types/_entity/descriptor
 * @param types Desirable value types
 * @public
 * @author Мальцев А.А.
 */
export default function descriptor<T = any>(...types: Descriptor[]): ChainedValidator<T> {
   if (types.length === 0) {
      throw new TypeError('You should specify one type descriptor at least');
   }

   return chain(
      types.length > 1 ? validateComposite<T>(...types) : validate<T>(types[0])
   );
}
