import { useState, useEffect, useCallback } from 'react'
import { BrowserProvider, Contract, formatUnits, parseUnits } from 'ethers'
import { MNEE_CONTRACT_ADDRESS, ETHEREUM_CHAIN_ID } from '@/lib/mnee'
import { toast } from 'sonner'

const MNEE_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
]

interface WalletState {
  address: string | null
  chainId: number | null
  isConnected: boolean
  isConnecting: boolean
  mneeBalance: string
  ethBalance: string
}

interface Web3Error extends Error {
  code?: number | string
}

export function useWallet() {
  const [walletState, setWalletState] = useState<WalletState>({
    address: null,
    chainId: null,
    isConnected: false,
    isConnecting: false,
    mneeBalance: '0',
    ethBalance: '0',
  })

  const checkIfWalletIsConnected = useCallback(async () => {
    if (typeof window === 'undefined' || !window.ethereum) return

    try {
      const provider = new BrowserProvider(window.ethereum as never)
      const accounts = await provider.listAccounts()
      
      if (accounts.length > 0) {
        const signer = await provider.getSigner()
        const address = await signer.getAddress()
        const network = await provider.getNetwork()
        
        setWalletState(prev => ({
          ...prev,
          address,
          chainId: Number(network.chainId),
          isConnected: true,
        }))

        await updateBalances(address, provider)
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error)
    }
  }, [])

  const updateBalances = async (address: string, provider: BrowserProvider) => {
    try {
      const ethBalanceWei = await provider.getBalance(address)
      const ethBalance = formatUnits(ethBalanceWei, 18)

      const mneeContract = new Contract(MNEE_CONTRACT_ADDRESS, MNEE_ABI, provider)
      const mneeBalanceWei = await mneeContract.balanceOf(address)
      const decimals = await mneeContract.decimals()
      const mneeBalance = formatUnits(mneeBalanceWei, decimals)

      setWalletState(prev => ({
        ...prev,
        ethBalance: parseFloat(ethBalance).toFixed(4),
        mneeBalance: parseFloat(mneeBalance).toFixed(2),
      }))
    } catch (error) {
      console.error('Error updating balances:', error)
    }
  }

  const connectWallet = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      toast.error('MetaMask not detected', {
        description: 'Please install MetaMask to connect your wallet.',
      })
      return
    }

    setWalletState(prev => ({ ...prev, isConnecting: true }))

    try {
      const provider = new BrowserProvider(window.ethereum as never)
      const accounts = await provider.send('eth_requestAccounts', []) as string[]
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found')
      }

      const signer = await provider.getSigner()
      const address = await signer.getAddress()
      const network = await provider.getNetwork()
      const chainId = Number(network.chainId)

      if (chainId !== ETHEREUM_CHAIN_ID) {
        toast.warning('Wrong Network', {
          description: 'Please switch to Ethereum Mainnet in MetaMask.',
        })
      }

      setWalletState(prev => ({
        ...prev,
        address,
        chainId,
        isConnected: true,
        isConnecting: false,
      }))

      await updateBalances(address, provider)

      toast.success('Wallet Connected', {
        description: `Connected to ${address.slice(0, 6)}...${address.slice(-4)}`,
      })
    } catch (error) {
      const web3Error = error as Web3Error
      console.error('Error connecting wallet:', web3Error)
      
      let errorMessage = 'Failed to connect wallet'
      
      if (web3Error.code === 4001) {
        errorMessage = 'Connection request rejected'
      } else if (web3Error.message) {
        errorMessage = web3Error.message
      }

      toast.error('Connection Failed', {
        description: errorMessage,
      })

      setWalletState(prev => ({
        ...prev,
        isConnecting: false,
      }))
    }
  }

  const disconnectWallet = () => {
    setWalletState({
      address: null,
      chainId: null,
      isConnected: false,
      isConnecting: false,
      mneeBalance: '0',
      ethBalance: '0',
    })

    toast.info('Wallet Disconnected')
  }

  const switchToEthereumMainnet = async () => {
    if (!window.ethereum) return

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x1' }],
      })
      
      toast.success('Network Switched', {
        description: 'Switched to Ethereum Mainnet',
      })
    } catch (error) {
      const web3Error = error as Web3Error
      console.error('Error switching network:', web3Error)
      
      toast.error('Network Switch Failed', {
        description: web3Error.message || 'Failed to switch network',
      })
    }
  }

  const transferMNEE = async (toAddress: string, amount: string) => {
    if (!walletState.isConnected || !walletState.address) {
      toast.error('Wallet not connected')
      return null
    }

    try {
      const provider = new BrowserProvider(window.ethereum as never)
      const signer = await provider.getSigner()
      const mneeContract = new Contract(MNEE_CONTRACT_ADDRESS, MNEE_ABI, signer)
      
      const decimals = await mneeContract.decimals()
      const amountWei = parseUnits(amount, decimals)

      const tx = await mneeContract.transfer(toAddress, amountWei)
      
      toast.info('Transaction Submitted', {
        description: 'Waiting for confirmation...',
      })

      const receipt = await tx.wait()
      
      await updateBalances(walletState.address, provider)

      toast.success('Transaction Confirmed', {
        description: `Transferred ${amount} MNEE`,
      })

      return receipt.hash
    } catch (error) {
      const web3Error = error as Web3Error
      console.error('Error transferring MNEE:', web3Error)
      
      let errorMessage = 'Transaction failed'
      
      if (web3Error.code === 4001) {
        errorMessage = 'Transaction rejected by user'
      } else if (web3Error.message) {
        errorMessage = web3Error.message
      }

      toast.error('Transaction Failed', {
        description: errorMessage,
      })

      return null
    }
  }

  const refreshBalances = async () => {
    if (walletState.address && window.ethereum) {
      const provider = new BrowserProvider(window.ethereum as never)
      await updateBalances(walletState.address, provider)
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected()

    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet()
        } else {
          checkIfWalletIsConnected()
        }
      }

      const handleChainChanged = () => {
        window.location.reload()
      }

      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)

      return () => {
        window.ethereum?.removeListener('accountsChanged', handleAccountsChanged)
        window.ethereum?.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [checkIfWalletIsConnected])

  return {
    ...walletState,
    connectWallet,
    disconnectWallet,
    switchToEthereumMainnet,
    transferMNEE,
    refreshBalances,
  }
}

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
      on: (event: string, callback: (...args: unknown[]) => void) => void
      removeListener: (event: string, callback: (...args: unknown[]) => void) => void
      send: (method: string, params?: unknown[]) => Promise<unknown>
    }
  }
}
