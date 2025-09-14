/**
 * @author Lloyd
 * @date 2025/09/14
 * @description EigenPhi API integration for comprehensive MEV transaction profit analysis and financial metrics calculation
 */

import axios from "axios";
import { formatEther } from "ethers";

/**
 * Retrieves comprehensive profit analysis data for a specific transaction using EigenPhi's analytics API.
 * Calculates detailed financial metrics including revenue, gas fees, and MEV builder payments.
 * @param {string} hash - Transaction hash to analyze for profit and cost breakdown
 * @returns {Promise<Object>} Comprehensive profit analysis object containing revenue, fees, and builder payments
 */
export const getTransactionProfit = async (hash: string) => {
  try {
    // Retrieve transaction analytics data from EigenPhi's comprehensive MEV analysis service
    const result = await axios.get(
      `https://storage.googleapis.com/eigenphi-ethereum-tx/${hash}`
    );
    
    // Calculate total gas cost by converting wei amounts to ether and applying gas price
    const gasCost = Number(
      formatEther(
        BigInt(result.data.txMeta.gasUsed) * BigInt(result.data.txMeta.gasPrice)
      )
    );
    
    // Extract platform token price data for accurate USD conversion calculations
    const tokenPrice = result.data.tokenPrices.find(
      (price: any) => price.tokenSpec === "PLATFORM"
    );
    
    // Convert gas cost from ETH to USD using current platform token pricing
    const gasFee = gasCost * Number(tokenPrice.priceInUsd);

    return {
      hash: hash,                                               // Transaction identifier for reference
      revenue: Number(result.data.summary.revenue),             // Total revenue generated from the transaction
      gasFee: gasFee,                                          // Gas fees paid in USD equivalent
      profit: Number(result.data.summary.profit),              // Net profit after all costs
      builderPay: Number(result.data.summary.cost) - gasFee,   // MEV builder payment excluding gas fees
    };
  } catch (error) {
    // Return default zero-value object to maintain data structure consistency during API failures
    return {
      hash: "",
      revenue: 0,
      gasFee: 0,
      profit: 0,
      builderPay: 0,
    };
  }
};