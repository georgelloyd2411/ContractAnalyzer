/**
 * @author Lloyd
 * @date 2025/09/12
 * @description Ethereum blockchain constants for Swaap protocol integration and event monitoring
 */

/**
 * Centralized collection of Ethereum blockchain constants for Swaap protocol interactions.
 * Contains contract addresses and event topic hashes for consistent protocol integration.
 */
export const EthereumConstants = {
  /**
   * Smart contract addresses for various Swaap protocol components.
   * Used for direct contract interactions and transaction targeting.
   */
  contracts: {
    /** Swaap protocol main contract address for liquidity pool operations and token swaps */
    swaap: "0xd315a9c38ec871068fec378e4ce78af528c76293"
  },
  
  /**
   * Event topic hashes for monitoring and parsing Swaap protocol blockchain events.
   * Used for transaction log filtering and event-driven application logic.
   */
  eventTopics: {
    /** Keccak256 hash of the Swaap swap event signature for transaction log parsing */
    swaap_swap: "0x2170c741c41531aec20e7c107c24eecfdd15e69c9bb0a8dd37b1840b9e0b207b"
  }
};