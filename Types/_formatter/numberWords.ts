/// <amd-module name="Types/_formatter/numberWords" />
import numberWordsRu from './_numberWords/ru';
import numberWordsEN from './_numberWords/en';
// @ts-ignore
import i18n = require('Core/i18n');

export default function numberWords(num: number|string, feminine: boolean = false): String {
   num = String(num);

   switch (i18n.getLang()) {
      case 'ru-RU':
         return numberWordsRu(num, feminine);
      case 'en-US':
      default:
         return numberWordsEN(num);
   }
}
