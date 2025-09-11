import axios from "axios";
import { EtherscanTransaction, InternalTransaction } from "./types";

export class EtherscanAPI {
  private apiKey: string;
  private baseUrl = "https://api.etherscan.io/v2/api?chainid=1";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getLatestBlock(): Promise<number> {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          module: "proxy",
          action: "eth_blockNumber",
          apikey: this.apiKey,
        },
      });

      if (response.data.result) {
        return parseInt(response.data.result, 16);
      }
      throw new Error("Failed to get latest block number");
    } catch (error) {
      throw new Error(`Error fetching latest block: ${error}`);
    }
  }

  async getBlockByTimestamp(
    timestamp: number,
    closest: "before" | "after" = "before"
  ): Promise<number> {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          module: "block",
          action: "getblocknobytime",
          timestamp: timestamp,
          closest: closest,
          apikey: this.apiKey,
        },
      });

      if (response.data.status === "1") {
        return parseInt(response.data.result);
      }
      throw new Error(`Failed to get block for timestamp ${timestamp}`);
    } catch (error) {
      throw new Error(`Error fetching block by timestamp: ${error}`);
    }
  }

  async getContractTransactions(
    contractAddress: string,
    startBlock: number,
    endBlock: number
  ): Promise<EtherscanTransaction[]> {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          module: "account",
          action: "txlist",
          address: contractAddress,
          startblock: startBlock,
          endblock: endBlock,
          page: 1,
          offset: 10000,
          sort: "asc",
          apikey: this.apiKey,
        },
      });

      if (response.data.status === "1") {
        return response.data.result;
      }
      return [];
    } catch (error) {
      throw new Error(`Error fetching contract transactions: ${error}`);
    }
  }

  async getInternalTransactions(
    txHash: string
  ): Promise<InternalTransaction[]> {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          module: "account",
          action: "txlistinternal",
          txhash: txHash,
          apikey: this.apiKey,
        },
      });

      if (response.data.status === "1") {
        return response.data.result;
      }
      return [];
    } catch (error) {
      console.warn(
        `Warning: Could not fetch internal transactions for ${txHash}: ${error}`
      );
      return [];
    }
  }

  async getEthPrice(): Promise<number> {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          module: "stats",
          action: "ethprice",
          apikey: this.apiKey,
        },
      });

      if (response.data.status === "1") {
        return response.data.result.ethusd;
      }
      return 0;
    } catch (error) {
      console.warn(`Warning: Could not fetch current ETH price: ${error}`);
      return 0;
    }
  }
}
