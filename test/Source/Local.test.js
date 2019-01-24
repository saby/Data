/* global define, describe, context, beforeEach, afterEach, it, assert */
define([
   'Types/_source/Local',
   'Types/_entity/adapter/JsonTable'
], function(
   Local,
   JsonTable
) {
   'use strict';

   Local = Local.default;
   JsonTable = JsonTable.default;

   describe('Types/_source/Local', function() {
      var source;
      var adapterResolver = Local.prototype._getTableAdapter;

      beforeEach(function() {
         Local.prototype._getTableAdapter = function() {
            return new JsonTable();
         };
         source = new Local();
      });

      afterEach(function() {
         Local.prototype._getTableAdapter = adapterResolver;
         source = undefined;
      });

      describe('.create()', function() {
         it('should generate a request with Date field', function(done) {
            var date = new Date();
            if (!date.setSQLSerializationMode) {
               done();
            }

            date.setSQLSerializationMode(Date.SQL_SERIALIZE_MODE_DATE);
            var meta = {foo: date};
            source.create(meta).addCallbacks(function(data) {
               try {
                  assert.instanceOf(data.get('foo'), Date);
                  assert.strictEqual(data.get('foo').getSQLSerializationMode(), Date.SQL_SERIALIZE_MODE_DATE);
                  done();
               } catch (err) {
                  done(err);
               }
            }, function(err) {
               done(err);
            });
         });

         it('should generate a request with Time field', function(done) {
            var date = new Date();
            if (!date.setSQLSerializationMode) {
               done();
            }

            date.setSQLSerializationMode(Date.SQL_SERIALIZE_MODE_TIME);
            var meta = {foo: date};
            source.create(meta).addCallbacks(function(data) {
               try {
                  assert.instanceOf(data.get('foo'), Date);
                  assert.strictEqual(data.get('foo').getSQLSerializationMode(), Date.SQL_SERIALIZE_MODE_TIME);
                  done();
               } catch (err) {
                  done(err);
               }
            }, function(err) {
               done(err);
            });
         });
      });
   });
});
