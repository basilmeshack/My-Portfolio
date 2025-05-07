"use client"

import { motion } from "framer-motion"
import { GraduationCap, Calendar, ExternalLink } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const educationData = [
  {
    degree: "Bachelor of Science in Computer Science",
    institution: "The Co-operative University of Kenya",
    period: "2018 - 2022",
    description:
      "Comprehensive education in computer science fundamentals, programming, algorithms, and software engineering.",
    logo: "/placeholder.svg?height=80&width=160&text=CUK",
    url: "https://www.cuk.ac.ke/",
  },
  {
    degree: "Data Science with Python",
    institution: "National Research Fund - Kenya",
    period: "July 2021 - October 2021",
    description:
      "Specialized training in data analysis, visualization, and machine learning using Python and related libraries.",
    details: "Vetted by University of Nairobi, Kenyatta University, and The Co-operative University of Kenya",
    logo: "/placeholder.svg?height=80&width=160&text=NRF",
    url: "https://researchfund.go.ke/",
  },
  {
    degree: "Multimedia University of Kenya",
    institution: "",
    period: "2019 June - December",
    description: "Studied at Multimedia University of Kenya focusing on computer science and technology applications.",
    logo: "/placeholder.svg?height=80&width=160&text=MMU",
    url: "https://www.mmu.ac.ke/",
  },
]

export default function EducationShowcase() {
  return (
    <motion.div
      className="bg-gray-800/80 backdrop-blur-sm p-6 rounded-lg shadow-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-semibold mb-6 text-white flex items-center">
        <GraduationCap className="mr-2 text-purple-400" size={24} />
        Educational Background
      </h2>

      <div className="grid grid-cols-1 gap-6">
        {educationData.map((edu, index) => (
          <Card key={index} className="bg-gray-700/50 border-gray-600 overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl text-purple-400">{edu.degree}</CardTitle>
                  <CardDescription className="text-gray-300">
                    {edu.institution} • <Calendar className="inline h-4 w-4 mr-1" /> {edu.period}
                  </CardDescription>
                </div>
                <div className="h-16 w-16 relative flex-shrink-0">
                  <img src={edu.logo || "/placeholder.svg"} alt={edu.institution} className="object-contain" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">{edu.description}</p>
              {edu.details && <p className="text-gray-400 text-sm mt-2 italic">{edu.details}</p>}
            </CardContent>
            <CardFooter className="border-t border-gray-600 pt-4">
              <Button
                variant="outline"
                className="w-full border-purple-700 text-purple-400 hover:bg-purple-900/20"
                onClick={() => window.open(edu.url, "_blank")}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Visit Institution Website
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </motion.div>
  )
}
