import {
  Token,
  CollectionToken,
  Collection,
  NiftyswapExchange
} from "../../generated/schema";
import { BigInt, log } from "@graphprotocol/graph-ts";
import { ZERO_BI, ONE_BI } from "./constants";
import {
  getExchangeTokenId,
  getCollectionTokenId,
} from './getters'
import { divRound } from './math'

export const addNewListedCollectionToken = (tokenId: BigInt, niftyswapExchange: NiftyswapExchange, collection: Collection): void => {
  let tokenExchangeId = getExchangeTokenId(tokenId, niftyswapExchange.collection, niftyswapExchange.id)
  let collectionTokenId = getCollectionTokenId(tokenId, niftyswapExchange.collection)

  let collectionToken = CollectionToken.load(collectionTokenId)

  if (collectionToken == null) {
    collectionToken = new CollectionToken(collectionTokenId)
    collectionToken.tokenIds = [tokenExchangeId]
    collection.nListedTokenIds = collection.nListedTokenIds.plus(ONE_BI);
  } else {
    let tokenIdNotFound = true
    for (let j = 0; j < collectionToken.tokenIds.length; j++) {
      if (collectionToken.tokenIds[j] === tokenExchangeId) {
        tokenIdNotFound = false
      }
    }
    if (tokenIdNotFound) {
      if(collectionToken.tokenIds.length === 0){
        collection.nListedTokenIds = collection.nListedTokenIds.plus(ONE_BI);
      }
      const collectionTokenTokenIds = collectionToken.tokenIds 
      collectionTokenTokenIds.push(tokenExchangeId)
      collectionToken.tokenIds = collectionTokenTokenIds
    }
  }
  collectionToken.save()
}

export const createNewExchangeToken = (tokenId: BigInt, niftyswapExchange: NiftyswapExchange, tokenAmount: BigInt, currencyAmount: BigInt): Token => {
  const tokenExchangeId = getExchangeTokenId(tokenId, niftyswapExchange.collection, niftyswapExchange.id)
  const token = new Token(tokenExchangeId);
  token.tokenId = tokenId
  token.tokenAddress = niftyswapExchange.collection
  token.exchangeAddress = niftyswapExchange.id
  token.tokenAmount = tokenAmount;
  token.currencyReserve = currencyAmount;
  niftyswapExchange.totalCurrencyReserve = niftyswapExchange.totalCurrencyReserve.plus(
    currencyAmount
  );
  niftyswapExchange.nListedTokenIds = niftyswapExchange.nListedTokenIds.plus(ONE_BI)
  token.volume = ZERO_BI;
  token.nSwaps = ZERO_BI;
  token.nTokensBought = ZERO_BI;
  token.nTokensSold = ZERO_BI;
  token.liquidities = ZERO_BI
  return token
}

export const updateCurrencyReservesOnAddLiquidity = (token: Token, niftyswapExchange: NiftyswapExchange, currencyAmount: BigInt, tokenAmount: BigInt): void => {
  log.debug("Liquidity already present: {}", [token.id]);
  let currencyReserve = token.currencyReserve;
  let currentTokenReserve = token.tokenAmount;

  if (currentTokenReserve.equals(ZERO_BI)) {
    token.currencyReserve = currencyAmount;
    niftyswapExchange.totalCurrencyReserve = niftyswapExchange.totalCurrencyReserve.plus(
      currencyAmount
    );
    niftyswapExchange.nListedTokenIds = niftyswapExchange.nListedTokenIds.plus(ONE_BI)
  } else {
    let tokensToAdd = tokenAmount;
    let numerator = tokensToAdd.times(currencyReserve);
    let currencyAmount = divRound(numerator, currentTokenReserve);
    token.currencyReserve = token.currencyReserve.plus(currencyAmount);
    niftyswapExchange.totalCurrencyReserve = niftyswapExchange.totalCurrencyReserve.plus(
      currencyAmount
    );
  }
}