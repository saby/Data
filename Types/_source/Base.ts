/// <amd-module name="Types/_source/Base" />
/**
 * Базовый источник данных.
 * Это абстрактный класс, не предназначенный для создания самостоятельных экземпляров.
 * @class Types/_source/Base
 * @mixes Types/_entity/DestroyableMixin
 * @implements Types/_source/IData
 * @mixes Types/_entity/OptionsMixin
 * @mixes Types/_entity/SerializableMixin
 * @mixes Types/_source/OptionsMixin
 * @mixes Types/_source/LazyMixin
 * @mixes Types/_source/DataMixin
 * @ignoreOptions options.writable
 * @public
 * @author Мальцев А.А.
 */

import IData from './IData';
import SourceOptionsMixin, {IOptions as IDefaultOptions} from './OptionsMixin';
import LazyMixin from './LazyMixin';
import DataMixin, {IOptions as IDataOptions} from './DataMixin';
import {DestroyableMixin, OptionsToPropertyMixin, SerializableMixin, adapter} from '../entity';
import {logger, mixin} from '../util';

export interface IOptions extends IDefaultOptions, IDataOptions {
}

export default abstract class Base extends mixin(
   DestroyableMixin, OptionsToPropertyMixin, SerializableMixin, SourceOptionsMixin, LazyMixin, DataMixin
) implements IData /** @lends Types/_source/Base.prototype */{
   protected constructor(options?: IOptions) {
      options = Object.assign({}, options || {});

      super(options);
      SourceOptionsMixin.constructor.call(this, options);
      OptionsToPropertyMixin.call(this, options);
      SerializableMixin.constructor.call(this);
      DataMixin.constructor.call(this, options);
   }

   // region IData

   readonly '[Types/_source/IData]': boolean;

   getAdapter: () => adapter.IAdapter;
   getIdProperty: () => string;
   setIdProperty: (name: string) => void;
   getModel: () => Function | string;
   setModel: (model: Function) => void;
   getListModule: () => Function | string;
   setListModule: (listModule: Function | string) => void;

   // endregion
   /**
    * @deprecated
    */
   static extend(mixinsList:any, classExtender:any) {
      logger.info('Types/_source/Base', 'Method extend is deprecated, use ES6 extends or Core/core-extend');

      if (!require.defined('Core/core-extend')) {
         throw new ReferenceError(
            'You should require module "Core/core-extend" to use old-fashioned "Types/_source/Base::extend()" method.'
         );
      }
      const coreExtend = require('Core/core-extend');
      return coreExtend(this, mixinsList, classExtender);
   }
}

Object.assign(Base.prototype, {
   '[Types/_source/Base]': true,
   '[Types/_source/IData]': true,
   _moduleName: 'Types/source:Base'
});
