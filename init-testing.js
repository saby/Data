/* global testing */
testing.configure = function() {
   mocha.globals(['previousPageURL']);//надо будет разобраться где используется previousPageURL
   mocha.checkLeaks();
};

var require = {
   paths: {
      chai: 'node_modules/chai/chai',
      mocha: 'node_modules/mocha/mocha',
      sinon: 'node_modules/sinon/sinon'
   }
};
