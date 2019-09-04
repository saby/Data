import {assert} from 'chai';
import cyrTranslit from 'Types/_formatter/cyrTranslit';

describe('Types/_formatter/cyrTranslit', () => {
    it('should write phrase in translite', () => {
       assert.equal(cyrTranslit('Привет мир'), 'Privet_mir');
    });
});
