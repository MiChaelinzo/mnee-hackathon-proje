import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Robot, Wallet, ShoppingBag, Plus, Pencil } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import type { Agent, Transaction } from '@/lib/types'
import { formatMNEE } from '@/lib/mnee'

interface AgentDashboardProps {
  agents: Agent[]
  transactions: Transaction[]
  onUpdateAgent: (agent: Agent) => void
  onAddAgent: (agent: Agent) => void
}

export default function AgentDashboard({ agents, transactions, onUpdateAgent, onAddAgent }: AgentDashboardProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    balance: '1000',
    spendingLimit: '5000',
  })

  const handleAddAgent = () => {
    const newAgent: Agent = {
      id: crypto.randomUUID(),
      name: formData.name,
      address: `0x${Math.random().toString(16).substr(2, 40)}`,
      balance: parseFloat(formData.balance) || 0,
      isActive: true,
      spendingLimit: parseFloat(formData.spendingLimit) || 0,
      totalSpent: 0,
      purchaseCount: 0,
    }

    onAddAgent(newAgent)
    setIsAddDialogOpen(false)
    setFormData({ name: '', balance: '1000', spendingLimit: '5000' })
    
    toast.success('Agent created!', {
      description: `${newAgent.name} is now ready to make purchases`,
    })
  }

  const handleUpdateAgent = () => {
    if (!editingAgent) return

    const updated = {
      ...editingAgent,
      name: formData.name || editingAgent.name,
      balance: parseFloat(formData.balance) || editingAgent.balance,
      spendingLimit: parseFloat(formData.spendingLimit) || editingAgent.spendingLimit,
    }

    onUpdateAgent(updated)
    setEditingAgent(null)
    setFormData({ name: '', balance: '1000', spendingLimit: '5000' })
    
    toast.success('Agent updated!', {
      description: `${updated.name} settings have been saved`,
    })
  }

  const openEditDialog = (agent: Agent) => {
    setEditingAgent(agent)
    setFormData({
      name: agent.name,
      balance: agent.balance.toString(),
      spendingLimit: agent.spendingLimit.toString(),
    })
  }

  const getAgentTransactions = (agentId: string) => {
    return transactions.filter((tx) => tx.agentId === agentId)
  }

  if (agents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
          <Robot className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-2xl font-bold mb-2">No Agents Yet</h3>
        <p className="text-muted-foreground max-w-md mb-6">
          Create your first AI agent to start making autonomous purchases on the marketplace
        </p>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Agent
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">My AI Agents</h2>
          <p className="text-muted-foreground">Manage your autonomous trading agents</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Agent
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {agents.map((agent, index) => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card className="p-6 relative overflow-hidden">
              {agent.isActive && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
              )}
              
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      agent.isActive ? 'bg-primary pulse-glow' : 'bg-muted'
                    }`}>
                      <Robot className={`w-6 h-6 ${
                        agent.isActive ? 'text-primary-foreground' : 'text-muted-foreground'
                      }`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{agent.name}</h3>
                      <p className="text-xs text-muted-foreground font-mono">
                        {agent.address.slice(0, 10)}...{agent.address.slice(-8)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={agent.isActive ? 'default' : 'secondary'}>
                      {agent.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEditDialog(agent)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                      <Wallet className="w-4 h-4" />
                      Balance
                    </div>
                    <div className="text-2xl font-bold font-mono text-accent">
                      {formatMNEE(agent.balance)}
                    </div>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                      <ShoppingBag className="w-4 h-4" />
                      Purchases
                    </div>
                    <div className="text-2xl font-bold">
                      {agent.purchaseCount}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Spent</span>
                    <span className="font-mono font-medium">{formatMNEE(agent.totalSpent)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Spending Limit</span>
                    <span className="font-mono font-medium">{formatMNEE(agent.spendingLimit)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Remaining</span>
                    <span className="font-mono font-medium text-accent">
                      {formatMNEE(agent.spendingLimit - agent.totalSpent)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`active-${agent.id}`} className="cursor-pointer">
                      Autonomous Purchasing
                    </Label>
                    <Switch
                      id={`active-${agent.id}`}
                      checked={agent.isActive}
                      onCheckedChange={(checked) => 
                        onUpdateAgent({ ...agent, isActive: checked })
                      }
                    />
                  </div>
                </div>

                {getAgentTransactions(agent.id).length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Recent Activity</h4>
                    <div className="space-y-2">
                      {getAgentTransactions(agent.id).slice(0, 3).map((tx) => (
                        <div
                          key={tx.id}
                          className="text-xs flex justify-between items-center bg-muted/30 p-2 rounded"
                        >
                          <span className="text-muted-foreground truncate flex-1">
                            {tx.serviceName}
                          </span>
                          <span className="font-mono font-medium ml-2">
                            {formatMNEE(tx.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Dialog 
        open={isAddDialogOpen || !!editingAgent} 
        onOpenChange={(open) => {
          if (!open) {
            setIsAddDialogOpen(false)
            setEditingAgent(null)
            setFormData({ name: '', balance: '1000', spendingLimit: '5000' })
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAgent ? 'Edit Agent' : 'Create New Agent'}</DialogTitle>
            <DialogDescription>
              {editingAgent 
                ? 'Update your AI agent settings' 
                : 'Set up a new AI agent for autonomous commerce'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Agent Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Research Agent Alpha"
              />
            </div>
            <div>
              <Label htmlFor="balance">Initial Balance (MNEE)</Label>
              <Input
                id="balance"
                type="number"
                value={formData.balance}
                onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                placeholder="1000"
              />
            </div>
            <div>
              <Label htmlFor="limit">Spending Limit (MNEE)</Label>
              <Input
                id="limit"
                type="number"
                value={formData.spendingLimit}
                onChange={(e) => setFormData({ ...formData, spendingLimit: e.target.value })}
                placeholder="5000"
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsAddDialogOpen(false)
                setEditingAgent(null)
                setFormData({ name: '', balance: '1000', spendingLimit: '5000' })
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={editingAgent ? handleUpdateAgent : handleAddAgent}
              disabled={!formData.name}
            >
              {editingAgent ? 'Update' : 'Create'} Agent
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
