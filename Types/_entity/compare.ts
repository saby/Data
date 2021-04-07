/**
 * Библиотека сравнения значений.
 * @library Types/_entity/compare
 * @includes dateDifference Types/_entity/compare/dateDifference
 * @includes DateUnits Types/_entity/compare/dateDifference#Units
 * @author Кудрявцев И.С.
 */

/*
 * Comparison library.
 * @library Types/_entity/compare
 * @includes dateDifference Types/_entity/compare/dateDifference
 * @includes DateUnits Types/_entity/compare/dateDifference#Units
 * @includes dateInterval Types/_entity/compare/dateInterval
 * @includes isFullInterval Types/_entity/compare/isFullInterval
 * @author Кудрявцев И.С.
 */

export {
    default as dateDifference,
    Units as DateUnits
} from './compare/dateDifference';

export { default as dateInterval } from './compare/dateInterval';
export { default as isFullInterval } from './compare/isFullInterval';
