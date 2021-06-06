import BigNumber from "bignumber.js";

import { RoundingMode } from "../../index.d";
import { expandRoundMode } from ".";

type RoundingOptions = {
  roundMode: RoundingMode;
  precision: number | null;
  significant: boolean;
};

function digitCount(numeric: BigNumber): number {
  if (numeric.isZero()) {
    return 1;
  }

  return Math.floor(Math.log10(numeric.abs().toNumber()) + 1);
}

function getAbsolutePrecision(
  numeric: BigNumber,
  { precision, significant }: RoundingOptions,
): number | null {
  if (significant && precision !== null && precision > 0) {
    return precision - digitCount(numeric);
  }

  return precision;
}

export function roundNumber(
  numeric: BigNumber,
  options: RoundingOptions,
): string {
  const precision = getAbsolutePrecision(numeric, options);

  if (precision === null) {
    return numeric.toString();
  }

  const roundMode = expandRoundMode(options.roundMode);

  if (precision >= 0) {
    return numeric.toFixed(precision, roundMode);
  }

  // Ruby's BigDecimal support negative precision calculation, but JS'
  // BigNumber doesn't. This will ensure we'll match Ruby's behavior.
  const rounder = 10 ** Math.abs(precision);

  numeric = new BigNumber(numeric.div(rounder).toFixed(0, roundMode)).times(
    rounder,
  );

  return numeric.toString();
}