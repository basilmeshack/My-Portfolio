"use client"

import { motion } from "framer-motion"
import { Award, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const certifications = [
  {
    id: 1,
    title: "PCI Certified Professional",
    organization: "PCI Security Standards Council",
    date: "2023",
    description:
      "Certified in Payment Card Industry Data Security Standards (PCI DSS), ensuring secure handling of cardholder data and maintaining secure payment systems.",
    skills: ["Payment Security", "Data Protection", "Compliance", "Risk Management"],
    logo: "/placeholder.svg?height=80&width=160&text=PCI+SSC",
    url: "https://www.pcisecuritystandards.org/",
  },
  {
    id: 2,
    title: "Huawei Certified Network Associate",
    organization: "Huawei",
    date: "2022",
    description:
      "Certified in routing and switching technologies, demonstrating proficiency in network infrastructure design, implementation, and troubleshooting.",
    skills: ["Routing", "Switching", "Network Design", "Troubleshooting"],
    logo: "/placeholder.svg?height=80&width=160&text=Huawei",
    url: "https://e.huawei.com/en/talent/portal/#/",
  },
]

export default function Certifications() {
  return (
    <section className="py-16 bg-gray-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-4">
            Professional <span className="text-purple-400">Certifications</span>
          </h2>
          <p className="text-gray-300 max-w-3xl mx-auto">
            Industry-recognized qualifications that validate my expertise in payment security and network
            infrastructure.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {certifications.map((cert, index) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <Card className="bg-gray-800 border-gray-700 h-full flex flex-col overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl text-purple-400">{cert.title}</CardTitle>
                      <CardDescription className="text-gray-400">
                        {cert.organization} • {cert.date}
                      </CardDescription>
                    </div>
                    <div className="bg-purple-900/30 p-2 rounded-full">
                      <Award className="h-6 w-6 text-purple-400" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-gray-300 mb-4">{cert.description}</p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {cert.skills.map((skill) => (
                      <Badge key={skill} className="bg-purple-900/30 text-purple-300 border-purple-700/50">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="border-t border-gray-700 pt-4">
                  <Button
                    variant="outline"
                    className="w-full border-purple-700 text-purple-400 hover:bg-purple-900/20"
                    onClick={() => window.open(cert.url, "_blank")}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Certification Details
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-400 mb-6">
            These certifications complement my practical experience and academic qualifications, demonstrating my
            commitment to industry best practices and continuous professional development.
          </p>
          <Button
            className="bg-purple-600 hover:bg-purple-700"
            onClick={() => window.open("https://www.linkedin.com/in/meshack-bwire-b2390a213/", "_blank")}
          >
            View Full Credentials on LinkedIn
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
