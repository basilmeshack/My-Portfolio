"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Comprehensive tech stack based on CV
const techStack = {
  "Programming Languages": [
    { name: "Java", icon: "devicon-java-plain colored" },
    { name: "Python", icon: "devicon-python-plain colored" },
    { name: "C#", icon: "devicon-csharp-plain colored" },
    { name: "JavaScript", icon: "devicon-javascript-plain colored" },
    { name: "Go", icon: "devicon-go-plain colored" },
    { name: "SQL", icon: "devicon-mysql-plain colored" },
    { name: ".NET", icon: "devicon-dot-net-plain colored" },
  ],
  "Frameworks & Libraries": [
    { name: "Spring Boot", icon: "devicon-spring-plain colored" },
    { name: "Flutter", icon: "devicon-flutter-plain colored" },
    { name: "Angular", icon: "devicon-angularjs-plain colored" },
    { name: "React", icon: "devicon-react-original colored" },
    { name: "Node.js", icon: "devicon-nodejs-plain colored" },
  ],
  "DevOps & Cloud": [
    { name: "Docker", icon: "devicon-docker-plain colored" },
    { name: "Kubernetes", icon: "devicon-kubernetes-plain colored" },
    { name: "AWS", icon: "devicon-amazonwebservices-original colored" },
    { name: "GCP", icon: "devicon-googlecloud-plain colored" },
    { name: "Azure", icon: "devicon-azure-plain colored" },
    { name: "Git", icon: "devicon-git-plain colored" },
    { name: "Jenkins", icon: "devicon-jenkins-plain colored" },
  ],
  "POS & Payment": [
    { name: "Ingenico", icon: "devicon-android-plain colored" }, // Using Android icon as placeholder
    { name: "Nexgo", icon: "devicon-android-plain colored" },
    { name: "Telpo", icon: "devicon-android-plain colored" },
    { name: "Base24", icon: "devicon-java-plain colored" }, // Using Java icon as placeholder
    { name: "JPOS", icon: "devicon-java-plain colored" },
    { name: "ISO 8583", icon: "devicon-java-plain colored" },
  ],
  "Tools & Others": [
    { name: "Jira", icon: "devicon-jira-plain colored" },
    { name: "Bitbucket", icon: "devicon-bitbucket-original colored" },
    { name: "REST API", icon: "devicon-nodejs-plain colored" },
    { name: "GraphQL", icon: "devicon-graphql-plain colored" },
    { name: "SOAP", icon: "devicon-nodejs-plain colored" },
    { name: "PowerBI", icon: "devicon-microsoftsqlserver-plain colored" },
    { name: "Pandas", icon: "devicon-pandas-original colored" },
    { name: "NumPy", icon: "devicon-numpy-original colored" },
  ],
}

export default function TechStack() {
  const [activeTab, setActiveTab] = useState(Object.keys(techStack)[0])

  return (
    <motion.div
      className="bg-gray-800/80 backdrop-blur-sm p-6 rounded-lg shadow-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <h2 className="text-2xl font-semibold mb-4 text-white">Tech Stack</h2>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="mb-6 overflow-x-auto">
          <TabsList className="flex space-x-2 min-w-max">
            {Object.keys(techStack).map((category) => (
              <TabsTrigger
                key={category}
                value={category}
                className="px-3 py-2 text-xs md:text-sm data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {Object.entries(techStack).map(([category, technologies]) => (
          <TabsContent key={category} value={category}>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {technologies.map((tech, index) => (
                <motion.div
                  key={tech.name}
                  className="flex flex-col items-center justify-center p-3 bg-gray-700/50 rounded-lg"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <i className={`${tech.icon} text-3xl mb-2`}></i>
                  <span className="text-xs text-center text-gray-300">{tech.name}</span>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Include DevIcons */}
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/devicon.min.css" />
    </motion.div>
  )
}
