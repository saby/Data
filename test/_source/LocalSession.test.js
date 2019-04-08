/* global beforeEach, afterEach, describe, context, assert, it */
define([
   './data.sample',
   'Types/_source/LocalSession',
   'Types/_source/DataSet',
   'Types/_source/Query',
   'Types/_entity/Model',
   'Types/_collection/RecordSet',
   'Types/_collection/List',
   'Core/core-simpleExtend',
   'Browser/Storage'
], function(
   dataSample,
   LocalSession,
   DataSet,
   Query,
   Model,
   RecordSet,
   List,
   coreExtend,
   Storage
) {
   LocalSession = LocalSession.default;
   DataSet = DataSet.default;
   Query = Query.default;
   Model = Model.default;
   RecordSet = RecordSet.default;
   List = List.default;

   var source,
      ls = new Storage.LocalStorage('mdl_solarsystem'),
      ls5 = new Storage.LocalStorage('mdl_solarsystem_5'),
      ls6 = new Storage.LocalStorage('mdl_solarsystem_6'),
      ls7 = new Storage.LocalStorage('mdl_solarsystem_7'),
      existsId = 5,
      existsIdIndex = 6,
      existsId2 = '6',
      notExistsId = 33;

   var mock = [
      {id: '1', title: 'Sun', kind: 'Star', material: 'dirt'},
      {id: '2', title: 'Mercury', kind: 'Planet', material: 'clay'},
      {id: '3', title: 'Neptune', kind: 'Planet', material: 'sand'},
      {id: '4', title: 'Earth', kind: 'Planet', material: 'gravel'},
      {id: 5, title: 'Mars', kind: 'Planet', material: 'dirt'},
      {id: '6', title: 'Jupiter', kind: 'Planet', material: 'gravel'},
      {id: '7', title: 'Saturn', kind: 'Planet', material: 'clay'},
      {id: '8', title: 'Uranus', kind: 'Planet', material: 'asphalt'},
      {id: '9', title: 'Neptune', kind: 'Planet', material: 'gravel'},
      {id: '10', title: 'Plutonis', kind: 'Da planet', material: null}
   ];

   describe('Types/_source/LocalSession', function() {

      beforeEach(function() {
         source = new LocalSession({
            prefix: 'mdl_solarsystem',
            idProperty: 'id',
            data: mock
         });
      });

      afterEach(function() {
         source = undefined;
         ls.clear();
      });

      describe('.create()', function() {
         it('should return an empty model', function(done) {
            source.create().addCallbacks(function(model) {
               try {
                  assert.instanceOf(model, Model);
                  assert.isUndefined(model.get('title'));
                  done();
               } catch (err) {
                  done(err);
               }
            }, function(err) {
               done(err);
            });
         });

         it('should return an model with initial data', function(done) {
            var mockObj = {id: '11', name: 'Moon', 'kind': 'Satellite'};
            source.create(mockObj)
               .addCallbacks(function(model) {
                  try {
                     assert.strictEqual(model.get('name'), 'Moon');
                     assert.strictEqual(model.get('kind'), 'Satellite');
                     done();
                  } catch (err) {
                     done(err);
                  }
               }, function(err) {
                  done(err);
               });
         });

         it('should return an unlinked model', function(done) {
            var meta = {id: '11', name: 'Moon', 'kind': 'Satellite'};
            source.create(meta).addCallbacks(function(model) {
               model.set('name', 'Mars');
               try {
                  assert.strictEqual(meta.name, 'Moon');
                  done();
               } catch (err) {
                  done(err);
               }
            }, function(err) {
               done(err);
            });
         });
      });

      describe('read()', function() {
         context('when the model is exists', function() {
            it('should return the valid model', function(done) {
               source.read(existsId).addCallbacks(function(model) {
                  try {
                     assert.instanceOf(model, Model);
                     assert.isTrue(model.getId() > 0);
                     assert.strictEqual(model.getId(), existsId);
                     assert.strictEqual(model.get('title'), 'Mars');
                     done();
                  } catch (err) {
                     done(err);
                  }
               }, function(err) {
                  done(err);
               });
            });

            it('should return an unlinked model', function(done) {
               var oldValue = mock[existsIdIndex]['title']; // Saturn
               source.read(existsId).addCallbacks(function(model) {
                  try {
                     model.set('title', 'Test');
                     assert.strictEqual(mock[existsIdIndex]['title'], oldValue);
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
                  model.set('title', 'MarsUpdated');
                  source.update(model).addCallbacks(function(success) {
                     try {
                        assert.isTrue(!!success);
                        assert.isFalse(model.isChanged());
                        source.read(existsId).addCallbacks(function(model) {
                           assert.strictEqual(model.get('title'), 'MarsUpdated');
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
                  assert.strictEqual(length, ls.getItem('k'));
                  source.read(model.getId()).addCallbacks(function(modelToo) {
                     assert.strictEqual(model.get('title'), modelToo.get('title'));
                     done();
                  }, function(err) {
                     done(err);
                  });
               } catch (err) {
                  done(err);
               }
            };

            it('should create the model by 1st way', function(done) {
               var oldLength = mock.length;
               source.create().addCallbacks(function(model) {
                  model.set('title', 'Козлов');
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
               var oldLength = mock.length,
                  model = new Model({
                     idProperty: 'id'
                  });

               model.set('title', 'Овечкин');
               source.update(model).addCallbacks(function(success) {
                  testModel(success, model, 1 + oldLength, done);
               }, function(err) {
                  done(err);
               });
            });
            it('should generate id and set it in raw data', function(done) {
               var model = new Model({
                  idProperty: 'id'
               });
               source.update(model).addCallback(function(id) {
                  assert.equal(model.get('id'), id);
                  source.read(id).addCallback(function(readedModel) {
                     assert.equal(readedModel.get('id'), id);
                     done();
                  });
               });
            });

            it('should generate ids and set it in raw data when updating recordset', function() {
               var data = new RecordSet({
                  rawData: [
                     {id: null, title: 'Neptune', kind: 'Planet'},
                     {id: 90, title: 'Pluto', kind: 'Dwarf planet'}
                  ],
                  idProperty: 'id'
               });
               source.update(data).addCallback(function(ids) {
                  data.each(function(model, i) {
                     assert.equal(model.get('id'), ids[i]);
                     source.read(ids[i]).addCallback(function(readedModel) {
                        assert.equal(readedModel.get('id'), ids[i]);
                     });
                  });
               });
            });
         });

         context('update few rows', function() {
            it('should insert new rows', function(done) {
               var rs = new RecordSet({
                  rawData: [
                     {id: 90, title: 'Pluto', kind: 'Dwarf planet'},
                     {id: null, title: 'Neptune', kind: 'COCO-COLA Planet'}
                  ],
                  idProperty: 'id'
               });
               source.update(rs).addCallbacks(function() {
                  source.read(90).addCallbacks(function(record) {
                     assert.equal(record.get('title'), 'Pluto');
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
                  }, function(err) {
                     assert.isTrue(!!err);

                     //ok if err == Model is not found
                     done();
                  });
               }, function(err) {
                  done(err);
               });
            });

            it('should decrease the size of raw data', function(done) {
               var targetLength = ls.getItem('k') - 1;
               source.destroy(existsId).addCallbacks(function() {
                  try {
                     assert.strictEqual(targetLength, ls.getItem('k'));
                     done();
                  } catch (err) {
                     done(err);
                  }
               }, function(err) {
                  done(err);
               });
            });

            it('should decrease the size of raw data when delete a few models', function(done) {
               var targetLength = ls.getItem('k') - 2;
               source.destroy([existsId, existsId2]).addCallbacks(function() {
                  try {
                     assert.strictEqual(targetLength, ls.getItem('k'));
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
         context('when the model is exists', function() {
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
      });

      describe('.copy()', function() {
         it('should copy model', function(done) {
            var oldLength = ls.getItem('k');
            source.copy(existsId).addCallbacks(function(copy) {
               try {
                  assert.instanceOf(copy, Model);
                  assert.deepEqual(copy.getRawData(), ls.getItem('d' + existsId));
                  assert.strictEqual(ls.getItem('k'), 1 + oldLength);
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
                  assert.strictEqual(ds.getAll().getCount(), mock.length);
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
                  assert.strictEqual(ds.getAll().getCount(), mock.length);
                  done();
               } catch (err) {
                  done(err);
               }
            }, function(err) {
               done(err);
            });
         });

         it('should do not change order', function(done) {
            var meta = {id: '3i24qr5a-cqsq-raqj-6sla-c0sr9s5', name: 'Moon', 'kind': 'Satellite'},
               result = mock.slice();
            result.push(meta);
            source.create(meta).addCallback(function(model) {
               source.update(model).addCallback(function() {
                  source.query().addCallbacks(function(ds) {
                     try {
                        assert.instanceOf(ds, DataSet);
                        var data = ds.getAll().getRawData();
                        assert.deepEqual(data, result);
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

         it('should return an unlinked collection', function(done) {
            source.query().addCallbacks(function(ds) {
               try {
                  var rec = ds.getAll().at(0),
                     oldId = mock[0]['id'];
                  rec.set('id', 'test');
                  assert.strictEqual(mock[0]['id'], oldId);
                  done();


               } catch (err) {
                  done(err);
               }
            }, function(err) {
               done(err);
            });
         });

         it('should keep functions in data', function(done) {
            var data = dataSample.arrayWithFunctions;
            var source1 = new LocalSession({
               idProperty: 'id',
               prefix: 'mdl_solarsystem_1_1',
               data: data
            });

            source1.query().addCallbacks(function(ds) {
               try {
                  var rec = ds.getAll().at(0);
                  assert.strictEqual(rec.get('bar'), data[0].bar);
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
               source2 = new LocalSession({
                  idProperty: 'id',
                  prefix: 'mdl_solarsystem_2',
                  data: data
               });

            source2.query().addCallbacks(function(ds) {
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
            };

            var source5;
            beforeEach(function() {

               source5 = new LocalSession({
                  idProperty: 'id',
                  prefix: 'mdl_solarsystem_5',
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
            });

            afterEach(function() {
               ls5.clear();
            });

            it('should sort asc from right to left', function(done) {
               var query = new Query(),
                  expect = [
                     'aaa',
                     'baa',
                     'caa',
                     'aba',
                     'bba',
                     'cba',
                     'aca',
                     'bca',
                     'cca',
                     'aab',
                     'bab',
                     'cab',
                     'abb',
                     'bbb',
                     'cbb',
                     'acb',
                     'bcb',
                     'ccb',
                     'aac',
                     'bac',
                     'cac',
                     'abc',
                     'bbc',
                     'cbc',
                     'acc',
                     'bcc',
                     'ccc'
                  ];
               query.orderBy([{third: false}, {second: false}, {first: false}]);
               source5.query(query).addCallbacks(function(ds) {
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
               source5.query(query).addCallbacks(function(ds) {
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
               source5.query(query).addCallbacks(function(ds) {
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
            var tests = [
               {
                  filter: {'title': 'Neptune'},
                  expect: 2
               },
               {
                  filter: function(item) {
                     return item.get('title') === 'Neptune';
                  },
                  expect: 2
               },
               {
                  filter: function(item, index) {
                     return index < 3;
                  },
                  expect: 3
               },
               {
                  filter: {'title': ['Neptune', 'Uranus'], 'material': ['asphalt', 'sand']},
                  expect: 2
               },
               {
                  filter: {'title': 'Neptune'},
                  offset: 0,
                  expect: 2
               },
               {
                  filter: {'title': 'Neptune'},
                  offset: 0,
                  limit: 0,
                  expect: 0
               },
               {
                  filter: {'title': 'Sun'},
                  offset: 0,
                  limit: 1,
                  expect: 1
               },
               {
                  filter: {'title': 'Mercury'},
                  offset: 0,
                  limit: 2,
                  expect: 1
               },
               {
                  filter: {'title': 'Mercury'},
                  offset: 1,
                  expect: 0
               },
               {
                  filter: {'title': 'Sun'},
                  offset: 1,
                  limit: 0,
                  expect: 0
               },
               {
                  filter: {'title': 'Neptune'},
                  offset: 1,
                  limit: 1,
                  expect: 1
               },
               {
                  filter: {'title': 'Neptune'},
                  offset: 2,
                  expect: 0
               },
               {
                  filter: {'title': 'Neptune'},
                  offset: 2,
                  limit: 1,
                  expect: 0
               },
               {
                  filter: {'material': null},
                  expect: 1
               }
            ];
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

            var order1 = 'id',
               tests = [
                  {
                     check: order1,
                     expect: ['1', '2', '3', '4', 5, '6', '7', '8', '9', '10']
                  },
                  {
                     offset: 2,
                     check: order1,
                     expect: ['3', '4', 5, '6', '7', '8', '9', '10']
                  },
                  {
                     limit: 4,
                     check: order1,
                     expect: ['1', '2', '3', '4']
                  },
                  {
                     offset: 3,
                     limit: 2,
                     check: order1,
                     expect: ['4', 5]
                  },

                  {
                     sorting: [{'title': false}],
                     limit: 5,
                     check: 'title',
                     expect: ['Earth', 'Jupiter', 'Mars', 'Mercury', 'Neptune']
                  },
                  {
                     sorting: [{'title': true}],
                     limit: 3,
                     check: 'title',
                     expect: ['Uranus', 'Sun', 'Saturn']
                  },
                  {
                     sorting: [{'material': true}],
                     limit: 4,
                     check: 'material',
                     expect: ['sand', 'gravel', 'gravel', 'gravel']
                  },
                  {
                     sorting: [{'title': false}, {'material': true}],
                     check: ['title', 'material'],
                     expect: ['Earth+gravel', 'Jupiter+gravel', 'Mars+dirt', 'Mercury+clay', 'Neptune+sand', 'Neptune+gravel', 'Plutonis+', 'Saturn+clay', 'Sun+dirt', 'Uranus+asphalt'
                     ]
                  },

                  {
                     sorting: [{'title': false}, {'material': false}],
                     limit: 7,
                     check: ['title', 'material'],
                     expect: ['Earth+gravel', 'Jupiter+gravel', 'Mars+dirt', 'Mercury+clay', 'Neptune+gravel', 'Neptune+sand', 'Plutonis+']
                  },
                  {
                     sorting: [{'title': false}, {'material': true}],
                     limit: 7,
                     check: ['title', 'material'],
                     expect: ['Earth+gravel', 'Jupiter+gravel', 'Mars+dirt', 'Mercury+clay', 'Neptune+sand', 'Neptune+gravel', 'Plutonis+']
                  }
               ];

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
               [existsId],
               '6',
               {position: 'before'}
            ).addCallbacks(function() {
               if (ls.getItem('i')[4] === existsId) {
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
               ['6'],
               existsId,
               {position: 'before'}
            ).addCallbacks(function() {
               if (ls.getItem('i')[4] === '6' && ls.getItem('i')[5] === existsId) {
                  done();
               } else {
                  done(new Error('Unexpected value'));
               }
            }, function(err) {
               done(err);
            });
         });

         it('should move 6 after 5', function(done) {
            source.move(
               ['6'],
               existsId,
               {position: 'after'}
            ).addCallbacks(function() {
               if (ls.getItem('i')[4] === existsId && ls.getItem('i')[5] === '6') {
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
               ['6'],
               '3',
               {position: 'after'}
            ).addCallbacks(function() {
               if (ls.getItem('i')[3] === '6') {
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
               ['6'],
               '3',
               {position: 'after'}
            ).addCallbacks(function() {
               if (ls.getItem('i')[3] === '6') {
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
               ['6'],
               '3',
               {position: 'after'}
            ).addCallbacks(function() {
               if (ls.getItem('i')[3] === '6') {
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
               '6',
               '3',
               {before: false}
            ).addCallbacks(function() {
               if (ls.getItem('i')[3] === '6') {
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
               ['6', '5'],
               '3',
               {before: true}
            ).addCallbacks(function() {
               if (ls.getItem('i')[2] === '6') {
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
               '6',
               '3',
               {position: 'on', parentProperty: 'title'}
            ).addCallbacks(function() {
               assert.equal(ls.getItem('d' + '6')['title'], 'Neptune');
               done();
            }, function(err) {
               done(err);
            });
         });
         it('should move row with ids 3 on root', function(done) {
            source.move(
               '6',
               null,
               {position: 'on', parentProperty: 'title'}
            ).addCallbacks(function() {
               assert.equal(ls.getItem('d' + '6')['title'], null);
               done();
            }, function(err) {
               done(err);
            });
         });
      });

      context('when use recordset as data', function() {
         var recordset, source6;

         beforeEach(function() {

            recordset = new RecordSet({
               idProperty: 'id',
               rawData: mock
            });

            source6 = new LocalSession({
               prefix: 'mdl_solarsystem_6',
               adapter: 'Types/entity:adapter.RecordSet',
               idProperty: 'id',
               data: recordset
            });
         });
         afterEach(function() {
            ls6.clear();
         });

         describe('.create()', function() {
            it('should return an empty model', function(done) {
               source6.create().addCallbacks(function() {
                  done();
               }, function(err) {
                  done(err);
               });
            });

            it('should return an model with initial data', function(done) {
               var model = new Model({
                  rawData: {
                     a: 1,
                     b: true
                  }
               });
               source6.create(model).addCallbacks(function(model) {
                  try {
                     var a = model.get('a');
                     assert.strictEqual(a, 1);
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
                  source6.read(existsId).addCallbacks(function(model) {

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
                  source6.read(notExistsId).addBoth(function(err) {
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
                  source6.read(existsId).addCallbacks(function(model) {
                     model.set('Фамилия', 'Петров');
                     source6.update(model).addCallbacks(function(success) {
                        try {
                           assert.isTrue(!!success);
                           source6.read(existsId).addCallbacks(function(model) {
                              assert.equal(model.get('Фамилия'), 'Петров');
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
                     assert.strictEqual(length, ls6.getItem('k'));

                     source6.read(model.getId()).addCallbacks(function(modelToo) {
                        assert.strictEqual(model.get('Фамилия'), modelToo.get('Фамилия'));
                        done();
                     }, function(err) {
                        done(err);
                     });
                  } catch (err) {
                     done(err);
                  }
               };

               it('should create the model by 1st way', function(done) {
                  var oldLength = ls6.getItem('k');
                  source6.create(new Model({
                     adapter: recordset.getAdapter()
                  })).addCallbacks(function(model) {
                     model.set('Фамилия', 'Козлов');
                     source6.update(model).addCallbacks(function(success) {
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
                        idProperty: 'Ид',
                        adapter: 'Types/entity:adapter.RecordSet'
                     });
                  model.set('Фамилия', 'Овечкин');
                  source6.update(model).addCallbacks(function(success) {
                     testModel(success, model, 1 + oldLength, done);
                  }, function(err) {
                     done(err);
                  });
               });

               it('should nod clone row when it have key 0', function() {
                  var source7 = new LocalSession({
                        prefix: 'mdl_solarsystem_7',
                        data: [{'id': 0, 'name': 'name'}],
                        idProperty: 'id'
                     }),
                     model = new Model({
                        rawData: {id: 0, 'name': '11'},
                        idProperty: 'id'
                     });
                  source7.update(model);
                  assert.equal(ls7.getItem('i').length, 1);
               });
            });
         });

         describe('.destroy()', function() {
            context('when the model is exists', function() {
               it('should return success', function(done) {
                  source6.destroy(existsId).addCallbacks(function(success) {
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
                  source6.destroy(existsId).addCallbacks(function() {
                     source6.read(existsId).addCallbacks(function() {
                        done(new Error('The model still exists'));
                     }, function() {
                        done();
                     });
                  }, function(err) {
                     done(err);
                  });
               });

               it('should decrease the size of raw data', function(done) {
                  var targetLength = ls6.getItem('k') - 1;
                  source6.destroy(existsId).addCallbacks(function() {
                     try {
                        assert.strictEqual(targetLength, ls6.getItem('k'));
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
                  source6.destroy(notExistsId).addBoth(function(err) {
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
                  source6.merge(notExistsId, existsId).addBoth(function(err) {
                     if (err instanceof Error) {
                        done();
                     } else {
                        done(new Error('That\'s no Error'));
                     }
                  });
               });

               it('should return an error', function(done) {
                  source6.merge(existsId, notExistsId).addBoth(function(err) {
                     if (err instanceof Error) {
                        done();
                     } else {
                        done(new Error('That\'s no Error'));
                     }
                  });
               });
            });

            it('should merge models', function(done) {
               source6.merge(existsId, existsId2).addCallbacks(function() {
                  source6.read(existsId).addCallbacks(function() {
                     source6.read(existsId2).addCallbacks(function() {
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
               var oldLength = ls6.getItem('k');
               source6.copy(existsId).addCallbacks(function() {
                  if (ls6.getItem('k') === 1 + oldLength) {
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
               var query = new Query();
               source6.query(query).addCallbacks(function(ds) {
                  try {
                     assert.instanceOf(ds, DataSet);
                     assert.strictEqual(ds.getAll().getCount(), ls6.getItem('k'));
                     done();
                  } catch (err) {
                     done(err);
                  }
               }, function(err) {
                  done(err);
               });
            });

            it('should work with no query', function(done) {
               source6.query().addCallbacks(function(ds) {
                  try {
                     assert.instanceOf(ds, DataSet);
                     assert.strictEqual(ds.getAll().getCount(), ls6.getItem('k'));
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

               source6.query(query).addCallbacks(function(ds) {
                  try {
                     var itemsProperty = ds.getItemsProperty();
                     var property = ds.getProperty(itemsProperty);
                     assert.instanceOf(property, RecordSet);
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
               source6.setListModule(MyList);
               source6.query().addCallbacks(function(ds) {
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
               source6.setModel(MyModel);
               source6.query().addCallbacks(function(ds) {
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
               source6.query(new Query().limit(2)).addCallbacks(function(ds) {
                  try {
                     assert.instanceOf(ds, DataSet);
                     assert.strictEqual(ds.getMetaData().total, 2);
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
});
