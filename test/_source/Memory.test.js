/* global beforeEach, afterEach, describe, context, assert, it */
define([
   'Types/_source/Memory',
   'Types/_source/DataSet',
   'Types/_source/Query',
   'Types/_entity/Model',
   'Types/_collection/List',
   'Types/_collection/RecordSet',
   'Types/_entity/adapter/Sbis',
   'Core/core-extend'
], function(
   MemorySource,
   DataSet,
   Query,
   Model,
   List,
   RecordSet,
   SbisAdapter,
   coreExtend
) {
   'use strict';

   MemorySource = MemorySource.default;
   DataSet = DataSet.default;
   Query = Query.default;
   Model = Model.default;
   List = List.default;
   RecordSet = RecordSet.default;
   SbisAdapter = SbisAdapter.default;

   describe('Types/_source/Memory', function() {
      var existsId = 5,
         existsIdIndex = 6,
         existsId2 = 6,
         notExistsId = 33,
         data,
         source;

      beforeEach(function() {
         data = [{
            'Id': 6,
            'Order': 3,
            'ParentId': [null],
            'LastName': 'Иванов',
            'FirstName': 'Иван',
            'MiddleName': 'Иванович',
            'Position': 'Инженер'
         }, {
            'Id': 4,
            'Order': 1,
            'ParentId': [null],
            'LastName': 'Петров',
            'FirstName': 'Федор',
            'MiddleName': 'Иванович',
            'Position': 'Директор'
         }, {
            'Order': null
         }, {
            'Id': 7,
            'Order': 6,
            'ParentId': [6],
            'LastName': 'Аксенова',
            'FirstName': 'Федора',
            'MiddleName': 'Сергеевна',
            'Position': 'Инженер'
         }, {
            'Id': 2,
            'Order': 0,
            'ParentId': [4],
            'LastName': 'Афанасьев',
            'FirstName': 'Иван',
            'MiddleName': 'Андреевич',
            'Position': 'Директор'
         }, {
            'Id': null
         }, {
            'Id': 5,
            'Order': 4,
            'ParentId': [null],
            'LastName': 'Баранов',
            'FirstName': 'Иванко',
            'MiddleName': 'Петрович',
            'Position': 'Карапуз'
         }, {
            'Id': 1,
            'Order': 5,
            'ParentId': [null],
            'LastName': 'Годолцов',
            'FirstName': 'Иван',
            'MiddleName': 'Викторович',
            'Position': 'Директор'
         }, {
            'Id': 3,
            'Order': 3,
            'ParentId': [6],
            'LastName': 'Иванов',
            'FirstName': 'Ян',
            'MiddleName': 'Яковлевич',
            'Position': 'Маркетолог'
         }];

         source = new MemorySource({
            data: data,
            keyProperty: 'Id'
         });
      });

      afterEach(function() {
         data = undefined;
         source = undefined;
      });

      describe('.data', function() {
         it('should return data passed to constructor', function() {
            assert.strictEqual(source.data, data);
         });
      });

      describe('.create()', function() {
         it('should return an empty model', function(done) {
            source.create().addCallbacks(function(model) {
               try {
                  assert.instanceOf(model, Model);
                  assert.isUndefined(model.getId());
                  assert.isUndefined(model.get('LastName'));
                  done();
               } catch (err) {
                  done(err);
               }
            }, function(err) {
               done(err);
            });
         });

         it('should return an model with initial data', function(done) {
            source.create({
               a: 1,
               b: true
            }).addCallbacks(function(model) {
               try {
                  assert.strictEqual(model.get('a'), 1);
                  assert.strictEqual(model.get('b'), true);
                  done();
               } catch (err) {
                  done(err);
               }
            }, function(err) {
               done(err);
            });
         });

         it('should return an unlinked model', function(done) {
            var meta = {
               a: 1,
               b: true
            };
            source.create(meta).addCallbacks(function(model) {
               model.set('a', 2);
               try {
                  assert.strictEqual(meta.a, 1);
                  done();
               } catch (err) {
                  done(err);
               }
            }, function(err) {
               done(err);
            });
         });
      });

      describe('.read()', function() {
         context('when the model is exists', function() {
            it('should return the valid model', function(done) {
               source.read(existsId).addCallbacks(function(model) {
                  try {
                     assert.instanceOf(model, Model);
                     assert.isTrue(model.getId() > 0);
                     assert.strictEqual(model.getId(), existsId);
                     assert.strictEqual(model.get('LastName'), 'Баранов');
                     done();
                  } catch (err) {
                     done(err);
                  }
               }, function(err) {
                  done(err);
               });
            });

            it('should return an unlinked model', function(done) {
               var oldValue = data[existsIdIndex]['LastName'];
               source.read(existsId).addCallbacks(function(model) {
                  try {
                     model.set('LastName', 'Test');
                     assert.strictEqual(data[existsIdIndex]['LastName'], oldValue);
                     done();
                  } catch (err) {
                     done(err);
                  }
               }, function(err) {
                  done(err);
               });
            });
         });

         context('when the model isn\'t exists', function() {
            it('should return an error', function(done) {
               source.read(notExistsId).addBoth(function(err) {
                  if (err instanceof Error) {
                     done();
                  } else {
                     done(new Error('That\'s no Error'));
                  }
               });
            });
         });
      });

      describe('.update()', function() {
         context('when the model was stored', function() {
            it('should update the model', function(done) {
               source.read(existsId).addCallbacks(function(model) {
                  model.set('LastName', 'Петров');
                  source.update(model).addCallbacks(function(success) {
                     try {
                        assert.isTrue(!!success);
                        assert.isFalse(model.isChanged());
                        source.read(existsId).addCallbacks(function(model) {
                           assert.strictEqual(model.get('LastName'), 'Петров');
                           done();
                        }, function(err) {
                           done(err);
                        });
                     } catch (err) {
                        done(err);
                     }
                  }, function(err) {
                     done(err);
                  });
               }, function(err) {
                  done(err);
               });
            });
         });

         context('when the model was not stored', function() {
            var testModel = function(success, model, length, done) {
               try {
                  assert.isTrue(!!success);
                  assert.isFalse(model.isChanged());
                  assert.isTrue(!!model.getId());
                  assert.strictEqual(length, data.length);
                  source.read(model.getId()).addCallbacks(function(modelToo) {
                     assert.strictEqual(model.get('LastName'), modelToo.get('LastName'));
                     done();
                  }, function(err) {
                     done(err);
                  });
               } catch (err) {
                  done(err);
               }
            };

            it('should create the model by 1st way', function(done) {
               var oldLength = data.length;
               source.create().addCallbacks(function(model) {
                  model.set('LastName', 'Козлов');
                  source.update(model).addCallbacks(function(success) {
                     testModel(success, model, 1 + oldLength, done);
                  }, function(err) {
                     done(err);
                  });
               }, function(err) {
                  done(err);
               });
            });

            it('should create the model by 2nd way', function(done) {
               var oldLength = data.length,
                  model = new Model({
                     idProperty: 'Id'
                  });

               model.set('LastName', 'Овечкин');
               source.update(model).addCallbacks(function(success) {
                  testModel(success, model, 1 + oldLength, done);
               }, function(err) {
                  done(err);
               });
            });
            it('should generate id and set it in raw data', function(done) {
               var model = new Model({
                  idProperty: 'Id'
               });
               source.update(model).addCallback(function(id) {
                  assert.equal(model.get('Id'), id);
                  source.read(id).addCallback(function(readedModel) {
                     assert.equal(readedModel.get('Id'), id);
                     done();
                  });
               });
            });

            it('should generate ids and set it in raw data when updating recordset', function() {
               var data = new RecordSet({
                  rawData: [{
                     'Id': null,
                     'Order': 3,
                     'ParentId': [null],
                     'LastName': 'Иванов',
                     'FirstName': 'Иван',
                     'MiddleName': 'Иванович',
                     'Position': 'Инженер'
                  }, {
                     'Order': 1,
                     'ParentId': [null],
                     'LastName': 'Петровский',
                     'FirstName': 'Федор',
                     'MiddleName': 'Иванович',
                     'Position': 'Директор'
                  }],
                  idProperty: 'Id'
               });
               source.update(data).addCallback(function(ids) {
                  data.each(function(model, i) {
                     assert.equal(model.get('Id'), ids[i]);
                     source.read(ids[i]).addCallback(function(readedModel) {
                        assert.equal(readedModel.get('Id'), ids[i]);
                     });
                  });
               });
            });
         });

         context('update few rows', function() {
            it('should insert new rows', function(done) {
               var
                  source = new MemorySource({
                     data: data,
                     keyProperty: 'Id'
                  }),
                  rs = new RecordSet({
                     rawData: [{
                        'Id': 25,
                        'Order': 3,
                        'ParentId': [null],
                        'LastName': 'Иванов',
                        'FirstName': 'Иван',
                        'MiddleName': 'Иванович',
                        'Position': 'Инженер'
                     }, {
                        'Id': 15,
                        'Order': 1,
                        'ParentId': [null],
                        'LastName': 'Петровский',
                        'FirstName': 'Федор',
                        'MiddleName': 'Иванович',
                        'Position': 'Директор'
                     }]
                  });
               source.update(rs).addCallbacks(function() {
                  source.read(15).addCallbacks(function(record) {
                     assert.equal(record.get('LastName'), 'Петровский');
                     done();
                  }, function(err) {
                     done(err);
                  });
               }, function(err) {
                  done(err);
               });
            });
         });
      });

      describe('.destroy()', function() {
         context('when the model is exists', function() {
            it('should return success', function(done) {
               source.destroy(existsId).addCallbacks(function(success) {
                  try {
                     assert.isTrue(!!success);
                     done();
                  } catch (err) {
                     done(err);
                  }
               }, function(err) {
                  done(err);
               });
            });

            it('should really delete the model', function(done) {
               source.destroy(existsId).addCallbacks(function() {
                  source.read(existsId).addCallbacks(function() {
                     done(new Error('The model still exists'));
                  }, function() {
                     //ok if err == Model is not found
                     done();
                  });
               }, function(err) {
                  done(err);
               });
            });

            it('should decrease the size of raw data', function(done) {
               var targetLength = data.length - 1;
               source.destroy(existsId).addCallbacks(function() {
                  try {
                     assert.strictEqual(targetLength, data.length);
                     done();
                  } catch (err) {
                     done(err);
                  }
               }, function(err) {
                  done(err);
               });
            });

            it('should decrease the size of raw data when delete a few models', function(done) {
               var targetLength = data.length - 2;
               source.destroy([existsId, existsId2]).addCallbacks(function() {
                  try {
                     assert.strictEqual(targetLength, data.length);
                     done();
                  } catch (err) {
                     done(err);
                  }
               }, function(err) {
                  done(err);
               });
            });
         });

         context('when the model isn\'t exists', function() {
            it('should return an error', function(done) {
               source.destroy(notExistsId).addBoth(function(err) {
                  if (err instanceof Error) {
                     done();
                  } else {
                     done(new Error('That\'s no Error'));
                  }
               });
            });
         });
      });

      describe('.merge()', function() {
         context('when the model isn\'t exists', function() {
            it('should return an error', function(done) {
               source.merge(notExistsId, existsId).addBoth(function(err) {
                  if (err instanceof Error) {
                     done();
                  } else {
                     done(new Error('That\'s no Error'));
                  }
               });
            });

            it('should return an error', function(done) {
               source.merge(existsId, notExistsId).addBoth(function(err) {
                  if (err instanceof Error) {
                     done();
                  } else {
                     done(new Error('That\'s no Error'));
                  }
               });
            });
         });

         it('should merge models', function(done) {
            source.merge(existsId, existsId2).addCallbacks(function() {
               source.read(existsId).addCallbacks(function() {
                  source.read(existsId2).addCallbacks(function() {
                     done(new Error('Exists extention model.'));
                  }, function() {
                     done();
                  });
               }, function(err) {
                  done(err);
               });
            }, function(err) {
               done(err);
            });
         });
      });

      describe('.copy()', function() {
         it('should copy model', function(done) {
            var oldLength = data.length;
            source.copy(existsId).addCallbacks(function(copy) {
               try {
                  assert.instanceOf(copy, Model);
                  assert.deepEqual(copy.getRawData(), data[existsIdIndex]);
                  assert.strictEqual(data.length, 1 + oldLength);
                  done();
               } catch (err) {
                  done(err);
               }
            }, function(err) {
               done(err);
            });
         });
      });

      describe('.query()', function() {
         it('should return a valid dataset', function(done) {
            source.query(new Query()).addCallbacks(function(ds) {
               try {
                  assert.instanceOf(ds, DataSet);
                  assert.strictEqual(ds.getAll().getCount(), data.length);
                  done();
               } catch (err) {
                  done(err);
               }
            }, function(err) {
               done(err);
            });
         });

         it('should work with no query', function(done) {
            source.query().addCallbacks(function(ds) {
               try {
                  assert.instanceOf(ds, DataSet);
                  assert.strictEqual(ds.getAll().getCount(), data.length);
                  done();
               } catch (err) {
                  done(err);
               }
            }, function(err) {
               done(err);
            });
         });

         it('should return an unlinked collection', function(done) {
            source.query().addCallbacks(function(ds) {
               try {
                  var rec = ds.getAll().at(0),
                     oldId = data[0]['Id'];
                  rec.set('Id', 'test');
                  assert.strictEqual(data[0]['Id'], oldId);
                  done();
               } catch (err) {
                  done(err);
               }
            }, function(err) {
               done(err);
            });
         });

         it('should keep functions in data', function(done) {
            var data = [{
                  a: function() {}
               }],
               source = new MemorySource({
                  data: data
               });

            source.query().addCallbacks(function(ds) {
               try {
                  var rec = ds.getAll().at(0);
                  assert.strictEqual(rec.get('a'), data[0].a);
                  done();
               } catch (err) {
                  done(err);
               }
            }, function(err) {
               done(err);
            });
         });

         it('should keep modules of cloned instances', function(done) {
            var data = [{
                  a: new Model()
               }],
               source = new MemorySource({
                  data: data
               });

            source.query().addCallbacks(function(ds) {
               try {
                  var rec = ds.getAll().at(0);
                  assert.instanceOf(rec.get('a'), Model);
                  done();
               } catch (err) {
                  done(err);
               }
            }, function(err) {
               done(err);
            });
         });

         it('should return a list instance of injected module', function(done) {
            var MyList = coreExtend.extend(List, {});
            source.setListModule(MyList);
            source.query().addCallbacks(function(ds) {
               try {
                  assert.instanceOf(ds.getAll(), MyList);
                  done();
               } catch (err) {
                  done(err);
               }
            }, function(err) {
               done(err);
            });
         });

         it('should return a model instance of injected module', function(done) {
            var MyModel = coreExtend.extend(Model, {});
            source.setModel(MyModel);
            source.query().addCallbacks(function(ds) {
               try {
                  assert.instanceOf(ds.getAll().at(0), MyModel);
                  done();
               } catch (err) {
                  done(err);
               }
            }, function(err) {
               done(err);
            });
         });

         it('should keep data artifact if data is empty', function(done) {
            var artifact = [{foo: 'bar'}],
               data = {
                  d: [],
                  s: artifact
               },
               source = new MemorySource({
                  data: data,
                  adapter: 'Types/entity:adapter.Sbis'
               });

            source.query().addCallbacks(function(ds) {
               try {
                  assert.deepEqual(ds.getRawData(true).items.s, artifact);
                  done();
               } catch (err) {
                  done(err);
               }
            }, function(err) {
               done(err);
            });
         });

         it('should keep data artifact if query selects empty', function(done) {
            var artifact = [{n: 'foo', t: 'Число целое'}],
               data = {
                  d: [[1]],
                  s: artifact
               },
               source = new MemorySource({
                  data: data,
                  adapter: 'Types/entity:adapter.Sbis'
               }),
               query = new Query();

            query.where({foo: 2});
            source.query(query).addCallbacks(function(ds) {
               try {
                  assert.deepEqual(ds.getRawData(true).items.s, artifact);
                  done();
               } catch (err) {
                  done(err);
               }
            }, function(err) {
               done(err);
            });
         });

         it('should use filter from option', function(done) {
            var data = [
                  {id: 1},
                  {id: 2},
                  {id: 3},
                  {id: 4}
               ],
               source = new MemorySource({
                  data: data,
                  filter: function(item) {
                     return item.get('id') % 2 === 0;
                  }
               }),
               expected = [2, 4];

            source.query().addCallbacks(function(ds) {
               try {
                  ds.getAll().each(function(record, index) {
                     assert.equal(record.get('id'), expected[index]);
                  });
                  assert.equal(ds.getAll().getCount(), expected.length);
                  done();
               } catch (err) {
                  done(err);
               }
            }, function(err) {
               done(err);
            });
         });

         it('should pass filters to filter from option', function(done) {
            var data = [
                  {id: 1, title: 'a'},
                  {id: 2, title: 'b'},
                  {id: 3, title: 'c'},
                  {id: 4, title: 'd'},
                  {id: 5, title: 'e'}
               ],
               source = new MemorySource({
                  data: data,
                  filter: function(item, where) {
                     return Object.keys(where).reduce(function(match, field) {
                        var value = item.get(field);
                        var check = where[field];
                        if (check[0] === '>') {
                           return value > check.substr(1);
                        } else {
                           return value === check;
                        }
                     }, true);
                  }
               }),
               query = new Query(),
               expected = [3, 4, 5];

            query.where({id: '>2'});

            source.query(query).addCallbacks(function(ds) {
               try {
                  ds.getAll().each(function(record, index) {
                     assert.equal(record.get('id'), expected[index]);
                  });
                  assert.equal(ds.getAll().getCount(), expected.length);
                  done();
               } catch (err) {
                  done(err);
               }
            }, function(err) {
               done(err);
            });
         });

         context('when sort use several fields', function() {
            var getResult = function(ds) {
                  var result = [];
                  ds.getAll().forEach(function(item) {
                     result.push([
                        item.get('first'),
                        item.get('second'),
                        item.get('third')
                     ].join(''));
                  });
                  return result;
               },
               source = new MemorySource({
                  data: [
                     {first: 'a', second: 'a', third: 'a'},
                     {first: 'a', second: 'a', third: 'b'},
                     {first: 'a', second: 'a', third: 'c'},
                     {first: 'a', second: 'b', third: 'a'},
                     {first: 'a', second: 'b', third: 'b'},
                     {first: 'a', second: 'b', third: 'c'},
                     {first: 'a', second: 'c', third: 'a'},
                     {first: 'a', second: 'c', third: 'b'},
                     {first: 'a', second: 'c', third: 'c'},
                     {first: 'b', second: 'a', third: 'a'},
                     {first: 'b', second: 'a', third: 'b'},
                     {first: 'b', second: 'a', third: 'c'},
                     {first: 'b', second: 'b', third: 'a'},
                     {first: 'b', second: 'b', third: 'b'},
                     {first: 'b', second: 'b', third: 'c'},
                     {first: 'b', second: 'c', third: 'a'},
                     {first: 'b', second: 'c', third: 'b'},
                     {first: 'b', second: 'c', third: 'c'},
                     {first: 'c', second: 'a', third: 'a'},
                     {first: 'c', second: 'a', third: 'b'},
                     {first: 'c', second: 'a', third: 'c'},
                     {first: 'c', second: 'b', third: 'a'},
                     {first: 'c', second: 'b', third: 'b'},
                     {first: 'c', second: 'b', third: 'c'},
                     {first: 'c', second: 'c', third: 'a'},
                     {first: 'c', second: 'c', third: 'b'},
                     {first: 'c', second: 'c', third: 'c'}
                  ]
               });

            it('should sort asc from right to left', function(done) {
               var query = new Query(),
                  expect = [
                     'aaa', 'baa', 'caa',
                     'aba', 'bba', 'cba',
                     'aca', 'bca', 'cca',

                     'aab', 'bab', 'cab',
                     'abb', 'bbb', 'cbb',
                     'acb', 'bcb', 'ccb',

                     'aac', 'bac', 'cac',
                     'abc', 'bbc', 'cbc',
                     'acc', 'bcc', 'ccc'
                  ];
               query.orderBy([{third: false}, {second: false}, {first: false}]);
               source.query(query).addCallbacks(function(ds) {
                  try {
                     var given = getResult(ds);
                     assert.deepEqual(given, expect);
                     done();
                  } catch (err) {
                     done(err);
                  }
               }, function(err) {
                  done(err);
               });
            });

            it('should sort desc from left to right', function(done) {
               var query = new Query(),
                  expect = [
                     'ccc', 'ccb', 'cca',
                     'cbc', 'cbb', 'cba',
                     'cac', 'cab', 'caa',

                     'bcc', 'bcb', 'bca',
                     'bbc', 'bbb', 'bba',
                     'bac', 'bab', 'baa',

                     'acc', 'acb', 'aca',
                     'abc', 'abb', 'aba',
                     'aac', 'aab', 'aaa'
                  ];
               query.orderBy([{first: true}, {second: true}, {third: true}]);
               source.query(query).addCallbacks(function(ds) {
                  try {
                     var given = getResult(ds);
                     assert.deepEqual(given, expect);
                     done();
                  } catch (err) {
                     done(err);
                  }
               }, function(err) {
                  done(err);
               });
            });

            it('should sort mixed from right to left', function(done) {
               var query = new Query(),
                  expect = [
                     'aca', 'bca', 'cca',
                     'aba', 'bba', 'cba',
                     'aaa', 'baa', 'caa',

                     'acb', 'bcb', 'ccb',
                     'abb', 'bbb', 'cbb',
                     'aab', 'bab', 'cab',

                     'acc', 'bcc', 'ccc',
                     'abc', 'bbc', 'cbc',
                     'aac', 'bac', 'cac'
                  ];
               query.orderBy([{third: false}, {second: true}, {first: false}]);
               source.query(query).addCallbacks(function(ds) {
                  try {
                     var given = getResult(ds);
                     assert.deepEqual(given, expect);
                     done();
                  } catch (err) {
                     done(err);
                  }
               }, function(err) {
                  done(err);
               });
            });
         });

         context('when the filter applied', function() {
            var tests = [{
               filter: {'LastName': 'Иванов'},
               expect: 2
            }, {
               filter: function(item) {
                  return item.get('LastName') === 'Иванов';
               },
               expect: 2
            }, {
               filter: function(item, index) {
                  return index < 3;
               },
               expect: 3
            }, {
               filter: {'LastName': ['Иванов', 'Петров']},
               expect: 3
            }, {
               filter: {'LastName': 'Иванов'},
               offset: 0,
               expect: 2
            }, {
               filter: {'LastName': 'Иванов'},
               offset: 0,
               limit: 0,
               expect: 0
            }, {
               filter: {'LastName': 'Иванов'},
               offset: 0,
               limit: 1,
               expect: 1
            }, {
               filter: {'LastName': 'Иванов'},
               offset: 0,
               limit: 2,
               expect: 2
            }, {
               filter: {'LastName': 'Иванов'},
               offset: 1,
               expect: 1
            }, {
               filter: {'LastName': 'Иванов'},
               offset: 1,
               limit: 0,
               expect: 0
            }, {
               filter: {'LastName': 'Иванов'},
               offset: 1,
               limit: 1,
               expect: 1
            }, {
               filter: {'LastName': 'Иванов'},
               offset: 2,
               expect: 0
            }, {
               filter: {'LastName': 'Иванов'},
               offset: 2,
               limit: 1,
               expect: 0
            }, {
               filter: {'FirstName': 'Иван'},
               expect: 3
            }, {
               filter: {'FirstName': 'Иван'},
               offset: 0,
               expect: 3
            }, {
               filter: {'FirstName': 'Иван'},
               limit: 2,
               expect: 2
            }, {
               filter: {'FirstName': 'Иван'},
               offset: 0,
               limit: 1,
               expect: 1
            }, {
               filter: {'FirstName': 'Иван'},
               offset: 0,
               limit: 2,
               expect: 2
            }, {
               filter: {'FirstName': 'Иван'},
               offset: 1,
               limit: 2,
               expect: 2
            }, {
               filter: {'FirstName': 'Иван'},
               offset: 2,
               expect: 1
            }, {
               filter: {'FirstName': 'Иван'},
               offset: 2,
               limit: 2,
               expect: 1
            }, {
               filter: {'MiddleName': 'Оглы'},
               expect: 0
            }, {
               filter: {'ParentId': null},
               expect: 6
            }, {
               filter: {'ParentId': 6},
               expect: 2
            }, {
               filter: {'ParentId': 99},
               expect: 0
            }];
            for (var i = 0; i < tests.length; i++) {
               (function(test, num) {
                  it('#' + num + ' should return ' + test.expect + ' model(s)', function(done) {
                     var query = new Query()
                        .where(test.filter)
                        .offset(test.offset)
                        .limit(test.limit);
                     source.query(query).addCallbacks(function(ds) {
                        if (ds.getAll().getCount() === test.expect) {
                           done();
                        } else {
                           done(new Error(ds.getAll().getCount() + ' expect to be ' + test.expect));
                        }
                     }, function(err) {
                        done(err);
                     });
                  });
               })(tests[i], 1 + i);
            }
         });

         context('when sorting applied', function() {
            var tests = [{
               sorting: 'Id',
               check: 'Id',
               expect: [7, 6, 5, 4, 3, 2, 1, undefined, null]
            }, {
               sorting: [{'Id': true}],
               check: 'Id',
               expect: [7, 6, 5, 4, 3, 2, 1, undefined, null]
            }, {
               sorting: [{'Id': false}],
               offset: 2,
               check: 'Id',
               expect: [1, 2, 3, 4, 5, 6, 7]
            }, {
               sorting: [{'Id': true}],
               offset: 2,
               check: 'Id',
               expect: [5, 4, 3, 2, 1, undefined, null]
            }, {
               sorting: [{'Id': false}],
               limit: 4,
               check: 'Id',
               expect: [undefined, null, 1, 2, 3, 4]
            }, {
               sorting: [{'Id': true}],
               limit: 4,
               check: 'Id',
               expect: [7, 6, 5, 4]
            }, {
               sorting: [{'Id': false}],
               offset: 3,
               limit: 2,
               check: 'Id',
               expect: [2, 3, 4]
            }, {
               sorting: [{'Id': true}],
               offset: 3,
               limit: 2,
               check: 'Id',
               expect: [4, 3]
            }, {
               sorting: [{'LastName': false}],
               limit: 5,
               check: 'LastName',
               expect: [undefined, undefined, 'Аксенова', 'Афанасьев', 'Баранов']
            }, {
               sorting: [{'LastName': true}],
               limit: 3,
               check: 'LastName',
               expect: ['Петров', 'Иванов', 'Иванов']
            }, {
               sorting: [{'FirstName': true}],
               limit: 4,
               check: 'FirstName',
               expect: ['Ян', 'Федора', 'Федор', 'Иванко']
            }, {
               sorting: [{'LastName': false}, {'FirstName': true}],
               check: ['LastName', 'FirstName'],
               expect: ['+', '+', 'Аксенова+Федора', 'Афанасьев+Иван', 'Баранов+Иванко', 'Годолцов+Иван', 'Иванов+Ян', 'Иванов+Иван', 'Петров+Федор']
            }, {
               sorting: [{'FirstName': false}, {'MiddleName': false}],
               limit: 7,
               check: ['FirstName', 'MiddleName'],
               expect: ['+', '+', 'Иван+Андреевич', 'Иван+Викторович', 'Иван+Иванович', 'Иванко+Петрович', 'Федор+Иванович']
            }, {
               sorting: [{'FirstName': false}, {'MiddleName': true}],
               limit: 7,
               check: ['FirstName', 'MiddleName'],
               expect: ['+', '+', 'Иван+Иванович', 'Иван+Викторович', 'Иван+Андреевич', 'Иванко+Петрович', 'Федор+Иванович']
            }, {
               sorting: [{'Position': false}, {'LastName': false}, {'FirstName': false}],
               check: ['Position', 'LastName', 'FirstName'],
               expect: ['++', '++', 'Директор+Афанасьев+Иван', 'Директор+Годолцов+Иван', 'Директор+Петров+Федор', 'Инженер+Аксенова+Федора', 'Инженер+Иванов+Иван', 'Карапуз+Баранов+Иванко', 'Маркетолог+Иванов+Ян']
            }];

            for (var i = 0; i < tests.length; i++) {
               (function(test, num) {
                  if (!(test.check instanceof Array)) {
                     test.check = [test.check];
                  }

                  it('#' + num + ' should return ' + test.expect + ' models order', function(done) {
                     var query = new Query()
                        .where(test.filter)
                        .orderBy(test.sorting)
                        .offset(test.offset)
                        .limit(test.limit);
                     source.query(query).addCallbacks(function(ds) {
                        var modelNum = 0,
                           failOn;
                        ds.getAll().each(function(model) {
                           if (failOn === undefined) {
                              var have,
                                 need = test.expect[modelNum];
                              if (test.check.length > 1) {
                                 have = [];
                                 for (var j = 0; j < test.check.length; j++) {
                                    have.push(model.get(test.check[j]));
                                 }
                                 have = have.join('+');
                              } else {
                                 have = model.get(test.check[0]);
                              }
                              if (have !== need) {
                                 failOn = [have, need];
                              }
                           }
                           modelNum++;
                        });
                        if (failOn) {
                           done(new Error('The model with value "' + failOn[0] + '" has been found. Expect to be "' + failOn[1] + '".'));
                        } else {
                           done();
                        }
                     }, function(err) {
                        done(err);
                     });
                  });
               })(tests[i], 1 + i);
            }
         });
      });

      describe('.move()', function() {
         it('should move 5 to begin list', function(done) {
            source.move(
               [5],
               6,
               {position: 'before'}
            ).addCallbacks(function() {
               if (data[0]['Id'] === 5) {
                  done();
               } else {
                  done(new Error('Unexpected value'));
               }
            }, function(err) {
               done(err);
            });
         });

         it('should move 6 before 5', function(done) {
            source.move(
               [6],
               5,
               {position: 'before'}
            ).addCallbacks(function() {
               if (data[5]['Id'] === 6 && data[6]['Id'] === 5) {
                  done();
               } else {
                  done(new Error('Unexpected value'));
               }
            }, function(err) {
               done(err);
            });
         });

         it('should move 6 after 5', function(done) {
            data;
            source.move(
               [6],
               5,
               {position: 'after'}
            ).addCallbacks(function() {
               if (data[5]['Id'] === 5 && data[6]['Id'] === 6) {
                  done();
               } else {
                  done(new Error('Unexpected value'));
               }
            }, function(err) {
               done(err);
            });
         });

         it('should move 6 to end list', function(done) {
            source.move(
               [6],
               3,
               {position: 'after'}
            ).addCallbacks(function() {
               if (data[data.length - 1]['Id'] === 6) {
                  done();
               } else {
                  done(new Error('Unexpected value'));
               }
            }, function(err) {
               done(err);
            });
         });

         it('should move 6 to end list', function(done) {
            source.move(
               [6],
               3,
               {position: 'after'}
            ).addCallbacks(function() {
               if (data[data.length - 1]['Id'] === 6) {
                  done();
               } else {
                  done(new Error('Unexpected value'));
               }
            }, function(err) {
               done(err);
            });
         });

         it('should move 6 to end list', function(done) {
            source.move(
               [6],
               3,
               {position: 'after'}
            ).addCallbacks(function() {
               if (data[data.length - 1]['Id'] === 6) {
                  done();
               } else {
                  done(new Error('Unexpected value'));
               }
            }, function(err) {
               done(err);
            });
         });

         it('should move 6 to end list with use before', function(done) {
            source.move(
               6,
               3,
               {before: false}
            ).addCallbacks(function() {
               if (data[data.length - 1]['Id'] === 6) {
                  done();
               } else {
                  done(new Error('Unexpected value'));
               }
            }, function(err) {
               done(err);
            });
         });

         it('should move 6 before 3 with use before', function(done) {
            source.move(
               6,
               3,
               {before: true}
            ).addCallbacks(function() {
               if (data[data.length - 2]['Id'] === 6) {
                  done();
               } else {
                  done(new Error('Unexpected value'));
               }
            }, function(err) {
               done(err);
            });
         });
         it('should move row with ids 6 on 3', function(done) {
            source.move(
               6,
               3,
               {position: 'on', parentProperty: 'ParentId'}
            ).addCallbacks(function() {
               assert.equal(data[0]['ParentId'], 3);
               done();
            }, function(err) {
               done(err);
            });
         });
         it('should move row with ids 3 on root', function(done) {
            source.move(
               3,
               null,
               {position: 'on', parentProperty: 'ParentId'}
            ).addCallbacks(function() {
               assert.equal(data[8]['ParentId'], null);
               done();
            }, function(err) {
               done(err);
            });
         });
         it('should move row up before targets', function(done) {
            source.move(
               5,
               7,
               {position: 'before'}
            ).addCallbacks(function() {
               if (data[3]['Id'] === 5) {
                  done();
               } else {
                  done(new Error('Unexpected value'));
               }
            }, function(err) {
               done(err);
            });
         });
         it('should move rows up after targets', function(done) {
            data;
            source.move(
               5,
               7,
               {position: 'after'}
            ).addCallbacks(function() {
               if (data[4]['Id'] === 5) {
                  done();
               } else {
                  done(new Error('Unexpected value'));
               }
            }, function(err) {
               done(err);
            });
         });

         it('should move rows up before targets', function(done) {
            source.move(
               [5, 1],
               7,
               {position: 'after'}
            ).addCallbacks(function() {
               if (data[4]['Id'] === 5 && data[5]['Id'] === 1) {
                  done();
               } else {
                  done(new Error('Unexpected value'));
               }
            }, function(err) {
               done(err);
            });
         });

         it('should move rows down before targets', function(done) {
            source.move(
               [5, 1],
               7,
               {position: 'before'}
            ).addCallbacks(function() {
               if (data[3]['Id'] === 5 && data[4]['Id'] === 1) {
                  done();
               } else {
                  done(new Error('Unexpected value'));
               }
            }, function(err) {
               done(err);
            });
         });

         it('should move row down after targets', function(done) {
            source.move(
               [4, 7],
               1,
               {position: 'after'}
            ).addCallbacks(function() {
               if (data[6]['Id'] === 4 && data[7]['Id'] === 7) {
                  done();
               } else {
                  done(new Error('Unexpected value'));
               }
            }, function(err) {
               done(err);
            });
         });

         it('should move row up before targets', function(done) {
            source.move(
               [4, 7],
               1,
               {position: 'before'}
            ).addCallbacks(function() {
               if (data[5]['Id'] === 4 && data[6]['Id'] === 7) {
                  done();
               } else {
                  done(new Error('Unexpected value'));
               }
            }, function(err) {
               done(err);
            });
         });
      });

      context('when use recordset as data', function() {
         var recordset, source;

         beforeEach(function() {
            recordset = new RecordSet({
               rawData: data
            });

            source = new MemorySource({
               data: recordset,
               adapter: 'Types/entity:adapter.RecordSet',
               keyProperty: 'Id'
            });
         });

         describe('.create()', function() {
            it('should return an empty model', function(done) {
               source.create().addCallbacks(function(model) {
                  try {
                     assert.instanceOf(model, Model);
                     done();
                  } catch (err) {
                     done(err);
                  }
               }, function(err) {
                  done(err);
               });
            });

            it('should return an model with initial data', function(done) {
               source.create(new Model({
                  rawData: {
                     a: 1,
                     b: true
                  }
               })).addCallbacks(function(model) {
                  try {
                     assert.strictEqual(model.get('a'), 1);
                     assert.strictEqual(model.get('b'), true);
                     done();
                  } catch (err) {
                     done(err);
                  }
               }, function(err) {
                  done(err);
               });
            });
         });

         describe('.read()', function() {
            context('when the model is exists', function() {
               it('should return the valid model', function(done) {
                  source.read(existsId).addCallbacks(function(model) {
                     try {
                        assert.instanceOf(model, Model);
                        assert.strictEqual(model.getId(), existsId);
                        done();
                     } catch (err) {
                        done(err);
                     }
                  }, function(err) {
                     done(err);
                  });
               });
            });

            context('when the model isn\'t exists', function() {
               it('should return an error', function(done) {
                  source.read(notExistsId).addBoth(function(err) {
                     if (err instanceof Error) {
                        done();
                     } else {
                        done(new Error('That\'s no Error'));
                     }
                  });
               });
            });
         });

         describe('.update()', function() {
            it('should update data if it\'s null by default', function(done) {
               var source = new MemorySource({
                     keyProperty: 'foo'
                  }),
                  model = new Model({
                     rawData: {foo: 'bar'}
                  });

               source.update(model).addCallback(function() {
                  source.query().addCallback(function(ds) {
                     try {
                        assert.equal(ds.getAll().at(0).get('foo'), 'bar');
                        done();
                     } catch (e) {
                        done(e);
                     }
                  });
               });
            });

            context('when the model was stored', function() {
               it('should update the model', function(done) {
                  source.read(existsId).addCallbacks(function(model) {
                     model.set('LastName', 'Петров');
                     source.update(model).addCallbacks(function(success) {
                        try {
                           assert.isTrue(!!success);
                           source.read(existsId).addCallbacks(function(model) {
                              assert.equal(model.get('LastName'), 'Петров');
                              done();
                           }, function(err) {
                              done(err);
                           });
                        } catch (err) {
                           done(err);
                        }
                     }, function(err) {
                        done(err);
                     });
                  }, function(err) {
                     done(err);
                  });
               });
            });

            context('when the model was not stored', function() {
               var testModel = function(success, model, length, done) {
                  try {
                     assert.isTrue(!!success);
                     assert.strictEqual(length, recordset.getCount());
                     source.read(model.getId()).addCallbacks(function(modelToo) {
                        assert.strictEqual(model.get('LastName'), modelToo.get('LastName'));
                        done();
                     }, function(err) {
                        done(err);
                     });
                  } catch (err) {
                     done(err);
                  }
               };

               it('should create the model by 1st way', function(done) {
                  var oldLength = recordset.getCount();
                  source.create(new Model({
                     adapter: recordset.getAdapter()
                  })).addCallbacks(function(model) {
                     model.set('LastName', 'Козлов');
                     source.update(model).addCallbacks(function(success) {
                        testModel(success, model, 1 + oldLength, done);
                     }, function(err) {
                        done(err);
                     });
                  }, function(err) {
                     done(err);
                  });
               });

               it('should create the model by 2nd way', function(done) {
                  var oldLength = recordset.getCount(),
                     model = new Model({
                        rawData: new Model(),
                        idProperty: 'Id',
                        adapter: 'Types/entity:adapter.RecordSet'
                     });
                  model.set('LastName', 'Овечкин');
                  source.update(model).addCallbacks(function(success) {
                     testModel(success, model, 1 + oldLength, done);
                  }, function(err) {
                     done(err);
                  });
               });

               it('should nod clone row when it have key 0', function() {
                  var source = new MemorySource({
                        data: [{'id': 0, 'name': 'name'}],
                        keyProperty: 'id'
                     }),
                     model = new Model({
                        rawData: {id: 0, 'name': '11'},
                        idProperty: 'id'
                     });
                  source.update(model);
                  assert.equal(source._$data.length, 1);
               });
            });
         });

         describe('.destroy()', function() {
            context('when the model is exists', function() {
               it('should return success', function(done) {
                  source.destroy(existsId).addCallbacks(function(success) {
                     try {
                        assert.isTrue(!!success);
                        done();
                     } catch (err) {
                        done(err);
                     }
                  }, function(err) {
                     done(err);
                  });
               });

               it('should really delete the model', function(done) {
                  source.destroy(existsId).addCallbacks(function() {
                     source.read(existsId).addCallbacks(function() {
                        done(new Error('The model still exists'));
                     }, function() {
                        done();
                     });
                  }, function(err) {
                     done(err);
                  });
               });

               it('should decrease the size of raw data', function(done) {
                  var targetLength = recordset.getCount() - 1;
                  source.destroy(existsId).addCallbacks(function() {
                     try {
                        assert.strictEqual(targetLength, recordset.getCount());
                        done();
                     } catch (err) {
                        done(err);
                     }
                  }, function(err) {
                     done(err);
                  });
               });
            });

            context('when the model isn\'t exists', function() {
               it('should return an error', function(done) {
                  source.destroy(notExistsId).addBoth(function(err) {
                     if (err instanceof Error) {
                        done();
                     } else {
                        done(new Error('That\'s no Error'));
                     }
                  });
               });
            });
         });

         describe('.merge()', function() {
            context('when the model isn\'t exists', function() {
               it('should return an error', function(done) {
                  source.merge(notExistsId, existsId).addBoth(function(err) {
                     if (err instanceof Error) {
                        done();
                     } else {
                        done(new Error('That\'s no Error'));
                     }
                  });
               });

               it('should return an error', function(done) {
                  source.merge(existsId, notExistsId).addBoth(function(err) {
                     if (err instanceof Error) {
                        done();
                     } else {
                        done(new Error('That\'s no Error'));
                     }
                  });
               });
            });

            it('should merge models', function(done) {
               source.merge(existsId, existsId2).addCallbacks(function() {
                  source.read(existsId).addCallbacks(function() {
                     source.read(existsId2).addCallbacks(function() {
                        done(new Error('Exists extention model.'));
                     }, function() {
                        done();
                     });
                  }, function(err) {
                     done(err);
                  });
               }, function(err) {
                  done(err);
               });
            });
         });

         describe('.copy()', function() {
            it('should copy model', function(done) {
               var oldLength = recordset.getCount();
               source.copy(existsId).addCallbacks(function() {
                  if (recordset.getCount() === 1 + oldLength) {
                     done();
                  } else {
                     done(new Error('Model dosn\'t copied'));
                  }
               }, function(err) {
                  done(err);
               });
            });
         });

         describe('.query()', function() {
            it('should return a valid dataset', function(done) {
               source.query(new Query()).addCallbacks(function(ds) {
                  try {
                     assert.instanceOf(ds, DataSet);
                     assert.strictEqual(ds.getAll().getCount(), recordset.getCount());
                     done();
                  } catch (err) {
                     done(err);
                  }
               }, function(err) {
                  done(err);
               });
            });

            it('should save data adapter', function(done) {
               var format = [{name: 'id', type: 'integer'}],
                  recordset = new RecordSet({
                     format: format,
                     adapter: 'Types/entity:adapter.Sbis'
                  }),
                  source = new MemorySource({
                     data: recordset,
                     adapter: 'Types/entity:adapter.RecordSet',
                     keyProperty: 'Id'
                  }),
                  record;

               record = new Model({
                  format: recordset.getFormat(),
                  adapter: recordset.getAdapter()
               });
               record.set('id', 1);
               recordset.add(record);

               source.query().addCallbacks(function(ds) {
                  try {
                     assert.instanceOf(ds.getAll().getRawData(true).getAdapter(), SbisAdapter);
                     done();
                  } catch (err) {
                     done(err);
                  }
               }, function(err) {
                  done(err);
               });
            });

            it('should work with no query', function(done) {
               source.query().addCallbacks(function(ds) {
                  try {
                     assert.instanceOf(ds, DataSet);
                     assert.strictEqual(ds.getAll().getCount(), recordset.getCount());
                     done();
                  } catch (err) {
                     done(err);
                  }
               }, function(err) {
                  done(err);
               });
            });

            it('should work if query select no items', function(done) {
               var query = new Query();
               query.where({someField: 'WithValueThatWillNotBeFind'});

               source.query(query).addCallbacks(function(ds) {
                  try {
                     assert.instanceOf(ds.getProperty(ds.getItemsProperty()), RecordSet);
                     done();
                  } catch (err) {
                     done(err);
                  }
               }, function(err) {
                  done(err);
               });
            });

            it('should return a list instance of injected module', function(done) {
               var MyList = coreExtend.extend(List, {});
               source.setListModule(MyList);
               source.query().addCallbacks(function(ds) {
                  try {
                     assert.instanceOf(ds.getAll(), MyList);
                     done();
                  } catch (err) {
                     done(err);
                  }
               }, function(err) {
                  done(err);
               });
            });

            it('should return a model instance of injected module', function(done) {
               var MyModel = coreExtend.extend(Model, {});
               source.setModel(MyModel);
               source.query().addCallbacks(function(ds) {
                  try {
                     assert.instanceOf(ds.getAll().at(0), MyModel);
                     done();
                  } catch (err) {
                     done(err);
                  }
               }, function(err) {
                  done(err);
               });
            });

            it('should keep property total', function(done) {
               source.query(new Query().limit(2)).addCallbacks(function(ds) {
                  try {
                     assert.instanceOf(ds, DataSet);
                     assert.strictEqual(ds.getMetaData().total, recordset.getCount());
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
}
);
