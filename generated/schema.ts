// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  TypedMap,
  Entity,
  Value,
  ValueKind,
  store,
  Bytes,
  BigInt,
  BigDecimal
} from "@graphprotocol/graph-ts";

export class Factory extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save Factory entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type Factory must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("Factory", id.toString(), this);
    }
  }

  static load(id: string): Factory | null {
    return changetype<Factory | null>(store.get("Factory", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get exchangeCount(): BigInt {
    let value = this.get("exchangeCount");
    return value!.toBigInt();
  }

  set exchangeCount(value: BigInt) {
    this.set("exchangeCount", Value.fromBigInt(value));
  }

  get txCount(): BigInt {
    let value = this.get("txCount");
    return value!.toBigInt();
  }

  set txCount(value: BigInt) {
    this.set("txCount", Value.fromBigInt(value));
  }

  get owner(): string {
    let value = this.get("owner");
    return value!.toString();
  }

  set owner(value: string) {
    this.set("owner", Value.fromString(value));
  }
}

export class Currency extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save Currency entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type Currency must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("Currency", id.toString(), this);
    }
  }

  static load(id: string): Currency | null {
    return changetype<Currency | null>(store.get("Currency", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get symbol(): string | null {
    let value = this.get("symbol");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toString();
    }
  }

  set symbol(value: string | null) {
    if (!value) {
      this.unset("symbol");
    } else {
      this.set("symbol", Value.fromString(<string>value));
    }
  }

  get name(): string | null {
    let value = this.get("name");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toString();
    }
  }

  set name(value: string | null) {
    if (!value) {
      this.unset("name");
    } else {
      this.set("name", Value.fromString(<string>value));
    }
  }

  get decimals(): BigInt {
    let value = this.get("decimals");
    return value!.toBigInt();
  }

  set decimals(value: BigInt) {
    this.set("decimals", Value.fromBigInt(value));
  }

  get exchangeCount(): BigInt {
    let value = this.get("exchangeCount");
    return value!.toBigInt();
  }

  set exchangeCount(value: BigInt) {
    this.set("exchangeCount", Value.fromBigInt(value));
  }
}

export class Collection extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save Collection entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type Collection must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("Collection", id.toString(), this);
    }
  }

  static load(id: string): Collection | null {
    return changetype<Collection | null>(store.get("Collection", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get name(): string | null {
    let value = this.get("name");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toString();
    }
  }

  set name(value: string | null) {
    if (!value) {
      this.unset("name");
    } else {
      this.set("name", Value.fromString(<string>value));
    }
  }

  get decimals(): BigInt | null {
    let value = this.get("decimals");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toBigInt();
    }
  }

  set decimals(value: BigInt | null) {
    if (!value) {
      this.unset("decimals");
    } else {
      this.set("decimals", Value.fromBigInt(<BigInt>value));
    }
  }

  get tokenIds(): Array<string> {
    let value = this.get("tokenIds");
    return value!.toStringArray();
  }

  set tokenIds(value: Array<string>) {
    this.set("tokenIds", Value.fromStringArray(value));
  }

  get nTokenIds(): BigInt {
    let value = this.get("nTokenIds");
    return value!.toBigInt();
  }

  set nTokenIds(value: BigInt) {
    this.set("nTokenIds", Value.fromBigInt(value));
  }

  get nListedTokenIds(): BigInt {
    let value = this.get("nListedTokenIds");
    return value!.toBigInt();
  }

  set nListedTokenIds(value: BigInt) {
    this.set("nListedTokenIds", Value.fromBigInt(value));
  }

  get nExchanges(): BigInt {
    let value = this.get("nExchanges");
    return value!.toBigInt();
  }

  set nExchanges(value: BigInt) {
    this.set("nExchanges", Value.fromBigInt(value));
  }

  get latestTradedToken(): string | null {
    let value = this.get("latestTradedToken");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toString();
    }
  }

  set latestTradedToken(value: string | null) {
    if (!value) {
      this.unset("latestTradedToken");
    } else {
      this.set("latestTradedToken", Value.fromString(<string>value));
    }
  }

  get latestTradedTimestamp(): BigInt {
    let value = this.get("latestTradedTimestamp");
    return value!.toBigInt();
  }

  set latestTradedTimestamp(value: BigInt) {
    this.set("latestTradedTimestamp", Value.fromBigInt(value));
  }

  get latestTradedPrice(): BigInt {
    let value = this.get("latestTradedPrice");
    return value!.toBigInt();
  }

  set latestTradedPrice(value: BigInt) {
    this.set("latestTradedPrice", Value.fromBigInt(value));
  }
}

