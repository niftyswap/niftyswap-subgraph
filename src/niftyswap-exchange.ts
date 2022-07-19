import {
  NiftyswapExchange,
  Token,
  Currency,
  Collection,
} from "./../generated/schema";
import { BigInt, log, BigDecimal } from "@graphprotocol/graph-ts";
import { ONE_BI, ZERO_BI, ZERO_BD, ONE_BD } from "./utils/constants";

import {
  LiquidityAdded,
  LiquidityRemoved,
  TokensPurchase,
  CurrencyPurchase,
} from "./../generated/NiftyswapFactory/NiftyswapExchange";

export function handleLiquidityAdded(event: LiquidityAdded): void {
  let niftyswapExchange = NiftyswapExchange.load(
    event.address.toHexString()
  ) as NiftyswapExchange;
  if (niftyswapExchange == null) {
    log.error("Exchange not found: {}", [event.address.toHexString()]);
    return;
  }

  let currency = Currency.load(niftyswapExchange.currency) as Currency;
  if (currency == null) {
    log.error("Currency not found: {}", [niftyswapExchange.currency]);
    return;
  }

  let collection = Collection.load(niftyswapExchange.collection) as Collection;
  if (collection == null) {
    log.error("Collection not found: {}", [niftyswapExchange.collection]);
    return;
  }

  let tokenIds = event.params.tokenIds;
  // TokenId = tokenNumber + "-" + CollectionId + "-" + ExchangeId
  for (let i = 0; i < tokenIds.length; i++) {
    let tokenConId = tokenIds[i]
      .toString()
      .concat("-")
      .concat(niftyswapExchange.collection)
      .concat("-")
      .concat(niftyswapExchange.id);

    collection.tokenIds.push(tokenConId);
    collection.nTokenIds = collection.nTokenIds.plus(ONE_BI);

    // Loading Token or creating if not exist
    let token = Token.load(tokenConId);
    if (token == null) {
      token = new Token(tokenConId);
      token.tokenAmount = event.params.tokenAmounts[i];
      token.currencyReserve = event.params.currencyAmounts[i];
      niftyswapExchange.totalCurrencyReserve = niftyswapExchange.totalCurrencyReserve.plus(event.params.currencyAmounts[i]);
      token.volume = ZERO_BI;
    } else {
      log.debug("Liquidity already present: {}", [token.id]);
      let currencyReserve = token.currencyReserve;
      let currentTokenReserve = token.tokenAmount;
      let tokensToAdd = event.params.tokenAmounts[i];
      let numerator = tokensToAdd.times(currencyReserve);
      let currencyAmount = divRound(numerator, currentTokenReserve);
      token.currencyReserve = token.currencyReserve.plus(currencyAmount);
      token.tokenAmount = token.tokenAmount.plus(tokensToAdd);
      niftyswapExchange.totalCurrencyReserve = niftyswapExchange.totalCurrencyReserve.plus(currencyAmount);
    }

    token.totalValueLocked = token.currencyReserve.times(BigInt.fromI32(2));
    
    // Spot price calculation
    if (token.currencyReserve > ZERO_BI && token.tokenAmount > ZERO_BI) {
      token.spotPrice = token.currencyReserve
        .divDecimal(token.tokenAmount.toBigDecimal());
    } else {
      token.spotPrice = ZERO_BD;
    }
    token.spotPrice = token.spotPrice.truncate(0);
    token.collectedFeesToken = ZERO_BD;
    token.save();
  }

  collection.save();
  niftyswapExchange.totalValueLocked = niftyswapExchange.totalCurrencyReserve.times(BigInt.fromI32(2));
  niftyswapExchange.txCount = niftyswapExchange.txCount.plus(ONE_BI);
  niftyswapExchange.save();
}

