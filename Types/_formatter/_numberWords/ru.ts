import {iterateNumber} from './utils';

const DIGITS = {
   0: 'ноль',
   1: 'один',
   2: 'два',
   3: 'три',
   4: 'четыре',
   5: 'пять',
   6: 'шесть',
   7: 'семь',
   8: 'восемь',
   9: 'девять'
};

const DIGITS_FEMININE = {
   0: 'ноль',
   1: 'одна',
   2: 'две',
   3: 'три',
   4: 'четыре',
   5: 'пять',
   6: 'шесть',
   7: 'семь',
   8: 'восемь',
   9: 'девять'
};

const TENS = {
   0: 'десять',
   1: 'одиннадцать',
   2: 'двенадцать',
   3: 'тринадцать',
   4: 'четырнадцать',
   5: 'пятнадцать',
   6: 'шестнадцать',
   7: 'семнадцать',
   8: 'восемнадцать',
   9: 'девятнадцать'
};

const TWENTIES = {
   2: 'двадцать',
   3: 'тридцать',
   4: 'сорок',
   5: 'пятьдесят',
   6: 'шестьдесят',
   7: 'семьдесят',
   8: 'восемьдесят',
   9: 'девяносто'
};

const HUNDREDS = {
   0: '',
   1: 'сто',
   2: 'двести',
   3: 'триста',
   4: 'четыреста',
   5: 'пятьсот',
   6: 'шестьсот',
   7: 'семьсот',
   8: 'восемьсот',
   9: 'девятьсот'
};

const THOUSANDS = [
   '',
   'тысяча',
   'миллион',
   'миллиард',
   'триллион',
   'квадриллион',
   'квинтиллион',
   'сикстиллион',
   'септиллион',
   'октиллион',
   'нониллион',
   'дециллион'
];

const negword = 'минус';

export default function numToWordsRu(num: string, feminine: boolean = false): string {
   if (num[0] === '-') {
      return negword + ' ' + numToWordsRu(num.slice(1));
   }

   const words = [];
   // let chunks = list(splitbyx(str(n), 3))
   iterateNumber(num, (three, counter) => {
      if (three[0] !== '0') {
         words.push(HUNDREDS[three[0]]);
      }
      if (three[1] > 1) {
         words.push(TWENTIES[three[1]]);
      }
      // tslint:disable-next-line:triple-equals
      if (three[1] == 1) {
         words.push(TENS[three[2]]);
      } else if (three[2] > 0 || (+three === 0 && words.length === 0)) {
         const dict = (counter === 1 || feminine) ? DIGITS_FEMININE : DIGITS;
         words.push(dict[three[2]]);
      }

      // tslint:disable-next-line:triple-equals
      if (counter > 0 && +three != 0) {
         words.push(rk(THOUSANDS[counter], +three));
      }
   });

   return words.join(' ');
}
