/* global define, describe, it, assert */
define([
   'Types/_entity/InstantiableMixin',
   'Core/constants'
], function(
   InstantiableMixin,
   constants
) {
   'use strict';

   InstantiableMixin = InstantiableMixin.default;

   describe('Types/_entity/InstantiableMixin', function() {
      describe('.getInstanceId()', function() {
         it('should return various prefix on client and server', function() {
            var id = InstantiableMixin.getInstanceId();
            if (constants.isBrowserPlatform) {
               assert.isTrue(id.startsWith('client-id-'));
            } else {
               assert.isTrue(id.startsWith('server-id-'));
            }
         });
      });
   });
});
