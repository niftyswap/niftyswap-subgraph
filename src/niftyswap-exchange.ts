import {
  Token,
  CollectionToken,
} from "./../generated/schema";
import { BigInt, log } from "@graphprotocol/graph-ts";
import { ONE_BI, ZERO_BI, ZERO_BD } from "./utils/constants";
import { createTokenLiquiditySnapshot, createUserLiquiditySnapshot } from "./utils/liquidity"
import {
  getExchangeTokenId,
  getCollectionTokenId,
  getCollectionWithError,
  getNiftyswapExchangeWithError,
  getExchangeTokenWithError,
} from './utils/getters'

import {
  divRound
} from './utils/math'

import {  
  addNewListedCollectionToken,
  createNewExchangeToken,
  updateCurrencyReservesOnAddLiquidity
} from './utils/token'

import {
  LiquidityAdded,
  LiquidityRemoved,
  TokensPurchase,
  CurrencyPurchase,
  NiftyswapExchange as NiftyswapExchangeContract,
} from "./../generated/NiftyswapFactory/NiftyswapExchange";

export function handleLiquidityAdded(event: LiquidityAdded): void {
  let niftyswapExchange = getNiftyswapExchangeWithError(event.address.toHexString())
  let collection = getCollectionWithError(niftyswapExchange.collection)

  let tokenIds = event.params.tokenIds;
  // TokenId = tokenNumber + "-" + CollectionId + "-" + ExchangeId
  for (let i = 0; i < tokenIds.length; i++) {
    let tokenExchangeId = getExchangeTokenId(tokenIds[i], niftyswapExchange.collection, niftyswapExchange.id)
    
    collection.tokenIds.push(tokenExchangeId);
    collection.nTokenIds = collection.nTokenIds.plus(ONE_BI);

    // collectionTokenId = tokenNumber + "-" + CollectionId
    addNewListedCollectionToken(tokenIds[i], niftyswapExchange, collection)

    // Loading Token or creating if not exist
    let token = Token.load(tokenExchangeId);
    if (token == null) {
      token = createNewExchangeToken(tokenIds[i], niftyswapExchange, event.params.tokenAmounts[i], event.params.currencyAmounts[i], event)
    } else {
      updateCurrencyReservesOnAddLiquidity(token, niftyswapExchange, event.params.currencyAmounts[i], event.params.tokenAmounts[i])
      token.tokenAmount = token.tokenAmount.plus(event.params.tokenAmounts[i]);
    }

    token.totalValueLocked = token.currencyReserve.times(BigInt.fromI32(2));

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

    createTokenLiquiditySnapshot(event, token.id)
    createUserLiquiditySnapshot(event, token.id, event.params.provider)
  }

  collection.save();
  niftyswapExchange.totalValueLocked = niftyswapExchange.totalCurrencyReserve.times(
    BigInt.fromI32(2)
  );
  niftyswapExchange.txCount = niftyswapExchange.txCount.plus(ONE_BI);
  niftyswapExchange.save();
}

