import numberWordsRu from './_numberWords/ru';
import numberWordsEN from './_numberWords/en';
import {controller} from 'I18n/i18n';

/**
 * Функция, выводящая число прописью.
 * @remark
 * Параметры:
 * <ul>
 *      <li>{Number|String} num Число.</li>
 *      <li>{Boolean} [feminine=false] Использовать женский род (одна, две и т.д. вместо один, два и т.д.).</li>
 * </ul>
 * <h2>Возвращает</h2>
 * {String} Число прописью.
 *
 * @class
 * @name Types/_formatter/numberWords
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
