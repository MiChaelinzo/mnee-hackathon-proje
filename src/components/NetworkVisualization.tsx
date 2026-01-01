import { useEffect, useRef, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Play, Pause, ArrowsClockwise } from '@phosphor-icons/react'
import type { Transaction, Agent } from '@/lib/types'
import * as THREE from 'three'

interface NetworkVisualizationProps {
  transactions: Transaction[]
  agents: Agent[]
}

export default function NetworkVisualization({
  transactions,
  agents,
}: NetworkVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isPlaying, setIsPlaying] = useState(true)
  const [stats, setStats] = useState({
    nodes: 0,
    connections: 0,
    volume: 0,
  })

  useEffect(() => {
    if (!canvasRef.current) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a0a0f)

    const camera = new THREE.PerspectiveCamera(
      75,
      canvasRef.current.clientWidth / canvasRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.z = 50

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
    })
    renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)

    const ambientLight = new THREE.AmbientLight(0x404040, 2)
    scene.add(ambientLight)

    const pointLight = new THREE.PointLight(0x00ffff, 1, 100)
    pointLight.position.set(10, 10, 10)
    scene.add(pointLight)

    const nodes: THREE.Mesh[] = []
    const connections: THREE.Line[] = []

    const uniqueProviders = new Set(transactions.map(t => t.serviceId))
    const nodeCount = agents.length + uniqueProviders.size

    const agentGeometry = new THREE.SphereGeometry(0.8, 16, 16)
    const agentMaterial = new THREE.MeshPhongMaterial({
      color: 0x4c7de0,
      emissive: 0x2a4f9e,
      shininess: 100,
    })

    agents.forEach((agent, index) => {
      const angle = (index / agents.length) * Math.PI * 2
      const radius = 20
      const node = new THREE.Mesh(agentGeometry, agentMaterial)
      node.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0)
      node.userData = { type: 'agent', data: agent }
      scene.add(node)
      nodes.push(node)
    })

    const providerGeometry = new THREE.OctahedronGeometry(1, 0)
    const providerMaterial = new THREE.MeshPhongMaterial({
      color: 0x86efac,
      emissive: 0x4ade80,
      shininess: 100,
    })

    Array.from(uniqueProviders).forEach((providerId, index) => {
      const angle = (index / uniqueProviders.size) * Math.PI * 2
      const radius = 15
      const node = new THREE.Mesh(providerGeometry, providerMaterial)
      node.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 5)
      node.userData = { type: 'provider', id: providerId }
      scene.add(node)
      nodes.push(node)
    })

    transactions.slice(0, 50).forEach((transaction) => {
      const agentNode = nodes.find(
        n => n.userData.type === 'agent' && n.userData.data?.id === transaction.agentId
      )
      const providerNode = nodes.find(
        n => n.userData.type === 'provider' && n.userData.id === transaction.serviceId
      )

      if (agentNode && providerNode) {
        const points: THREE.Vector3[] = []
        points.push(agentNode.position.clone())
        points.push(providerNode.position.clone())

        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points)
        const lineMaterial = new THREE.LineBasicMaterial({
          color: 0x4c7de0,
          opacity: 0.3,
          transparent: true,
        })
        const line = new THREE.Line(lineGeometry, lineMaterial)
        scene.add(line)
        connections.push(line)
      }
    })

    const totalVolume = transactions.reduce((sum, t) => sum + t.amount, 0)
    setStats({
      nodes: nodeCount,
      connections: connections.length,
      volume: totalVolume,
    })

    let animationId: number
    let rotation = 0

    const animate = () => {
      if (isPlaying) {
        rotation += 0.002
        scene.rotation.y = rotation

        nodes.forEach((node, index) => {
          node.position.y += Math.sin(Date.now() * 0.001 + index) * 0.01
          node.rotation.y += 0.01
        })
      }

      renderer.render(scene, camera)
      animationId = requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      if (!canvasRef.current) return
      camera.aspect = canvasRef.current.clientWidth / canvasRef.current.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight)
    }

    window.addEventListener('resize', handleResize)

    let mouseX = 0
    let mouseY = 0

    const handleMouseMove = (event: MouseEvent) => {
      if (!canvasRef.current) return
      const rect = canvasRef.current.getBoundingClientRect()
      mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1
      camera.position.x = mouseX * 5
      camera.position.y = mouseY * 5
      camera.lookAt(scene.position)
    }

    canvasRef.current.addEventListener('mousemove', handleMouseMove)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', handleResize)
      canvasRef.current?.removeEventListener('mousemove', handleMouseMove)
      
      nodes.forEach(node => {
        node.geometry.dispose()
        if (Array.isArray(node.material)) {
          node.material.forEach(m => m.dispose())
        } else {
          node.material.dispose()
        }
      })
      
      connections.forEach(conn => {
        conn.geometry.dispose()
        if (Array.isArray(conn.material)) {
          conn.material.forEach(m => m.dispose())
        } else {
          conn.material.dispose()
        }
      })
      
      renderer.dispose()
    }
  }, [transactions, agents, isPlaying])

  const handleReset = () => {
    setIsPlaying(false)
    setTimeout(() => setIsPlaying(true), 100)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">Transaction Network</h3>
          <p className="text-sm text-muted-foreground">
            3D visualization of marketplace activity
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPlaying(!isPlaying)}
            className="gap-2"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isPlaying ? 'Pause' : 'Play'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset} className="gap-2">
            <ArrowsClockwise className="w-4 h-4" />
            Reset
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <div className="text-sm text-muted-foreground mb-1">Network Nodes</div>
          <div className="text-3xl font-bold font-mono text-primary">{stats.nodes}</div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
          <div className="text-sm text-muted-foreground mb-1">Active Connections</div>
          <div className="text-3xl font-bold font-mono text-accent">{stats.connections}</div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
          <div className="text-sm text-muted-foreground mb-1">Total Volume</div>
          <div className="text-3xl font-bold font-mono">{stats.volume.toFixed(0)} MNEE</div>
        </Card>
      </div>

      <Card className="relative overflow-hidden border-2 border-primary/20">
        <canvas ref={canvasRef} className="w-full h-[600px]" />
        <div className="absolute bottom-4 left-4 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-xs text-white">Agents</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-accent" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
            <span className="text-xs text-white">Services</span>
          </div>
        </div>
        <Badge className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm">
          Hover to explore
        </Badge>
      </Card>
    </div>
  )
}
