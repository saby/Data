/* global define, describe, it, assert */
define([
   'Types/_entity/format',
   'Types/_collection/RecordSet',
   'Types/_entity/Record',
   'Types/_collection/Enum',
   'Types/_collection/Flags'
], function(
   format,
   RecordSet,
   Record,
   Enum,
   Flags
) {
   'use strict';

   var fieldsFactory = format.fieldsFactory;
   RecordSet = RecordSet.default;
   Record = Record.default;
   Enum = Enum.default;
   Flags = Flags.default;

   describe('Types/Format/FieldsFactory', function() {
      it('should throw an error if not simple object passed', function() {
         assert.throws(function() {
            fieldsFactory();
         });
         assert.throws(function() {
            fieldsFactory(null);
         });
         assert.throws(function() {
            fieldsFactory(false);
         });
         assert.throws(function() {
            fieldsFactory(true);
         });
         assert.throws(function() {
            fieldsFactory(0);
         });
         assert.throws(function() {
            fieldsFactory(1);
         });
         assert.throws(function() {
            fieldsFactory('');
         });
         assert.throws(function() {
            fieldsFactory([]);
         });
      });
      it('should throw an error for unknown type', function() {
         assert.throws(function() {
            fieldsFactory({
               type: 'a'
            });
         });
      });
      it('should create boolean', function() {
         var field = fieldsFactory({
            type: 'boolean'
         });
         assert.instanceOf(field, format.BooleanField);
      });
      it('should create integer', function() {
         var field = fieldsFactory({
            type: 'integer'
         });
         assert.instanceOf(field, format.IntegerField);
      });
      it('should create real from string', function() {
         var field = fieldsFactory({
            type: 'real'
         });
         assert.instanceOf(field, format.RealField);
      });
      it('should create real from constructor', function() {
         var field = fieldsFactory({
            type: Number
         });
         assert.instanceOf(field, format.RealField);
      });
      it('should create money', function() {
         var field = fieldsFactory({
            type: 'money'
         });
         assert.instanceOf(field, format.MoneyField);
      });
      it('should create string from string', function() {
         var field = fieldsFactory({
            type: 'string'
         });
         assert.instanceOf(field, format.StringField);
      });
      it('should create string from constructor', function() {
         var field = fieldsFactory({
            type: String
         });
         assert.instanceOf(field, format.StringField);
      });
      it('should create deprecated text as string', function() {
         var field = fieldsFactory({
            type: 'text'
         });
         assert.instanceOf(field, format.StringField);
      });
      it('should create xml', function() {
         var field = fieldsFactory({
            type: 'xml'
         });
         assert.instanceOf(field, format.XmlField);
      });
      it('should create datetime', function() {
         var field = fieldsFactory({
            type: 'datetime'
         });
         assert.instanceOf(field, format.DateTimeField);
      });
      it('should create date from string', function() {
         var field = fieldsFactory({
            type: 'date'
         });
         assert.instanceOf(field, format.DateField);
      });
      it('should create date from constructor', function() {
         var field = fieldsFactory({
            type: Date
         });
         assert.instanceOf(field, format.DateField);
      });
      it('should create time', function() {
         var field = fieldsFactory({
            type: 'time'
         });
         assert.instanceOf(field, format.TimeField);
      });
      it('should create timeinterval', function() {
         var field = fieldsFactory({
            type: 'timeinterval'
         });
         assert.instanceOf(field, format.TimeIntervalField);
      });
      it('should create link', function() {
         var field = fieldsFactory({
            type: 'link'
         });
         assert.instanceOf(field, format.LinkField);
      });
      it('should create identity', function() {
         var field = fieldsFactory({
            type: 'identity'
         });
         assert.instanceOf(field, format.IdentityField);
      });
      it('should create enum from string', function() {
         var field = fieldsFactory({
            type: 'enum'
         });
         assert.instanceOf(field, format.EnumField);
      });
      it('should create enum from constructor', function() {
         var field = fieldsFactory({
            type: Enum
         });
         assert.instanceOf(field, format.EnumField);
      });
      it('should create enum from alias', function() {
         var field = fieldsFactory({
            type: 'Types/collection:Enum'
         });
         assert.instanceOf(field, format.EnumField);
      });
      it('should create flags from string', function() {
         var field = fieldsFactory({
            type: 'flags'
         });
         assert.instanceOf(field, format.FlagsField);
      });
      it('should create flags from constructor', function() {
         var field = fieldsFactory({
            type: Flags
         });
         assert.instanceOf(field, format.FlagsField);
      });
      it('should create record from string', function() {
         var field = fieldsFactory({
            type: 'record'
         });
         assert.instanceOf(field, format.RecordField);
      });
      it('should create record from constructor', function() {
         var field = fieldsFactory({
            type: Record
         });
         assert.instanceOf(field, format.RecordField);
      });
      it('should create recordset from string', function() {
         var field = fieldsFactory({
            type: 'recordset'
         });
         assert.instanceOf(field, format.RecordSetField);
      });
      it('should create recordset from constructor', function() {
         var field = fieldsFactory({
            type: RecordSet
         });
         assert.instanceOf(field, format.RecordSetField);
      });
      it('should create binary', function() {
         var field = fieldsFactory({
            type: 'binary'
         });
         assert.instanceOf(field, format.BinaryField);
      });
      it('should create uuid', function() {
         var field = fieldsFactory({
            type: 'uuid'
         });
         assert.instanceOf(field, format.UuidField);
      });
      it('should create rpcfile', function() {
         var field = fieldsFactory({
            type: 'rpcfile'
         });
         assert.instanceOf(field, format.RpcFileField);
      });
      it('should create deprecated hierarchy as identity', function() {
         var field = fieldsFactory({
            type: 'hierarchy'
         });
         assert.instanceOf(field, format.IdentityField);
      });
      it('should create object from string', function() {
         var field = fieldsFactory({
            type: 'object'
         });
         assert.instanceOf(field, format.ObjectField);
      });
      it('should create object from constructor', function() {
         var field = fieldsFactory({
            type: Object
         });
         assert.instanceOf(field, format.ObjectField);
      });
      it('should create array from string', function() {
         var field = fieldsFactory({
            type: 'array'
         });
         assert.instanceOf(field, format.ArrayField);
      });
      it('should create array from constructor', function() {
         var field = fieldsFactory({
            type: Array
         });
         assert.instanceOf(field, format.ArrayField);
      });
   });
});