export class Token extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save Token entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type Token must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("Token", id.toString(), this);
    }
  }

  static load(id: string): Token | null {
    return changetype<Token | null>(store.get("Token", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get createdAtTimestamp(): BigInt {
    let value = this.get("createdAtTimestamp");
    return value!.toBigInt();
  }

  set createdAtTimestamp(value: BigInt) {
    this.set("createdAtTimestamp", Value.fromBigInt(value));
  }

  get createdAtBlockNumber(): BigInt {
    let value = this.get("createdAtBlockNumber");
    return value!.toBigInt();
  }

  set createdAtBlockNumber(value: BigInt) {
    this.set("createdAtBlockNumber", Value.fromBigInt(value));
  }

  get tokenId(): BigInt {
    let value = this.get("tokenId");
    return value!.toBigInt();
  }

  set tokenId(value: BigInt) {
    this.set("tokenId", Value.fromBigInt(value));
  }

  get tokenAddress(): string | null {
    let value = this.get("tokenAddress");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toString();
    }
  }

  set tokenAddress(value: string | null) {
    if (!value) {
      this.unset("tokenAddress");
    } else {
      this.set("tokenAddress", Value.fromString(<string>value));
    }
  }

  get exchangeAddress(): string | null {
    let value = this.get("exchangeAddress");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toString();
    }
  }

  set exchangeAddress(value: string | null) {
    if (!value) {
      this.unset("exchangeAddress");
    } else {
      this.set("exchangeAddress", Value.fromString(<string>value));
    }
  }

  get spotPrice(): BigDecimal {
    let value = this.get("spotPrice");
    return value!.toBigDecimal();
  }

  set spotPrice(value: BigDecimal) {
    this.set("spotPrice", Value.fromBigDecimal(value));
  }

  get tokenAmount(): BigInt {
    let value = this.get("tokenAmount");
    return value!.toBigInt();
  }

  set tokenAmount(value: BigInt) {
    this.set("tokenAmount", Value.fromBigInt(value));
  }

  get currencyReserve(): BigInt {
    let value = this.get("currencyReserve");
    return value!.toBigInt();
  }

  set currencyReserve(value: BigInt) {
    this.set("currencyReserve", Value.fromBigInt(value));
  }

  get totalValueLocked(): BigInt {
    let value = this.get("totalValueLocked");
    return value!.toBigInt();
  }

  set totalValueLocked(value: BigInt) {
    this.set("totalValueLocked", Value.fromBigInt(value));
  }

  get volume(): BigInt {
    let value = this.get("volume");
    return value!.toBigInt();
  }

  set volume(value: BigInt) {
    this.set("volume", Value.fromBigInt(value));
  }

  get nSwaps(): BigInt {
    let value = this.get("nSwaps");
    return value!.toBigInt();
  }

  set nSwaps(value: BigInt) {
    this.set("nSwaps", Value.fromBigInt(value));
  }

  get nTokensSold(): BigInt {
    let value = this.get("nTokensSold");
    return value!.toBigInt();
  }

  set nTokensSold(value: BigInt) {
    this.set("nTokensSold", Value.fromBigInt(value));
  }

  get nTokensBought(): BigInt {
    let value = this.get("nTokensBought");
    return value!.toBigInt();
  }

  set nTokensBought(value: BigInt) {
    this.set("nTokensBought", Value.fromBigInt(value));
  }

  get liquidities(): BigInt {
    let value = this.get("liquidities");
    return value!.toBigInt();
  }

  set liquidities(value: BigInt) {
    this.set("liquidities", Value.fromBigInt(value));
  }

  get snapshotQuantity(): BigInt {
    let value = this.get("snapshotQuantity");
    return value!.toBigInt();
  }

  set snapshotQuantity(value: BigInt) {
    this.set("snapshotQuantity", Value.fromBigInt(value));
  }
}

