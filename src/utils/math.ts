import {
  NiftyswapExchange,
  Token,
  Currency,
  Collection,
  CollectionToken,
} from "../../generated/schema";
import { BigInt, log, BigDecimal, ethereum } from "@graphprotocol/graph-ts";
import { ONE_BI, ZERO_BI, ZERO_BD, ONE_BD } from "./constants";

export function bigDecimalExponated(
  value: BigDecimal,
  power: BigInt
): BigDecimal {
  if (power.equals(ZERO_BI)) {
    return ONE_BD;
  }
  let negativePower = power.lt(ZERO_BI);
  let result = ZERO_BD.plus(value);
  let powerAbs = power.abs();
  for (let i = ONE_BI; i.lt(powerAbs); i = i.plus(ONE_BI)) {
    result = result.times(value);
  }

  if (negativePower) {
    result = safeDiv(ONE_BD, result);
  }

  return result;
}

// return 0 if denominator is 0 in division
export function safeDiv(amount0: BigDecimal, amount1: BigDecimal): BigDecimal {
  if (amount1.equals(ZERO_BD)) {
    return ZERO_BD;
  } else {
    return amount0.div(amount1);
  }
}

export function divRound(a: BigInt, b: BigInt): BigInt {
  return a.mod(b).equals(ZERO_BI) ? a.div(b) : a.div(b).plus(ONE_BI);
}