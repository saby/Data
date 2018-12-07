/// <amd-module name="Types/_source/Base" />
/**
 * Базовый источник данных.
 * Это абстрактный класс, не предназначенный для создания самостоятельных экземпляров.
 * @class Types/Source/Base
 * @mixes Types/Entity/DestroyableMixin
 * @implements Types/Source/IData
 * @mixes Types/Entity/OptionsMixin
 * @mixes Types/Entity/SerializableMixin
 * @mixes Types/Source/OptionsMixin
 * @mixes Types/Source/LazyMixin
 * @mixes Types/Source/DataMixin
 * @ignoreOptions options.writable
 * @public
 * @author Мальцев А.А.
 */

import IData from './IData';
import SourceOptionsMixin, {IOptions as IDefaultOptions} from './OptionsMixin';
import LazyMixin from './LazyMixin';
import DataMixin, {IOptions as IDataOptions} from './DataMixin';
import {DestroyableMixin, OptionsToPropertyMixin, SerializableMixin, adapter} from '../entity';
import {mixin} from '../util';

export interface IOptions extends IDefaultOptions, IDataOptions {
}

export default abstract class Base extends mixin(
   DestroyableMixin, OptionsToPropertyMixin, SerializableMixin, SourceOptionsMixin, LazyMixin, DataMixin
) implements IData /** @lends Types/Source/Base.prototype */{
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
}

Base.prototype._moduleName = 'Types/source:Base';
Base.prototype['[Types/_source/Base]'] = true;
// @ts-ignore
Base.prototype['[Types/_source/IData]'] = true;
