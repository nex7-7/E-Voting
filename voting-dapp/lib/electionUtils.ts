/**
 * Election-specific utility functions
 */

export function formatEthAddress(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function getElectionStatus(started: boolean, ended: boolean): string {
  if (!started) return "Not Started";
  if (ended) return "Ended";
  return "In Progress";
}

export function getElectionStatusColor(started: boolean, ended: boolean): string {
  if (!started) return "bg-yellow-500";
  if (ended) return "bg-red-500";
  return "bg-green-500";
}