export function handleLiquidityRemoved(event: LiquidityRemoved): void {
  let niftyswapExchange = NiftyswapExchange.load(
    event.address.toHexString()
  ) as NiftyswapExchange;
  if (niftyswapExchange == null) {
    log.error("Exchange not found: {}", [event.address.toHexString()]);
    return;
  }

  let currency = Currency.load(niftyswapExchange.currency) as Currency;
  if (currency == null) {
    log.error("Currency not found: {}", [niftyswapExchange.currency]);
    return;
  }

  let collection = Collection.load(niftyswapExchange.collection) as Collection;
  if (collection == null) {
    log.error("Collection not found: {}", [niftyswapExchange.collection]);
    return;
  }

  let tokenIds = event.params.tokenIds;
  for (let i = 0; i < tokenIds.length; i++) {
    let tokenConId = tokenIds[i]
      .toString()
      .concat("-")
      .concat(niftyswapExchange.collection)
      .concat("-")
      .concat(niftyswapExchange.id);

    let token = Token.load(tokenConId);
    if (token == null) {
      log.error("Token not found: {}", [tokenConId]);
      return;
    }

    token.tokenAmount = token.tokenAmount.minus(event.params.tokenAmounts[i]);
    token.currencyReserve = token.currencyReserve.minus(
      event.params.details[i].currencyAmount
    );
    token.totalValueLocked = token.currencyReserve.times(BigInt.fromI32(2));
    niftyswapExchange.totalCurrencyReserve = niftyswapExchange.totalCurrencyReserve.minus(event.params.details[i].currencyAmount);

    // Spot price calculation
    if (token.currencyReserve > ZERO_BI && token.tokenAmount > ZERO_BI) {
      let currencyReserve = token.currencyReserve.toBigDecimal();
      let tokenAmount = token.tokenAmount.toBigDecimal();
      token.spotPrice = currencyReserve.div(tokenAmount);
    } else {
      token.spotPrice = ZERO_BD;
    }
    token.spotPrice = token.spotPrice.truncate(0);

    token.save();
    niftyswapExchange.volume = niftyswapExchange.volume.minus(
      event.params.tokenAmounts[i]
    );
  }
  
  niftyswapExchange.totalValueLocked = niftyswapExchange.totalCurrencyReserve.times(BigInt.fromI32(2));
  niftyswapExchange.txCount = niftyswapExchange.txCount.plus(ONE_BI);
  niftyswapExchange.save();
}

export function handleTokenPurchase(event: TokensPurchase): void {
  let niftyswapExchange = NiftyswapExchange.load(
    event.address.toHexString()
  ) as NiftyswapExchange;
  if (niftyswapExchange == null) {
    log.error("Exchange not found: {}", [event.address.toHexString()]);
    return;
  }

  let currency = Currency.load(niftyswapExchange.currency) as Currency;
  if (currency == null) {
    log.error("Currency not found: {}", [niftyswapExchange.currency]);
    return;
  }

  let collection = Collection.load(niftyswapExchange.collection) as Collection;
  if (collection == null) {
    log.error("Collection not found: {}", [niftyswapExchange.collection]);
    return;
  }

  let tokenIds = event.params.tokensBoughtIds;
  for (let i = 0; i < tokenIds.length; i++) {
    log.debug("TokenPurchase: {}", [
      event.params.tokensBoughtAmounts[i].toString(),
    ]);
    let tokenConId = tokenIds[i]
      .toString()
      .concat("-")
      .concat(niftyswapExchange.collection)
      .concat("-")
      .concat(niftyswapExchange.id);
    let token = Token.load(tokenConId);
    if (token == null) {
      log.error("Token not found: {}", [tokenConId]);
      return;
    }

    token.tokenAmount = token.tokenAmount.minus(
      event.params.tokensBoughtAmounts[i]
    );

    // Get Buy Price Calculation
    let fee_multiplier = BigInt.fromI32(1000).minus(niftyswapExchange.lpFee);
    let numerator = token.currencyReserve
      .times(event.params.tokensBoughtAmounts[i])
      .times(BigInt.fromI32(1000));
    let denominator = token.tokenAmount.times(fee_multiplier);

    if (denominator.equals(ZERO_BI)) {
      log.error("Denominator is zero: {}", [token.id]);
      return;
    }

    let buyPrice = divRound(numerator, denominator);

    token.currencyReserve = token.currencyReserve.plus(buyPrice);
    token.volume = token.volume.plus(buyPrice);
    token.totalValueLocked = token.currencyReserve.times(BigInt.fromI32(2));
    niftyswapExchange.totalCurrencyReserve = niftyswapExchange.totalCurrencyReserve.plus(buyPrice);
    niftyswapExchange.volume = niftyswapExchange.volume.plus(buyPrice);

    // Spot price calculation
    if (token.currencyReserve > ZERO_BI && token.tokenAmount > ZERO_BI) {
      let currencyReserve = token.currencyReserve.toBigDecimal();
      
      let tokenAmount = token.tokenAmount.toBigDecimal();
      token.spotPrice = currencyReserve.div(tokenAmount);
    } else {
      token.spotPrice = ZERO_BD;
    }
    token.spotPrice = token.spotPrice.truncate(0);

    token.save();
  }

  niftyswapExchange.totalValueLocked = niftyswapExchange.totalCurrencyReserve.times(BigInt.fromI32(2));
  niftyswapExchange.txCount = niftyswapExchange.txCount.plus(BigInt.fromI32(1));
  niftyswapExchange.save();
}

