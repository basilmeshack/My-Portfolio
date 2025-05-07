"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Comprehensive skills data based on CV
const skillsData = [
  {
    category: "Programming",
    skills: [
      { name: "Java", level: 90 },
      { name: "Python", level: 85 },
      { name: "C#", level: 80 },
      { name: "JavaScript", level: 85 },
      { name: "Go", level: 75 },
      { name: "SQL", level: 85 },
      { name: ".NET", level: 75 },
    ],
  },
  {
    category: "POS Systems",
    skills: [
      { name: "Ingenico", level: 95 },
      { name: "Nexgo", level: 90 },
      { name: "Telpo", level: 85 },
      { name: "Base24", level: 80 },
      { name: "JPOS", level: 85 },
      { name: "ISO 8583", level: 90 },
      { name: "PCI-DSS", level: 85 },
    ],
  },
  {
    category: "Cloud & DevOps",
    skills: [
      { name: "AWS", level: 75 },
      { name: "GCP", level: 70 },
      { name: "Azure", level: 80 },
      { name: "Docker", level: 80 },
      { name: "Kubernetes", level: 70 },
      { name: "CI/CD", level: 80 },
      { name: "Git", level: 90 },
    ],
  },
  {
    category: "API & Integration",
    skills: [
      { name: "REST API", level: 90 },
      { name: "GraphQL", level: 80 },
      { name: "SOAP", level: 75 },
      { name: "Payment Processing", level: 95 },
      { name: "System Integration", level: 85 },
      { name: "Visa/Mastercard", level: 85 },
    ],
  },
  {
    category: "Data & Analytics",
    skills: [
      { name: "SQL Databases", level: 85 },
      { name: "PowerBI", level: 80 },
      { name: "Python Analytics", level: 85 },
      { name: "Data Pipelines", level: 75 },
      { name: "Pandas", level: 80 },
      { name: "NumPy", level: 75 },
    ],
  },
]

export default function Skills() {
  const [activeCategory, setActiveCategory] = useState(skillsData[0].category)

  return (
    <motion.div
      className="bg-gray-800/80 backdrop-blur-sm p-6 rounded-lg shadow-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-semibold mb-6 text-white">Technical Skills</h2>

      <Tabs defaultValue={activeCategory} onValueChange={setActiveCategory} className="w-full">
        <div className="mb-6 overflow-x-auto">
          <TabsList className="flex space-x-2 min-w-max">
            {skillsData.map((category) => (
              <TabsTrigger
                key={category.category}
                value={category.category}
                className="px-3 py-2 text-xs md:text-sm data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              >
                {category.category}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {skillsData.map((category) => (
          <TabsContent key={category.category} value={category.category}>
            <div className="space-y-4">
              {category.skills.map((skill) => (
                <div key={skill.name}>
                  <div className="flex justify-between mb-1">
                    <span className="font-medium text-white">{skill.name}</span>
                    <span className="text-sm text-gray-400">{skill.level}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${skill.level}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </motion.div>
  )
}
