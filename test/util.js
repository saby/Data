define(function() {
   function extend(Parent, Child) {
      // No parent
      if (Child === undefined) {
         Child = Parent;
         Parent = Object;
      }

      //Child is an object
      if (!(Child instanceof Function)) {
         Child = (function(childProto, Parent) {
            var Basic = function() {
               Parent.apply(this, arguments);
            };
            Object.assign(Basic.prototype, childProto);
            return Basic;
         })(Child, Parent);
      }

      //Connect prototypes
      var childProto = Child.prototype;
      Child.prototype = Object.create(Parent.prototype);
      Object.assign(Child.prototype, childProto);
      Child.prototype.constructor = Child;

      //Link to superclass
      Child.superclass = Parent.prototype;

      //Connect statics
      Object.setPrototypeOf(Child, Parent);

      return Child;
   }

   return {
      extend: extend
   }
});
