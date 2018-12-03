/* global testing */
testing.configure = function() {
   mocha.globals([ 'previousPageURL']);//надо будет разобраться где используется previousPageURL
   mocha.checkLeaks();
};
