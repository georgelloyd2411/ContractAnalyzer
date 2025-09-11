export interface EtherscanTransaction {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  nonce: string;
  blockHash: string;
  transactionIndex: string;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasPrice: string;
  gasUsed: string;
  cumulativeGasUsed: string;
  input: string;
  confirmations: string;
  isError: string;
}

export interface InternalTransaction {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  from: string;
  to: string;
  value: string;
  contractAddress: string;
  input: string;
  type: string;
  gas: string;
  gasUsed: string;
  traceId: string;
  isError: string;
  errCode: string;
}

export interface TransactionProfit {
  hash: string;
  timestamp: string;
  blockNumber: string;
  gasFee: bigint;
  contractToWalletValue: bigint;
  contractToOriginValue: bigint;
  totalInternalValue: bigint;
  netProfit: bigint;
  from: string;
}

export interface DailyAnalysis {
  date: string;
  transactions: TransactionProfit[];
  totalProfit: bigint;
  totalTransactions: number;
  totalGasFees: bigint;
  totalInternalValue: bigint;
}
