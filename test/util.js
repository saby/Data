define(function() {
   return {
      extend: function (Child, Parent) {
         var Proxy = function() {};
         Proxy.prototype = Parent.prototype;
         Child.prototype = new Proxy();
         Child.prototype.constructor = Child;
         Child.superclass = Parent.prototype;
      }
   }
});
