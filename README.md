# NiftySwap Subgraph

[Niftyswap](https://niftyswap.io/) is a fully decentralized marketplace for Web3 Collectibles.

This subgraph dynamically tracks any exchange and token pair created by the Niftyswap factory. It racks crucial data from the chain like

- aggregated data across pairs, tokens and exchanges,
- data on individual pairs and tokens,
- data on swaps
- individual token information like currencyReserve and staked amount

## Running Locally

Make sure to update package.json settings to point to your own graph account.

## Queries

Below are a few ways to show how to query the niftyswap-subgraph for data. The queries show most of the information that is queryable, but there are many other filtering options that can be used, just check out the [querying api](https://thegraph.com/docs/graphql-api). These queries can be used locally or in The Graph Explorer playground.

## Key Entity Overviews

#### Niftyswap Factory

Contains data across all of Niftyswap. This entity tracks  transaction count, number of exchanges and the owner of the factory.

#### Token (ERC-1155 token Pool)

Contains data on a specific token pool in a specific exchange. It tracks amount of token stacked, liquidity, reserved currency and total value locked in that specific token pool.


#### NiftySwap Exchange

These contain specifc information about an exchange. Things like which collection and currency in the exchange. Moreover, it displays aggregated data like Total Value Locked (TVL), and Total Currency Reserve in the exchange

## Example Queries

### Querying Aggregated Niftyswap Data

This query fetches first 100 exchange data from all niftyswap exchange, sorted by number of transaction to give a view into value locked in exchange and currency reserve in them.

```graphql
{
  niftyswapExchanges(first: 100, orderBy: txCount, orderDirection: desc) {
    id
    totalValueLocked
    txCount
    lpFee
    volume
    nSwaps
    totalCurrencyReserve
  }
}

```

### Querying Token Data

This query fetches a specific token data

```graphql
{
  tokens(first: 1, where: {id: "65539-0x631998e91476da5b870d741192fc5cbc55f5a52e-0x6f5c06d4f90e30f0ea3deb5bf760b2aa97643f55"}) {
    id
    tokenAmount
    currencyReserve
    spotPrice
    totalValueLocked
    volume
    nSwaps
  }
}
```