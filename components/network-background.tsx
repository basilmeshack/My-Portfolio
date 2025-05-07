"use client"

import { useEffect, useRef } from "react"

export default function NetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number
    const particles: Particle[] = []
    const particleCount = 100
    const maxDistance = 150
    const mouseRadius = 150

    const mouse = {
      x: canvas.width / 2,
      y: canvas.height / 2,
      active: false,
    }

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    class Particle {
      x: number
      y: number
      vx: number
      vy: number
      size: number
      color: string

      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.vx = (Math.random() - 0.5) * 0.5
        this.vy = (Math.random() - 0.5) * 0.5
        this.size = Math.random() * 1.5 + 0.5

        // Violet to blue gradient for particles
        const colors = ["rgba(139, 92, 246, 0.7)", "rgba(96, 165, 250, 0.7)"]
        this.color = colors[Math.floor(Math.random() * colors.length)]
      }

      update() {
        // Move particles
        this.x += this.vx
        this.y += this.vy

        // Bounce off edges
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1

        // Mouse interaction
        if (mouse.active) {
          const dx = this.x - mouse.x
          const dy = this.y - mouse.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < mouseRadius) {
            const angle = Math.atan2(dy, dx)
            const force = (mouseRadius - distance) / mouseRadius
            this.vx += Math.cos(angle) * force * 0.2
            this.vy += Math.sin(angle) * force * 0.2
          }
        }
      }

      draw() {
        if (!ctx) return
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fillStyle = this.color
        ctx.fill()
      }
    }

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle())
    }

    // Mouse events
    canvas.addEventListener("mousemove", (e) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
      mouse.active = true
    })

    canvas.addEventListener("mouseleave", () => {
      mouse.active = false
    })

    // Handle window resize
    window.addEventListener("resize", () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    })

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update and draw particles
      particles.forEach((particle) => {
        particle.update()
        particle.draw()
      })

      // Draw connections
      ctx.strokeStyle = "rgba(139, 92, 246, 0.15)"
      ctx.lineWidth = 0.5

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < maxDistance) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener("resize", () => {})
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full bg-zinc-950" style={{ zIndex: 0 }} />
}
