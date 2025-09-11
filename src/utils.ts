export function formatEther(wei: bigint): string {
  const ether = Number(wei) / 1e18;
  return ether.toFixed(18);
}

export function formatEtherWithSymbol(wei: bigint): string {
  return `${formatEther(wei)} ETH`;
}

export function formatEtherWithUSD(wei: bigint, ethPrice: number): string {
  const ether = Number(wei) / 1e18;
  return `(${(ether * ethPrice).toFixed(2)} USD)`;
}

export function validateDate(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) {
    return false;
  }

  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

export function validateEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}
