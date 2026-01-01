import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowSquareOut, Check, X, Clock, Package, CalendarBlank, ShoppingCart } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import type { Transaction, Agent } from '@/lib/types'
import { formatMNEE, getEtherscanUrl } from '@/lib/mnee'

interface TransactionExplorerProps {
  transactions: Transaction[]
  agents: Agent[]
}

export default function TransactionExplorer({ transactions, agents }: TransactionExplorerProps) {
  const getAgentName = (agentId: string) => {
    return agents.find((a) => a.id === agentId)?.name || 'Unknown Agent'
  }

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(timestamp))
  }

  const getStatusIcon = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return <Check className="w-4 h-4" />
      case 'pending':
        return <Clock className="w-4 h-4" />
      case 'failed':
        return <X className="w-4 h-4" />
    }
  }

  const getStatusVariant = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return 'default'
      case 'pending':
        return 'secondary'
      case 'failed':
        return 'destructive'
    }
  }

  const getTypeIcon = (type?: Transaction['type']) => {
    switch (type) {
      case 'bundle':
        return <Package className="w-3 h-3" />
      case 'subscription':
        return <CalendarBlank className="w-3 h-3" />
      default:
        return <ShoppingCart className="w-3 h-3" />
    }
  }

  const getTypeLabel = (type?: Transaction['type']) => {
    switch (type) {
      case 'bundle':
        return 'Bundle'
      case 'subscription':
        return 'Subscription'
      default:
        return 'Service'
    }
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
          <ArrowSquareOut className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-2xl font-bold mb-2">No Transactions Yet</h3>
        <p className="text-muted-foreground max-w-md">
          When your agents make purchases, they'll appear here with full blockchain verification
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Transaction History</h2>
        <p className="text-muted-foreground">All agent purchases verified on Ethereum</p>
      </div>

      <div className="hidden md:block">
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Transaction</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx, index) => (
                <motion.tr
                  key={tx.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                  className="border-b border-border"
                >
                  <TableCell className="text-muted-foreground">
                    {formatDate(tx.timestamp)}
                  </TableCell>
                  <TableCell className="font-medium">{tx.agentName}</TableCell>
                  <TableCell>{tx.serviceName}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="gap-1">
                      {getTypeIcon(tx.type)}
                      {getTypeLabel(tx.type)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono font-bold text-accent">
                    {formatMNEE(tx.amount)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(tx.status)} className="gap-1">
                      {getStatusIcon(tx.status)}
                      {tx.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {tx.txHash && (
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                      >
                        <a
                          href={getEtherscanUrl(tx.txHash)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="gap-1"
                        >
                          View
                          <ArrowSquareOut className="w-3 h-3" />
                        </a>
                      </Button>
                    )}
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      <div className="md:hidden space-y-4">
        {transactions.map((tx, index) => (
          <motion.div
            key={tx.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="font-semibold">{tx.serviceName}</div>
                    <Badge variant="outline" className="gap-1 text-xs">
                      {getTypeIcon(tx.type)}
                      {getTypeLabel(tx.type)}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">{tx.agentName}</div>
                </div>
                <Badge variant={getStatusVariant(tx.status)} className="gap-1">
                  {getStatusIcon(tx.status)}
                  {tx.status}
                </Badge>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-mono font-bold text-accent">
                    {formatMNEE(tx.amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time</span>
                  <span>{formatDate(tx.timestamp)}</span>
                </div>
              </div>

              {tx.txHash && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-3 gap-1"
                  asChild
                >
                  <a
                    href={getEtherscanUrl(tx.txHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View on Etherscan
                    <ArrowSquareOut className="w-3 h-3" />
                  </a>
                </Button>
              )}
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="p-6 bg-muted/30">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
            <ArrowSquareOut className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold mb-1">Blockchain Verification</h3>
            <p className="text-sm text-muted-foreground">
              All transactions are recorded on Ethereum and can be verified on Etherscan. 
              MNEE contract: {' '}
              <code className="bg-background px-1 py-0.5 rounded text-xs font-mono">
                0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF
              </code>
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
