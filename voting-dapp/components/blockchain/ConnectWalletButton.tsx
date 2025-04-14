"use client";

import { Button } from "@/components/ui/button";
import { useWeb3 } from "@/contexts/Web3Context";
import { formatEthAddress } from "@/lib/electionUtils";

export default function ConnectWalletButton() {
  const { account, isConnected, connectWallet } = useWeb3();

  return (
    <Button 
      onClick={connectWallet} 
      variant={isConnected ? "outline" : "default"}
    >
      {isConnected && account
        ? `Connected: ${formatEthAddress(account)}`
        : "Connect Wallet"}
    </Button>
  );
}