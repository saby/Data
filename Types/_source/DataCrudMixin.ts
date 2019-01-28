/// <amd-module name="Types/_source/DataCrudMixin" />
/**
 * Миксин, совместно с DataMixin дающий возможность обобщить логику вызова CRUD.
 * @mixin Types/_source/DataCrudMixin
 * @public
 * @author Мальцев А.А.
 */

import DataSet from './DataSet';
import {Model} from '../entity';

const DataCrudMixin = /** @lends Types/_source/DataCrudMixin.prototype */{
   '[Types/_source/DataCrudMixin]': true,

   _prepareCreateResult(data): Model {
      return this._getModelInstance(data);
   },

   _prepareReadResult(data): Model {
      return this._getModelInstance(data);
   },

   _prepareUpdateResult(data, keys) {
      let idProperty = this.getIdProperty();
      let callback = (record, key) => {
         if (key &&
            idProperty &&
            !record.get(idProperty)
         ) {
            record.set(idProperty, key);
         }
         record.acceptChanges();
      };

      if (data && data['[Types/_collection/IList]']) {
         data.each((record, i) => {
            callback(record, keys ? keys[i] : undefined);
         });
      } else {
         callback(data, keys);
      }
      return keys;
   },

   _prepareQueryResult(data: any): DataSet {
      return this._wrapToDataSet(data);
   }
};

export default DataCrudMixin;