export class CollectionToken extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save CollectionToken entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type CollectionToken must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("CollectionToken", id.toString(), this);
    }
  }

  static load(id: string): CollectionToken | null {
    return changetype<CollectionToken | null>(store.get("CollectionToken", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get tokenIds(): Array<string> {
    let value = this.get("tokenIds");
    return value!.toStringArray();
  }

  set tokenIds(value: Array<string>) {
    this.set("tokenIds", Value.fromStringArray(value));
  }
}

export class NiftyswapExchange extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save NiftyswapExchange entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type NiftyswapExchange must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("NiftyswapExchange", id.toString(), this);
    }
  }

  static load(id: string): NiftyswapExchange | null {
    return changetype<NiftyswapExchange | null>(
      store.get("NiftyswapExchange", id)
    );
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get createdAtTimestamp(): BigInt {
    let value = this.get("createdAtTimestamp");
    return value!.toBigInt();
  }

  set createdAtTimestamp(value: BigInt) {
    this.set("createdAtTimestamp", Value.fromBigInt(value));
  }

  get createdAtBlockNumber(): BigInt {
    let value = this.get("createdAtBlockNumber");
    return value!.toBigInt();
  }

  set createdAtBlockNumber(value: BigInt) {
    this.set("createdAtBlockNumber", Value.fromBigInt(value));
  }

  get collection(): string {
    let value = this.get("collection");
    return value!.toString();
  }

  set collection(value: string) {
    this.set("collection", Value.fromString(value));
  }

  get currency(): string {
    let value = this.get("currency");
    return value!.toString();
  }

  set currency(value: string) {
    this.set("currency", Value.fromString(value));
  }

  get txCount(): BigInt {
    let value = this.get("txCount");
    return value!.toBigInt();
  }

  set txCount(value: BigInt) {
    this.set("txCount", Value.fromBigInt(value));
  }

  get lpFee(): BigInt {
    let value = this.get("lpFee");
    return value!.toBigInt();
  }

  set lpFee(value: BigInt) {
    this.set("lpFee", Value.fromBigInt(value));
  }

  get totalValueLocked(): BigInt {
    let value = this.get("totalValueLocked");
    return value!.toBigInt();
  }

  set totalValueLocked(value: BigInt) {
    this.set("totalValueLocked", Value.fromBigInt(value));
  }

  get volume(): BigInt {
    let value = this.get("volume");
    return value!.toBigInt();
  }

  set volume(value: BigInt) {
    this.set("volume", Value.fromBigInt(value));
  }

  get totalCurrencyReserve(): BigInt {
    let value = this.get("totalCurrencyReserve");
    return value!.toBigInt();
  }

  set totalCurrencyReserve(value: BigInt) {
    this.set("totalCurrencyReserve", Value.fromBigInt(value));
  }

  get nSwaps(): BigInt {
    let value = this.get("nSwaps");
    return value!.toBigInt();
  }

  set nSwaps(value: BigInt) {
    this.set("nSwaps", Value.fromBigInt(value));
  }

  get nListedTokenIds(): BigInt {
    let value = this.get("nListedTokenIds");
    return value!.toBigInt();
  }

  set nListedTokenIds(value: BigInt) {
    this.set("nListedTokenIds", Value.fromBigInt(value));
  }

  get latestTradedToken(): string | null {
    let value = this.get("latestTradedToken");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toString();
    }
  }

  set latestTradedToken(value: string | null) {
    if (!value) {
      this.unset("latestTradedToken");
    } else {
      this.set("latestTradedToken", Value.fromString(<string>value));
    }
  }

  get latestTradedTimestamp(): BigInt {
    let value = this.get("latestTradedTimestamp");
    return value!.toBigInt();
  }

  set latestTradedTimestamp(value: BigInt) {
    this.set("latestTradedTimestamp", Value.fromBigInt(value));
  }

  get latestTradedPrice(): BigInt {
    let value = this.get("latestTradedPrice");
    return value!.toBigInt();
  }

  set latestTradedPrice(value: BigInt) {
    this.set("latestTradedPrice", Value.fromBigInt(value));
  }
}

