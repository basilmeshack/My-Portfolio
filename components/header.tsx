"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X } from "lucide-react"

const navItems = [
  { name: "Home", href: "#home" },
  { name: "About", href: "#about" },
  { name: "Experience", href: "#experience" },
  { name: "Projects", href: "#projects" },
  { name: "Contact", href: "#contact" },
  { name: "Resume", href: "#resume" },
]

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("home")
  const pathname = usePathname()
  const router = useRouter()

  const prefetchTargets = useMemo(() => ["/resume"], [])

  useEffect(() => {
    // Warm key routes so first navigation feels instant on slower devices/connections.
    prefetchTargets.forEach((href) => router.prefetch(href))
  }, [prefetchTargets, router])

  const warmRoute = (href: string) => {
    router.prefetch(href)
  }

  // Smooth scroll to section
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    setIsOpen(false)
  }

  // Update active section on scroll
  useEffect(() => {
    // Only enable scroll listener on home page
    if (pathname !== "/") {
      setActiveSection("resume")
      return
    }

    const handleScroll = () => {
      const sections = navItems.map(item => item.href.replace("#", ""))
      const scrollPosition = window.scrollY + 150

      let currentSection = "home"
      let maxVisibility = 0

      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const { offsetTop, offsetHeight } = element
          const sectionBottom = offsetTop + offsetHeight
          
          // Check if section is in viewport
          if (scrollPosition >= offsetTop && scrollPosition < sectionBottom) {
            currentSection = section
            break
          }
          
          // Also check if we're past this section (for the last section)
          if (scrollPosition >= sectionBottom && section === sections[sections.length - 1]) {
            currentSection = section
          }
        }
      }

      setActiveSection(currentSection)
    }

    // Initial check
    handleScroll()
    
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [pathname])

  return (
    <header className="bg-gray-900/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-purple-400">
            Meshack Bwire
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={(e) => scrollToSection(e, item.href)}
                className={`text-base font-medium transition-colors hover:text-purple-400 cursor-pointer ${
                  activeSection === item.href.replace("#", "") ? "text-purple-400" : "text-gray-300"
                }`}
              >
                {item.name}
              </a>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-gray-300" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <nav className="md:hidden mt-4 py-4 border-t border-gray-800">
            <ul className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    onClick={(e) => scrollToSection(e, item.href)}
                    className={`block text-base font-medium transition-colors hover:text-purple-400 cursor-pointer ${
                      activeSection === item.href.replace("#", "") ? "text-purple-400" : "text-gray-300"
                    }`}
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </header>
  )
}
