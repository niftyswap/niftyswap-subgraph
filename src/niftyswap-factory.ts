import {
  FACTORY_ADDRESS,
  ZERO_BI,
  ONE_BI,
  ADDRESS_ZERO,
} from "./utils/constants";
import { BigInt } from "@graphprotocol/graph-ts";
import {
  NewExchange,
  OwnershipTransferred,
} from "../generated/NiftyswapFactory/NiftyswapFactory";
import {
  Factory,
  NiftyswapExchange,
  Currency,
  Collection,
} from "../generated/schema";
import { NiftyswapExchange as Exchange } from "../generated/templates";
import {
  fetchCurrencyDecimals,
  fetchCurrencyName,
  fetchCurrencySymbol,
} from "./utils/currency";

export function handleNewExchange(event: NewExchange): void {
  // Loading the Factory contract
  let factory = Factory.load(FACTORY_ADDRESS);
  if (factory == null) {
    factory = new Factory(FACTORY_ADDRESS);
    factory.exchangeCount = ZERO_BI;
    factory.txCount = ZERO_BI;
    factory.owner = event.transaction.from.toHexString();
  }
  factory.exchangeCount = factory.exchangeCount.plus(ONE_BI);
  factory.txCount = factory.txCount.plus(ONE_BI);
  factory.save();

  // Saving currency to the store
  let currency = Currency.load(event.params.currency.toHexString());
  if (currency == null) {
    currency = new Currency(event.params.currency.toHexString());
    currency.exchangeCount = ZERO_BI;
    let decimals = fetchCurrencyDecimals(event.params.currency);
    if (decimals === null) {
      // Default to 18 decimals if we can't fetch the decimals
      decimals = BigInt.fromI32(18);
    }
    currency.name = fetchCurrencyName(event.params.currency);
    currency.symbol = fetchCurrencySymbol(event.params.currency);
    currency.decimals = decimals;
  }
  currency.exchangeCount = currency.exchangeCount.plus(ONE_BI);

  // Saving ERC1155 token/collection to the store
  let collection = Collection.load(event.params.token.toHexString());
  if (collection == null) {
    collection = new Collection(event.params.token.toHexString());
    collection.tokenIds = [];
    collection.nTokenIds = ZERO_BI;
    collection.nListedTokenIds = ZERO_BI;
    collection.nExchanges = ZERO_BI;
    collection.latestTradedTimestamp = ZERO_BI;
    collection.latestTradedPrice = ZERO_BI
  }
  collection.nExchanges = collection.nExchanges.plus(ONE_BI);
  collection.save();

  // Loading the Exchange contract
  let niftyswapExchange = new NiftyswapExchange(
    event.params.exchange.toHexString()
  ) as NiftyswapExchange;

  niftyswapExchange.collection = collection.id;
  niftyswapExchange.createdAtTimestamp = event.block.timestamp;
  niftyswapExchange.createdAtBlockNumber = event.block.number;
  niftyswapExchange.txCount = ZERO_BI;
  niftyswapExchange.lpFee = event.params.lpFee;
  niftyswapExchange.currency = currency.id;
  niftyswapExchange.volume = ZERO_BI;

  niftyswapExchange.totalValueLocked = ZERO_BI;
  niftyswapExchange.totalCurrencyReserve = ZERO_BI;
  niftyswapExchange.volume = ZERO_BI;
  niftyswapExchange.nSwaps = ZERO_BI;
  niftyswapExchange.nListedTokenIds = ZERO_BI;
  niftyswapExchange.latestTradedTimestamp = ZERO_BI
  niftyswapExchange.latestTradedPrice = ZERO_BI
  niftyswapExchange.save();
  currency.save();

  Exchange.create(event.params.exchange);
}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {
  let factory = Factory.load(FACTORY_ADDRESS);
  if (factory == null) {
    factory = new Factory(FACTORY_ADDRESS);
    factory.exchangeCount = BigInt.fromI32(0);
    factory.txCount = BigInt.fromI32(0);
    factory.owner = ADDRESS_ZERO;
  }
  factory.txCount = factory.txCount.plus(BigInt.fromI32(1));
  factory.owner = event.params.newOwner.toHex();
  factory.save();
}

