/**
 * @typedef {Function} Chained
 * @property {Function} required Функция проверки обязательности
 * @property {Function} oneOf Функция проверки по списку разрешенных значений
 * @property {Function} arrayOf Функция проверки массива на тип значений
 */

declare type Descriptor = string | Function;

type ValidateFunc = (value: any) => any;

interface IChained extends ValidateFunc {
   required?: IChained;
   oneOf?: IChained;
   not?: IChained;
   arrayOf?: IChained;
}

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
 * Returns validator for certain type.
 * @name Types/_entity/descriptor#validate
 * @param type Type descriptor
 * @returns Validator
 */
function validate(type: Descriptor): ValidateFunc {
   type = normalizeType(type);
   const typeName = typeof type;

   switch (typeName) {
      case 'string':
         return function validateTypeName(value: any): any {
            if (value === undefined || typeof value === type || value instanceof String) {
               return value;
            }
            return new TypeError(`Value "${value}" should be type of ${type}`);
         };

      case 'function':
         return function validateTypeInstance(value: any): any {
            if (value === undefined || value instanceof (type as Function)) {
               return value;
            }
            return new TypeError(`Value "${value}" should be instance of ${type}`);
         };

      case 'object':
         return function validateTypeInterface(value: any): any {
            if (value === undefined) {
               return value;
            }

            const mixins = value && value._mixins;
            if (mixins instanceof Array && mixins.indexOf(type) !== -1) {
               return value;
            }
            return new TypeError(`Value "${value}" should implement ${type}`);
         };
   }

   // tslint:disable-next-line:max-line-length
   throw new TypeError(`Argument "type" should be one of following types: string, function or object but "${typeName}" received.`);
}

/**
 * Returns validator for required value.
 * @name Types/_entity/descriptor#required
 * @returns Validator
 */
function required(): IChained {
   const prev: IChained = this;

   return chain(function isRequired(value: any): IChained | TypeError {
      if (value === undefined) {
         return new TypeError('Value is required');
      }
      return prev(value);
   });
}

/**
 * Returns validator for "One of" restriction.
 * @name Types/_entity/descriptor#oneOf
 * @param values Allowed values
 * @returns Validator
 */
function oneOf(values: any[]): IChained {
   if (!(values instanceof Array)) {
      throw new TypeError('Argument values should be an instance of Array');
   }

   const prev: IChained = this;

   return chain(function isOneOf(value: any): IChained | TypeError {
      if (value !== undefined && values.indexOf(value) === -1) {
         return new TypeError(`Invalid value ${value}`);
      }
      return prev(value);
   });
}

/**
 * Returns validator for "Not" restriction.
 * @param values Allowed values
 * @returns Validator
 */
function not(values: any[]): IChained {
   if (!(values instanceof Array)) {
      throw new TypeError('Argument values should be an instance of Array');
   }

   const prev: IChained = this;

   return chain(function isNot(value: any): IChained | TypeError {
      if (value !== undefined && values.indexOf(value) !== -1) {
         return new TypeError(`Invalid value ${value}`);
      }
      return prev(value);
   });
}

/**
 * Returns validator for Array<T> restriction.
 * @name Types/_entity/descriptor#oneOf
 * @param type Type descriptor
 * @returns Validator
 */
function arrayOf(type: Descriptor): IChained {
   const prev: IChained = this;
   const validator = validate(type);

   return chain(function isArrayOf(value: any): IChained | TypeError {
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

/**
 * Creates chain element with all available validators.
 * @name Types/_entity/descriptor#chain
 * @param parent Previous chain element
 * @returns New chain element
 */
function chain(parent: IChained): IChained {
   const wrapper = (...args) => {
      return parent.apply(this, args);
   };

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

   return wrapper as IChained;
}

/**
 * Creates type descriptor for given value type.
 * @function Types/_entity/descriptor
 * @param type Value type
 * @returns Type descriptor
 * @public
 * @author Мальцев А.А.
 */
export default function descriptor(type: Descriptor): IChained {
   return chain(
      validate(type)
   );
}
