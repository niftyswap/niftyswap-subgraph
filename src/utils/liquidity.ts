import {
  ethereum,
  BigInt
} from "@graphprotocol/graph-ts";
import {
  LiquidityPositionSnapshot,
  User,
  Token,
} from "../../generated/schema";

export interface CreateLiquiditySnapshopInputs {
  tvl: BigInt,
  event: ethereum.Event
  token?: Token
  user?: User
}

export function createLiquiditySnapshot(input: CreateLiquiditySnapshopInputs) {
  let entityId = input.token?.id || input.user?.id || ''
  let id = entityId.concat(input.event.block.timestamp.toString())
  let snapshot = LiquidityPositionSnapshot.load(id);
  if (!snapshot) {
    snapshot = new LiquidityPositionSnapshot(id.concat(input.event.block.timestamp.toString()))
  }
  snapshot.totalValueLocked = input.tvl
  snapshot.token = input.token?.id || null
  snapshot.user = input.user?.id || null
  snapshot.save()
  let entity = input.token || input.user
  if (entity) {
    entity.liquidityPositionSnapshots.push(snapshot.id)
    entity.save()
  }
}