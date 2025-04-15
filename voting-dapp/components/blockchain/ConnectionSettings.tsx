"use client";

import { useState, useEffect } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

export default function ConnectionSettings() {
  const { connectToNode, isConnected, currentRpcUrl } = useWeb3();
  const [rpcUrl, setRpcUrl] = useState<string>('');
  const [savedNodes, setSavedNodes] = useState<string[]>([]);

  // Load saved nodes from localStorage on component mount
  useEffect(() => {
    const savedNodesJson = localStorage.getItem('savedBlockchainNodes');
    if (savedNodesJson) {
      try {
        const nodes = JSON.parse(savedNodesJson);
        setSavedNodes(Array.isArray(nodes) ? nodes : []);
      } catch (e) {
        console.error("Error parsing saved nodes:", e);
      }
    }
  }, []);

  // Save a new node to localStorage
  const saveNode = (nodeUrl: string) => {
    const newSavedNodes = [...new Set([...savedNodes, nodeUrl])];
    setSavedNodes(newSavedNodes);
    localStorage.setItem('savedBlockchainNodes', JSON.stringify(newSavedNodes));
  };

  const handleConnect = async () => {
    if (rpcUrl) {
      const success = await connectToNode(rpcUrl);
      if (success) {
        saveNode(rpcUrl);
      }
    }
  };

  const handleSelectSavedNode = async (nodeUrl: string) => {
    setRpcUrl(nodeUrl);
    await connectToNode(nodeUrl);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Blockchain Connection</CardTitle>
        <CardDescription>
          Connect to any blockchain node on your network
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            {isConnected ? (
              <div className="flex items-center gap-2 text-sm mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Connected to: {currentRpcUrl}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm mb-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Disconnected</span>
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <Input
              placeholder="Enter RPC URL (e.g., http://192.168.1.5:8545)"
              value={rpcUrl}
              onChange={(e) => setRpcUrl(e.target.value)}
            />
            <Button onClick={handleConnect}>Connect</Button>
          </div>
          
          {savedNodes.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Saved Nodes:</h4>
              <div className="flex flex-wrap gap-2">
                {savedNodes.map((node, i) => (
                  <Button 
                    key={i} 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleSelectSavedNode(node)}
                  >
                    {node}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}