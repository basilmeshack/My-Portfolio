"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { ExternalLink } from "lucide-react"
import PocketBase from "pocketbase"

// Initialize PocketBase client
const pb = new PocketBase("https://remain-faceghost.pockethost.io")

// Type definition for partner/project data
interface PortfolioItem {
  id: string
  name: string
  logo: string
  url: string
  category: string
  field: string
  description?: string
  tags?: string
  demoLink?: string
  isCompanyProject?: boolean
}

// Fallback data in case the API request fails
const fallbackItems = [
  // Payment Networks
  {
    id: "1",
    name: "Visa",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png",
    url: "https://www.visa.com/",
    category: "Payment Networks",
    field: "partners",
  },
  {
    id: "2",
    name: "MasterCard",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png",
    url: "https://www.mastercard.com/",
    category: "Payment Networks",
    field: "partners",
  },
  // Projects
  {
    id: "3",
    name: "Infinity Wanderlust",
    logo: "/placeholder.svg?height=300&width=600",
    url: "https://infinity-wanderlust.vercel.app/",
    category: "Personal Projects",
    field: "projects",
    description: "A travel advisory application that helps users find hotels, restaurants, and attractions.",
    tags: JSON.stringify(["TypeScript", "React", "API Integration"]),
    demoLink: "https://infinity-wanderlust.vercel.app/",
    isCompanyProject: false,
  },
]

// Function to fetch items from PocketBase based on field type
async function fetchPortfolioItems(fieldType: string): Promise<PortfolioItem[]> {
  try {
    // Fetch all portfolio images with the specified field type
    const records = await pb.collection("portfolio_images").getFullList({
      sort: "-created",
      filter: `field = "${fieldType}"`,
    })

    // Map them to the expected format
    const items = records.map((record) => ({
      id: record.id,
      name: record.name,
      logo: pb.files.getUrl(record, record.image), // Construct full image URL
      url: record.url,
      category: record.category,
      field: record.field,
      description: record.description,
      tags: record.tags,
      demoLink: record.demoLink,
      isCompanyProject: record.isCompanyProject,
    }))

    return items
  } catch (err) {
    console.error(`Failed to fetch ${fieldType}:`, err)
    // Return only fallback items that match the requested field type
    return fallbackItems.filter((item) => item.field === fieldType)
  }
}

interface PartnerLogosProps {
  fieldType: "partners" | "projects"
  title?: string
  description?: string
}

