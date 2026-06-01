export const YEAR_OPTIONS = (() => {
  const currentYear = new Date().getFullYear();
  return [currentYear - 2, currentYear - 1, currentYear, currentYear + 1, currentYear + 2];
})();

export const MONTH_KEYS = ['jan', 'fev', 'mar', 'avr', 'mai', 'jui', 'jul', 'aou', 'sep', 'oct', 'nov', 'dec'];

export const MONTH_LABELS = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
];

export const MONTH_KEY_TO_LABEL = Object.fromEntries(
  MONTH_KEYS.map((key, index) => [key, MONTH_LABELS[index]])
);

export const emptyTargets = () =>
  MONTH_KEYS.reduce((acc, key) => {
    acc[key] = 0;
    return acc;
  }, {});
