import {iterateNumber} from "./utils";
import {number} from "../../formatter";

const DIGITS = [
   'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
];

const TENS = [
   'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'
];

const TWENTIES = {
   2: 'twenty',
   3: 'thirty',
   4: 'forty',
   5: 'fifty',
   6: 'sixty',
   7: 'seventy',
   8: 'eighty',
   9: 'ninety'
};

const THOUSANDS = {
   1:"thousand",
   2:"million",
   3:"billion",
   4:"trillion",
   5:"quadrillion",
   6:"quintillion",
   7:"sextillion",
   8:"septillion",
   9:"octillion",
   10:"nonillion",
   11:"decillion"
};

const negword = 'minus';

declare type wordConcatnumberUS = {
   value: number,
   title: string
}

function concat(right: wordConcatnumberUS, left:wordConcatnumberUS):wordConcatnumberUS {
   if (left.value == 1 && right.value < 100) {
      return right;
   } else if(left.value < 100 && left.value > right.value){
      return {
         title:`${left.title}-${right.title}`,
         value:left.value  + right.value
      };
   } else if(left.value >= 100 && left.value > right.value) {
      return {
         title:`${left.title} and ${right.title}`,
         value:left.value + right.value
      };
   }
   return {
      title:`${left.title} ${right.title}`,
      value:left.value + right.value
   };
}

export default function numberWordsEN(num: string): string {
   if (num[0]=== '-') {
      return negword + ' ' + numberWordsEN(num.slice(1));
   }

   let words = [];
   //let chunks = list(splitbyx(str(n), 3))
   iterateNumber(num, function (three, counter) {
      let i = three.length;
      let prepareWord = [];
      if (three[0] !== '0') {
         prepareWord.push({title: `${DIGITS[three[0]]} hundred`, value: three[0]*100});
      }
      if (three[1] > 1) {
         prepareWord.push({title: TWENTIES[three[1]], value: three[1]*10});
      }
      if (three[1] == 1) {
         prepareWord.push({title: TENS[three[2]], value: +three.slice(1)});
      } else if (three[2] > 0 || (+three === 0 && words.length === 0)) {
         prepareWord.push({title: DIGITS[three[2]], value: +three[2]})
      }
      if (prepareWord.length > 0) {
         let word = prepareWord.reduceRight(concat).title;
         if (counter > 0 && +three != 0) {
            word += ' ' + (rk(THOUSANDS[counter], +three));
         }

         words.push(word);
      }
   });

   return words.join(', ');
}
