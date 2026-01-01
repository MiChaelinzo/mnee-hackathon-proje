import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import type { Service, ServiceCategory } from '@/lib/types'

interface AddServiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddService: (service: Service) => void
}

export default function AddServiceDialog({ open, onOpenChange, onAddService }: AddServiceDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '' as ServiceCategory | '',
    price: '',
    provider: '',
  })

  const handleSubmit = () => {
    if (!formData.name || !formData.description || !formData.category || !formData.price || !formData.provider) {
      toast.error('Please fill in all fields')
      return
    }

    const newService: Service = {
      id: crypto.randomUUID(),
      name: formData.name,
      description: formData.description,
      category: formData.category as ServiceCategory,
      price: parseFloat(formData.price),
      provider: formData.provider,
      providerAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
      available: true,
      sales: 0,
      rating: 4.5 + Math.random() * 0.5,
    }

    onAddService(newService)
    onOpenChange(false)
    setFormData({
      name: '',
      description: '',
      category: '',
      price: '',
      provider: '',
    })

    toast.success('Service listed!', {
      description: `${newService.name} is now available on the marketplace`,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>List New Service</DialogTitle>
          <DialogDescription>
            Add your AI service to the marketplace and start earning MNEE
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="service-name">Service Name</Label>
              <Input
                id="service-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Advanced Sentiment Analysis API"
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value as ServiceCategory })}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Data Analysis">Data Analysis</SelectItem>
                  <SelectItem value="Content Generation">Content Generation</SelectItem>
                  <SelectItem value="API Access">API Access</SelectItem>
                  <SelectItem value="Compute Resources">Compute Resources</SelectItem>
                  <SelectItem value="Machine Learning">Machine Learning</SelectItem>
                  <SelectItem value="Image Processing">Image Processing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="price">Price (MNEE)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="49.99"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="provider">Provider Name</Label>
              <Input
                id="provider"
                value={formData.provider}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                placeholder="e.g., DataCorp Labs"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what your service does and what makes it valuable..."
                rows={4}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="bg-accent text-accent-foreground hover:brightness-110">
            List Service
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
