"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Award, ExternalLink, BookOpen, Shield, Server } from "lucide-react"

export default function ProfessionalCredentials() {
  const [activeTab, setActiveTab] = useState("certifications")

  return (
    <motion.div
      className="bg-gray-800/80 backdrop-blur-sm p-6 rounded-lg shadow-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-semibold mb-6 text-white flex items-center">
        <Award className="mr-2 text-purple-400" size={24} />
        Professional Credentials
      </h2>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger
            value="certifications"
            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            Certifications
          </TabsTrigger>
          <TabsTrigger value="standards" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            Standards & Technologies
          </TabsTrigger>
        </TabsList>

        <TabsContent value="certifications" className="space-y-6">
          {/* PCI Certification */}
          <Card className="bg-gray-700/50 border-gray-600">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl text-purple-400">PCI Certified Professional</CardTitle>
                  <CardDescription className="text-gray-300">
                    Payment Card Industry Security Standards Council
                  </CardDescription>
                </div>
                <div className="bg-purple-900/30 p-2 rounded-full">
                  <Shield className="h-6 w-6 text-purple-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                Certified in Payment Card Industry Data Security Standards (PCI DSS), ensuring secure handling of
                cardholder data and maintaining secure payment systems. This certification validates expertise in
                implementing and maintaining secure payment environments.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-purple-900/30 text-purple-300 border-purple-700/50">Payment Security</Badge>
                <Badge className="bg-purple-900/30 text-purple-300 border-purple-700/50">Data Protection</Badge>
                <Badge className="bg-purple-900/30 text-purple-300 border-purple-700/50">Compliance</Badge>
                <Badge className="bg-purple-900/30 text-purple-300 border-purple-700/50">Risk Management</Badge>
              </div>
            </CardContent>
            <CardFooter className="border-t border-gray-600 pt-4">
              <Button
                variant="outline"
                className="w-full border-purple-700 text-purple-400 hover:bg-purple-900/20"
                onClick={() => window.open("https://www.pcisecuritystandards.org/", "_blank")}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                View PCI SSC Website
              </Button>
            </CardFooter>
          </Card>

          {/* Huawei Certification */}
          <Card className="bg-gray-700/50 border-gray-600">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl text-purple-400">Huawei Certified Network Associate</CardTitle>
                  <CardDescription className="text-gray-300">Routing and Switching</CardDescription>
                </div>
                <div className="bg-purple-900/30 p-2 rounded-full">
                  <Server className="h-6 w-6 text-purple-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                Certified in routing and switching technologies, demonstrating proficiency in network infrastructure
                design, implementation, and troubleshooting. This certification validates expertise in configuring and
                maintaining Huawei network equipment and solutions.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-purple-900/30 text-purple-300 border-purple-700/50">Routing</Badge>
                <Badge className="bg-purple-900/30 text-purple-300 border-purple-700/50">Switching</Badge>
                <Badge className="bg-purple-900/30 text-purple-300 border-purple-700/50">Network Design</Badge>
                <Badge className="bg-purple-900/30 text-purple-300 border-purple-700/50">Troubleshooting</Badge>
              </div>
            </CardContent>
            <CardFooter className="border-t border-gray-600 pt-4">
              <Button
                variant="outline"
                className="w-full border-purple-700 text-purple-400 hover:bg-purple-900/20"
                onClick={() => window.open("https://e.huawei.com/en/talent/portal/#/", "_blank")}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                View Huawei Certification Portal
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="standards" className="space-y-6">
          {/* ISO Standards */}
          <Card className="bg-gray-700/50 border-gray-600">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl text-purple-400">ISO Standards</CardTitle>
                  <CardDescription className="text-gray-300">
                    International Organization for Standardization
                  </CardDescription>
                </div>
                <div className="bg-purple-900/30 p-2 rounded-full">
                  <BookOpen className="h-6 w-6 text-purple-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                Experienced in implementing and maintaining compliance with ISO standards, particularly ISO 8583 for
                financial transaction messaging. This expertise ensures interoperability and standardization across
                payment systems and financial networks.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-purple-900/30 text-purple-300 border-purple-700/50">ISO 8583</Badge>
                <Badge className="bg-purple-900/30 text-purple-300 border-purple-700/50">Financial Messaging</Badge>
                <Badge className="bg-purple-900/30 text-purple-300 border-purple-700/50">Interoperability</Badge>
              </div>
            </CardContent>
            <CardFooter className="border-t border-gray-600 pt-4">
              <Button
                variant="outline"
                className="w-full border-purple-700 text-purple-400 hover:bg-purple-900/20"
                onClick={() => window.open("https://www.iso.org/", "_blank")}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                View ISO Website
              </Button>
            </CardFooter>
          </Card>

          {/* BASE24-eps */}
          <Card className="bg-gray-700/50 border-gray-600">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl text-purple-400">BASE24-eps</CardTitle>
                  <CardDescription className="text-gray-300">ACI Worldwide</CardDescription>
                </div>
                <div className="bg-purple-900/30 p-2 rounded-full">
                  <Server className="h-6 w-6 text-purple-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                Proficient in working with BASE24-eps, a comprehensive electronic payment processing platform by ACI
                Worldwide. Experienced in developing and implementing payment solutions that integrate with BASE24-eps
                for high-volume transaction processing and authorization.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-purple-900/30 text-purple-300 border-purple-700/50">Payment Processing</Badge>
                <Badge className="bg-purple-900/30 text-purple-300 border-purple-700/50">
                  Transaction Authorization
                </Badge>
                <Badge className="bg-purple-900/30 text-purple-300 border-purple-700/50">Financial Switching</Badge>
              </div>
            </CardContent>
            <CardFooter className="border-t border-gray-600 pt-4">
              <Button
                variant="outline"
                className="w-full border-purple-700 text-purple-400 hover:bg-purple-900/20"
                onClick={() => window.open("https://www.aciworldwide.com/solutions/base24-eps", "_blank")}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                View BASE24-eps Information
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
