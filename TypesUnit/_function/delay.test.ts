import delay from 'Types/_function/delay';

describe('Types/_formatter/delay', () => {
    it('should call method', (done) => {
        delay(() => {
            done();
        });
    });
});
