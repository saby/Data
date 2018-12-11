define([
   'Types/function'
], function (
   functionUtil
) {
   describe('Types/function.once', () => {
      it('should save result of the function', () => {
         let value = 1;
         const decorator = functionUtil.once(() => {
            return ++value;
         });
         assert.equal(decorator(), decorator());
      });
   });
});
