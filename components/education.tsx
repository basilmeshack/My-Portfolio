"use client"

import { motion } from "framer-motion"
import { GraduationCap, Calendar } from "lucide-react"

const education = [
  {
    degree: "Bachelor of Science in Computer Science",
    institution: "The Co-operative University of Kenya",
    period: "2018 - 2022",
  },
  {
    degree: "Data Science with Python",
    institution: "National Research Fund - Kenya",
    period: "July 2021 - October 2021",
    details: "Vetted by University of Nairobi, Kenyatta University, and The Co-operative University of Kenya",
  },
]

export default function Education() {
  return (
    <motion.div
      className="bg-gray-800 p-6 rounded-lg shadow-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-semibold mb-6 text-white">Education</h2>

      <div className="space-y-6">
        {education.map((edu, index) => (
          <motion.div
            key={edu.degree}
            className="flex"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className="mr-4">
              <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-purple-600" />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-white">{edu.degree}</h3>
              <p className="text-purple-600">{edu.institution}</p>
              <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mt-1">
                <Calendar className="h-4 w-4 mr-1" />
                {edu.period}
              </div>
              {edu.details && <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{edu.details}</p>}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
