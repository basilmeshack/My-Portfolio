"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"

const navItems = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Experience", href: "/experience" },
  { name: "Projects", href: "/projects" },
  { name: "Contact", href: "/contact" },
]

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

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
              <Link
                key={item.name}
                href={item.href}
                className={`text-base font-medium transition-colors hover:text-purple-400 ${
                  pathname === item.href ? "text-purple-400" : "text-gray-300"
                }`}
              >
                {item.name}
              </Link>
            ))}
            <Link
              href="/resume"
              className={`text-base font-medium transition-colors hover:text-purple-400 ${
                pathname === "/resume" ? "text-purple-400" : "text-gray-300"
              }`}
            >
              Resume
            </Link>
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
                  <Link
                    href={item.href}
                    className={`block text-base font-medium transition-colors hover:text-purple-400 ${
                      pathname === item.href ? "text-purple-400" : "text-gray-300"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/resume"
                  className={`block text-base font-medium transition-colors hover:text-purple-400 ${
                    pathname === "/resume" ? "text-purple-400" : "text-gray-300"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  Resume
                </Link>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </header>
  )
}
