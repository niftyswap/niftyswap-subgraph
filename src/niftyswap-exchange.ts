import {
  NiftyswapExchange,
  Token,
  Currency,
  Collection,
  CollectionToken,
} from "./../generated/schema";
import { BigInt, log, BigDecimal, ethereum } from "@graphprotocol/graph-ts";
import { ONE_BI, ZERO_BI, ZERO_BD, ONE_BD } from "./utils/constants";
import { createTokenLiquiditySnapshot, createUserLiquiditySnapshot } from "./utils/liquidity"

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

    // collectionTokenId = tokenNumber + "-" + CollectionId
    let collectionTokenId = tokenIds[i]
      .toString()
      .concat("-")
      .concat(niftyswapExchange.collection)

    let collectionToken = CollectionToken.load(collectionTokenId)

    if (collectionToken == null) {
      collectionToken = new CollectionToken(collectionTokenId)
      collectionToken.tokenIds = [tokenConId]
      collection.nListedTokenIds = collection.nListedTokenIds.plus(ONE_BI);
    } else {
      let tokenIdNotFound = true
      for (let j = 0; j < collectionToken.tokenIds.length; j++) {
        if (collectionToken.tokenIds[j] === tokenConId) {
          tokenIdNotFound = false
        }
      }
      if (tokenIdNotFound) {
        if(collectionToken.tokenIds.length === 0){
          collection.nListedTokenIds = collection.nListedTokenIds.plus(ONE_BI);
        }
        const collectionTokenTokenIds = collectionToken.tokenIds 
        collectionTokenTokenIds.push(tokenConId)
        collectionToken.tokenIds = collectionTokenTokenIds
      }
    }
    collectionToken.save()

    // Loading Token or creating if not exist
    let token = Token.load(tokenConId);
    if (token == null) {
      token = new Token(tokenConId);
      token.tokenId = tokenIds[i]
      token.tokenAddress = niftyswapExchange.collection
      token.exchangeAddress = niftyswapExchange.id
      token.tokenAmount = event.params.tokenAmounts[i];
      token.currencyReserve = event.params.currencyAmounts[i];
      niftyswapExchange.totalCurrencyReserve = niftyswapExchange.totalCurrencyReserve.plus(
        event.params.currencyAmounts[i]
      );
      niftyswapExchange.nListedTokenIds = niftyswapExchange.nListedTokenIds.plus(ONE_BI)
      token.volume = ZERO_BI;
      token.nSwaps = ZERO_BI;
      token.nTokensBought = ZERO_BI;
      token.nTokensSold = ZERO_BI;
      token.liquiditySnapshots = []
      token.liquidities = ZERO_BI
    } else {
      log.debug("Liquidity already present: {}", [token.id]);
      let currencyReserve = token.currencyReserve;
      let currentTokenReserve = token.tokenAmount;

      // Special case
      if (currentTokenReserve.equals(ZERO_BI)) {
        token.currencyReserve = event.params.currencyAmounts[i];
        niftyswapExchange.totalCurrencyReserve = niftyswapExchange.totalCurrencyReserve.plus(
          event.params.currencyAmounts[i]
        );
        niftyswapExchange.nListedTokenIds = niftyswapExchange.nListedTokenIds.plus(ONE_BI)
      } else {
        let tokensToAdd = event.params.tokenAmounts[i];
        let numerator = tokensToAdd.times(currencyReserve);
        let currencyAmount = divRound(numerator, currentTokenReserve);
        token.currencyReserve = token.currencyReserve.plus(currencyAmount);
        niftyswapExchange.totalCurrencyReserve = niftyswapExchange.totalCurrencyReserve.plus(
          currencyAmount
        );
      }
      token.tokenAmount = token.tokenAmount.plus(event.params.tokenAmounts[i]);
    }

    token.totalValueLocked = token.currencyReserve.times(BigInt.fromI32(2));

    createTokenLiquiditySnapshot(event, token)

    // createTokenLiquiditySnapshot({
    //   event,
    //   token,
    // })

    // createUserLiquiditySnapshot({
    //   userAddress: event.params.provider,
    //   event,
    //   token,
    // })

    // Spot price calculation
    if (token.currencyReserve > ZERO_BI && token.tokenAmount > ZERO_BI) {
      token.spotPrice = token.currencyReserve.divDecimal(
        token.tokenAmount.toBigDecimal()
      );
    } else {
      token.spotPrice = ZERO_BD;
    }
    // token.spotPrice = token.spotPrice.truncate(0);
    token.save();
  }

  collection.save();
  niftyswapExchange.totalValueLocked = niftyswapExchange.totalCurrencyReserve.times(
    BigInt.fromI32(2)
  );
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

    // createTokenLiquiditySnapshot({
    //   event,
    //   token,
    // })

    // createUserLiquiditySnapshot({
    //   userAddress: event.params.provider,
    //   event,
    //   token,
    // })

    niftyswapExchange.totalCurrencyReserve = niftyswapExchange.totalCurrencyReserve.minus(
      event.params.details[i].currencyAmount
    );

    // Spot price calculation
    if (token.currencyReserve > ZERO_BI && token.tokenAmount > ZERO_BI) {
      let currencyReserve = token.currencyReserve.toBigDecimal();
      let tokenAmount = token.tokenAmount.toBigDecimal();
      token.spotPrice = currencyReserve.div(tokenAmount);
    } else {
      niftyswapExchange.nListedTokenIds = niftyswapExchange.nListedTokenIds.minus(ONE_BI)
      token.spotPrice = ZERO_BD;
      // Remove tokenId from list of collection tokenIds
      // Decrement the nListedTokenIds field if necessary
      // collectionTokenId = tokenNumber + "-" + CollectionId
      let collectionTokenId = tokenIds[i]
        .toString()
        .concat("-")
        .concat(niftyswapExchange.collection)

      let collectionToken = CollectionToken.load(collectionTokenId)

      if (collectionToken === null) {
        log.error("collectionToken not found upon removal of liquidity: {}", [collectionTokenId]);
      } else {
        // Code to get around closures limitations with WASM
        const newTokenIds: string[] = []
        for (let j = 0; j < collectionToken.tokenIds.length; j++) {
          const tokenId = collectionToken.tokenIds[j]
          if (tokenId !== tokenConId) {
            newTokenIds.push(collectionToken.tokenIds[j])
          }
        }
        collectionToken.tokenIds = newTokenIds
        if (newTokenIds.length === 0) {
          collection.nListedTokenIds = collection.nListedTokenIds.minus(ONE_BI);
          collection.save()
        }
        collectionToken.save()
      }
    }
    // token.spotPrice = token.spotPrice.truncate(0);

    niftyswapExchange.save()
    token.save();
  }

  niftyswapExchange.totalValueLocked = niftyswapExchange.totalCurrencyReserve.times(
    BigInt.fromI32(2)
  );
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
    let newVolume = token.volume.plus(buyPrice);
    token.volume = newVolume;
    let newTVL = token.currencyReserve.times(BigInt.fromI32(2));
    token.totalValueLocked = newTVL;

    token.nSwaps = token.nSwaps.plus(ONE_BI);
    niftyswapExchange.totalCurrencyReserve = niftyswapExchange.totalCurrencyReserve.plus(
      buyPrice
    );
    niftyswapExchange.volume = niftyswapExchange.volume.plus(buyPrice);
    niftyswapExchange.nSwaps = niftyswapExchange.nSwaps.plus(ONE_BI);

    // Spot price calculation
    if (token.currencyReserve > ZERO_BI && token.tokenAmount > ZERO_BI) {
      let currencyReserve = token.currencyReserve.toBigDecimal();

      let tokenAmount = token.tokenAmount.toBigDecimal();
      token.spotPrice = currencyReserve.div(tokenAmount);
    } else {
      token.spotPrice = ZERO_BD;
    }
    // token.spotPrice = token.spotPrice.truncate(0);
    token.nTokensBought = token.nTokensBought.plus(
      event.params.tokensBoughtAmounts[i]
    );

    token.save();

    // updating the latest traded item
    collection.latestTradedToken = tokenConId
    collection.latestTradedTimestamp = event.block.timestamp
    
    collection.save()
  }

  niftyswapExchange.totalValueLocked = niftyswapExchange.totalCurrencyReserve.times(
    BigInt.fromI32(2)
  );
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

    token.nSwaps = token.nSwaps.plus(ONE_BI);
    niftyswapExchange.totalCurrencyReserve = niftyswapExchange.totalCurrencyReserve.minus(
      sellPrice
    );
    niftyswapExchange.volume = niftyswapExchange.volume.plus(sellPrice);
    niftyswapExchange.nSwaps = niftyswapExchange.nSwaps.plus(ONE_BI);
    // Spot price calculation
    if (token.currencyReserve > ZERO_BI && token.tokenAmount > ZERO_BI) {
      let currencyReserve = token.currencyReserve.toBigDecimal();
      let tokenAmount = token.tokenAmount.toBigDecimal();
      token.spotPrice = currencyReserve.div(tokenAmount);
    } else {
      token.spotPrice = ZERO_BD;
    }
    // token.spotPrice = token.spotPrice.truncate(0);
    token.nTokensSold = token.nTokensSold.plus(
      event.params.tokensSoldAmounts[i]
    );

    token.save();
  }

  niftyswapExchange.totalValueLocked = niftyswapExchange.totalCurrencyReserve.times(
    BigInt.fromI32(2)
  );
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
