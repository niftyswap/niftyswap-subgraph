import {
  ethereum,
  BigInt,
  Address
} from "@graphprotocol/graph-ts";

import { getUser } from './user'

import {
  TokenLiquiditySnapshot,
  UserLiquiditySnapshot,
  User,
  Token,
} from "../../generated/schema";

import {
  NiftyswapExchange as NiftyswapExchangeContract,
} from "../../generated/NiftyswapFactory/NiftyswapExchange";


export function createTokenLiquiditySnapshot(event: ethereum.Event, token: Token): void {
  const snapshotId = token.id.concat(event.block.timestamp.toString())
  let snapshot = TokenLiquiditySnapshot.load(snapshotId);
  if (!snapshot) {
    snapshot = new TokenLiquiditySnapshot(snapshotId)
  }
  snapshot.totalValueLocked = token.totalValueLocked
  snapshot.volume = token.volume
  snapshot.token = token.id
  snapshot.timestamp = event.block.timestamp
  token.liquiditySnapshots.push(snapshot.id)

  const niftyswapExchange = NiftyswapExchangeContract.bind(event.address)
  const totalBalance = niftyswapExchange.getTotalSupply([token.tokenId])[0]
  snapshot.liquidities = totalBalance
  token.liquidities = totalBalance

  snapshot.save()
  token.save()
}

export function createUserLiquiditySnapshot(event: ethereum.Event, token: Token, userAddress: Address): void {
  const user = getUser(userAddress, token)
  const snapshotId = user.id.concat(event.block.timestamp.toString())
  let snapshot = UserLiquiditySnapshot.load(snapshotId);
  if (!snapshot) {
    snapshot = new UserLiquiditySnapshot(snapshotId)
  }
  snapshot.user = user.id
  snapshot.timestamp = event.block.timestamp
  user.liquiditySnapshots.push(snapshot.id)

  const niftyswapExchange = NiftyswapExchangeContract.bind(event.address)
  const balance = niftyswapExchange.balanceOf(userAddress, token.tokenId)
  snapshot.liquidities = balance
  user.liquidities = balance

  snapshot.save()
  user.save()
}