import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Play, Trash, ArrowRight, FlowArrow, Sparkle, Lightning } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useKV } from '@github/spark/hooks'
import type { Service, Agent } from '@/lib/types'

interface WorkflowNode {
  id: string
  serviceId: string
  serviceName: string
  order: number
  condition?: string
}

interface Workflow {
  id: string
  name: string
  agentId: string
  nodes: WorkflowNode[]
  trigger: 'manual' | 'schedule' | 'event'
  status: 'active' | 'paused' | 'completed'
  executions: number
  lastRun?: number
}

interface WorkflowBuilderProps {
  services: Service[]
  agents: Agent[]
}

export default function WorkflowBuilder({ services, agents }: WorkflowBuilderProps) {
  const [workflows, setWorkflows] = useKV<Workflow[]>('workflows', [])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [workflowName, setWorkflowName] = useState('')
  const [selectedAgent, setSelectedAgent] = useState<string>('')
  const [selectedTrigger, setSelectedTrigger] = useState<'manual' | 'schedule' | 'event'>('manual')
  const [nodes, setNodes] = useState<WorkflowNode[]>([])
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null)

  const addNode = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId)
    if (!service) return

    const newNode: WorkflowNode = {
      id: crypto.randomUUID(),
      serviceId: service.id,
      serviceName: service.name,
      order: nodes.length + 1,
    }

    setNodes(prev => [...prev, newNode])
  }

  const removeNode = (nodeId: string) => {
    setNodes(prev => prev.filter(n => n.id !== nodeId).map((n, idx) => ({ ...n, order: idx + 1 })))
  }

  const moveNode = (nodeId: string, direction: 'up' | 'down') => {
    const currentIndex = nodes.findIndex(n => n.id === nodeId)
    if (currentIndex === -1) return
    if (direction === 'up' && currentIndex === 0) return
    if (direction === 'down' && currentIndex === nodes.length - 1) return

    const newNodes = [...nodes]
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    ;[newNodes[currentIndex], newNodes[targetIndex]] = [newNodes[targetIndex], newNodes[currentIndex]]
    
    setNodes(newNodes.map((n, idx) => ({ ...n, order: idx + 1 })))
  }

  const createWorkflow = () => {
    if (!workflowName || !selectedAgent || nodes.length === 0) return

    const workflow: Workflow = {
      id: crypto.randomUUID(),
      name: workflowName,
      agentId: selectedAgent,
      nodes,
      trigger: selectedTrigger,
      status: 'active',
      executions: 0,
    }

    setWorkflows(prev => [...(prev || []), workflow])
    resetForm()
    setIsDialogOpen(false)
  }

  const resetForm = () => {
    setWorkflowName('')
    setSelectedAgent('')
    setSelectedTrigger('manual')
    setNodes([])
    setEditingWorkflow(null)
  }

  const executeWorkflow = async (workflow: Workflow) => {
    setWorkflows(prev =>
      (prev || []).map(w =>
        w.id === workflow.id
          ? { ...w, executions: w.executions + 1, lastRun: Date.now() }
          : w
      )
    )
  }

  const deleteWorkflow = (workflowId: string) => {
    setWorkflows(prev => (prev || []).filter(w => w.id !== workflowId))
  }

  const toggleWorkflowStatus = (workflowId: string) => {
    setWorkflows(prev =>
      (prev || []).map(w =>
        w.id === workflowId
          ? { ...w, status: w.status === 'active' ? 'paused' : 'active' }
          : w
      )
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">Agent Workflows</h3>
          <p className="text-sm text-muted-foreground">
            Automate complex multi-service operations
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Create Workflow
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Build Workflow</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="workflow-name">Workflow Name</Label>
                <Input
                  id="workflow-name"
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  placeholder="e.g., Daily Content Generation Pipeline"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Select Agent</Label>
                  <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose agent" />
                    </SelectTrigger>
                    <SelectContent>
                      {agents.map(agent => (
                        <SelectItem key={agent.id} value={agent.id}>
                          {agent.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Trigger Type</Label>
                  <Select value={selectedTrigger} onValueChange={(v: any) => setSelectedTrigger(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="schedule">Scheduled</SelectItem>
                      <SelectItem value="event">Event-driven</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Add Services to Workflow</Label>
                <Select onValueChange={addNode}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select service to add" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map(service => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name} - {service.price} MNEE
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Workflow Steps ({nodes.length})</Label>
                <AnimatePresence>
                  {nodes.length === 0 ? (
                    <Card className="p-8 text-center border-dashed">
                      <p className="text-sm text-muted-foreground">
                        Add services to build your workflow
                      </p>
                    </Card>
                  ) : (
                    <div className="space-y-2">
                      {nodes.map((node, index) => (
                        <motion.div
                          key={node.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="relative"
                        >
                          <Card className="p-4 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Badge className="font-mono">{node.order}</Badge>
                                <span className="font-medium">{node.serviceName}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => moveNode(node.id, 'up')}
                                  disabled={index === 0}
                                >
                                  ↑
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => moveNode(node.id, 'down')}
                                  disabled={index === nodes.length - 1}
                                >
                                  ↓
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeNode(node.id)}
                                >
                                  <Trash className="w-4 h-4 text-destructive" />
                                </Button>
                              </div>
                            </div>
                          </Card>
                          {index < nodes.length - 1 && (
                            <div className="flex justify-center py-1">
                              <ArrowRight className="w-5 h-5 text-primary rotate-90" />
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={createWorkflow}
                  disabled={!workflowName || !selectedAgent || nodes.length === 0}
                  className="gap-2"
                >
                  <Lightning className="w-4 h-4" />
                  Create Workflow
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {(workflows || []).length === 0 ? (
          <Card className="col-span-2 p-12 text-center border-dashed">
            <FlowArrow className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold text-lg mb-2">No Workflows Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first workflow to automate multi-service operations
            </p>
            <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Workflow
            </Button>
          </Card>
        ) : (
          (workflows || []).map(workflow => (
            <Card key={workflow.id} className="p-6 space-y-4 hover:border-primary/30 transition-all">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h4 className="font-semibold text-lg">{workflow.name}</h4>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={workflow.status === 'active' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {workflow.status}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {workflow.trigger}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {workflow.nodes.length} steps
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteWorkflow(workflow.id)}
                >
                  <Trash className="w-4 h-4 text-destructive" />
                </Button>
              </div>

              <div className="space-y-2">
                {workflow.nodes.map((node, index) => (
                  <div key={node.id} className="relative">
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="secondary" className="font-mono text-xs px-2 py-0">
                        {index + 1}
                      </Badge>
                      <span className="text-muted-foreground">{node.serviceName}</span>
                    </div>
                    {index < workflow.nodes.length - 1 && (
                      <div className="ml-4 my-1">
                        <ArrowRight className="w-3 h-3 text-muted-foreground rotate-90" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="text-sm text-muted-foreground">
                  <span className="font-mono">{workflow.executions}</span> executions
                  {workflow.lastRun && (
                    <span className="ml-2">
                      • Last: {new Date(workflow.lastRun).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleWorkflowStatus(workflow.id)}
                  >
                    {workflow.status === 'active' ? 'Pause' : 'Activate'}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => executeWorkflow(workflow)}
                    disabled={workflow.status !== 'active'}
                    className="gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Run
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
