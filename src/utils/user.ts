import {
  Address
} from "@graphprotocol/graph-ts";
import {
  User,
  Token,
} from "../../generated/schema";

import { ZERO_BI } from "./constants";

export function getUser (userAddress: Address, token: Token): User {
  const userId = userAddress.toString().concat("-").concat(token.id)
  let user = User.load(userId)
  if (!user) {
    user = new User(userId)
    user.liquiditySnapshots = []
    user.liquidities = ZERO_BI
    user.save()
  }

  return user
}