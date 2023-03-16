import {
  Address,
  BigInt,
  log,
} from "@graphprotocol/graph-ts";
import {
  User,
  Token,
  NiftyswapExchange,
  Currency,
  Collection,
  CollectionToken
} from "../../generated/schema";

import { ZERO_BI } from "./constants";

export const getExchangeTokenId = (tokenId: BigInt, collectionId: string, exchangeId: string): string => {
  return tokenId.toString()
  .concat("-")
  .concat(collectionId)
  .concat("-")
  .concat(exchangeId);
}

export const getCollectionTokenId = (tokenId: BigInt, collectionId: string): string => {
  return tokenId
  .toString()
  .concat("-")
  .concat(collectionId)
}

export function getUser (userAddress: Address, token: Token): User {
  const userId = userAddress.toHexString().concat("-").concat(token.id)
  let user = User.load(userId)
  if (!user) {
    user = new User(userId)
    user.liquidities = ZERO_BI
    user.snapshotQuantity = ZERO_BI
    user.token = token.id
    user.save()
  }

  return user
}

export const getNiftyswapExchangeWithError = (address: string): NiftyswapExchange => {
  const niftyswapExchange = NiftyswapExchange.load(
    address
  ) as NiftyswapExchange;
  if (niftyswapExchange == null) {
    log.error("Exchange not found: {}", [address]);
    throw new Error(`Exchange not found: ${address}`);
  }
  return niftyswapExchange
}

export const getCurrencyWithError = (address: string): Currency => {
  const currency = Currency.load(address) as Currency;
  if (currency == null) {
    log.error("Currency not found: {}", [address]);
    throw new Error(`Currency not found: ${address}`);
  }
  return currency
}

export const getCollectionWithError = (address: string): Collection => {
  const collection = Collection.load(address) as Collection;
  if (collection == null) {
    log.error("Collection not found: {}", [address]);
    throw new Error(`Collection not found: ${address}`);
  }
  return collection
}

export const getExchangeTokenWithError = (id: string): Token => {
  let token = Token.load(id);
  if (token == null) {
    log.error("Exchange token not found: {}", [id]);
    throw new Error(`Exchange token not found: ${id}`);
  }
  return token
}

export const getCollectionTokenWithError = (id: string): CollectionToken => {
  let token = CollectionToken.load(id);
  if (token == null) {
    log.error("Collection token not found: {}", [id]);
    throw new Error(`Collection token not found: ${id}`);
  }
  return token
}