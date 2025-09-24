/**
 * @author Lloyd
 * @date 2025/09/12
 * @description Command-line application for comprehensive Ethereum smart contract transaction analysis and profit reporting
 */

import dotenv from "dotenv";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { ContractAnalyzer } from "./services/analyzer";
import {
  validateDate,
  validateEthereumAddress,
  formatEtherWithSymbol,
  formatEtherWithUSD,
} from "./utils/utils";
import { EtherscanAPI } from "./services/etherscan";
import { ArbitrageType } from "./constants/constants";
import { DailyAnalysis } from "./types/types";

// Load environment variables from .env file for secure configuration management
dotenv.config();

/**
 * Command-line argument interface defining the required input parameters.
 * Ensures type safety for user-provided command-line arguments.
 */
interface Arguments {
  /** Target date for transaction analysis in YYYY-MM-DD format */
  date: string;
}

/**
 * Main application entry point that orchestrates the complete transaction analysis workflow.
 * Handles argument parsing, validation, analysis execution, and comprehensive result reporting.
 */
async function main() {
  // Parse and validate command-line arguments using yargs for robust CLI interface
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

  // Extract and validate required environment variables for secure API access
  const apiKey = process.env.ETHERSCAN_API_KEY;
  const contractAddress = process.env.SMART_CONTRACT_ADDRESS;
  const mainWalletAddress = process.env.MAIN_WALLET_ADDRESS;

  // Validate presence of Etherscan API key for authenticated requests
  if (!apiKey) {
    console.error("❌ ETHERSCAN_API_KEY is required in .env file");
    process.exit(1);
  }

  // Ensure smart contract address is provided for transaction filtering
  if (!contractAddress) {
    console.error("❌ SMART_CONTRACT_ADDRESS is required in .env file");
    process.exit(1);
  }

  // Validate main wallet address for profit calculation accuracy
  if (!mainWalletAddress) {
    console.error("❌ MAIN_WALLET_ADDRESS is required in .env file");
    process.exit(1);
  }

  // Perform comprehensive input validation to prevent runtime errors
  if (!validateDate(argv.date)) {
    console.error("❌ Invalid date format. Please use YYYY-MM-DD format");
    process.exit(1);
  }

  // Validate smart contract address format according to Ethereum standards
  if (!validateEthereumAddress(contractAddress)) {
    console.error("❌ Invalid smart contract address format");
    process.exit(1);
  }

  // Validate main wallet address format for accurate profit attribution
  if (!validateEthereumAddress(mainWalletAddress)) {
    console.error("❌ Invalid main wallet address format");
    process.exit(1);
  }

  try {
    // Display analysis initialization information with formatted output
    console.log("🚀 Starting Ethereum Smart Contract Analysis");
    console.log(`📋 Contract: ${contractAddress}`);
    console.log(`💼 Main Wallet: ${mainWalletAddress}`);
    console.log(`📅 Date: ${argv.date}`);

    // Initialize contract analyzer with validated credentials and addresses
    const analyzer = new ContractAnalyzer(
      apiKey,
      contractAddress,
      mainWalletAddress
    );

    // Execute comprehensive daily transaction analysis for the specified date
    const analysis = await analyzer.analyzeDailyTransactions(argv.date);

    // Retrieve current ETH price for accurate USD conversion calculations
    const etherscanAPI = new EtherscanAPI(apiKey);
    const ethPrice = await etherscanAPI.getEthPrice();

    // Display formatted analysis results header with professional presentation
    console.log("\n" + "=".repeat(80));
    console.log("📊 TRANSACTION ANALYSIS RESULTS");
    console.log(`ETH Price: ${ethPrice} USD`);
    console.log("=".repeat(80));

    // Handle case where no transactions are found for the specified date
    if (analysis.transactions.length === 0) {
      console.log("🔍 No transactions found for the specified date.");
      return;
    }

    // Display detailed information for each analyzed transaction
    analysis.transactions.forEach((tx, index) => {
      console.log(`\n📝 Transaction ${index + 1}:`);
      console.log(`   Hash: ${tx.hash}`);
      console.log(`   Block: ${tx.blockNumber}`);
      console.log(`   Time: ${tx.timestamp}`);
      console.log(`   From: ${tx.from}`);
      
      // Format gas fee with both ETH and USD representations
      console.log(
        `   Gas Fee: ${formatEtherWithSymbol(tx.gasFee)} ${formatEtherWithUSD(
          tx.gasFee,
          ethPrice
        )}`
      );
      
      // Display contract to wallet value transfers with dual currency formatting
      console.log(
        `   Contract → Wallet: ${formatEtherWithSymbol(
          tx.contractToWalletValue
        )} ${formatEtherWithUSD(tx.contractToWalletValue, ethPrice)}`
      );
      
      // Show contract to origin value transfers for complete transaction analysis
      console.log(
        `   Contract → Origin: ${formatEtherWithSymbol(
          tx.contractToOriginValue
        )} ${formatEtherWithUSD(tx.contractToOriginValue, ethPrice)}`
      );
      
      // Display total internal value with comprehensive formatting
      console.log(
        `   Total Internal: ${formatEtherWithSymbol(
          tx.totalInternalValue
        )} ${formatEtherWithUSD(tx.totalInternalValue, ethPrice)}`
      );
      
      // Show net profit with visual indicators for profitability status
      console.log(
        `   Net Profit: ${formatEtherWithSymbol(
          tx.netProfit
        )} ${formatEtherWithUSD(tx.netProfit, ethPrice)} ${
          tx.netProfit >= 0 ? "✅" : "❌"
        }`
      );
    });

    // Generate and display comprehensive daily summary with key performance metrics
    console.log("\n" + "=".repeat(80));
    console.log("📈 DAILY SUMMARY");
    console.log("=".repeat(80));
    console.log(`📅 Date: ${analysis.date}`);
    console.log(`📊 Total Transactions: ${analysis.totalTransactions}`);
    
    // Display total internal value with dual currency representation
    console.log(
      `💰 Total Internal Value: ${formatEtherWithSymbol(
        analysis.totalInternalValue
      )} ${formatEtherWithUSD(analysis.totalInternalValue, ethPrice)}`
    );
    
    // Show total gas fees paid across all transactions
    console.log(
      `⛽ Total Gas Fees: ${formatEtherWithSymbol(
        analysis.totalGasFees
      )} ${formatEtherWithUSD(analysis.totalGasFees, ethPrice)}`
    );
    
    // Display total daily profit with visual profitability indicators
    console.log(
      `💵 Total Daily Profit: ${formatEtherWithSymbol(
        analysis.totalProfit
      )} ${formatEtherWithUSD(analysis.totalProfit, ethPrice)} ${
        analysis.totalProfit >= 0 ? "🎉" : "😞"
      }`
    );

    // Calculate and display profitable transaction statistics
    displayArbitrageInformation(analysis, ArbitrageType.CLIPPER_STATIC, ethPrice);
    displayArbitrageInformation(analysis, ArbitrageType.CLIPPER_DYNAMIC, ethPrice);
    
  } catch (error) {
    // Handle and display any errors that occur during the analysis process
    console.error("❌ Error during analysis:", error);
    process.exit(1);
  }
}

function displayArbitrageInformation(analysis: DailyAnalysis, type: ArbitrageType, ethPrice: number) {
  // Caculate and display clipper static arbitrage
  console.log("\n\n================================================================================");
  console.log(`Type: ${type}`);
  const clipperStaticTransactions = analysis.transactions.filter((tx) => tx.type === type && tx.netProfit > 0n );
  const clipperStaticTransactionsProfit = clipperStaticTransactions.map((tx) => tx.netProfit).reduce((prev, current) => prev + current, 0n);
  console.log(
    `${type} Transactions: ${clipperStaticTransactions.length}/${analysis.totalTransactions}`
  );
  console.log(
    `${type} Profit: ${formatEtherWithSymbol(
      clipperStaticTransactionsProfit
    )} ${formatEtherWithUSD(clipperStaticTransactionsProfit, ethPrice)} ${
      clipperStaticTransactionsProfit >= 0 ? "🎉" : "😞"
    }`
  );    
}

// Execute the main application function with error handling for uncaught exceptions
main().catch(console.error);