import {assert} from 'chai';
import numberRoman from 'Types/_formatter/numberRoman';

describe('Types/_formatter/numberRoman', () => {
    it('should format 5 in roman numerals', () => {
        assert.equal('V', numberRoman(5));
    });

    it('should format 1236 in roman numerals', () => {
        assert.equal('MCCXXXVI', numberRoman(1236));
    });
});