export function handleLiquidityRemoved(event: LiquidityRemoved): void {
  let niftyswapExchange = getNiftyswapExchangeWithError(event.address.toHexString())
  let collection = getCollectionWithError(niftyswapExchange.collection)
  let tokenIds = event.params.tokenIds;

  for (let i = 0; i < tokenIds.length; i++) {
    let tokenExchangeId = getExchangeTokenId(tokenIds[i], niftyswapExchange.collection, niftyswapExchange.id)
    let token = getExchangeTokenWithError(tokenExchangeId)

    token.tokenAmount = token.tokenAmount.minus(event.params.tokenAmounts[i]);
    token.currencyReserve = token.currencyReserve.minus(
      event.params.details[i].currencyAmount
    );
    token.totalValueLocked = token.currencyReserve.times(BigInt.fromI32(2));

    niftyswapExchange.totalCurrencyReserve = niftyswapExchange.totalCurrencyReserve.minus(
      event.params.details[i].currencyAmount
    );

    const hasLiquidity = token.currencyReserve > ZERO_BI && token.tokenAmount > ZERO_BI

    // Spot price calculation
    if (hasLiquidity) {
      let currencyReserve = token.currencyReserve.toBigDecimal();
      let tokenAmount = token.tokenAmount.toBigDecimal();
      token.spotPrice = currencyReserve.div(tokenAmount);
    } else {
      niftyswapExchange.nListedTokenIds = niftyswapExchange.nListedTokenIds.minus(ONE_BI)
      token.spotPrice = ZERO_BD;
    }

    if (!hasLiquidity) {
      // collectionTokenId = tokenNumber + "-" + CollectionId
      let collectionTokenId = getCollectionTokenId(tokenIds[i], niftyswapExchange.collection)

      let collectionToken = CollectionToken.load(collectionTokenId)

      if (collectionToken === null) {
        log.error("collectionToken not found upon removal of liquidity: {}", [collectionTokenId]);
      } else {
        // Code to get around closures limitations with WASM
        const newTokenIds: string[] = []
        for (let j = 0; j < collectionToken.tokenIds.length; j++) {
          const tokenId = collectionToken.tokenIds[j]
          if (tokenId !== tokenExchangeId) {
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


    const niftyswapExchangeContract = NiftyswapExchangeContract.bind(event.address)
    const totalBalance = niftyswapExchangeContract.getTotalSupply([token.tokenId])[0]
    token.liquidities = totalBalance

    token.save();

    createTokenLiquiditySnapshot(event, token.id)
    createUserLiquiditySnapshot(event, token.id, event.params.provider)
  }

  niftyswapExchange.totalValueLocked = niftyswapExchange.totalCurrencyReserve.times(
    BigInt.fromI32(2)
  );
  niftyswapExchange.txCount = niftyswapExchange.txCount.plus(ONE_BI);
  niftyswapExchange.save();
}

export function handleTokenPurchase(event: TokensPurchase): void {
  let niftyswapExchange = getNiftyswapExchangeWithError(event.address.toHexString())
  let collection = getCollectionWithError(niftyswapExchange.collection)

  let tokenIds = event.params.tokensBoughtIds;
  for (let i = 0; i < tokenIds.length; i++) {
    log.debug("TokenPurchase: {}", [
      event.params.tokensBoughtAmounts[i].toString(),
    ]);
    let tokenExchangeId = getExchangeTokenId(tokenIds[i], niftyswapExchange.collection, niftyswapExchange.id)
    let token = getExchangeTokenWithError(tokenExchangeId)

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

    const niftyswapExchangeContract = NiftyswapExchangeContract.bind(event.address)
    const totalBalance = niftyswapExchangeContract.getTotalSupply([token.tokenId])[0]
    token.liquidities = totalBalance

    token.save();

    createTokenLiquiditySnapshot(event, token.id)

    // updating the latest traded item
    collection.latestTradedToken = tokenExchangeId
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
  let niftyswapExchange = getNiftyswapExchangeWithError(event.address.toHexString())

  let tokenIds = event.params.tokensSoldIds;
  for (let i = 0; i < tokenIds.length; i++) {
    log.debug("CurrencyPurchase: {}", [
      event.params.tokensSoldAmounts[i].toString(),
    ]);
    let tokenExchangeId = getExchangeTokenId(tokenIds[i], niftyswapExchange.collection, niftyswapExchange.id)
    let token = getExchangeTokenWithError(tokenExchangeId)

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

    createTokenLiquiditySnapshot(event, token.id)
  }

  niftyswapExchange.totalValueLocked = niftyswapExchange.totalCurrencyReserve.times(
    BigInt.fromI32(2)
  );
  niftyswapExchange.txCount = niftyswapExchange.txCount.plus(BigInt.fromI32(1));
  niftyswapExchange.save();
}
