"use client"
import { m } from "framer-motion"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useInView } from "react-intersection-observer"
import { Bot, FileUp, BarChart4 } from "lucide-react"

export default function AiFeatures() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

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
    <section id="ai-features" className="py-20 bg-zinc-950">
      <div className="container mx-auto px-4">
        <m.div
          ref={ref}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={containerVariants}
          className="max-w-6xl mx-auto"
        >
          <m.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold mb-6 text-center">
            AI-Driven <span className="text-violet-400">Features</span>
          </m.h2>

          <m.p variants={itemVariants} className="text-lg text-zinc-400 text-center mb-12 max-w-3xl mx-auto">
            Explore interactive AI tools and demos showcasing my work in machine learning and artificial intelligence.
          </m.p>

          <Tabs defaultValue="resume-chat" className="w-full">
            <m.div variants={itemVariants} className="flex justify-center mb-8">
              <TabsList className="grid grid-cols-1 md:grid-cols-3">
                <TabsTrigger
                  value="resume-chat"
                  className="data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-400"
                >
                  <Bot className="mr-2 h-4 w-4" />
                  Resume Chatbot
                </TabsTrigger>
                <TabsTrigger
                  value="csv-insights"
                  className="data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-400"
                >
                  <FileUp className="mr-2 h-4 w-4" />
                  CSV Insights
                </TabsTrigger>
                <TabsTrigger
                  value="demos"
                  className="data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-400"
                >
                  <BarChart4 className="mr-2 h-4 w-4" />
                  ML Demos
                </TabsTrigger>
              </TabsList>
            </m.div>

            <m.div variants={itemVariants}>
              <TabsContent value="resume-chat">
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardHeader>
                    <CardTitle className="text-xl text-violet-400">Resume Chatbot</CardTitle>
                    <CardDescription className="text-zinc-400">
                      Ask questions about my experience, skills, and background
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-zinc-800 rounded-md p-6 border border-zinc-700">
                      <div className="space-y-4">
                        <div className="flex items-start">
                          <div className="bg-violet-500/20 p-3 rounded-full mr-3">
                            <Bot className="h-5 w-5 text-violet-400" />
                          </div>
                          <div className="bg-zinc-700 rounded-lg p-3 max-w-[80%]">
                            <p className="text-zinc-200">
                              Hello! I'm an AI assistant that can answer questions about John's resume, experience, and
                              skills. What would you like to know?
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start justify-end">
                          <div className="bg-zinc-700 rounded-lg p-3 max-w-[80%]">
                            <p className="text-zinc-200">What experience does John have with machine learning?</p>
                          </div>
                          <div className="bg-blue-500/20 p-3 rounded-full ml-3">
                            <svg
                              className="h-5 w-5 text-blue-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <div className="bg-violet-500/20 p-3 rounded-full mr-3">
                            <Bot className="h-5 w-5 text-violet-400" />
                          </div>
                          <div className="bg-zinc-700 rounded-lg p-3 max-w-[80%]">
                            <p className="text-zinc-200">
                              John has been working with machine learning since 2020. He started with predictive
                              analytics for inventory management, then expanded to NLP for customer service automation.
                              He's proficient in TensorFlow, scikit-learn, and has experience with computer vision
                              projects. His most recent ML project involved developing a recommendation system for
                              retail products.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 relative">
                        <input
                          type="text"
                          placeholder="Ask a question about my resume..."
                          className="w-full p-3 pr-12 bg-zinc-700 border border-zinc-600 rounded-md text-zinc-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        />
                        <Button className="absolute right-1 top-1 bg-violet-600 hover:bg-violet-700 h-8 w-8 p-0">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 12h14M12 5l7 7-7 7"
                            />
                          </svg>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="text-sm text-zinc-500">
                    This is a placeholder for a LangChain-powered chatbot that would answer questions about my resume.
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="csv-insights">
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardHeader>
                    <CardTitle className="text-xl text-violet-400">CSV Data Insights</CardTitle>
                    <CardDescription className="text-zinc-400">
                      Upload a CSV file to get AI-powered insights and visualizations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-zinc-800 rounded-md p-6 border border-dashed border-zinc-700 text-center">
                      <FileUp className="h-12 w-12 text-zinc-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-zinc-300 mb-2">Upload your CSV file</h3>
                      <p className="text-zinc-400 mb-4">Drag and drop your CSV file here, or click to browse</p>
                      <Button className="bg-violet-600 hover:bg-violet-700">Select File</Button>
                    </div>

                    <div className="mt-6 bg-zinc-800 rounded-md p-4 border border-zinc-700">
                      <h4 className="text-zinc-300 font-medium mb-2">What you'll get:</h4>
                      <ul className="space-y-2 text-zinc-400">
                        <li className="flex items-center">
                          <svg
                            className="h-5 w-5 text-violet-400 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Automated data cleaning and preprocessing
                        </li>
                        <li className="flex items-center">
                          <svg
                            className="h-5 w-5 text-violet-400 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Statistical analysis and pattern detection
                        </li>
                        <li className="flex items-center">
                          <svg
                            className="h-5 w-5 text-violet-400 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Interactive visualizations and charts
                        </li>
                        <li className="flex items-center">
                          <svg
                            className="h-5 w-5 text-violet-400 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          AI-generated insights and recommendations
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                  <CardFooter className="text-sm text-zinc-500">
                    This is a placeholder for an AI-powered data analysis tool that would process CSV files.
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="demos">
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardHeader>
                    <CardTitle className="text-xl text-violet-400">Machine Learning Demos</CardTitle>
                    <CardDescription className="text-zinc-400">
                      Interactive demos of my machine learning and AI projects
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="bg-zinc-800 border-zinc-700">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg text-zinc-200">Retail Sales Forecaster</CardTitle>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <p className="text-zinc-400 text-sm">
                            Time series forecasting model that predicts retail sales based on historical data and
                            seasonal patterns.
                          </p>
                        </CardContent>
                        <CardFooter>
                          <Button
                            className="w-full bg-violet-600 hover:bg-violet-700"
                            onClick={() => window.open("https://huggingface.co", "_blank")}
                          >
                            View Demo
                          </Button>
                        </CardFooter>
                      </Card>

                      <Card className="bg-zinc-800 border-zinc-700">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg text-zinc-200">Customer Segmentation</CardTitle>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <p className="text-zinc-400 text-sm">
                            Clustering algorithm that segments customers based on purchasing behavior, demographics, and
                            engagement patterns.
                          </p>
                        </CardContent>
                        <CardFooter>
                          <Button
                            className="w-full bg-violet-600 hover:bg-violet-700"
                            onClick={() => window.open("https://streamlit.io", "_blank")}
                          >
                            View Demo
                          </Button>
                        </CardFooter>
                      </Card>

                      <Card className="bg-zinc-800 border-zinc-700">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg text-zinc-200">Product Recommendation Engine</CardTitle>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <p className="text-zinc-400 text-sm">
                            Collaborative filtering system that recommends products based on user preferences and
                            similar user behaviors.
                          </p>
                        </CardContent>
                        <CardFooter>
                          <Button
                            className="w-full bg-violet-600 hover:bg-violet-700"
                            onClick={() => window.open("https://huggingface.co", "_blank")}
                          >
                            View Demo
                          </Button>
                        </CardFooter>
                      </Card>

                      <Card className="bg-zinc-800 border-zinc-700">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg text-zinc-200">Sentiment Analysis Tool</CardTitle>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <p className="text-zinc-400 text-sm">
                            NLP model that analyzes customer reviews and feedback to determine sentiment and extract key
                            insights.
                          </p>
                        </CardContent>
                        <CardFooter>
                          <Button
                            className="w-full bg-violet-600 hover:bg-violet-700"
                            onClick={() => window.open("https://streamlit.io", "_blank")}
                          >
                            View Demo
                          </Button>
                        </CardFooter>
                      </Card>
                    </div>
                  </CardContent>
                  <CardFooter className="text-sm text-zinc-500">
                    These demos would link to Streamlit or Hugging Face deployments of actual ML models.
                  </CardFooter>
                </Card>
              </TabsContent>
            </m.div>
          </Tabs>
        </m.div>
      </div>
    </section>
  )
}
