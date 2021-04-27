/**
 * Библиотека адаптеров.
 * @library Types/_formatter/periodConfiguration
 * @includes Default Types/_formatter/periodConfiguration/Default
 * @includes Accounting Types/_formatter/periodConfiguration/Accounting
 * @includes Text Types/_formatter/periodConfiguration/Text
 * @includes IConfiguration Types/_formatter/periodConfiguration/IConfiguration
 * @author Кудрявцев И.С.
 */

export { default as Default } from './periodConfiguration/Default';
export { default as Accounting } from './periodConfiguration/Accounting';
export { default as Text } from './periodConfiguration/Text';
export { default as IConfiguration, IPeriodFormats } from './periodConfiguration/IConfiguration';