export function handleCurrencyPurchase(event: CurrencyPurchase): void {
  let niftyswapExchange = NiftyswapExchange.load(
    event.address.toHexString()
  ) as NiftyswapExchange;
  if (niftyswapExchange == null) {
    log.error("Exchange not found: {}", [event.address.toHexString()]);
    return;
  }

  let currency = Currency.load(niftyswapExchange.currency) as Currency;
  if (currency == null) {
    log.error("Currency not found: {}", [niftyswapExchange.currency]);
    return;
  }

  let collection = Collection.load(niftyswapExchange.collection) as Collection;
  if (collection == null) {
    log.error("Collection not found: {}", [niftyswapExchange.collection]);
    return;
  }

  let tokenIds = event.params.tokensSoldIds;
  for (let i = 0; i < tokenIds.length; i++) {
    log.debug("CurrencyPurchase: {}", [
      event.params.tokensSoldAmounts[i].toString(),
    ]);
    let tokenConId = tokenIds[i]
      .toString()
      .concat("-")
      .concat(niftyswapExchange.collection)
      .concat("-")
      .concat(niftyswapExchange.id);
    let token = Token.load(tokenConId);
    if (token == null) {
      log.error("Token not found: {}", [tokenConId]);
      return;
    }

    // Get Sell Price Calculation
    let fee_multiplier = BigInt.fromI32(1000).minus(niftyswapExchange.lpFee);
    let numerator = token.currencyReserve
      .times(event.params.tokensSoldAmounts[i])
      .times(fee_multiplier);
    let denominator = token.tokenAmount
      .times(BigInt.fromI32(1000))
      .plus(event.params.tokensSoldAmounts[i].times(fee_multiplier));
    let sellPrice = numerator.div(denominator);
    token.tokenAmount = token.tokenAmount.plus(
      event.params.tokensSoldAmounts[i]
    );
    token.currencyReserve = token.currencyReserve.minus(sellPrice);
    token.volume = token.volume.plus(sellPrice);
    token.totalValueLocked = token.currencyReserve.times(BigInt.fromI32(2));
    niftyswapExchange.totalCurrencyReserve = niftyswapExchange.totalCurrencyReserve.minus(sellPrice);
    niftyswapExchange.volume = niftyswapExchange.volume.plus(sellPrice);
    // Spot price calculation
    if (token.currencyReserve > ZERO_BI && token.tokenAmount > ZERO_BI) {
      let currencyReserve = token.currencyReserve.toBigDecimal();
      let tokenAmount = token.tokenAmount.toBigDecimal();
      token.spotPrice = currencyReserve.div(tokenAmount);
    } else {
      token.spotPrice = ZERO_BD;
    }
    token.spotPrice = token.spotPrice.truncate(0);

    token.save();
  }

  niftyswapExchange.totalValueLocked = niftyswapExchange.totalCurrencyReserve.times(BigInt.fromI32(2));
  niftyswapExchange.txCount = niftyswapExchange.txCount.plus(BigInt.fromI32(1));
  niftyswapExchange.save();
}

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

function divRound(a: BigInt, b: BigInt): BigInt {
  return a.mod(b).equals(ZERO_BI) ? a.div(b) : a.div(b).plus(ONE_BI);
}


