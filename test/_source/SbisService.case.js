/* global define, describe, context, beforeEach, afterEach, it, assert, DeferredCanceledError */
define([
   'Types/di',
   'Types/_source/IRpc',
   'Types/_source/DataSet',
   'Types/_entity/Model',
   'Types/_collection/RecordSet',
   'Types/_collection/List',
   'Types/_source/Query',
   'Core/core-extend',
   'Core/Deferred',
   'Types/_entity/adapter/Sbis'
], function(
   Di,
   IRpc,
   DataSet,
   Model,
   RecordSet,
   List,
   QueryModule,
   coreExtend,
   Deferred
) {
   'use strict';

   IRpc = IRpc.default;
   DataSet = DataSet.default;
   Model = Model.default;
   RecordSet = RecordSet.default;
   List = List.default;
   var Query = QueryModule.default;
   var NavigationType = QueryModule.NavigationType;

   return function(SbisService, provider) {//Mock of Types/_source/provider/SbisBusinessLogic
      var meta = [
            {n: 'Фамилия', t: 'Строка'},
            {n: 'Имя', t: 'Строка'},
            {n: 'Отчество', t: 'Строка'},
            {n: '@Ид', t: 'Число целое'},
            {n: 'Должность', t: 'Строка'},
            {n: 'В штате', t: 'Логическое'}
         ],
         SbisBusinessLogic = (function() {
            var lastId = 0,
               existsId = 7,
               existsTooId = 987,
               notExistsId = 99,
               textId = 'uuid';

            var Mock = coreExtend([IRpc], {
               _cfg: {},
               _$binding: {},
               constructor: function(cfg) {
                  this._cfg = cfg;
               },
               call: function(method, args) {
                  var def = new Deferred(),
                     idPosition = 3,
                     error = '',
                     data;

                  switch (this._cfg.endpoint.contract) {
                     case 'Товар':
                     case 'Продукт':
                        switch (method) {
                           case 'Создать':
                              data = {
                                 _type: 'record',
                                 d: [
                                    '',
                                    '',
                                    '',
                                    ++lastId,
                                    '',
                                    false
                                 ],
                                 s: meta
                              };
                              break;

                           case 'Прочитать':
                              if (args['ИдО'] === existsId) {
                                 data = {
                                    _type: 'record',
                                    d: [
                                       'Иванов',
                                       'Иван',
                                       'Иванович',
                                       existsId,
                                       'Инженер',
                                       true
                                    ],
                                    s: meta
                                 };
                              } else {
                                 error = 'Model is not found';
                              }
                              break;

                           case 'Записать':
                              if (args['Запись']) {
                                 if (args['Запись'].d && args['Запись'].d[idPosition]) {
                                    data = args['Запись'].d[idPosition];
                                 } else {
                                    data = 99;
                                 }
                              } else {
                                 data = true;
                              }
                              break;
                           case 'Продукт.Удалить':
                           case 'Удалить':
                              if (args['ИдО'] === existsId ||
                                 args['ИдО'].indexOf(String(existsId)) !== -1
                              ) {
                                 data = existsId;
                              } else if (args['ИдО'] === textId ||
                                 args['ИдО'].indexOf(String(textId)) !== -1
                              ) {
                                 data = textId;
                              } else if (args['ИдО'] === existsTooId ||
                                 args['ИдО'].indexOf(String(existsTooId)) !== -1
                              ) {
                                 data = existsTooId;
                              } else {
                                 error = 'Model is not found';
                              }
                              break;

                           case 'Список':
                              data = {
                                 _type: 'recordset',
                                 d: [
                                    [
                                       'Иванов',
                                       'Иван',
                                       'Иванович',
                                       existsId,
                                       'Инженер',
                                       true
                                    ],
                                    [
                                       'Петров',
                                       'Петр',
                                       'Петрович',
                                       1 + existsId,
                                       'Специалист',
                                       true
                                    ]
                                 ],
                                 s: meta
                              };
                              break;
                           case 'Sync':
                           case 'ВставитьДо':
                           case 'ВставитьПосле':
                           case 'Произвольный':
                           case 'IndexNumber.Move':
                           case 'Product.Mymove':
                           case 'ПорядковыйНомер.ВставитьДо':
                           case 'ПорядковыйНомер.ВставитьПосле':
                              break;
                           default:
                              error = 'Method "' + method + '" is undefined';
                        }
                        break;

                     case 'ПорядковыйНомер':
                        switch (method) {
                           case 'ВставитьДо':
                           case 'ВставитьПосле':
                              break;
                        }
                        break;
                     case 'IndexNumber.Move':
                        break;
                     default:
                        error = 'Contract "' + this._cfg.endpoint.contract + '" is not found';
                  }

                  setTimeout(function() {
                     Mock.lastRequest = {
                        cfg: this._cfg,
                        method: method,
                        args: args
                     };

                     if (error) {
                        return def.errback(error);
                     }

                     def.callback(data);
                  }.bind(this), 0);

                  Mock.lastDeferred = def;

                  return def;
               }
            });

            Mock.existsId = existsId;
            Mock.notExistsId = notExistsId;

            return Mock;
         })();


      var getSampleModel = function() {
            var model = new Model({
               adapter: 'Types/entity:adapter.Sbis',
               idProperty: '@Ид'
            });
            model.addField({name: '@Ид', type: 'integer'}, undefined, 1);
            model.addField({name: 'Фамилия', type: 'string'}, undefined, 'tst');

            return model;
         },
         getSampleMeta = function() {
            return {
               a: 1,
               b: 2,
               c: 3
            };
         },
         testArgIsModel = function(arg, model) {
            assert.strictEqual(arg._type, 'record');
            assert.deepEqual(arg.d, model.getRawData().d);
            assert.deepEqual(arg.s, model.getRawData().s);
         },
         testArgIsDataSet = function(arg, dataSet) {
            assert.strictEqual(arg._type, 'recordset');
            assert.deepEqual(arg.d, dataSet.getRawData().d);
            assert.deepEqual(arg.s, dataSet.getRawData().s);
         },
         service;

      beforeEach(function() {
         SbisBusinessLogic.lastRequest = {};
         SbisBusinessLogic.lastDeferred = null;

         //Replace of standard with mock
         Di.register(provider, SbisBusinessLogic);

         service = new SbisService({
            endpoint: 'Товар'
         });
      });

      afterEach(function() {
         service = undefined;
      });

      describe('.create()', function() {
         context('when the service is exists', function() {
            it('should return an empty model', function(done) {
               service.create().addCallbacks(function(model) {
                  try {
                     assert.isTrue(model instanceof Model);
                     assert.isTrue(model.getId() > 0);
                     assert.strictEqual(model.get('Фамилия'), '');
                     done();
                  } catch (err) {
                     done(err);
                  }
               }, function(err) {
                  done(err);
               });
            });

            it('should generate a valid request', function(done) {
               service.create().addCallbacks(function() {
                  try {
                     var args = SbisBusinessLogic.lastRequest.args;

                     assert.isNull(args['ИмяМетода']);
                     assert.strictEqual(args['Фильтр'].d[0], true, 'Wrong value for argument Фильтр.ВызовИзБраузера');
                     assert.strictEqual(args['Фильтр'].s[0].n, 'ВызовИзБраузера', 'Wrong name for argument Фильтр.ВызовИзБраузера');
                     assert.strictEqual(args['Фильтр'].s[0].t, 'Логическое', 'Wrong type for argument Фильтр.ВызовИзБраузера');

                     done();
                  } catch (err) {
                     done(err);
                  }
               }, function(err) {
                  done(err);
               });
            });

            it('should generate request with additional fields from record', function(done) {
               var model = getSampleModel();
               service.create(model).addCallbacks(function() {
                  try {
                     var args = SbisBusinessLogic.lastRequest.args;
                     testArgIsModel(args['Фильтр'], model);
                     done();
                  } catch (err) {
                     done(err);
                  }
               }, function(err) {
                  done(err);
               });
            });

            it('should generate request with additional fields from object', function(done) {
               var meta = getSampleMeta();
               service.create(meta).addCallbacks(function() {
                  try {
                     var args = SbisBusinessLogic.lastRequest.args,
                        fields = Object.keys(meta);
                     meta['ВызовИзБраузера'] = true;
                     fields.push('ВызовИзБраузера');

                     assert.strictEqual(args['Фильтр'].s.length, fields.length);
                     for (var i = 0; i < args['Фильтр'].d.length; i++) {
                        assert.strictEqual(args['Фильтр'].s[i].n, fields[i]);
                        assert.strictEqual(args['Фильтр'].d[i], meta[fields[i]]);
                     }
                     done();
                  } catch (err) {
                     done(err);
                  }
               }, function(err) {
                  done(err);
               });
            });

            it('should generate request with Date field', function(done) {
               var date = new Date();
               if (!date.setSQLSerializationMode) {
                  done();
               }

               date.setSQLSerializationMode(Date.SQL_SERIALIZE_MODE_DATE);
               var meta = {foo: date};
               service.create(meta).addCallbacks(function() {
                  try {
                     var args = SbisBusinessLogic.lastRequest.args;

                     assert.strictEqual(args['Фильтр'].s[0].n, 'foo');
                     assert.strictEqual(args['Фильтр'].s[0].t, 'Дата');
                     done();
                  } catch (err) {
                     done(err);
                  }
               }, function(err) {
                  done(err);
               });
            });

            it('should generate request with Time field', function(done) {
               var date = new Date();
               if (!date.setSQLSerializationMode) {
                  done();
               }

               date.setSQLSerializationMode(Date.SQL_SERIALIZE_MODE_TIME);
               var meta = {foo: date};
               service.create(meta).addCallbacks(function() {
                  try {
                     var args = SbisBusinessLogic.lastRequest.args;

                     assert.strictEqual(args['Фильтр'].s[0].n, 'foo');
                     assert.strictEqual(args['Фильтр'].s[0].t, 'Время');
                     done();
                  } catch (err) {
                     done(err);
                  }
               }, function(err) {
                  done(err);
               });
            });

            it('should generate request with custom method name in the filter', function(done) {
               var service = new SbisService({
                  endpoint: 'Товар',
                  binding: {
                     format: 'ПрочитатьФормат'
                  }
               });
               service.create().addCallbacks(function() {
                  try {
                     var args = SbisBusinessLogic.lastRequest.args;
                     assert.strictEqual(args['ИмяМетода'], 'ПрочитатьФормат');
                     done();
                  } catch (err) {
                     done(err);
                  }
               }, function(err) {
                  done(err);
               });
            });

            it('should cancel the inner request', function() {
               var def = service.create(),
                  lastDef = SbisBusinessLogic.lastDeferred;

               def.cancel();
               assert.instanceOf(lastDef.getResult(), DeferredCanceledError);
            });

            it('should sort fields in filter', function(done) {
               var filter = {'Раздел': 1, 'Тип': 3, 'Раздел@': true, 'Демо': true, 'Раздел$': true};
               service.create(filter).addBoth(function() {
                  var s = SbisBusinessLogic.lastRequest.args.Фильтр.s,
                     sortNames = s.map(function(i) {
                        return i.n;
                     }).sort();
                  for (var i = 0; i < sortNames.length; i++) {
                     assert.strictEqual(s[i].n, sortNames[i]);
                  }
                  done();
               });
            });

         });

         context('when the service isn\'t exists', function() {
            it('should return an error', function(done) {
               var service = new SbisService({
                  endpoint: 'Купец'
               });
               service.create().addBoth(function(err) {
                  if (err instanceof Error) {
                     done();
                  } else {
                     done(new Error('That\'s no Error'));
                  }
               });
            });
         });
      });

      describe('.read()', function() {
         context('when the service is exists', function() {
            context('and the model is exists', function() {
               it('should return valid model', function(done) {
                  service.read(SbisBusinessLogic.existsId).addCallbacks(function(model) {
                     try {
                        assert.isTrue(model instanceof Model);
                        assert.strictEqual(model.getId(), SbisBusinessLogic.existsId);
                        assert.strictEqual(model.get('Фамилия'), 'Иванов');
                        done();
                     } catch (err) {
                        done(err);
                     }
                  }, function(err) {
                     done(err);
                  });
               });

               it('should generate a valid request', function(done) {
                  var service = new SbisService({
                     endpoint: 'Товар',
                     binding: {
                        format: 'Формат'
                     }
                  });
                  service.read(
                     SbisBusinessLogic.existsId
                  ).addCallbacks(function() {
                     try {
                        var args = SbisBusinessLogic.lastRequest.args;
                        assert.strictEqual(args['ИмяМетода'], 'Формат');
                        assert.strictEqual(args['ИдО'], SbisBusinessLogic.existsId);
                        done();
                     } catch (err) {
                        done(err);
                     }
                  }, function(err) {
                     done(err);
                  });
               });

               it('should generate request with additional fields from record', function(done) {
                  service.read(
                     SbisBusinessLogic.existsId,
                     getSampleModel()
                  ).addCallbacks(function() {
                     try {
                        var args = SbisBusinessLogic.lastRequest.args;
                        testArgIsModel(args['ДопПоля'], getSampleModel());
                        done();
                     } catch (err) {
                        done(err);
                     }
                  }, function(err) {
                     done(err);
                  });
               });

               it('should generate request with additional fields from object', function(done) {
                  service.read(
                     SbisBusinessLogic.existsId,
                     getSampleMeta()
                  ).addCallbacks(function() {
                     try {
                        var args = SbisBusinessLogic.lastRequest.args;
                        assert.deepEqual(args['ДопПоля'], getSampleMeta());
                        done();
                     } catch (err) {
                        done(err);
                     }
                  }, function(err) {
                     done(err);
                  });
               });
            });

            context('and the model isn\'t exists', function() {
               it('should return an error', function(done) {
                  service.read(SbisBusinessLogic.notExistsId).addBoth(function(err) {
                     if (err instanceof Error) {
                        done();
                     } else {
                        done(new Error('That\'s no Error'));
                     }
                  });
               });
            });
         });

         context('when the service isn\'t exists', function() {
            it('should return an error', function(done) {
               var service = new SbisService({
                  endpoint: 'Купец'
               });
               service.read(SbisBusinessLogic.existsId).addBoth(function(err) {
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
         context('when the service is exists', function() {
            context('and the model was stored', function() {
               it('should update the model', function(done) {
                  service.read(SbisBusinessLogic.existsId).addCallbacks(function(model) {
                     model.set('Фамилия', 'Петров');
                     service.update(model).addCallbacks(function(success) {
                        try {
                           assert.isTrue(success > 0);
                           assert.isFalse(model.isChanged());
                           assert.strictEqual(model.get('Фамилия'), 'Петров');
                           done();
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

            context('and the model was not stored', function() {
               var testModel = function(success, model, done) {
                  try {
                     assert.isTrue(success > 0);
                     assert.isFalse(model.isChanged());
                     assert.isTrue(model.getId() > 0);
                     done();
                  } catch (err) {
                     done(err);
                  }
               };

               it('should create the model by 1st way', function(done) {
                  var service = new SbisService({
                     endpoint: 'Товар',
                     idProperty: '@Ид'
                  });
                  service.create().addCallbacks(function(model) {
                     service.update(model).addCallbacks(function(success) {
                        testModel(success, model, done);
                     }, function(err) {
                        done(err);
                     });
                  }, function(err) {
                     done(err);
                  });
               });

               it('should create the model by 2nd way', function(done) {
                  var service = new SbisService({
                        endpoint: 'Товар',
                        idProperty: '@Ид'
                     }),
                     model = getSampleModel();

                  service.update(model).addCallbacks(function(success) {
                     testModel(success, model, done);
                  }, function(err) {
                     done(err);
                  });
               });
            });

            it('should generate a valid request', function(done) {
               var service = new SbisService({
                  endpoint: 'Товар',
                  binding: {
                     format: 'Формат'
                  }
               });
               service.read(SbisBusinessLogic.existsId).addCallbacks(function(model) {
                  service.update(model).addCallbacks(function() {
                     try {
                        var args = SbisBusinessLogic.lastRequest.args;
                        testArgIsModel(args['Запись'], model);
                        done();
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

            it('should generate request with additional fields from record', function(done) {
               var meta = new Model({
                  adapter: 'Types/entity:adapter.Sbis'
               });
               meta.addField({name: 'Тест', type: 'integer'}, undefined, 7);
               service.update(
                  getSampleModel(),
                  meta
               ).addCallbacks(function() {
                  try {
                     var args = SbisBusinessLogic.lastRequest.args;
                     testArgIsModel(args['ДопПоля'], meta);
                     done();
                  } catch (err) {
                     done(err);
                  }
               }, function(err) {
                  done(err);
               });
            });

            it('should generate request with additional fields from object', function(done) {
               service.update(
                  getSampleModel(),
                  getSampleMeta()
               ).addCallbacks(function() {
                  try {
                     var args = SbisBusinessLogic.lastRequest.args;
                     assert.deepEqual(args['ДопПоля'], getSampleMeta());
                     done();
                  } catch (err) {
                     done(err);
                  }
               }, function(err) {
                  done(err);
               });
            });

            it('should cancel the inner request', function() {
               var model = getSampleModel(),
                  def = service.update(model),
                  lastDef = SbisBusinessLogic.lastDeferred;

               def.cancel();
               assert.instanceOf(lastDef.getResult(), DeferredCanceledError);
            });
         });

         context('when the service isn\'t exists', function() {
            it('should return an error', function(done) {
               service.create().addCallbacks(function(model) {
                  var service = new SbisService({
                     endpoint: 'Купец'
                  });
                  service.update(model).addBoth(function(err) {
                     if (err instanceof Error) {
                        done();
                     } else {
                        done(new Error('That\'s no Error'));
                     }
                  });
               }, function(err) {
                  done(err);
               });
            });
         });

         context('when is updating few rows', function() {
            it('should accept RecordSet', function(done) {
               var
                  rs = new RecordSet({
                     rawData: {
                        _type: 'recordset',
                        d: [[
                           'Иванов',
                           'Иван',
                           'Иванович',
                           1,
                           'Инженер',
                           true
                        ]],
                        s: meta
                     },
                     adapter: 'Types/entity:adapter.Sbis'
                  }),
                  service = new SbisService({
                     endpoint: 'Продукт'
                  });

               service.update(rs).addCallback(function() {
                  var args = SbisBusinessLogic.lastRequest.args;
                  assert.isObject(args.Записи);
                  done();
               });
            });

            it('should call updateBatch', function(done) {
               var RecordState = Model.RecordState,
                  format = [
                     {name: 'id', type: 'integer'},
                     {name: 'name', type: 'string'}
                  ],
                  rs = new RecordSet({
                     format: format,
                     adapter: 'Types/entity:adapter.Sbis'
                  }),
                  service = new SbisService({
                     endpoint: 'Продукт'
                  }),
                  binding = service.getBinding(),
                  record,
                  addRecord = function(data) {
                     record = new Model({
                        format: rs.getFormat(),
                        adapter: rs.getAdapter()
                     });
                     record.set(data);
                     rs.add(record);
                  };

               binding.updateBatch = 'Sync';
               service.setBinding(binding);

               addRecord({id: 1, name: 'sample1'});
               addRecord({id: 2, name: 'sample2'});
               addRecord({id: 3, name: 'sample3'});
               rs.acceptChanges();
               addRecord({id: 4, name: 'sample4'});

               rs.at(0).set('name', 'foo');
               rs.at(1).setState(RecordState.DELETED);

               service.update(rs).addCallback(function() {
                  var args = SbisBusinessLogic.lastRequest.args;

                  assert.equal(args.changed.d.length, 1);
                  assert.equal(args.changed.d[0][0], 1);

                  assert.equal(args.added.d.length, 1);
                  assert.equal(args.added.d[0][0], 4);

                  assert.deepEqual(args.removed, [2]);

                  done();
               });

            });
         });
      });

      describe('.destroy()', function() {
         context('when the service is exists', function() {
            context('and the model is exists', function() {
               it('should return success', function(done) {
                  service.destroy(SbisBusinessLogic.existsId).addCallbacks(function(success) {
                     try {
                        assert.strictEqual(success, SbisBusinessLogic.existsId);
                        done();
                     } catch (err) {
                        done(err);
                     }
                  }, function(err) {
                     done(err);
                  });
               });
            });

            context('and the model isn\'t exists', function() {
               it('should return an error', function(done) {
                  service.destroy(SbisBusinessLogic.notExistsId).addBoth(function(err) {
                     if (err instanceof Error) {
                        done();
                     } else {
                        done(new Error('That\'s no Error'));
                     }
                  });
               });
            });

            it('should delete a few records', function(done) {
               service.destroy([0, SbisBusinessLogic.existsId, 1]).addCallbacks(function(success) {
                  try {
                     var args = SbisBusinessLogic.lastRequest.args;
                     assert.equal(args['ИдО'][0], 0);
                     assert.equal(args['ИдО'][1], SbisBusinessLogic.existsId);
                     assert.equal(args['ИдО'][2], 1);
                     assert.equal(success[0], SbisBusinessLogic.existsId);
                     done();
                  } catch (err) {
                     done(err);
                  }
               }, function(err) {
                  done(err);
               });
            });

            it('should delete records by a composite key', function(done) {
               var anId = 987;
               service.destroy([SbisBusinessLogic.existsId + ',Товар', anId + ',Продукт']).addCallbacks(function(success) {
                  try {
                     var args = SbisBusinessLogic.lastRequest.args;
                     assert.equal(args['ИдО'], anId);
                     assert.equal(success[0], SbisBusinessLogic.existsId);
                     assert.equal(success[1], anId);
                     done();
                  } catch (err) {
                     done(err);
                  }
               }, function(err) {
                  done(err);
               });
            });

            it('should handle not a composite key', function(done) {
               var notABlName = SbisBusinessLogic.existsId + ',(Товар)';
               service.destroy([notABlName]).addCallbacks(function() {
                  done(new Error('It shouldn\'t be a successfull call'));
               }, function() {
                  try {
                     var args = SbisBusinessLogic.lastRequest.args;
                     assert.equal(args['ИдО'], notABlName);
                     done();
                  } catch (err) {
                     done(err);
                  }
               });
            });

            it('should delete records by text key', function(done) {
               var anId = 'uuid';
               service.destroy([anId]).addCallbacks(function(success) {
                  try {
                     var args = SbisBusinessLogic.lastRequest.args;
                     assert.strictEqual(args['ИдО'][0], anId);
                     assert.strictEqual(success[0], anId);
                     done();
                  } catch (err) {
                     done(err);
                  }
               }, function(err) {
                  done(err);
               });
            });

            it('should generate a valid request', function(done) {
               service.destroy(
                  SbisBusinessLogic.existsId
               ).addCallbacks(function() {
                  try {
                     var args = SbisBusinessLogic.lastRequest.args;
                     assert.equal(args['ИдО'][0], SbisBusinessLogic.existsId);
                     done();
                  } catch (err) {
                     done(err);
                  }
               }, function(err) {
                  done(err);
               });
            });

            it('should generate request with additional fields from record', function(done) {
               service.destroy(
                  SbisBusinessLogic.existsId,
                  getSampleModel()
               ).addCallbacks(function() {
                  try {
                     var args = SbisBusinessLogic.lastRequest.args;
                     testArgIsModel(args['ДопПоля'], getSampleModel());
                     done();
                  } catch (err) {
                     done(err);
                  }
               }, function(err) {
                  done(err);
               });
            });

            it('should generate request with additional fields from object', function(done) {
               service.destroy(
                  SbisBusinessLogic.existsId,
                  getSampleMeta()
               ).addCallbacks(function() {
                  try {
                     var args = SbisBusinessLogic.lastRequest.args;
                     assert.deepEqual(args['ДопПоля'], getSampleMeta());
                     done();
                  } catch (err) {
                     done(err);
                  }
               }, function(err) {
                  done(err);
               });
            });
         });

         context('when the service isn\'t exists', function() {
            it('should return an error', function(done) {
               var service = new SbisService({
                  endpoint: 'Купец'
               });
               service.destroy(SbisBusinessLogic.existsId).addBoth(function(err) {
                  if (err instanceof Error) {
                     done();
                  } else {
                     done(new Error('That\'s no Error'));
                  }
               });
            });
         });
      });

      describe('.query()', function() {
         context('when the service is exists', function() {
            it('should return a valid dataset', function(done) {
               service.query(new Query()).addCallbacks(function(ds) {
                  try {
                     assert.isTrue(ds instanceof DataSet);
                     assert.strictEqual(ds.getAll().getCount(), 2);
                     done();
                  } catch (err) {
                     done(err);
                  }
               }, function(err) {
                  done(err);
               });
            });

            it('should take idProperty for dataset from raw data', function(done) {
               service.query(new Query()).addCallbacks(function(ds) {
                  try {
                     assert.strictEqual(ds.getIdProperty(), '@Ид');
                     done();
                  } catch (err) {
                     done(err);
                  }
               }, function(err) {
                  done(err);
               });
            });

            it('should work with no query', function(done) {
               service.query().addCallbacks(function(ds) {
                  try {
                     assert.isTrue(ds instanceof DataSet);
                     assert.strictEqual(ds.getAll().getCount(), 2);
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
               service.setListModule(MyList);
               service.query().addCallbacks(function(ds) {
                  try {
                     assert.isTrue(ds.getAll() instanceof MyList);
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
               service.setModel(MyModel);
               service.query().addCallbacks(function(ds) {
                  try {
                     assert.isTrue(ds.getAll().at(0) instanceof MyModel);
                     done();
                  } catch (err) {
                     done(err);
                  }
               }, function(err) {
                  done(err);
               });
            });

            it('should generate a valid request', function(done) {
               var recData = {
                     d: [1],
                     s: [{n: 'Число целое'}]
                  },
                  rsData = {
                     d: [[1], [2]],
                     s: [{n: 'Число целое'}]
                  },
                  query = new Query();
               query
                  .from('Goods')
                  .where({
                     id: 5,
                     enabled: true,
                     title: 'abc*',
                     path: [1, 2, 3],
                     obj: {a: 1, b: 2},
                     rec: new Model({
                        adapter: 'Types/entity:adapter.Sbis',
                        rawData: recData
                     }),
                     rs: new RecordSet({
                        adapter: 'Types/entity:adapter.Sbis',
                        rawData: rsData
                     })
                  })
                  .orderBy({
                     id: false,
                     enabled: true
                  })
                  .offset(100)
                  .limit(33);

               service.query(query).addCallbacks(function() {
                  try {
                     var args = SbisBusinessLogic.lastRequest.args;

                     assert.strictEqual(args['Фильтр'].d[1], 5);
                     assert.strictEqual(args['Фильтр'].s[1].n, 'id');
                     assert.strictEqual(args['Фильтр'].s[1].t, 'Число целое');

                     assert.isTrue(args['Фильтр'].d[0]);
                     assert.strictEqual(args['Фильтр'].s[0].n, 'enabled');
                     assert.strictEqual(args['Фильтр'].s[0].t, 'Логическое');

                     assert.strictEqual(args['Фильтр'].d[6], 'abc*');
                     assert.strictEqual(args['Фильтр'].s[6].n, 'title');
                     assert.strictEqual(args['Фильтр'].s[6].t, 'Строка');

                     assert.deepEqual(args['Фильтр'].d[3], [1, 2, 3]);
                     assert.strictEqual(args['Фильтр'].s[3].n, 'path');
                     assert.strictEqual(args['Фильтр'].s[3].t.n, 'Массив');
                     assert.strictEqual(args['Фильтр'].s[3].t.t, 'Число целое');

                     assert.deepEqual(args['Фильтр'].d[2], {a: 1, b: 2});
                     assert.strictEqual(args['Фильтр'].s[2].n, 'obj');
                     assert.strictEqual(args['Фильтр'].s[2].t, 'JSON-объект');

                     assert.deepEqual(args['Фильтр'].d[4].d, recData.d);
                     assert.deepEqual(args['Фильтр'].d[4].s, recData.s);
                     assert.strictEqual(args['Фильтр'].s[4].n, 'rec');
                     assert.strictEqual(args['Фильтр'].s[4].t, 'Запись');

                     assert.deepEqual(args['Фильтр'].d[5].d, rsData.d);
                     assert.deepEqual(args['Фильтр'].d[5].s, rsData.s);
                     assert.strictEqual(args['Фильтр'].s[5].n, 'rs');
                     assert.strictEqual(args['Фильтр'].s[5].t, 'Выборка');

                     assert.strictEqual(args['Сортировка'].d[0][1], 'id');
                     assert.isFalse(args['Сортировка'].d[0][2]);
                     assert.isTrue(args['Сортировка'].d[0][0]);

                     assert.strictEqual(args['Сортировка'].d[1][1], 'enabled');
                     assert.isTrue(args['Сортировка'].d[1][2]);
                     assert.isFalse(args['Сортировка'].d[1][0]);

                     assert.strictEqual(args['Сортировка'].s[0].n, 'l');
                     assert.strictEqual(args['Сортировка'].s[1].n, 'n');
                     assert.strictEqual(args['Сортировка'].s[2].n, 'o');

                     assert.strictEqual(args['Навигация'].d[2], 3);
                     assert.strictEqual(args['Навигация'].s[2].n, 'Страница');

                     assert.strictEqual(args['Навигация'].d[1], 33);
                     assert.strictEqual(args['Навигация'].s[1].n, 'РазмерСтраницы');

                     assert.isTrue(args['Навигация'].d[0]);
                     assert.strictEqual(args['Навигация'].s[0].n, 'ЕстьЕще');

                     assert.strictEqual(args['ДопПоля'].length, 0);

                     done();
                  } catch (err) {
                     done(err);
                  }
               }, function(err) {
                  done(err);
               });
            });

            it('should generate request with filter contains only given data', function(done) {
               var MyModel = coreExtend.extend(Model, {
                     $protected: {
                        _options: {
                           rawData: {
                              a: 1
                           }
                        }
                     }
                  }),
                  query = new Query();

               service.setModel(MyModel);
               query.where({
                  b: 2
               });
               service.query(query).addCallbacks(function() {
                  try {
                     var args = SbisBusinessLogic.lastRequest.args;
                     assert.strictEqual(args['Фильтр'].s.length, 1);
                     assert.strictEqual(args['Фильтр'].s[0].n, 'b');
                     done();
                  } catch (err) {
                     done(err);
                  }
               }, function(err) {
                  done(err);
               });
            });

            it('should generate request with an empty filter', function(done) {
               var query = new Query();
               query.where({});
               service.query(query).addCallbacks(function() {
                  try {
                     var args = SbisBusinessLogic.lastRequest.args;
                     assert.strictEqual(args['Фильтр'].s.length, 0);
                     assert.strictEqual(args['Фильтр'].d.length, 0);
                     done();
                  } catch (err) {
                     done(err);
                  }
               }, function(err) {
                  done(err);
               });
            });

            it('should generate request with given null policy', function(done) {
               var query = new Query();
               query.orderBy('id', true, true);
               service.query(query).addCallbacks(function() {
                  try {
                     var args = SbisBusinessLogic.lastRequest.args;
                     assert.strictEqual(args['Сортировка'].s.length, 3);
                     assert.strictEqual(args['Сортировка'].s[0].n, 'l');
                     assert.strictEqual(args['Сортировка'].s[1].n, 'n');
                     assert.strictEqual(args['Сортировка'].s[2].n, 'o');

                     assert.strictEqual(args['Сортировка'].d.length, 1);
                     assert.strictEqual(args['Сортировка'].d[0].length, 3);
                     assert.strictEqual(args['Сортировка'].d[0][0], true);
                     assert.strictEqual(args['Сортировка'].d[0][1], 'id');
                     assert.strictEqual(args['Сортировка'].d[0][2], true);
                     done();
                  } catch (err) {
                     done(err);
                  }
               }, function(err) {
                  done(err);
               });
            });

            it('should generate request with expand "None" mode', function() {
               var query = new Query();
               query.meta({
                  expand: QueryModule.ExpandMode.None
               });

               return service.query(query).then(function() {
                  var args = SbisBusinessLogic.lastRequest.args;
                  assert.strictEqual(args['Фильтр'].s.length, 1);
                  assert.strictEqual(args['Фильтр'].s[0].n, 'Разворот');
                  assert.strictEqual(args['Фильтр'].d[0], 'Без разворота');
               });
            });

            it('should generate request with expand "Nodes" mode', function() {
               var query = new Query();
               query.meta({
                  expand: QueryModule.ExpandMode.Nodes
               });

               return service.query(query).then(function() {
                  var args = SbisBusinessLogic.lastRequest.args;
                  assert.strictEqual(args['Фильтр'].s.length, 2);
                  assert.strictEqual(args['Фильтр'].s[0].n, 'ВидДерева');
                  assert.strictEqual(args['Фильтр'].d[0], 'Только узлы');
                  assert.strictEqual(args['Фильтр'].s[1].n, 'Разворот');
                  assert.strictEqual(args['Фильтр'].d[1], 'С разворотом');
               });
            });

            it('should generate request with expand "Leaves" mode', function() {
               var query = new Query();
               query.meta({
                  expand: QueryModule.ExpandMode.Leaves
               });

               return service.query(query).then(function() {
                  var args = SbisBusinessLogic.lastRequest.args;
                  assert.strictEqual(args['Фильтр'].s.length, 2);
                  assert.strictEqual(args['Фильтр'].s[0].n, 'ВидДерева');
                  assert.strictEqual(args['Фильтр'].d[0], 'Только листья');
                  assert.strictEqual(args['Фильтр'].s[1].n, 'Разворот');
                  assert.strictEqual(args['Фильтр'].d[1], 'С разворотом');
               });
            });

            it('should generate request with expand "All" mode', function() {
               var query = new Query();
               query.meta({
                  expand: QueryModule.ExpandMode.All
               });

               return service.query(query).then(function() {
                  var args = SbisBusinessLogic.lastRequest.args;
                  assert.strictEqual(args['Фильтр'].s.length, 2);
                  assert.strictEqual(args['Фильтр'].s[0].n, 'ВидДерева');
                  assert.strictEqual(args['Фильтр'].d[0], 'Узлы и листья');
                  assert.strictEqual(args['Фильтр'].s[1].n, 'Разворот');
                  assert.strictEqual(args['Фильтр'].d[1], 'С разворотом');
               });
            });

            it('should generate request with additional fields from query select', function(done) {
               var query = new Query();
               query.select(['Foo']);

               service.query(query).addCallbacks(function() {
                  try {
                     var args = SbisBusinessLogic.lastRequest.args;
                     assert.deepEqual(args['ДопПоля'], ['Foo']);
                     done();
                  } catch (err) {
                     done(err);
                  }
               }, function(err) {
                  done(err);
               });
            });

            it('should generate request with null navigation and undefined limit', function() {
               var query = new Query();
               query.limit(undefined);
               return service.query(query).then(function() {
                  var args = SbisBusinessLogic.lastRequest.args;
                  assert.isNull(args['Навигация']);
               });
            });

            it('should generate request with null navigation and null limit', function() {
               var query = new Query();
               query.limit(null);
               return service.query(query).then(function() {
                  var args = SbisBusinessLogic.lastRequest.args;
                  assert.isNull(args['Навигация']);
               });
            });

            it('should generate request with offset type navigation by option', function() {
               var service = new SbisService({
                     endpoint: 'Товар',
                     options: {
                        navigationType: SbisService.NAVIGATION_TYPE.OFFSET
                     }
                  }),
                  query = new Query(),
                  offset = 15,
                  limit = 50;

               query
                  .offset(offset)
                  .limit(limit);
               return service.query(query).then(function() {
                  var args = SbisBusinessLogic.lastRequest.args;

                  assert.strictEqual(args['Навигация'].s[0].n, 'HaveMore');
                  assert.strictEqual(args['Навигация'].d[0], true);

                  assert.strictEqual(args['Навигация'].s[1].n, 'Limit');
                  assert.strictEqual(args['Навигация'].d[1], limit);

                  assert.strictEqual(args['Навигация'].s[2].n, 'Offset');
                  assert.strictEqual(args['Навигация'].d[2], offset);
               });
            });

            it('should generate request with offset type navigation by meta data', function() {
               var service = new SbisService({
                     endpoint: 'Товар'
                  }),
                  query = new Query(),
                  offset = 15,
                  limit = 50;

               query
                  .meta({navigationType: NavigationType.Offset})
                  .offset(offset)
                  .limit(limit);
               return service.query(query).then(function() {
                  var args = SbisBusinessLogic.lastRequest.args;

                  assert.strictEqual(args['Навигация'].s[0].n, 'HaveMore');
                  assert.strictEqual(args['Навигация'].d[0], true);

                  assert.strictEqual(args['Навигация'].s[1].n, 'Limit');
                  assert.strictEqual(args['Навигация'].d[1], limit);

                  assert.strictEqual(args['Навигация'].s[2].n, 'Offset');
                  assert.strictEqual(args['Навигация'].d[2], offset);
               });
            });

            it('should generate request with null navigation if there is no limit', function() {
               var service = new SbisService({
                  endpoint: 'Товар'
               });
               var query = new Query()
                  .meta({navigationType: NavigationType.Position});

               return service.query(query).then(function() {
                  var args = SbisBusinessLogic.lastRequest.args;

                  assert.isNull(args['Навигация']);
                  assert.strictEqual(args['Фильтр'].d.length, 0);
               });
            });

            it('should generate request with position navigation and null position and "after" order', function() {
               var service = new SbisService({
                  endpoint: 'Товар'
               });
               var limit = 9;
               var query = new Query()
                  .meta({navigationType: NavigationType.Position})
                  .where({'id>=': null})
                  .limit(limit);

               return service.query(query).then(function() {
                  var args = SbisBusinessLogic.lastRequest.args;

                  assert.strictEqual(args['Навигация'].s[0].n, 'HaveMore');
                  assert.strictEqual(args['Навигация'].d[0], true);

                  assert.strictEqual(args['Навигация'].s[1].n, 'Limit');
                  assert.strictEqual(args['Навигация'].d[1], limit);

                  assert.strictEqual(args['Навигация'].s[2].n, 'Order');
                  assert.strictEqual(args['Навигация'].d[2], 'after');

                  assert.strictEqual(args['Навигация'].s[3].n, 'Position');
                  assert.strictEqual(args['Навигация'].s[3].t, 'Строка');
                  assert.strictEqual(args['Навигация'].d[3], null);
               });
            });

            it('should generate request with position navigation and null position and "before" order', function() {
               var service = new SbisService({
                  endpoint: 'Товар'
               });
               var limit = 9;
               var query = new Query()
                  .meta({navigationType: NavigationType.Position})
                  .where({'id<=': null})
                  .limit(limit);

               return service.query(query).then(function() {
                  var args = SbisBusinessLogic.lastRequest.args;

                  assert.strictEqual(args['Навигация'].s[0].n, 'HaveMore');
                  assert.strictEqual(args['Навигация'].d[0], true);

                  assert.strictEqual(args['Навигация'].s[1].n, 'Limit');
                  assert.strictEqual(args['Навигация'].d[1], limit);

                  assert.strictEqual(args['Навигация'].s[2].n, 'Order');
                  assert.strictEqual(args['Навигация'].d[2], 'before');

                  assert.strictEqual(args['Навигация'].s[3].n, 'Position');
                  assert.strictEqual(args['Навигация'].s[3].t, 'Строка');
                  assert.strictEqual(args['Навигация'].d[3], null);
               });
            });

            it('should generate request with position navigation and null position if there is undefined value in conditions', function() {
               var service = new SbisService({
                  endpoint: 'Товар'
               });
               var limit = 9;
               var query = new Query()
                  .meta({navigationType: NavigationType.Position})
                  .where({'id>=': undefined})
                  .limit(limit);

               return service.query(query).then(function() {
                  var args = SbisBusinessLogic.lastRequest.args;

                  assert.strictEqual(args['Навигация'].s[0].n, 'HaveMore');
                  assert.strictEqual(args['Навигация'].d[0], true);

                  assert.strictEqual(args['Навигация'].s[1].n, 'Limit');
                  assert.strictEqual(args['Навигация'].d[1], limit);

                  assert.strictEqual(args['Навигация'].s[2].n, 'Order');
                  assert.strictEqual(args['Навигация'].d[2], 'after');

                  assert.strictEqual(args['Навигация'].s[3].n, 'Position');
                  assert.strictEqual(args['Навигация'].s[3].t, 'Строка');
                  assert.strictEqual(args['Навигация'].d[3], null);
               });
            });

            it('should generate request with position navigation and "after" order as default', function() {
               var service = new SbisService({
                     endpoint: 'Товар'
                  }),
                  query = new Query(),
                  limit = 50;

               query
                  .meta({navigationType: NavigationType.Position})
                  .limit(limit);
               return service.query(query).then(function() {
                  var args = SbisBusinessLogic.lastRequest.args;

                  assert.strictEqual(args['Навигация'].s[0].n, 'HaveMore');
                  assert.strictEqual(args['Навигация'].d[0], true);

                  assert.strictEqual(args['Навигация'].s[1].n, 'Limit');
                  assert.strictEqual(args['Навигация'].d[1], limit);

                  assert.strictEqual(args['Навигация'].s[2].n, 'Order');
                  assert.strictEqual(args['Навигация'].d[2], 'after');

                  assert.strictEqual(args['Навигация'].s[3].n, 'Position');
                  assert.strictEqual(args['Навигация'].s[3].t, 'Строка');
                  assert.strictEqual(args['Навигация'].d[3], null);

                  assert.strictEqual(args['Фильтр'].d.length, 0);
               });
            });

            it('should generate request with position navigation and "after" order', function() {
               var service = new SbisService({
                     endpoint: 'Товар'
                  }),
                  query = new Query(),
                  where = {'id>=': 10},
                  limit = 50;

               query
                  .meta({navigationType: NavigationType.Position})
                  .where(where)
                  .limit(limit);
               return service.query(query).then(function() {
                  var args = SbisBusinessLogic.lastRequest.args;

                  assert.strictEqual(args['Навигация'].s[0].n, 'HaveMore');
                  assert.strictEqual(args['Навигация'].d[0], true);

                  assert.strictEqual(args['Навигация'].s[1].n, 'Limit');
                  assert.strictEqual(args['Навигация'].d[1], limit);

                  assert.strictEqual(args['Навигация'].s[2].n, 'Order');
                  assert.strictEqual(args['Навигация'].d[2], 'after');

                  assert.strictEqual(args['Навигация'].s[3].n, 'Position');
                  assert.strictEqual(args['Навигация'].s[3].t, 'Запись');
                  assert.strictEqual(args['Навигация'].d[3].s.length, 1);
                  assert.strictEqual(args['Навигация'].d[3].s[0].n, 'id');
                  assert.strictEqual(args['Навигация'].d[3].d.length, 1);
                  assert.strictEqual(args['Навигация'].d[3].d[0], 10);

                  assert.strictEqual(args['Фильтр'].d.length, 0);
               });
            });

            it('should generate request with position navigation and "before" order', function() {
               var service = new SbisService({
                     endpoint: 'Товар'
                  }),
                  query = new Query(),
                  where = {'id<=': 10},
                  limit = 50;

               query
                  .meta({navigationType: NavigationType.Position})
                  .where(where)
                  .limit(limit);
               return service.query(query).then(function() {
                  var args = SbisBusinessLogic.lastRequest.args;

                  assert.strictEqual(args['Навигация'].s[2].n, 'Order');
                  assert.strictEqual(args['Навигация'].d[2], 'before');

                  assert.strictEqual(args['Навигация'].s[3].n, 'Position');
                  assert.strictEqual(args['Навигация'].s[3].t, 'Запись');
                  assert.strictEqual(args['Навигация'].d[3].s.length, 1);
                  assert.strictEqual(args['Навигация'].d[3].s[0].n, 'id');
                  assert.strictEqual(args['Навигация'].d[3].d.length, 1);
                  assert.strictEqual(args['Навигация'].d[3].d[0], 10);

                  assert.strictEqual(args['Фильтр'].d.length, 0);
               });
            });

            it('should generate request with position navigation and "both" order', function() {
               var service = new SbisService({
                     endpoint: 'Товар'
                  }),
                  query = new Query(),
                  where = {'id~': 10},
                  limit = 50;

               query
                  .meta({navigationType: NavigationType.Position})
                  .where(where)
                  .limit(limit);
               return service.query(query).then(function() {
                  var args = SbisBusinessLogic.lastRequest.args;

                  assert.strictEqual(args['Навигация'].s[2].n, 'Order');
                  assert.strictEqual(args['Навигация'].d[2], 'both');

                  assert.strictEqual(args['Фильтр'].d.length, 0);
               });
            });

            it('should generate request with "hasMore" from given meta property', function() {
               var hasMore = 'test',
                  query = new Query();
               query
                  .offset(0)
                  .limit(10)
                  .meta({
                     hasMore: hasMore
                  });
               return service.query(query).then(function() {
                  var args = SbisBusinessLogic.lastRequest.args;

                  assert.strictEqual(args['Навигация'].d[0], hasMore);
                  assert.strictEqual(args['Навигация'].s[0].n, 'ЕстьЕще');
               });
            });

            it('should cancel the inner request', function() {
               var def = service.query(),
                  lastDef = SbisBusinessLogic.lastDeferred;

               def.cancel();
               assert.instanceOf(lastDef.getResult(), DeferredCanceledError);
            });
         });

         context('when the service isn\'t exists', function() {
            it('should return an error', function() {
               var service = new SbisService({
                  endpoint: 'Купец'
               });
               return service.query(new Query()).then(function() {
                  throw new Error('Shouldn\'t reach here');
               }, function(err) {
                  assert.instanceOf(err, Error);
               });
            });
         });
      });

      describe('.call()', function() {
         context('when the method is exists', function() {
            it('should accept an object', function(done) {
               var rs = new RecordSet({
                     rawData: [
                        {f1: 1, f2: 2},
                        {f1: 3, f2: 4}
                     ]
                  }),
                  sent = {
                     bool: false,
                     intgr: 1,
                     real: 1.01,
                     string: 'test',
                     obj: {a: 1, b: 2, c: 3},
                     rec: getSampleModel(),
                     rs: rs
                  };

               service.call('Произвольный', sent).addCallbacks(function() {
                  try {
                     assert.strictEqual(SbisBusinessLogic.lastRequest.method, 'Произвольный');
                     var args = SbisBusinessLogic.lastRequest.args;

                     assert.deepEqual(args.rec, getSampleModel().getRawData());
                     delete sent.rec;
                     delete args.rec;

                     assert.deepEqual(args.rs, rs.getRawData());
                     delete sent.rs;
                     delete args.rs;

                     assert.deepEqual(args, sent);
                     done();
                  } catch (err) {
                     done(err);
                  }
               }, function(err) {
                  done(err);
               });
            });

            it('should accept a model', function(done) {
               var model = getSampleModel();

               service.call('Произвольный', model).addCallbacks(function() {
                  try {
                     assert.strictEqual(SbisBusinessLogic.lastRequest.method, 'Произвольный');
                     var args = SbisBusinessLogic.lastRequest.args;
                     testArgIsModel(args, model);
                     done();
                  } catch (err) {
                     done(err);
                  }
               }, function(err) {
                  done(err);
               });
            });

            it('should accept a dataset', function(done) {
               var dataSet = new DataSet({
                  adapter: 'Types/entity:adapter.Sbis',
                  rawData: {
                     _type: 'recordset',
                     d: [
                        [1, true],
                        [2, false],
                        [5, true]
                     ],
                     s: [
                        {'n': '@Ид', 't': 'Идентификатор'},
                        {'n': 'Флаг', 't': 'Логическое'}
                     ]
                  }
               });

               service.call('Произвольный', dataSet).addCallbacks(function() {
                  try {
                     assert.strictEqual(SbisBusinessLogic.lastRequest.method, 'Произвольный');
                     var args = SbisBusinessLogic.lastRequest.args;
                     testArgIsDataSet(args, dataSet);
                     done();
                  } catch (err) {
                     done(err);
                  }
               }, function(err) {
                  done(err);
               });
            });
         });

         context('when the method isn\'t exists', function() {
            it('should return an error', function(done) {
               service.call('МойМетод').addBoth(function(err) {
                  if (err instanceof Error) {
                     done();
                  } else {
                     done(new Error('That\'s no Error'));
                  }
               });
            });
         });
      });

      describe('.move', function() {
         it('should call move', function(done) {
            service.move([1], 2, {
               parentProperty: 'parent',
               position: 'before'
            }).addCallback(function() {
               var args = SbisBusinessLogic.lastRequest.args,
                  etalon = {
                     'IndexNumber': 'ПорНомер',
                     'HierarchyName': 'parent',
                     'ObjectName': 'Товар',
                     'ObjectId': ['1'],
                     'DestinationId': '2',
                     'Order': 'before',
                     'ReadMethod': 'Товар.Прочитать',
                     'UpdateMethod': 'Товар.Записать'
                  };
               assert.deepEqual(etalon, args);
               done();
            });
         });

         it('should call move method when binding has contract', function(done) {
            var service = new SbisService({
               endpoint: 'Продукт',
               binding: {
                  move: 'Product.Mymove'
               }
            });
            service.move([1], 2, {
               parentProperty: 'parent',
               position: 'before'
            }).addCallback(function() {
               var args = SbisBusinessLogic.lastRequest.args,
                  etalon = {
                     'IndexNumber': 'ПорНомер',
                     'HierarchyName': 'parent',
                     'ObjectName': 'Продукт',
                     'ObjectId': ['1'],
                     'DestinationId': '2',
                     'Order': 'before',
                     'ReadMethod': 'Продукт.Прочитать',
                     'UpdateMethod': 'Продукт.Записать'
                  };
               assert.deepEqual(etalon, args);
               done();
            });
         });

         it('should call move with complex ids', function(done) {
            service.move(['1,Item'], '2,Item', {
               parentProperty: 'parent',
               position: 'before'
            }).addCallback(function() {
               var args = SbisBusinessLogic.lastRequest.args,
                  etalon = {
                     'IndexNumber': 'ПорНомер',
                     'HierarchyName': 'parent',
                     'ObjectName': 'Item',
                     'ObjectId': ['1'],
                     'DestinationId': '2',
                     'Order': 'before',
                     'ReadMethod': 'Item.Прочитать',
                     'UpdateMethod': 'Item.Записать'
                  };
               assert.deepEqual(etalon, args);
               done();
            });
         });

         it('should return origin error', function(done) {
            var originError = new Error(),
               SbisBusinessLogic2 = coreExtend(SbisBusinessLogic, {
                  call: function() {
                     return new Deferred().errback(originError);
                  }
               });
            Di.register(provider, SbisBusinessLogic2);
            service = new SbisService({
               endpoint: 'Товар'
            });
            service.move(['1,Item'], '2,Item', {
               parentProperty: 'parent',
               position: 'before'
            }).addErrback(function(error) {
               assert.equal(error, originError);
               done();
            });
         });

         context('test move way with moveBefore or moveAfter', function() {
            var oldWayService;
            beforeEach(function() {
               oldWayService = new SbisService({
                  endpoint: {
                     contract: 'Товар',
                     moveContract: 'ПорядковыйНомер'
                  },
                  binding: {
                     moveBefore: 'ВставитьДо',
                     moveAfter: 'ВставитьПосле'
                  }
               });
            });


            it('should call move', function(done) {
               oldWayService.move(1, 2, {
                  before: true,
                  hierField: 'parent'
               }).addCallbacks(function() {
                  var args = SbisBusinessLogic.lastRequest.args,
                     etalon = {
                        'ПорядковыйНомер': 'ПорНомер',
                        'Иерархия': 'parent',
                        'Объект': 'ПорядковыйНомер',
                        'ИдО': ['1', 'Товар'],
                        'ИдОДо': ['2', 'Товар']
                     };
                  assert.deepEqual(etalon, args);
                  done();
               }, function(e) {
                  done(e);
               });
            });

            it('should call move with complex ids', function(done) {
               oldWayService.move('1,Item', '2,Item', {
                  before: true,
                  hierField: 'parent'
               }).addCallback(function() {
                  var args = SbisBusinessLogic.lastRequest.args,
                     etalon = {
                        'ПорядковыйНомер': 'ПорНомер',
                        'Иерархия': 'parent',
                        'Объект': 'ПорядковыйНомер',
                        'ИдО': ['1', 'Item'],
                        'ИдОДо': ['2', 'Item']
                     };
                  assert.deepEqual(etalon, args);
                  done();
               });
            });
         });
      });

      describe('.getOrderProperty()', function() {
         it('should return an empty string by default', function() {
            var source = new SbisService();
            assert.strictEqual(source.getOrderProperty(), 'ПорНомер');
         });

         it('should return value passed to the constructor', function() {
            var source = new SbisService({
               orderProperty: 'test'
            });
            assert.equal(source.getOrderProperty(), 'test');
         });
      });

      describe('.setOrderProperty()', function() {
         it('should set the new value', function() {
            var source = new SbisService();
            source.setOrderProperty('test');
            assert.equal(source.getOrderProperty(), 'test');
         });
      });

      describe('.toJSON()', function() {
         it('should serialize provider option', function() {
            var Foo = function() {};
            Di.register('Foo', Foo);

            var source = new SbisService({
                  provider: 'Foo'
               }),
               provider = source.getProvider(),
               json = source.toJSON();

            Di.unregister('Foo');

            assert.instanceOf(provider, Foo);
            assert.equal(json.state.$options.provider, 'Foo');
         });
      });
   };
});
