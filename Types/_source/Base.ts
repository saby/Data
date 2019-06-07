import IData from './IData';
import OptionsMixin, {IOptions as IOptionsOptions} from './OptionsMixin';
import LazyMixin from './LazyMixin';
import DataMixin, {IOptions as IDataOptions} from './DataMixin';
import {DestroyableMixin, OptionsToPropertyMixin, SerializableMixin} from '../entity';
import {deprecateExtend, logger, mixin} from '../util';

export interface IOptions extends IDataOptions, IOptionsOptions {
}

/**
 * Базовый источник данных.
 * @remark
 * Это абстрактный класс, не предназначенный для создания самостоятельных экземпляров.
 * @class Types/_source/Base
 * @mixes Types/_entity/DestroyableMixin
 * @implements Types/_source/IData
 * @mixes Types/_entity/OptionsToPropertyMixin
 * @mixes Types/_entity/SerializableMixin
 * @mixes Types/_source/OptionsMixin
 * @mixes Types/_source/LazyMixin
 * @mixes Types/_source/DataMixin
 * @ignoreOptions options.writable
 * @public
 * @author Мальцев А.А.
 */
export default abstract class Base extends mixin<
   OptionsToPropertyMixin,
   SerializableMixin,
   OptionsMixin,
   LazyMixin,
   DataMixin
>(
   OptionsToPropertyMixin,
   SerializableMixin,
   OptionsMixin,
   LazyMixin,
   DataMixin
) implements IData {
   protected constructor(options?: IOptions) {
      options = {...(options || {})};

      super(options);
      OptionsToPropertyMixin.call(this, options);
      SerializableMixin.call(this);
      DataMixin.call(this, options);
   }

   /**
    * @deprecated
    */
   static extend(mixinsList: any, classExtender: any): Function {
       return deprecateExtend(
           this,
           classExtender,
           mixinsList,
           'Types/_source/Base'
       );
   }
}

Object.assign(Base.prototype, {
   '[Types/_source/Base]': true,
   _moduleName: 'Types/source:Base'
});
