define(function() {
   var barFunction = (function(){
      var bar = function () {};
      bar.toJSON = function() {
         return {
            '$serialized$': 'func',
            module: 'test/Source/data.sample',
            path: 'barFunction'
         }
      };
      return bar;
   })();

   return {
      barFunction: barFunction,
      arrayWithFunctions: [{
         foo: 'foo',
         bar: barFunction
      }]
   }
});
