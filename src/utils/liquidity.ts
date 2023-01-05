import {
  ethereum,
  BigInt,
  Address
} from "@graphprotocol/graph-ts";

import { getUser } from './getters'

import { ONE_BI, ZERO_BI, ZERO_BD } from "../utils/constants";

import {
  TokenLiquiditySnapshot,
  UserLiquiditySnapshot,
  User,
  Token,
} from "../../generated/schema";

import {
  NiftyswapExchange as NiftyswapExchangeContract,
} from "../../generated/NiftyswapFactory/NiftyswapExchange";


export function createTokenLiquiditySnapshot(event: ethereum.Event, tokenId: string): void {
  const token = Token.load(tokenId)
  if (!token) {
    return
  }
  const snapshotId = token.id.concat("-").concat(event.block.timestamp.toString())
  let snapshot = TokenLiquiditySnapshot.load(snapshotId)
  if (!snapshot) {
    snapshot = new TokenLiquiditySnapshot(snapshotId)
  }

  snapshot.totalValueLocked = token.totalValueLocked
  snapshot.volume = token.volume
  snapshot.token = token.id
  snapshot.timestamp = event.block.timestamp

  const niftyswapExchange = NiftyswapExchangeContract.bind(event.address)
  const totalBalance = niftyswapExchange.getTotalSupply([token.tokenId])[0]
  snapshot.liquidities = totalBalance
  snapshot.save()

  token.snapshotQuantity = token.snapshotQuantity.plus(ONE_BI)
  token.save()
}

export function createUserLiquiditySnapshot(event: ethereum.Event, tokenId: string, userAddress: Address): void {
  const token = Token.load(tokenId)
  if (!token) {
    return
  }
  const user = getUser(userAddress, token)
  const snapshotId = user.id.concat("-").concat(event.block.timestamp.toString())
  let snapshot = UserLiquiditySnapshot.load(snapshotId)
  if (!snapshot) {
    snapshot = new UserLiquiditySnapshot(snapshotId)
  }
  snapshot.user = user.id
  snapshot.timestamp = event.block.timestamp

  const niftyswapExchange = NiftyswapExchangeContract.bind(event.address)
  const balance = niftyswapExchange.balanceOf(userAddress, token.tokenId)
  snapshot.liquidities = balance

  snapshot.save()

  user.liquidities = balance
  user.snapshotQuantity = user.snapshotQuantity.plus(ONE_BI)
  user.save()
}