export default function PartnerLogos({
  fieldType = "partners",
  title = "Professional Network",
  description = "Throughout my career, I've collaborated with leading organizations across banking, payment processing, telecommunications, and technology sectors.",
}: PartnerLogosProps) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const [items, setItems] = useState<PortfolioItem[]>([])
  const [activeCategory, setActiveCategory] = useState("All")
  const [hoveredLogo, setHoveredLogo] = useState<string | null>(null)
  const [imageLoadError, setImageLoadError] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(true)

  // Fetch items data on component mount
  useEffect(() => {
    const loadItems = async () => {
      setIsLoading(true)
      try {
        const fetchedItems = await fetchPortfolioItems(fieldType)
        setItems(fetchedItems)
      } catch (error) {
        console.error(`Error loading ${fieldType}:`, error)
        setItems(fallbackItems.filter((item) => item.field === fieldType))
      } finally {
        setIsLoading(false)
      }
    }

    loadItems()
  }, [fieldType])

  // Extract unique categories from items
  const categories = Array.from(new Set(items.map((item) => item.category)))

  // Filter items based on active category
  const filteredItems = activeCategory === "All" ? items : items.filter((item) => item.category === activeCategory)

  // Handle image load errors
  const handleImageError = (itemName: string) => {
    setImageLoadError((prev) => ({ ...prev, [itemName]: true }))
  }

  // Get category description based on active category and field type
  const getCategoryDescription = () => {
    if (fieldType === "partners") {
      if (activeCategory === "All") {
        return "Select a category to learn more about my professional relationships"
      } else if (activeCategory === "Employers") {
        return "Organizations where I've contributed my skills and expertise, including my current employer Tracom Services Limited, where I specialize in POS systems development."
      } else if (activeCategory === "Banking") {
        return "Financial institutions across East Africa for whom I've developed and implemented payment solutions, including Awash Bank, CRDB Bank, Bunna Bank, CBE, NMB Bank, and Family Bank."
      } else if (activeCategory === "Payment Networks") {
        return "Global payment networks I've worked with for certification and compliance, ensuring secure and standardized payment processing across different platforms."
      } else if (activeCategory === "POS Devices") {
        return "Hardware manufacturers whose devices I've programmed for, including Ingenico, Nexgo, Telpo, Sunmi, and Urovo, developing custom payment applications and SDKs."
      } else if (activeCategory === "Telecom") {
        return "Telecommunications companies I've worked with during my time as a Telecommunications Engineer, focusing on network infrastructure and system stability."
      } else if (activeCategory === "Technology") {
        return "Technology partners and clients for whom I've developed specialized solutions, including Quantum Technology PLC for whom I developed cashless fuel transaction applications."
      } else if (activeCategory === "Standards") {
        return "Industry standards and technologies I'm certified in and work with, including PCI Security Standards for payment security, ISO standards for financial messaging, and BASE24-eps for transaction processing."
      }
    } else if (fieldType === "projects") {
      if (activeCategory === "All") {
        return "Select a category to see projects by type"
      } else if (activeCategory === "Personal Projects") {
        return "Projects I've developed in my personal time to explore new technologies and build useful applications."
      } else if (activeCategory === "Company Projects") {
        return "Professional projects I've contributed to during my employment, showcasing my work in payment systems and POS applications."
      }
    }
    return ""
  }

  return (
    <section className="py-16 bg-gray-800/50 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-4">
            {title} <span className="text-purple-400">{fieldType === "partners" ? "Network" : "Showcase"}</span>
          </h2>
          <p className="text-gray-300 max-w-3xl mx-auto">{description}</p>
        </motion.div>

        {/* Loading state */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <>
            {/* Category filter */}
            <div className="overflow-x-auto mb-10">
              <div className="flex justify-center flex-nowrap min-w-max space-x-2 pb-2 mx-auto max-w-6xl">
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeCategory === "All"
                      ? "bg-purple-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                  onClick={() => setActiveCategory("All")}
                >
                  All
                </motion.button>

                {categories.map((category, index) => (
                  <motion.button
                    key={category}
                    initial={{ opacity: 0, y: 10 }}
                    animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                    transition={{ duration: 0.3, delay: 0.1 + (index + 1) * 0.05 }}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      activeCategory === category
                        ? "bg-purple-600 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                    onClick={() => setActiveCategory(category)}
                  >
                    {category}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Items grid with floating animation */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8 max-w-6xl mx-auto">
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="flex justify-center"
                >
                  <div
                    className="relative group"
                    onMouseEnter={() => setHoveredLogo(item.name)}
                    onMouseLeave={() => setHoveredLogo(null)}
                  >
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{
                        duration: 3,
                        ease: "easeInOut",
                        repeat: Number.POSITIVE_INFINITY,
                        repeatType: "reverse",
                        delay: index * 0.1,
                      }}
                      className="w-28 h-20 relative"
                    >
                      <a
                        href={item.demoLink || item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 hover:shadow-xl transition-all duration-300 transform hover:scale-105 h-full flex items-center justify-center"
                      >
                        {!imageLoadError[item.name] ? (
                          <img
                            src={item.logo || "/placeholder.svg"}
                            alt={item.name}
                            onError={() => handleImageError(item.name)}
                            className="h-full max-h-16 w-auto object-contain mx-auto"
                          />
                        ) : (
                          <div className="text-gray-500 text-xs text-center">{item.name}</div>
                        )}
                      </a>
                    </motion.div>
                    {hoveredLogo === item.name && (
                      <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap flex items-center z-10">
                        <span>{item.name}</span>
                        <ExternalLink className="ml-1 h-3 w-3" />
                        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Category description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-16 text-center max-w-3xl mx-auto"
            >
              <p className="text-gray-300">{getCategoryDescription()}</p>
            </motion.div>
          </>
        )}
      </div>
    </section>
  )
}
