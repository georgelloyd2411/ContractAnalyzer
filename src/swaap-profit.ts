/**
 * @author Lloyd
 * @date 2025/09/14
 * @description Batch transaction profit analysis processor that retrieves comprehensive MEV metrics for multiple transactions concurrently
 */

import { getTransactionProfit } from "./services/eigenphi";
import fs from "fs";
import pMap from "p-map";

/**
 * Main execution function that processes multiple transaction hashes to generate comprehensive profit analysis.
 * Loads transaction hashes from file, performs parallel profit calculations, and exports filtered results.
 */
const main = async() => {
  // Load transaction hash array from previously generated JSON file for batch processing
  const hashes: string[] = JSON.parse(fs.readFileSync("./data/transactions.json", "utf-8"));

  // Execute parallel profit analysis for all transaction hashes with optimized concurrency
  const result = await pMap(
    hashes,
    async (hash) => {
      // Retrieve comprehensive profit metrics for each individual transaction
      const detail = await getTransactionProfit(hash);
      return detail;
    },
    {
      concurrency: 100,     // Process up to 100 requests simultaneously for optimal throughput
      stopOnError: false    // Continue processing remaining transactions even if individual requests fail
    }
  )

  console.log("Fetched all the profits");
  
  // Filter out failed API responses and save successful profit analyses to persistent storage
  fs.writeFileSync("./data/profits.json", JSON.stringify(result.filter((res) => res.hash !== "")));
}

// Execute the main batch profit analysis process
main();