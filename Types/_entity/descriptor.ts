type Descriptor = string | Function | null | object;

type ValidateFunc = <T>(
   props: T,
   propName: keyof T,
   componentName: string
) => Error | undefined;

interface IChained {
   required: RequiredValidator;
   oneOf: oneOfValidator;
   not: notValidator;
   arrayOf: arrayOfValidator;
}

export type DescriptorValidator = ValidateFunc & IChained;

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
 * Возвращает валидатор для составного типа, который должен подходить для одного из заданных простых типов.
 * @param types Составной тип дескриптора.
 */

/*
 * Returns validator for composite type which must be suitable for one of given simple types
 * @param types Composite type descriptor
 */
function validateComposite(...types: Descriptor[]): ValidateFunc {
   const validators = types.map((type) => validate(type));

   return function validateCompositeFor<T>(
      props: T,
      propName: keyof T,
      componentName: string
   ): Error | undefined {
      let hasSuitable = false;
      const errors: Error[] = [];

      for (let index = 0; index < validators.length; index++) {
         const validator = validators[index];
         const result = validator(props, propName, componentName);
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
   };
}

/**
 * Type guard для определения наличия миксинов в объекте
 * @param value
 */
function valueWithMixins(
   value: unknown
): value is {
   _mixins: unknown[];
} {
   return (
      typeof value === 'object' &&
      value !== null &&
      !!(value as {
         _mixins?: unknown[];
      })._mixins
   );
}

/**
 * Возвращает валидатор для определенного типа.
 * @param type Тип дескриптора.
 */

/*
 * Returns validator for certain type.
 * @param type Type descriptor
 */
function validate(type: Descriptor): ValidateFunc {
   type = normalizeType(type);
   const typeName = typeof type;

   if (type === null) {
      return function validateNull<T>(
         props: T,
         propName: keyof T
      ): Error | undefined {
         const value = props[propName];
         if (value === null) {
            return;
         }
         return new TypeError(`Value "${value}" should be null`);
      };
   }

   switch (typeName) {
      case 'string':
         return function validateTypeName<T>(
            props: T,
            propName: keyof T
         ): Error | undefined {
            const value = props[propName];
            if (
               value === undefined ||
               typeof value === type ||
               value instanceof String
            ) {
               return;
            }
            return new TypeError(`Value "${value}" should be type of ${type}`);
         };

      case 'function':
         return function validateTypeInstance<T>(
            props: T,
            propName: keyof T
         ): Error | undefined {
            const value = props[propName];
            if (value === undefined || value instanceof (type as Function)) {
               return;
            }
            return new TypeError(
               `Value "${value}" should be instance of ${type}`
            );
         };

      case 'object':
         return function validateTypeInterface<T>(
            props: T,
            propName: keyof T
         ): Error | undefined {
            const value = props[propName];
            if (value === undefined) {
               return;
            }

            const mixins = valueWithMixins(value) && value._mixins;
            if (mixins instanceof Array && mixins.indexOf(type) !== -1) {
               return;
            }
            return new TypeError(`Value "${value}" should implement ${type}`);
         };
   }

   throw new TypeError(
      `Argument "type" should be one of following types: string, function or object but "${typeName}" received.`
   );
}

/**
 * Возвращает валидатор для требуемого значения.
 * @function
 * @name Types/_entity/descriptor#required
 * @example
 * Определим необходимость ограничения:
 * <pre>
 * import {descriptor} from 'Types/entity';
 *
 * console.log(descriptor(Number).required()(1)); // 1
 * console.log(descriptor(Number).required()()); // TypeError
 * </pre>
 */

/*
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
function required(): DescriptorValidator {
   const prev: ValidateFunc = this;

   return chain(function isRequired<T>(
      props: T,
      propName: keyof T,
      componentName: string
   ): Error | undefined {
      const value = props[propName];
      if (value === undefined) {
         return new TypeError('Value is required');
      }
      return prev(props, propName, componentName);
   });
}

type RequiredValidator = () => DescriptorValidator;

/**
 * Возвращает валидатор для ограничения «Один из».
 * @function
 * @name Types/_entity/descriptor#oneOf
 * @param values Допустимые значения.
 * @example
 * Определим ограничение включения:
 * <pre>
 * import {descriptor} from 'Types/entity';
 *
 * console.log(descriptor(String).oneOf(['foo', 'bar'])('foo')); // 'foo'
 * console.log(descriptor(String).oneOf(['foo', 'bar'])('baz')); // TypeError
 * </pre>
 */

/*
 * Returns validator for "One of" restriction.
 * @function
 * @name Types/_entity/descriptor#oneOf
 * @param values Allowed values
 * @example
 * Define inclusion restriction:
 * <pre>
 * import {descriptor} from 'Types/entity';
 *
 * console.log(descriptor(String).oneOf(['foo', 'bar'])('foo')); // 'foo'
 * console.log(descriptor(String).oneOf(['foo', 'bar'])('baz')); // TypeError
 * </pre>
 */
function oneOf(values: unknown[]): DescriptorValidator {
   if (!(values instanceof Array)) {
      throw new TypeError('Argument values should be an instance of Array');
   }

   const prev: ValidateFunc = this;

   return chain(function isOneOf<T>(
      props: T,
      propName: keyof T,
      componentName: string
   ): Error | undefined {
      const value = props[propName];
      if (value !== undefined && values.indexOf(value) === -1) {
         return new TypeError(`Invalid value ${value}`);
      }
      return prev(props, propName, componentName);
   });
}

type oneOfValidator = (values: unknown[]) => DescriptorValidator;

/**
 * Возвращает валидатор для ограничения «Не».
 * @function
 * @name Types/_entity/descriptor#not
 * @param values Допустимые значения.
 * @example
 * Определим ограничение исключения:
 * <pre>
 * import {descriptor} from 'Types/entity';
 *
 * console.log(descriptor(String).not('foo', 'bar')('baz')); // 'baz'
 * console.log(descriptor(String).not('foo', 'bar')('bar')); // TypeError
 * </pre>
 */

/*
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
function not(values: unknown[]): DescriptorValidator {
   if (!(values instanceof Array)) {
      throw new TypeError('Argument values should be an instance of Array');
   }

   const prev: ValidateFunc = this;

   return chain(function isNot<T>(
      props: T,
      propName: keyof T,
      componentName: string
   ): Error | undefined {
      const value = props[propName];
      if (value !== undefined && values.indexOf(value) !== -1) {
         return new TypeError(`Invalid value ${value}`);
      }
      return prev(props, propName, componentName);
   });
}

type notValidator = (values: unknown[]) => DescriptorValidator;

/**
 * Возвращает валидатор для ограничения Array.
 * @function
 * @name Types/_entity/descriptor#arrayOf
 * @param type Тип дескриптора.
 * @example
 * Определите тип ограничения для массива:
 * <pre>
 * import {descriptor} from 'Types/entity';
 *
 * console.log(descriptor(Array).arrayOf(Boolean)([true])); // [true]
 * console.log(descriptor(Array).arrayOf(Boolean)([0])); // TypeError
 * </pre>
 */

/*
 * Returns validator for Array restriction.
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
function arrayOf(type: Descriptor): DescriptorValidator {
   const prev: ValidateFunc = this;
   const validator = validate(type);

   return chain(function isArrayOf<T>(
      props: T,
      propName: keyof T,
      componentName: string
   ): Error | undefined {
      const value = props[propName];
      if (value !== undefined) {
         if (!(value instanceof Array)) {
            return new TypeError(`'Value "${value}" is not an Array`);
         }
         let valid;
         for (let i = 0; i < value.length; i++) {
            valid = validator(value, i, componentName);
            if (valid instanceof Error) {
               return valid;
            }
         }
      }

      return prev(props, propName, componentName);
   });
}

type arrayOfValidator = (type: Descriptor) => DescriptorValidator;

/**
 * Создает элемент цепочки со всеми доступными валидаторами.
 * @param parent Предыдущий элемент цепи.
 */

/*
 * Creates chain element with all available validators.
 * @param parent Previous chain element
 */
function chain(parent: ValidateFunc): DescriptorValidator {
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

   return wrapper as DescriptorValidator;
}

/**
 * Создает дескриптор, который проверяет данный тип значения.
 * @remark
 * Вы можете установить:
 * - тип ограничения:
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
 * - необходимость ограничения:
 * <pre>
 * import {descriptor} from 'Types/entity';
 *
 * console.log(descriptor(Number).required()(1)); // 1
 * console.log(descriptor(Number).required()()); // TypeError
 * </pre>
 *
 * - включение ограничения:
 * <pre>
 * import {descriptor} from 'Types/entity';
 *
 * console.log(descriptor(String).oneOf('foo', 'bar')('foo')); // 'foo'
 * console.log(descriptor(String).oneOf('foo', 'bar')('baz')); // TypeError
 * </pre>
 *
 * - исключение ограничения:
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
 * - связанное ограничение:
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

/*
 * Creates type descriptor which checks given value type.
 * @remark
 * You can set:
 * - type restriction:
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
// FIXME: бесполезное T, но если его просто убрать, то попадают сборки
export default function descriptor<T>(
   ...types: Descriptor[]
): DescriptorValidator {
   if (types.length === 0) {
      throw new TypeError('You should specify one type descriptor at least');
   }

   return chain(
      types.length > 1 ? validateComposite(...types) : validate(types[0])
   );
}
