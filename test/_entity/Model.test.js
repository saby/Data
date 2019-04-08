/* global define, beforeEach, afterEach, describe, context, it, assert */
define([
   'Types/_entity/Model',
   'Types/_entity/functor/Compute',
   'Types/_entity/adapter/Sbis',
   'Types/_collection/RecordSet',
   'Core/core-extend'
], function(
   Model,
   Compute,
   SbisAdapter,
   RecordSet,
   extend
) {
   'use strict';

   Model = Model.default;
   Compute = Compute.default;
   SbisAdapter = SbisAdapter.default;
   RecordSet = RecordSet.default;

   describe('Types/_entity/Model', function() {
      var model,
         modelData,
         modelProperties,
         sqMaxVal,
         getModelData = function() {
            return {
               max: 10,
               calc: 5,
               calcRead: 5,
               calcWrite: 5,
               title: 'A',
               id: 1
            };
         },
         getModelProperties = function() {
            return {
               calc: {
                  def: 1,
                  get: function(value) {
                     return 10 * value;
                  },
                  set: function(value) {
                     return value / 10;
                  }
               },
               calcRead: {
                  def: 2,
                  get: function(value) {
                     return 10 * value;
                  }
               },
               calcWrite: {
                  def: 3,
                  set: function(value) {
                     return value / 10;
                  }
               },
               title: {
                  def: 4,
                  get: function(value) {
                     return value + ' B';
                  }
               },
               sqMax: {
                  def: function() {
                     return sqMaxVal++;
                  },
                  get: function() {
                     return this.get('max') * this.get('max');
                  }
               },
               internal: {
                  get: function() {
                     return this.hasOwnProperty('_internal') ? this._internal : 'internalDefault';
                  },
                  set: function(value) {
                     this._internal = value;
                  }
               },
               date: {
                  get: function() {
                     return new Date();
                  }
               }
            };
         },
         getModel = function(modelData, modelProperties) {
            return new Model({
               idProperty: 'id',
               rawData: modelData || getModelData(),
               properties: modelProperties || getModelProperties()
            });
         };

      beforeEach(function() {
         sqMaxVal = 33;
         modelData = getModelData();
         modelProperties = getModelProperties();
         model = getModel(modelData, modelProperties);
      });

      afterEach(function() {
         modelData = undefined;
         modelProperties = undefined;
         model = undefined;
      });

      describe('.get()', function() {
         it('should return a data value', function() {
            assert.strictEqual(model.get('max'), modelData.max);
            assert.strictEqual(model.get('id'), modelData.id);
         });

         it('should return a calculated value', function() {
            assert.strictEqual(model.get('calc'), modelData.calc * 10);
            assert.strictEqual(model.get('calcRead'), modelData.calc * 10);
            assert.strictEqual(model.get('calcWrite'), modelData.calc);
            assert.strictEqual(model.get('title'), 'A B');
            assert.strictEqual(model.get('sqMax'), modelData.max * modelData.max);
         });

         it('should return the property value', function() {
            assert.strictEqual(model.get('internal'), 'internalDefault');
         });

         it('should return cached property value', function() {
            var values = [1, 2, 3],
               model = new Model({
                  cacheMode: Model.CACHE_MODE_ALL,
                  properties: {
                     foo: {
                        get: function() {
                           return values.pop();
                        }
                     }
                  }
               });

            assert.strictEqual(model.get('foo'), 3);
            assert.strictEqual(values.length, 2);
            assert.strictEqual(model.get('foo'), 3);
            assert.strictEqual(values.length, 2);
         });

         it('should return a single instance for Object', function() {
            var value = model.get('date');
            assert.instanceOf(value, Date);
            assert.strictEqual(model.get('date'), value);
            assert.strictEqual(model.get('date'), value);
         });

         it('should prevent caching for overridden property', function() {
            var model = new Model({
               rawData: {
                  test: {a: 1}
               },
               properties: {
                  test: {
                     get: function() {
                        return 2;
                     }
                  }
               }
            });
            assert.strictEqual(model.get('test'), 2);
            assert.strictEqual(model.get('test'), 2);
         });

         it('should return cached value inside a getter and then able to reset it', function() {
            var foo,
               cached,
               model = new Model({
                  rawData: {
                     foo: {bar: 'bar'}
                  },
                  properties: {
                     foo: {
                        get: function(value) {
                           cached = this.get('foo');
                           return value;
                        },
                        set: function(value) {
                           return value;
                        }
                     }
                  }
               });

            foo = model.get('foo');
            assert.strictEqual(foo.bar, 'bar');
            assert.strictEqual(cached.bar, 'bar');

            model.set('foo', {baz: 'baz'});
            assert.strictEqual(model.get('foo').baz, 'baz');
         });

         it('should use recordset format for the property initial value', function() {
            var SubModel = extend.extend(Model, {
                  _$properties: {
                     id: {
                        get: function(value) {
                           return value.toDateString();
                        }
                     }
                  }
               }),
               date = new Date(),
               rs = new RecordSet({
                  model: SubModel,
                  format: [{name: 'id', type: 'datetime'}]
               }),
               model = new Model({
                  rawData: {
                     id: date.getTime()
                  }
               });

            rs.add(model);
            assert.strictEqual(rs.at(0).get('id'), date.toDateString());
         });

         it('should use recordset format for not a property', function() {
            var rs = new RecordSet({
                  format: [{name: 'id', type: 'datetime'}]
               }),
               model = new Model({
                  rawData: {
                     id: 1
                  }
               });
            rs.add(model);
            assert.instanceOf(rs.at(0).get('id'), Date);
         });

         it('should return raw value instead of property default value', function() {
            var model = new Model({
               properties: {
                  id: {
                     def: 0
                  }
               },
               rawData: {
                  id: 1
               }
            });
            assert.equal(model.get('id'), 1);
         });
      });

      describe('.set()', function() {
         it('should set a writable property', function() {
            model.set('calc', 50);
            assert.strictEqual(model.get('calc'), 50);
            assert.strictEqual(model.getRawData().calc, 5);

            model.set('calc', 70);
            assert.strictEqual(model.get('calc'), 70);
            assert.strictEqual(model.getRawData().calc, 7);

            model.set('calcWrite', 50);
            assert.strictEqual(model.get('calcWrite'), 5);
            assert.strictEqual(model.getRawData().calcWrite, 5);

            model.set('calcWrite', 70);
            assert.strictEqual(model.get('calcWrite'), 7);
            assert.strictEqual(model.getRawData().calcWrite, 7);
         });

         it('should trigger only one event "onPropertyChange" if some propperty calls set() inside itself', function() {
            var model = new Model({
               rawData: {
                  foo: 'one',
                  bar: 'two'
               },
               properties: {
                  moreFoo: {
                     get: function(value) {
                        return value;
                     },
                     set: function(value) {
                        var realValue = '{' + value + '}';
                        this.set('bar', '[' + value + ']');
                        this.set('foo', value);
                        return realValue;
                     }
                  }
               }
            });

            var changed;
            var handler = function(event, props) {
               changed = props;
            };
            model.subscribe('onPropertyChange', handler);
            model.set('moreFoo', 'three');
            model.unsubscribe('onPropertyChange', handler);

            assert.deepEqual(changed, {
               foo: 'three',
               bar: '[three]',
               moreFoo: '{three}',
            });
         });

         it('should write and read updated cached value inside set', function() {
            var updatedValue;

            var model = new Model({
               rawData: {
                  foo: [1]
               },
               properties: {
                  bar: {
                     set: function(value) {
                        this.set('foo', [value]);
                        updatedValue = this.get('foo');
                     }
                  }
               }
            });
            model.set('bar', 2);

            assert.deepEqual(updatedValue, [2]);
            assert.deepEqual(model.get('foo'), [2]);
         });

         it('shouldn\'t change cached field value taken from format if model has any properties', function() {
            var model = new Model({
               format: {
                  foo: Model
               },
               rawData: {
                  foo: {bar: 1}
               },
               properties: {}
            });
            var foo = model.get('foo');
            model.set('foo', foo);

            assert.isFalse(model.isChanged('foo'));
         });

         it('should throw an Error for read only property', function() {
            assert.throws(function() {
               model.set('calcRead', 100);
            });
            assert.strictEqual(model.get('calcRead'), 50);
            assert.strictEqual(model.getRawData().calcRead, 5);

            assert.throws(function() {
               model.set('calcRead', 70);
            });
            assert.strictEqual(model.get('calcRead'), 50);
            assert.strictEqual(model.getRawData().calcRead, 5);

            assert.throws(function() {
               model.set('title', 'test');
            });
            assert.strictEqual(model.get('title'), 'A B');
            assert.strictEqual(model.getRawData().title, 'A');
         });

         it('should attempt to set every property if someone throws an Error', function() {
            var model = new Model({
               properties: {
                  foo: {
                     get: function() {
                        return 'ro';
                     },
                     set: function() {
                        throw new Error('oops!');
                     }
                  },
                  bar: {
                     get: function() {
                        return this._bar;
                     },
                     set: function(value) {
                        this._bar = value;
                     }
                  }
               }
            });
            assert.throws(function() {
               model.set({
                  foo: 'one',
                  bar: 'two'
               });
            });
            assert.strictEqual(model.get('foo'), 'ro');
            assert.strictEqual(model.get('bar'), 'two');
         });

         it('should attempt to set every property if several throw an Error', function() {
            var model = new Model({
               properties: {
                  foo: {
                     get: function() {
                        return 'foo';
                     },
                     set: function() {
                        throw new Error('oops foo!');
                     }
                  },
                  bar: {
                     get: function() {
                        return this._bar;
                     },
                     set: function(value) {
                        this._bar = value;
                     }
                  },
                  baz: {
                     get: function() {
                        return 'baz';
                     },
                     set: function() {
                        throw new Error('oops baz!');
                     }
                  }
               }
            });
            assert.throws(function() {
               model.set({
                  foo: 'one',
                  bar: 'two',
                  baz: 'three'
               });
            });
            assert.strictEqual(model.get('foo'), 'foo');
            assert.strictEqual(model.get('bar'), 'two');
            assert.strictEqual(model.get('baz'), 'baz');
         });

         it('should don\'t throw an Error for property with only "def"', function() {
            var model = new Model({
               properties: {
                  test: {
                     def: null
                  }
               }
            });
            assert.strictEqual(model.get('test'), null);
            model.set('test', 'new');
            assert.strictEqual(model.get('test'), 'new');
         });

         it('should set the rawData value', function() {
            model.set('max', 13);
            assert.strictEqual(model.get('max'), 13);
            assert.strictEqual(model.getRawData().max, 13);

            model.set('internal', 'testInternal');
            assert.strictEqual(model.get('internal'), 'testInternal');
            assert.isUndefined(model.getRawData().internal);
         });

         it('should set inverted rawData value', function() {
            var model = new Model({
               rawData: {
                  foo: false
               },
               properties: {
                  foo: {
                     get: function(value) {
                        return !value;
                     },
                     set: function(value) {
                        return !value;
                     }
                  }
               }
            });

            assert.isTrue(model.get('foo'));

            var fromEvent = undefined;
            model.subscribe('onPropertyChange', function(event, map) {
               fromEvent = map['foo'];
            });
            model.set('foo', false);
            assert.isFalse(model.get('foo'));
            assert.isTrue(model.getRawData().foo);
            assert.isFalse(fromEvent);

            fromEvent = undefined;
            model.set('foo', true);
            assert.isTrue(model.get('foo'));
            assert.isFalse(model.getRawData().foo);
            assert.isTrue(fromEvent);
         });

         it('should work well in case of getter exception', function() {
            var model = new Model({
               properties: {
                  p1: {
                     get: function() {
                        throw new Error('Something went wrong');
                     },
                     set: function(value) {
                        this._p1 = value;
                     }
                  }
               }
            });

            //Get twice checks valid state
            assert.throws(function() {
               model.get('p1');
            });
            assert.throws(function() {
               model.get('p1');
            });

            model.set('p1', 'v1');
         });

         it('should set values', function() {
            model.set({
               calc: 50,
               calcWrite: 50,
               id: 'test'
            });
            assert.strictEqual(model.get('calc'), 50);
            assert.strictEqual(model.get('calcWrite'), 5);
            assert.strictEqual(model.get('id'), 'test');
         });

         it('should set values with exception', function() {
            assert.throws(function() {
               model.set({
                  calc: 50,
                  calcRead: 100,
                  calcWrite: 50,
                  id: 'test'
               });
            });
            assert.strictEqual(model.get('calc'), 50);
            assert.strictEqual(model.get('calcRead'), 50);
            assert.strictEqual(model.get('calcWrite'), 5);
            assert.strictEqual(model.get('id'), 'test');
         });

         it('should set value when property define only default value ', function() {
            var model = new Model({
               properties: {
                  id: {
                     def: 0
                  }
               },
               rawData: {
                  id: 1
               }
            });
            model.set('id', 2);
            assert.equal(model.get('id'), 2);
         });

         it('should work well on property value convert', function() {
            var model = new Model({
               _id: null,
               properties: {
                  id: {
                     get: function() {
                        return this._id;
                     },
                     set: function(value) {
                        this._id = value.toString();
                     }
                  }
               }
            });

            model.set('id', [1, 2, 3]);
            assert.equal(model.get('id'), '1,2,3');
         });

         it('should reset cached property value if related raw field has been changed', function() {
            var model = new Model({
               rawData: {
                  foo: 1
               },
               properties: {
                  bar: {
                     get: function() {
                        return this.get('foo');
                     }
                  }
               }
            });

            assert.strictEqual(model.get('bar'), 1);

            model.set('foo', 2);
            assert.strictEqual(model.get('bar'), 2);
         });

         it('should reset cached property value if related property has been changed', function() {
            var model = new Model({
               properties: {
                  foo: {
                     get: function() {
                        return this._foo === undefined ? 1 : this._foo;
                     },
                     set: function(value) {
                        return this._foo = value;
                     }
                  },
                  bar: {
                     get: function() {
                        return this.get('foo');
                     }
                  }
               }
            });

            assert.strictEqual(model.get('bar'), 1);

            model.set('foo', 2);
            assert.strictEqual(model.get('bar'), 2);
         });

         context('if has properties defined dependency', function() {
            it('should reset related property', function() {
               var model = new Model({
                     properties: {
                        foo: {
                           get: new Compute(function() {
                              var bar = this.get('bar');
                              return ['foo'].concat(bar);
                           }, ['bar'])
                        },
                        bar: {
                           get: function() {
                              return this._bar || ['bar'];
                           },
                           set: function(value) {
                              this._bar = [value];
                           }
                        }
                     }
                  }),
                  foo;

               foo = model.get('foo');
               assert.deepEqual(foo, ['foo', 'bar']);

               model.set('bar', 'baz');
               foo = model.get('foo');
               assert.deepEqual(foo, ['foo', 'baz']);

               foo = model.get('foo');
               model.set('moo', 'shmoo');
               assert.strictEqual(model.get('foo'), foo);
            });

            it('should don\'t reset unrelated property', function() {
               var model = new Model({
                     properties: {
                        foo: {
                           get: new Compute(function() {
                              var bar = this.get('bar');
                              return ['foo'].concat(bar);
                           }, [])
                        },
                        bar: {
                           get: function() {
                              return this._bar || ['bar'];
                           },
                           set: function(value) {
                              this._bar = [value];
                           }
                        }
                     }
                  }),
                  foo;

               foo = model.get('foo');
               assert.deepEqual(foo, ['foo', 'bar']);

               foo = model.get('foo');
               model.set('bar', 'baz');
               assert.strictEqual(model.get('foo'), foo);
               assert.deepEqual(model.get('foo'), ['foo', 'bar']);
            });

            it('should reset deep related property and dont\'t resut unrelated', function() {
               var model = new Model({
                     properties: {
                        foo: {
                           get: new Compute(function() {
                              var bar = this.get('bar');
                              return ['foo'].concat([bar.get('a'), bar.get('b')]);
                           }, ['bar.a'])
                        },
                        bar: {
                           get: function() {
                              return new Model({rawData: {
                                 a: 1,
                                 b: 2
                              }});
                           }
                        }
                     }
                  }),
                  foo,
                  bar;

               bar = model.get('bar');
               assert.deepEqual(model.get('foo'), ['foo', 1, 2]);

               foo = model.get('foo');
               bar.set('a', 10);
               assert.notEqual(model.get('foo'), foo);
               assert.deepEqual(model.get('foo'), ['foo', 10, 2]);

               foo = model.get('foo');
               bar.set('b', 20);
               assert.strictEqual(model.get('foo'), foo);
               assert.deepEqual(model.get('foo'), ['foo', 10, 2]);
            });
         });

         context('if has properties calculated dependency', function() {
            var MyModel = extend.extend(Model, {
                  _$properties: {
                     p1: {
                        get: function() {
                           return {
                              p2: this.get('p2'),
                              p3: this.get('p3')
                           };
                        }
                     },
                     p3: {
                        get: function() {
                           return {
                              p4: this.get('p4'),
                              p5: this.get('p5')
                           };
                        }
                     }
                  }
               }),
               getMyModel = function() {
                  return new MyModel({
                     rawData: {
                        p2: 'v2',
                        p4: 'v4',
                        p5: 'v5'
                     }
                  });
               };

            it('should reset the value on direct dependency', function() {
               var model = getMyModel(),
                  v3old = model.get('p3');
               model.set('p4', 'v4new');
               var v3new = model.get('p3');
               assert.notEqual(v3old, v3new);
               assert.equal(v3old.p4, 'v4');
               assert.equal(v3new.p4, 'v4new');
            });

            it('should reset the value on indirect dependency', function() {
               var model = getMyModel(),
                  v1old = model.get('p1');
               model.set('p5', 'v5new');
               var v1new = model.get('p1');
               assert.notEqual(v1old, v1new);
               assert.equal(v1old.p3.p5, 'v5');
               assert.equal(v1new.p3.p5, 'v5new');
            });

            it('should leave the independent value', function() {
               var model = getMyModel(),
                  v3old = model.get('p3');
               model.set('p2', 'v2new');
               var v3new = model.get('p3');
               assert.strictEqual(v3old, v3new);
            });

            it('should reset the value if dependency cached', function() {
               var MyModel = extend.extend(Model, {
                     _$properties: {
                        a: {
                           get: function() {
                              return ['a'].concat(this.get('b'));
                           }
                        },
                        b: {
                           get: function() {
                              return ['b'];
                           },
                           set: function() {
                           }
                        }
                     }
                  }),
                  model = new MyModel(),
                  oldB = model.get('b'),
                  oldA = model.get('a'),
                  newA,
                  newB;

               model.set('b', ['b1']);
               newB = model.get('b');
               newA = model.get('a');

               assert.notEqual(oldB, newB);
               assert.notEqual(oldA, newA);
            });

            it('should stay inner index length stable on several calls', function() {
               var model = getMyModel();
               model.get('p3');
               model.get('p3');
               assert.equal(model._propertiesDependency.get('p4').size, 1);
               assert.equal(model._propertiesDependency.get('p5').size, 1);
            });
         });

         context('if adapter doesn\'t support dynamic properties define', function() {
            var getData = function() {
               return {
                  d: [
                     1,
                     '2'
                  ],
                  s: [
                     {n: 'a'},
                     {n: 'b'}
                  ]
               };
            };

            it('should throw an error', function() {
               var model = new Model({
                  rawData: getData(),
                  adapter: new SbisAdapter()
               });
               assert.throws(function() {
                  model.set('c', 50);
               });
            });

            it('should don\'t throw an error if user defined property has setter without a result', function() {
               var model = new Model({
                  rawData: getData(),
                  adapter: new SbisAdapter(),
                  properties: {
                     c: {
                        set: function() {}
                     }
                  }
               });
               model.set('c', 50);
            });

            it('should throw an error if user defined property has setter with a result', function() {
               var model = new Model({
                  rawData: getData(),
                  adapter: new SbisAdapter(),
                  properties: {
                     c: {
                        set: function(value) {
                           return value;
                        }
                     }
                  }
               });
               assert.throws(function() {
                  model.set('c', 50);
               });
            });
         });

      });

      describe('.has()', function() {
         it('should return true for defined field', function() {
            for (var key in modelData) {
               if (modelData.hasOwnProperty(key)) {
                  assert.isTrue(model.has(key));
               }
            }
         });

         it('should return true for defined property', function() {
            for (var key in modelProperties) {
               if (modelProperties.hasOwnProperty(key)) {
                  assert.isTrue(model.has(key));
               }
            }
         });

         it('should return false for undefined property', function() {
            assert.isFalse(model.has('blah'));
         });
      });

      describe('.getDefault()', function() {
         it('should return undefined for undefined property', function() {
            assert.strictEqual(model.getDefault('max'), undefined);
         });

         it('should return defined value', function() {
            assert.strictEqual(model.getDefault('calc'), 1);
            assert.strictEqual(model.getDefault('calcRead'), 2);
            assert.strictEqual(model.getDefault('calcWrite'), 3);
            assert.strictEqual(model.getDefault('title'), 4);
         });

         it('should return function result and exec this function once', function() {
            assert.strictEqual(model.getDefault('sqMax'), 33);
            assert.strictEqual(model.getDefault('sqMax'), 33);
         });
      });

      describe('.each()', function() {
         it('should return equivalent values', function() {
            model.each(function(name, value) {
               if (modelProperties[name] && modelProperties[name].get) {
                  assert.strictEqual(model.get(name), value);
               } else {
                  assert.strictEqual(modelData[name], value);
               }
            });
         });

         it('should traverse all properties in given order', function() {
            var allProps = Object.keys(modelProperties),
               count = 0,
               key;
            for (key in modelData) {
               if (modelData.hasOwnProperty(key) &&
                     allProps.indexOf(key) === -1
               ) {
                  allProps.push(key);
               }
            }
            model.each(function(name) {
               assert.strictEqual(name, allProps[count]);
               count++;
            });
            assert.strictEqual(allProps.length, count);
         });
      });

      describe('.getProperties()', function() {
         it('should return a model properties', function() {
            assert.deepEqual(model.getProperties(), modelProperties);
         });
      });

      describe('.getId()', function() {
         it('should return id', function() {
            assert.strictEqual(model.getId(), modelData.id);
         });

         it('should detect idProperty automatically', function() {
            var data = {
                  d: [
                     1,
                     'a',
                     'test'
                  ],
                  s: [
                     {n: 'Num'},
                     {n: '@Key'},
                     {n: 'Name'}]
               },
               model = new Model({
                  rawData: data,
                  adapter: new SbisAdapter()
               });
            assert.strictEqual(model.getIdProperty(), '@Key');
            assert.strictEqual(model.getId(), data.d[1]);
         });

         it('should return undefined for empty key property', function() {
            var newModel = new Model({
               rawData: modelData
            });
            assert.isUndefined(newModel.getId());
         });
      });

      describe('.getIdProperty()', function() {
         it('should return id property', function() {
            assert.strictEqual(model.getIdProperty(), 'id');
         });
      });

      describe('.setIdProperty()', function() {
         it('should set id property', function() {
            var newModel = new Model({
               rawData: modelData
            });
            newModel.setIdProperty('id');
            assert.strictEqual(newModel.getId(), modelData.id);
         });
      });

      describe('.clone()', function() {
         it('should clone properties definition', function() {
            var clone = model.clone();
            assert.notEqual(model.getProperties(), clone.getProperties());
            assert.deepEqual(model.getProperties(), clone.getProperties());
         });

         it('should have another instance id', function() {
            var id = model.getInstanceId(),
               clone = model.clone();
            assert.notEqual(clone.getInstanceId(), id);
         });

         it('should clone id property', function() {
            var clone = model.clone();
            assert.strictEqual(model.getId(), clone.getId());
            assert.strictEqual(model.getIdProperty(), clone.getIdProperty());
         });

         it('should give equal fields for not an Object', function() {
            var clone = model.clone();
            model.each(function(name, value) {
               if (!(value instanceof Object)) {
                  assert.strictEqual(value, clone.get(name));
               }
            });
            clone.each(function(name, value) {
               if (!(value instanceof Object)) {
                  assert.strictEqual(value, model.get(name));
               }
            });
         });
      });

      describe('.merge()', function() {
         it('should merge models', function() {
            var newModel = new Model({
               idProperty: 'id',
               rawData: {
                  title: 'new',
                  link: '123'
               }
            });
            newModel.merge(model);
            assert.strictEqual(newModel.getId(), modelData.id);
         });

         it('should do nothing with itself', function() {
            var model = new Model({
               idProperty: 'id',
               rawData: {
                  foo: 'bar',
               }
            });

            sinon.spy(model, 'set');
            model.merge(model);
            assert.isFalse(model.set.called);
         });

         context('with various adapter types', function() {
            var getSbisData = function() {
                  return {
                     d: [
                        1,
                        2,
                        3
                     ],
                     s: [
                        {n: 'a'},
                        {n: 'b'},
                        {n: 'c'}
                     ]
                  };
               },
               getSimpleData = function() {
                  return {
                     c: 4,
                     d: 5,
                     e: 6
                  };
               };

            it('should append new fields if acceptor\'s adapter supports dynamic fields definition', function() {
               var acceptor = new Model({
                     rawData: getSimpleData()
                  }),
                  donor = new Model({
                     rawData: getSbisData(),
                     adapter: new SbisAdapter()
                  });

               acceptor.merge(donor);
               donor.each(function(field, value) {
                  assert.strictEqual(acceptor.get(field), value);
               });
            });

            it('should just update exists fields if acceptor\'s adapter doesn\'t support dynamic fields definition', function() {
               var acceptor = new Model({
                     rawData: getSbisData(),
                     adapter: new SbisAdapter()
                  }),
                  donor = new Model({
                     rawData: getSimpleData()
                  });

               acceptor.merge(donor);
               acceptor.each(function(field, value) {
                  if (donor.has(field)) {
                     assert.strictEqual(donor.get(field), value);
                  }
               });
            });
         });

         it('should stay unchanged with empty donor', function() {
            assert.isFalse(model.isChanged());
            var anotherModel = new Model();
            model.merge(anotherModel);
            assert.isFalse(model.isChanged());
         });

         it('should stay unchanged with same donor', function() {
            assert.isFalse(model.isChanged());
            var anotherModel = new Model({
               rawData: {
                  max: modelData.max
               }
            });
            model.merge(anotherModel);
            assert.isFalse(model.isChanged());
         });

         it('should stay changed', function() {
            model.set('max', 2);
            assert.isTrue(model.isChanged());
            var anotherModel = new Model({
               rawData: {
                  max: 157
               }
            });
            model.merge(anotherModel);
            assert.isTrue(model.isChanged());
         });

         it('should become changed with different donor', function() {
            assert.isFalse(model.isChanged());
            var anotherModel = new Model({
               rawData: {
                  max: 157
               }
            });
            model.merge(anotherModel);
            assert.isTrue(model.isChanged());
         });

         it('should become changed with different donor', function() {
            var model = new Model({
                  rawData: {
                     d: ['qwe'],
                     s: [{
                        n: 'name',
                        t: 'Строка'
                     }]
                  },
                  adapter: 'Types/entity:adapter.Sbis'
               }),
               anotherModel = new Model({
                  rawData: {
                     d: ['qwe2', 'qwe3'],
                     s: [{
                        n: 'name2',
                        t: 'Строка'
                     }, {
                        n: 'name',
                        t: 'Строка'
                     }]
                  },
                  adapter: 'Types/entity:adapter.Sbis'
               });
            model.merge(anotherModel);
            assert.strictEqual(model.get('name'), 'qwe3');
         });
      });

      describe('.getInstanceId()', function() {
         it('should return different values for different instances', function() {
            var modelA = getModel(),
               modelB = getModel();
            assert.notEqual(modelA.getInstanceId(), modelB.getInstanceId());
         });
      });

      describe('.relationChanged', function() {
         it('should return affected "which"', function() {
            var rawData = {foo: ['bar']},
               model = new Model({
                  rawData: rawData
               }),
               target = model.get('foo'),
               which = {
                  target: target,
                  data: {'baz': 'bad'}
               },
               route = ['field.foo'],
               result;

            result = model.relationChanged(which, route);
            assert.strictEqual(result.target, target);
            assert.deepEqual(result.data, {foo: target});
         });

         it('should not clear own cache', function() {
            var model = new Model({
                  properties: {
                     obj: {
                        get: function() {
                           return {};
                        }
                     }
                  }
               }),
               obj = model.get('obj');

            model.relationChanged({target: obj}, ['field.obj']);
            assert.equal(obj, model.get('obj'));
         });

         it('should clear cache for a dependency field', function() {
            var model = new Model({
                  properties: {
                     obj: {
                        get: function() {
                           return {};
                        }
                     },
                     obj2: {
                        get: function() {
                           return {
                              'obj': this.get('obj')
                           };
                        }
                     }
                  }
               }),
               obj = model.get('obj'),
               obj2 = model.get('obj2');

            model.relationChanged({target: obj2}, ['field.obj']);
            assert.strictEqual(obj, model.get('obj'));
            assert.notEqual(obj2, model.get('obj2'));
         });
      });

      describe('.subscribe()', function() {
         it('should trigger "onPropertyChange" if property value type supports mediator', function() {
            var model = new Model({
                  properties: {
                     record: {
                        get: function() {
                           return new Model({
                              a: 1
                           });
                        }
                     }
                  }
               }),
               given = {},
               handler = function(event, properties) {
                  given.properties = properties;
               },
               property;

            model.subscribe('onPropertyChange', handler);
            property = model.get('record');
            property.set('a', 2);
            model.unsubscribe('onPropertyChange', handler);

            assert.strictEqual(given.properties.record, property);
         });

         it('should trigger "onPropertyChange" for new property value', function() {
            var model = new Model({
                  properties: {
                     record: {
                        get: function() {
                           return this._record || (this._record = new Model({
                              a: 1
                           }));
                        },
                        set: function(value) {
                           this._record = value;
                        }
                     }
                  }
               }),
               given = {},
               handler = function(event, properties) {
                  given.properties = properties;
               },
               newProperty;

            model.get('record');
            newProperty = new Model({
               b: 1
            });
            model.set('record', newProperty);

            model.subscribe('onPropertyChange', handler);
            model.get('record').set('b', 2);
            model.unsubscribe('onPropertyChange', handler);

            assert.strictEqual(given.properties.record, newProperty);
         });

         it('should don\'t trigger "onPropertyChange" for old property value', function() {
            var model = new Model({
                  properties: {
                     record: {
                        get: function() {
                           return this._record || (this._record = new Model({
                              a: 1
                           }));
                        },
                        set: function(value) {
                           this._record = value;
                        }
                     }
                  }
               }),
               given = {},
               handler = function(event, properties) {
                  given.properties = properties;
               },
               oldProperty,
               newProperty;

            oldProperty = model.get('record');
            newProperty = new Model({
               b: 1
            });
            model.set('record', newProperty);

            model.subscribe('onPropertyChange', handler);
            oldProperty.set('a', 2);
            model.unsubscribe('onPropertyChange', handler);

            assert.isFalse('properties' in given);
         });

         it('should trigger "onPropertyChange" for instance with IObjectNotify created in def', function() {
            var model = new Model({
                  properties: {
                     foo: {
                        def: function() {
                           return new Model();
                        },
                        get: function(value) {
                           return value;
                        }
                     }
                  }
               }),
               foo = model.get('foo'),
               given = {},
               handler = function(event, properties) {
                  given = properties;
               };

            assert.instanceOf(foo, Model);

            model.subscribe('onPropertyChange', handler);
            foo.set('bar', 'baz');
            model.unsubscribe('onPropertyChange', handler);

            assert.isTrue('foo' in given);
         });
      });

      describe('.toJSON()', function() {
         it('should serialize a model', function() {
            var json = model.toJSON(),
               options = model._getOptions();
            delete options.owner;

            assert.strictEqual(json.module, 'Types/entity:Model');
            assert.isNumber(json.id);
            assert.isTrue(json.id > 0);
            assert.deepEqual(json.state.$options, options);
            assert.deepEqual(json.state._changedFields, model._changedFields);
         });

         it('should serialize an instance id', function() {
            var json = model.toJSON();
            assert.strictEqual(json.state._instanceId, model.getInstanceId());
         });
      });

      describe('.fromJSON()', function() {
         it('should restore an instance id', function() {
            var json = model.toJSON(),
               clone = Model.fromJSON(json);

            assert.strictEqual(json.state._instanceId, clone.getInstanceId());
         });
      });

      describe('.toString()', function() {
         it('should serialize a model', function() {
            var model = new Model({
               rawData: {'to': 'String'}
            });
            assert.equal(model.toString(), '{"to":"String"}');
         });
      });

      context('when old style extend used', function() {
         describe('.$constructor()', function() {
            it('should be called', function() {
               var testOk = false,
                  Sub = extend.extend(Model, {
                     $constructor: function() {
                        testOk = true;
                     }
                  });
               var instance = new Sub();
               assert.isTrue(testOk);

               instance.destroy();
               instance = undefined;
            });

            it('should be called on each child', function() {
               var testOk = 0,
                  Sub = extend.extend(Model, {
                     $constructor: function() {
                        testOk++;
                     }
                  }),
                  MoreSub = extend.extend(Sub, {
                     $constructor: function() {
                        testOk += 2;
                     }
                  });

               var instance = new MoreSub();
               assert.equal(testOk, 3);

               instance.destroy();
               instance = undefined;
            });
         });

         describe('.toJSON()', function() {
            it('should dont save _$properties', function() {
               var Sub = extend.extend(Model, {
                     _moduleName: 'Sub',
                     _$properties: {
                        some: {
                           foo: function() {
                              return 'bar';
                           }
                        }
                     }
                  }),
                  instance = new Sub(),
                  serialized = instance.toJSON();
               assert.isUndefined(serialized.state.$options.properties);
            });

            it('should save old _options object values', function() {
               var Sub = extend.extend(Model, {
                     _moduleName: 'Sub',
                     $protected: {
                        _options: {
                           opt1: 1,
                           opt2: 'a'
                        }
                     }
                  }),
                  instance = new Sub({
                     opt2: 'b'
                  }),
                  serialized = instance.toJSON();
               assert.equal(serialized.state.$options.opt1, 1);
               assert.equal(serialized.state.$options.opt2, 'b');
            });
         });

         describe('.fromObject', function() {
            it('should return a model', function() {
               var data = {
                     id: 1,
                     title: 'title',
                     selected: true,
                     pid: null
                  },
                  model = Model.fromObject(data),
                  key;

               assert.instanceOf(model, Model);
               for (key in data) {
                  if (data.hasOwnProperty(key)) {
                     assert.strictEqual(model.get(key), data[key]);
                  }
               }
            });
         });
      });
   });
});
