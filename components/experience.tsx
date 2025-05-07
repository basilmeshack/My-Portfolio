"use client"

import { useState, useEffect } from "react"
import { m } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useInView } from "react-intersection-observer"

// Mock data - would be fetched from PocketBase in production
const experienceData = [
  {
    id: 1,
    title: "Senior Software Engineer",
    company: "TechCorp",
    period: "2020 - Present",
    description:
      "Led the development of a next-generation POS system with data analytics capabilities. Implemented machine learning algorithms to predict inventory needs and customer behavior patterns. Reduced operational costs by 25% through intelligent automation.",
    tags: ["Backend", "Data Analytics", "ML"],
  },
  {
    id: 2,
    title: "Software Engineer",
    company: "DataSystems Inc.",
    period: "2017 - 2020",
    description:
      "Developed and maintained backend services for retail management systems. Designed data pipelines for processing transaction data. Implemented real-time analytics dashboards.",
    tags: ["Backend", "Data Pipelines", "Analytics"],
  },
  {
    id: 3,
    title: "Junior Developer",
    company: "RetailTech",
    period: "2015 - 2017",
    description:
      "Built and maintained point-of-sale applications. Implemented payment processing integrations. Collaborated with UX team to improve customer checkout experience.",
    tags: ["POS", "Integrations", "Frontend"],
  },
]

export default function Experience() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const [data, setData] = useState(experienceData)

  // Simulate fetching data from PocketBase
  useEffect(() => {
    // In production, this would be a fetch from PocketBase
    // const fetchData = async () => {
    //   const response = await pb.collection('experience').getFullList();
    //   setData(response);
    // };
    // fetchData();
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <section id="experience" className="py-20 bg-zinc-900">
      <div className="container mx-auto px-4">
        <m.div
          ref={ref}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={containerVariants}
          className="max-w-6xl mx-auto"
        >
          <m.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold mb-12 text-center">
            Work <span className="text-violet-400">Experience</span>
          </m.h2>

          <div className="space-y-8">
            {data.map((job, index) => (
              <m.div key={job.id} variants={itemVariants} className="relative">
                <Card className="bg-zinc-800 border-zinc-700 overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-violet-500 to-blue-500"></div>
                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                      <div>
                        <CardTitle className="text-xl text-violet-400">{job.title}</CardTitle>
                        <CardDescription className="text-zinc-400">
                          {job.company} | {job.period}
                        </CardDescription>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {job.tags.map((tag, tagIndex) => (
                          <Badge
                            key={tagIndex}
                            variant="outline"
                            className="bg-zinc-700/50 text-zinc-300 border-zinc-600"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-zinc-300">{job.description}</p>
                  </CardContent>
                </Card>
              </m.div>
            ))}
          </div>
        </m.div>
      </div>
    </section>
  )
}
