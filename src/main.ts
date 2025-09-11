import dotenv from "dotenv";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { ContractAnalyzer } from "./analyzer";
import {
  validateDate,
  validateEthereumAddress,
  formatEtherWithSymbol,
  formatEtherWithUSD,
} from "./utils";
import { EtherscanAPI } from "./etherscan";

// Load environment variables
dotenv.config();

interface Arguments {
  date: string;
}

async function main() {
  // Parse command line arguments
  const argv = (await yargs(hideBin(process.argv))
    .option("date", {
      alias: "d",
      description: "Date to analyze (format: YYYY-MM-DD)",
      type: "string",
      demandOption: true,
    })
    .help()
    .alias("h", "help")
    .example("$0 2025-09-10", "Analyze transactions for September 10, 2025")
    .argv) as Arguments;

  // Validate environment variables
  const apiKey = process.env.ETHERSCAN_API_KEY;
  const contractAddress = process.env.SMART_CONTRACT_ADDRESS;
  const mainWalletAddress = process.env.MAIN_WALLET_ADDRESS;

  if (!apiKey) {
    console.error("❌ ETHERSCAN_API_KEY is required in .env file");
    process.exit(1);
  }

  if (!contractAddress) {
    console.error("❌ SMART_CONTRACT_ADDRESS is required in .env file");
    process.exit(1);
  }

  if (!mainWalletAddress) {
    console.error("❌ MAIN_WALLET_ADDRESS is required in .env file");
    process.exit(1);
  }

  // Validate inputs
  if (!validateDate(argv.date)) {
    console.error("❌ Invalid date format. Please use YYYY-MM-DD format");
    process.exit(1);
  }

  if (!validateEthereumAddress(contractAddress)) {
    console.error("❌ Invalid smart contract address format");
    process.exit(1);
  }

  if (!validateEthereumAddress(mainWalletAddress)) {
    console.error("❌ Invalid main wallet address format");
    process.exit(1);
  }

  try {
    console.log("🚀 Starting Ethereum Smart Contract Analysis");
    console.log(`📋 Contract: ${contractAddress}`);
    console.log(`💼 Main Wallet: ${mainWalletAddress}`);
    console.log(`📅 Date: ${argv.date}`);

    // Initialize analyzer
    const analyzer = new ContractAnalyzer(
      apiKey,
      contractAddress,
      mainWalletAddress
    );

    // Analyze transactions
    const analysis = await analyzer.analyzeDailyTransactions(argv.date);

    // get ETH price
    const etherscanAPI = new EtherscanAPI(apiKey);
    const ethPrice = await etherscanAPI.getEthPrice();

    // Print results
    console.log("\n" + "=".repeat(80));
    console.log("📊 TRANSACTION ANALYSIS RESULTS");
    console.log(`ETH Price: ${ethPrice} USD`);
    console.log("=".repeat(80));

    if (analysis.transactions.length === 0) {
      console.log("🔍 No transactions found for the specified date.");
      return;
    }

    analysis.transactions.forEach((tx, index) => {
      console.log(`\n📝 Transaction ${index + 1}:`);
      console.log(`   Hash: ${tx.hash}`);
      console.log(`   Block: ${tx.blockNumber}`);
      console.log(`   Time: ${tx.timestamp}`);
      console.log(`   From: ${tx.from}`);
      console.log(
        `   Gas Fee: ${formatEtherWithSymbol(tx.gasFee)} ${formatEtherWithUSD(
          tx.gasFee,
          ethPrice
        )}`
      );
      console.log(
        `   Contract → Wallet: ${formatEtherWithSymbol(
          tx.contractToWalletValue
        )} ${formatEtherWithUSD(tx.contractToWalletValue, ethPrice)}`
      );
      console.log(
        `   Contract → Origin: ${formatEtherWithSymbol(
          tx.contractToOriginValue
        )} ${formatEtherWithUSD(tx.contractToOriginValue, ethPrice)}`
      );
      console.log(
        `   Total Internal: ${formatEtherWithSymbol(
          tx.totalInternalValue
        )} ${formatEtherWithUSD(tx.totalInternalValue, ethPrice)}`
      );
      console.log(
        `   Net Profit: ${formatEtherWithSymbol(
          tx.netProfit
        )} ${formatEtherWithUSD(tx.netProfit, ethPrice)} ${
          tx.netProfit >= 0 ? "✅" : "❌"
        }`
      );
    });

    // Print summary
    console.log("\n" + "=".repeat(80));
    console.log("📈 DAILY SUMMARY");
    console.log("=".repeat(80));
    console.log(`📅 Date: ${analysis.date}`);
    console.log(`📊 Total Transactions: ${analysis.totalTransactions}`);
    console.log(
      `💰 Total Internal Value: ${formatEtherWithSymbol(
        analysis.totalInternalValue
      )} ${formatEtherWithUSD(analysis.totalInternalValue, ethPrice)}`
    );
    console.log(
      `⛽ Total Gas Fees: ${formatEtherWithSymbol(
        analysis.totalGasFees
      )} ${formatEtherWithUSD(analysis.totalGasFees, ethPrice)}`
    );
    console.log(
      `💵 Total Daily Profit: ${formatEtherWithSymbol(
        analysis.totalProfit
      )} ${formatEtherWithUSD(analysis.totalProfit, ethPrice)} ${
        analysis.totalProfit >= 0 ? "🎉" : "😞"
      }`
    );

    const profitableTransactions = analysis.transactions.filter(
      (tx) => tx.netProfit > 0
    ).length;
    console.log(
      `✅ Profitable Transactions: ${profitableTransactions}/${analysis.totalTransactions}`
    );
  } catch (error) {
    console.error("❌ Error during analysis:", error);
    process.exit(1);
  }
}

// Run the application
main().catch(console.error);
