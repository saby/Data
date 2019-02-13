define(function() {
   function extend(Parent, Child) {
      if (Child === undefined) {
         Child = Parent;
         Parent = Object;
      }

      if (!(Child instanceof Function)) {
         Child = (function(childProto, Parent) {
            var Basic = function() {
               return Parent.apply(this, arguments);
            };
            Object.assign(Basic.prototype, childProto);
            return Basic;
         })(Child, Parent);
      }

      var childProto = Child.prototype;
      Child.prototype = Object.create(Parent.prototype);
      Object.assign(Child.prototype, childProto);
      Child.prototype.constructor = Child;

      Child.superclass = Parent.prototype;

      return Child;
   }

   return {
      extend: extend
   }
});
