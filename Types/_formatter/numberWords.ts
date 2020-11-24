import numberWordsRu from './_numberWords/ru';
import numberWordsEN from './_numberWords/en';
import {controller} from 'I18n/i18n';

/**
 * Функция, выводящая число прописью.
 * @remark
 * @param num Число
 * @param feminine Использовать женский род (одна, две и т.д. вместо один, два и т.д.)
 * @returns Число прописью
 * @public
 * @author Мальцев А.А.
 */
export default function numberWords(num: number | string, feminine: boolean = false): string {
    num = String(num);

    switch (controller.currentLocale) {
        case 'ru-RU':
            return numberWordsRu(num, feminine);
        case 'en-US':
        default:
            return numberWordsEN(num);
    }
}
