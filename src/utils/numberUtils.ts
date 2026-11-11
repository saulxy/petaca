/**
 * Returns the sign prefix for a numeric value:
 * '+' for positive numbers, '-' for negative numbers, or '' for zero (and non-finite values).
 */
export const getNumericSign = (value: number): '+' | '-' | '' => {
  if (!Number.isFinite(value) || value === 0) {
    return '';
  }

  return value > 0 ? '+' : '-';
};

const getNormalizedCurrencyAmount = (
  value: number
): { sign: '+' | '-' | ''; formattedAmount: string } => {
  if (!Number.isFinite(value)) {
    return { sign: '', formattedAmount: '0.00' };
  }

  const formattedAmount = Math.abs(value).toFixed(2);
  if (formattedAmount === '0.00') {
    return { sign: '', formattedAmount };
  }

  return { sign: getNumericSign(value), formattedAmount };
};

/**
 * Formats a numeric amount as signed USD currency (e.g., '+$12.34', '-$12.34', or '$0.00').
 */
export const formatSignedCurrency = (value: number): string => {
  const { sign, formattedAmount } = getNormalizedCurrencyAmount(value);
  return `${sign}$${formattedAmount}`;
};

/**
 * Returns the pill CSS class name for a profit amount:
 * 'lost-pill' for negative values (< 0), or 'profit-pill' for zero and positive values (>= 0).
 */
export const getProfitPillClass = (value: number): 'profit-pill' | 'lost-pill' => {
  const { sign } = getNormalizedCurrencyAmount(value);
  return sign === '-' ? 'lost-pill' : 'profit-pill';
};

