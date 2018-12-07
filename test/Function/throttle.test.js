define([
   'Types/function'
], function (
   functionUtil
) {
   describe('Types/function.throttle', () => {
      it('should call method only one time', (done) => {
         let value = 1;
         const decorator = functionUtil.throttle(() => {
            value += 1;
         }, 0);
         decorator();
         decorator();
         setTimeout(() => {
            assert.equal(value, 2);
            done();
         }, 150);
      });
   });
});