export class User extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save User entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type User must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("User", id.toString(), this);
    }
  }

  static load(id: string): User | null {
    return changetype<User | null>(store.get("User", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get liquidities(): BigInt {
    let value = this.get("liquidities");
    return value!.toBigInt();
  }

  set liquidities(value: BigInt) {
    this.set("liquidities", Value.fromBigInt(value));
  }

  get snapshotQuantity(): BigInt {
    let value = this.get("snapshotQuantity");
    return value!.toBigInt();
  }

  set snapshotQuantity(value: BigInt) {
    this.set("snapshotQuantity", Value.fromBigInt(value));
  }
}

export class TokenLiquiditySnapshot extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(
      id != null,
      "Cannot save TokenLiquiditySnapshot entity without an ID"
    );
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type TokenLiquiditySnapshot must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("TokenLiquiditySnapshot", id.toString(), this);
    }
  }

  static load(id: string): TokenLiquiditySnapshot | null {
    return changetype<TokenLiquiditySnapshot | null>(
      store.get("TokenLiquiditySnapshot", id)
    );
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get timestamp(): BigInt {
    let value = this.get("timestamp");
    return value!.toBigInt();
  }

  set timestamp(value: BigInt) {
    this.set("timestamp", Value.fromBigInt(value));
  }

  get totalValueLocked(): BigInt {
    let value = this.get("totalValueLocked");
    return value!.toBigInt();
  }

  set totalValueLocked(value: BigInt) {
    this.set("totalValueLocked", Value.fromBigInt(value));
  }

  get volume(): BigInt {
    let value = this.get("volume");
    return value!.toBigInt();
  }

  set volume(value: BigInt) {
    this.set("volume", Value.fromBigInt(value));
  }

  get liquidities(): BigInt {
    let value = this.get("liquidities");
    return value!.toBigInt();
  }

  set liquidities(value: BigInt) {
    this.set("liquidities", Value.fromBigInt(value));
  }

  get token(): string {
    let value = this.get("token");
    return value!.toString();
  }

  set token(value: string) {
    this.set("token", Value.fromString(value));
  }
}

export class UserLiquiditySnapshot extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(
      id != null,
      "Cannot save UserLiquiditySnapshot entity without an ID"
    );
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type UserLiquiditySnapshot must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("UserLiquiditySnapshot", id.toString(), this);
    }
  }

  static load(id: string): UserLiquiditySnapshot | null {
    return changetype<UserLiquiditySnapshot | null>(
      store.get("UserLiquiditySnapshot", id)
    );
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get timestamp(): BigInt {
    let value = this.get("timestamp");
    return value!.toBigInt();
  }

  set timestamp(value: BigInt) {
    this.set("timestamp", Value.fromBigInt(value));
  }

  get liquidities(): BigInt {
    let value = this.get("liquidities");
    return value!.toBigInt();
  }

  set liquidities(value: BigInt) {
    this.set("liquidities", Value.fromBigInt(value));
  }

  get user(): string {
    let value = this.get("user");
    return value!.toString();
  }

  set user(value: string) {
    this.set("user", Value.fromString(value));
  }
}
