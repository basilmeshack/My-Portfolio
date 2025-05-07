"use client"

import { useState, useEffect } from "react"
import { m } from "framer-motion"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Calendar, Clock } from "lucide-react"
import { useInView } from "react-intersection-observer"
import Image from "next/image"

// Mock data - would be fetched from Medium RSS or PocketBase in production
const blogData = [
  {
    id: 1,
    title: "From POS to ML: My Journey into AI",
    excerpt:
      "How I transitioned from building point-of-sale systems to exploring machine learning and AI applications.",
    image: "/placeholder.svg?height=200&width=400",
    date: "May 15, 2023",
    readTime: "8 min read",
    tags: ["Career", "AI", "Personal Growth"],
    url: "https://medium.com",
  },
  {
    id: 2,
    title: "Building Predictive Models for Retail",
    excerpt:
      "A deep dive into how predictive analytics can transform inventory management and customer experiences in retail.",
    image: "/placeholder.svg?height=200&width=400",
    date: "March 22, 2023",
    readTime: "12 min read",
    tags: ["Machine Learning", "Retail", "Data Science"],
    url: "https://medium.com",
  },
  {
    id: 3,
    title: "The Future of AI in Enterprise Software",
    excerpt: "Exploring how AI is reshaping enterprise software and what developers need to know to stay ahead.",
    image: "/placeholder.svg?height=200&width=400",
    date: "January 10, 2023",
    readTime: "10 min read",
    tags: ["AI", "Enterprise", "Future Tech"],
    url: "https://medium.com",
  },
]

export default function Blog() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const [data, setData] = useState(blogData)
  const [showChatbot, setShowChatbot] = useState(false)

  // Simulate fetching data from Medium RSS or PocketBase
  useEffect(() => {
    // In production, this would be a fetch from Medium RSS or PocketBase
    // const fetchData = async () => {
    //   const response = await fetch('https://medium.com/feed/@username');
    //   const text = await response.text();
    //   // Parse XML and set data
    //   setData(parsedData);
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
    <section id="blog" className="py-20 bg-zinc-900">
      <div className="container mx-auto px-4">
        <m.div
          ref={ref}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={containerVariants}
          className="max-w-6xl mx-auto"
        >
          <m.div variants={itemVariants} className="flex justify-between items-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">
              Latest <span className="text-violet-400">Articles</span>
            </h2>
            <Button
              variant="outline"
              className="border-violet-500 text-violet-400 hover:bg-violet-500/20"
              onClick={() => setShowChatbot(!showChatbot)}
            >
              {showChatbot ? "Hide Recommendations" : "Get Article Recommendations"}
            </Button>
          </m.div>

          {showChatbot && (
            <m.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-10"
            >
              <Card className="bg-zinc-800 border-zinc-700">
                <CardHeader>
                  <CardTitle className="text-violet-400">AI Article Recommender</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-300 mb-4">
                    This is a placeholder for an AI-powered chatbot that would recommend articles based on your
                    interests. In a production environment, this would be integrated with LangChain or a similar
                    framework.
                  </p>
                  <div className="bg-zinc-900 p-4 rounded-md border border-zinc-700">
                    <p className="text-zinc-400 italic">
                      "Based on your interest in machine learning and retail, you might enjoy reading 'Building
                      Predictive Models for Retail' and 'The Impact of AI on Customer Experience'."
                    </p>
                  </div>
                </CardContent>
              </Card>
            </m.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.map((post) => (
              <m.div key={post.id} variants={itemVariants}>
                <Card className="bg-zinc-800 border-zinc-700 h-full flex flex-col overflow-hidden">
                  <div className="relative h-48 w-full overflow-hidden">
                    <Image
                      src={post.image || "/placeholder.svg"}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                  <CardHeader>
                    <div className="flex items-center gap-4 text-sm text-zinc-400 mb-2">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {post.date}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {post.readTime}
                      </div>
                    </div>
                    <CardTitle className="text-xl text-violet-400">{post.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-zinc-300 mb-4">{post.excerpt}</p>
                    <div className="flex flex-wrap gap-1">
                      {post.tags.map((tag, tagIndex) => (
                        <Badge
                          key={tagIndex}
                          variant="outline"
                          className="bg-zinc-700/50 text-zinc-300 border-zinc-600"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-4 border-t border-zinc-700">
                    <Button
                      variant="outline"
                      className="w-full border-violet-500 text-violet-400 hover:bg-violet-500/20"
                      onClick={() => window.open(post.url, "_blank")}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Read Article
                    </Button>
                  </CardFooter>
                </Card>
              </m.div>
            ))}
          </div>

          <m.div variants={itemVariants} className="mt-10 text-center">
            <Button
              variant="outline"
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              onClick={() => window.open("https://medium.com", "_blank")}
            >
              View All Articles
            </Button>
          </m.div>
        </m.div>
      </div>
    </section>
  )
}
