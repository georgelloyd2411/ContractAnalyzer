import { EtherscanAPI } from "./etherscan";
import {
  EtherscanTransaction,
  TransactionProfit,
  DailyAnalysis,
} from "../types/types";

export class ContractAnalyzer {
  private etherscanAPI: EtherscanAPI;
  private contractAddress: string;
  private mainWalletAddress: string;

  constructor(
    apiKey: string,
    contractAddress: string,
    mainWalletAddress: string
  ) {
    this.etherscanAPI = new EtherscanAPI(apiKey);
    this.contractAddress = contractAddress.toLowerCase();
    this.mainWalletAddress = mainWalletAddress.toLowerCase();
  }

  async analyzeDailyTransactions(date: string): Promise<DailyAnalysis> {
    console.log(`\n🔍 Analyzing transactions for ${date}...`);

    // Parse date and create timestamp range
    const [year, month, day] = date.split("-").map((term) => Number(term));

    const startTimestamp = Math.floor(
      Date.UTC(year, month - 1, day, 15, 0, 0) / 1000
    );
    const endTimestamp = startTimestamp + 86400;

    console.log(`📅 Time range: ${startTimestamp} to ${endTimestamp}`);

    // Get block numbers for the time range
    const latestBlock = await this.etherscanAPI.getLatestBlock();
    const startBlock = await this.etherscanAPI.getBlockByTimestamp(
      startTimestamp,
      "after"
    );
    const currentTimestamp = Date.now() / 1000;
    let endBlock =
      endTimestamp > currentTimestamp
        ? latestBlock
        : await this.etherscanAPI.getBlockByTimestamp(endTimestamp, "before");

    // Check if end block is beyond latest block
    if (endBlock > latestBlock) {
      console.log(
        `⚠️  End block ${endBlock} is beyond latest block ${latestBlock}, using latest block`
      );
      endBlock = latestBlock;
    }

    console.log(`🏗️  Block range: ${startBlock} to ${endBlock}`);

    // Get all transactions for the contract in this range
    const transactions = await this.etherscanAPI.getContractTransactions(
      this.contractAddress,
      startBlock,
      endBlock
    );

    console.log(`📦 Found ${transactions.length} transactions`);

    // Filter transactions by exact timestamp
    const dayTransactions = transactions.filter((tx) => {
      const txTimestamp = parseInt(tx.timeStamp);
      return txTimestamp >= startTimestamp && txTimestamp < endTimestamp;
    });

    console.log(
      `✅ ${dayTransactions.length} transactions match the exact date range`
    );

    // Analyze each transaction
    const analyzedTransactions: TransactionProfit[] = [];

    for (let i = 0; i < dayTransactions.length; i++) {
      const tx = dayTransactions[i];
      console.log(
        `\n📋 Processing transaction ${i + 1}/${dayTransactions.length}: ${
          tx.hash
        }`
      );

      const profit = await this.analyzeTransaction(tx);
      analyzedTransactions.push(profit);
    }

    // Calculate totals
    const totalProfit = analyzedTransactions.reduce(
      (sum, tx) => sum + tx.netProfit,
      BigInt(0)
    );
    const totalGasFees = analyzedTransactions.reduce(
      (sum, tx) => sum + tx.gasFee,
      BigInt(0)
    );
    const totalInternalValue = analyzedTransactions.reduce(
      (sum, tx) => sum + tx.totalInternalValue,
      BigInt(0)
    );

    return {
      date,
      transactions: analyzedTransactions,
      totalProfit,
      totalTransactions: analyzedTransactions.length,
      totalGasFees,
      totalInternalValue,
    };
  }

  private async analyzeTransaction(
    tx: EtherscanTransaction
  ): Promise<TransactionProfit> {
    // Calculate gas fee
    const gasFee = BigInt(tx.gasUsed) * BigInt(tx.gasPrice);

    // Get internal transactions
    const internalTxs = await this.etherscanAPI.getInternalTransactions(
      tx.hash
    );

    // Filter relevant internal transactions
    const contractToWalletTxs = internalTxs.filter(
      (itx) =>
        itx.from.toLowerCase() === this.contractAddress &&
        itx.to.toLowerCase() === this.mainWalletAddress
    );

    const contractToOriginTxs = internalTxs.filter(
      (itx) =>
        itx.from.toLowerCase() === this.contractAddress &&
        itx.to.toLowerCase() === tx.from.toLowerCase() &&
        itx.to.toLowerCase() !== this.mainWalletAddress
    );

    // Calculate values
    const contractToWalletValue = contractToWalletTxs.reduce(
      (sum, itx) => sum + BigInt(itx.value),
      BigInt(0)
    );

    const contractToOriginValue = contractToOriginTxs.reduce(
      (sum, itx) => sum + BigInt(itx.value),
      BigInt(0)
    );

    const totalInternalValue = contractToWalletValue + contractToOriginValue;
    const netProfit = totalInternalValue - gasFee;

    return {
      hash: tx.hash,
      timestamp: new Date(parseInt(tx.timeStamp) * 1000).toISOString(),
      blockNumber: tx.blockNumber,
      gasFee,
      contractToWalletValue,
      contractToOriginValue,
      totalInternalValue,
      netProfit,
      from: tx.from,
    };
  }
}
