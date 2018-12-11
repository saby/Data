/* global define, beforeEach, afterEach, describe, it, assert */
define([
   'Types/source'
], function(
   source
) {
   'use strict';

   var QueryJoin = source.QueryExt.Join;

   describe('Types/Query/Join', function() {
      var select,
         on,
         as,
         resource,
         inner,
         join;

      beforeEach(function() {
         select = {id: 'id', name: 'name'};
         on = {id: 'productId'};
         as = 'prod';
         resource = 'product';
         inner = true;
         join = new QueryJoin({
            resource: resource,
            as: as,
            on: on,
            select: select,
            inner: inner
         });
      });

      afterEach(function() {
         select = undefined;
         on = undefined;
         as = undefined;
         resource = undefined;
         inner = undefined;
         join = undefined;
      });

      describe('.getResource', function() {
         it('should return resource', function() {
            assert.equal(join.getResource(), resource);
         });
      });
      describe('.getAs', function() {
         it('should return as', function() {
            assert.equal(join.getAs(), as);
         });
      });
      describe('.getOn', function() {
         it('should return on', function() {
            assert.deepEqual(join.getOn(), on);
         });
      });
      describe('.getSelect', function() {
         it('should return select', function() {
            assert.deepEqual(join.getSelect(), select);
         });
      });
      describe('.isInner', function() {
         it('should return inner', function() {
            assert.equal(join.isInner(), inner);
         });
      });
   });
});
