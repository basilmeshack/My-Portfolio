"use client"

import { motion } from "framer-motion"
import { Briefcase, Calendar } from "lucide-react"

const experiences = [
  {
    title: "Software Engineer",
    company: "Tracom Services Limited",
    period: "May 2023 - Present",
    description: [
      "Specialized in Android development for mobile and POS applications.",
      "Provided onsite and offsite client support, troubleshooting POS issues and ensuring smooth system operations.",
      "Integrated RESTful APIs and GraphQL APIs for real-time communication and data flow between systems.",
      "Ensured PCI compliance for all payment systems, focusing on secure transactions.",
      "Led client training sessions on POS system operations, enhancing user experience and system adoption.",
      "Managed the deployment and orchestration of containerized applications using Kubernetes.",
      "Utilized SQL and Python for data analysis, focusing on transactional data for cashless fuel transactions and terminal management.",
    ],
    achievements: [
      "Developed the current SDK being used in Awash Bank (Ethiopia) on all Ingenico Axium DX POS devices by S2M switch and deployed to production.",
      "Developed the current application and successfully completed Visa and MasterCard certification for Bunna Bank's (Ethiopia) Ingenico DX8000 SDK on BASE24-eps® Version 3.0.17 switch.",
      "Developed an Android Archive (AAR) file and improved the SDK currently being used by the Cooperative and Rural Development Bank (CRDB) of Tanzania on Nexgo and Telpo POS devices.",
      "Developed and implemented Terminal Management System (TMS) functionalities across POS devices, significantly enhancing remote management capabilities and efficiency.",
      "Developed and implemented a fuel module for CRDB Bank on Ingenico Move-2500 POS devices.",
      "Developed an application for cashless fuel transactions powered by Quantum Technology PLC – Ethiopia, on Move-2500 POS devices.",
    ],
  },
  {
    title: "Telecommunications Engineer",
    company: "Guzzer Technologies",
    period: "December 2021 - May 2022",
    description: [
      "Provided technical troubleshooting and issue resolution on network devices.",
      "Worked on network system migrations, construction, and maintenance of HFC and GPON networks.",
    ],
    achievements: [
      "Contributed to the enhancement of system stability through network power migration projects in Nairobi.",
    ],
  },
  {
    title: "Data Engineer (Internship)",
    company: "African Economic Research Consortium (AERC)",
    period: "September 2021 - November 2021",
    description: [
      "Managed electronic document storage, indexing, and scanning to ensure secure and efficient data retrieval.",
      "Leveraged Microsoft Azure and SQL to manage data securely and support research data needs.",
      "Used PowerBI to create interactive reports and dashboards for stakeholders.",
    ],
    achievements: [
      "Enhanced document retrieval processes through the successful implementation of the Electronic Document and Record Management System (EDMS).",
    ],
  },
  {
    title: "IT Support Technician (Casual)",
    company: "Rita Creations, Events and Luxury Rentals Company",
    period: "2020 - 2021",
    description: [
      "Provided technical support during event setups, resolving IT issues swiftly and ensuring operations ran smoothly.",
      "Coordinated event setups, ensuring the technical requirements were met.",
    ],
    achievements: [
      "Ensured event success by swiftly resolving technical issues and optimizing operations during the events.",
    ],
  },
]

export default function ExperienceTimeline() {
  return (
    <div className="bg-gray-800/80 backdrop-blur-sm p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-white">Professional Experience</h2>

      <div className="relative border-l-2 border-purple-600 pl-8 space-y-12">
        {experiences.map((exp, index) => (
          <motion.div
            key={exp.title}
            className="relative"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className="absolute -left-10 mt-1.5 h-6 w-6 rounded-full bg-purple-600 flex items-center justify-center">
              <Briefcase className="h-3 w-3 text-white" />
            </div>

            <div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                <h3 className="text-xl font-semibold text-purple-400">{exp.title}</h3>
                <div className="flex items-center text-gray-400 text-sm">
                  <Calendar className="h-4 w-4 mr-1" />
                  {exp.period}
                </div>
              </div>

              <p className="text-lg font-medium mb-3 text-white">{exp.company}</p>

              <div className="mb-4">
                <h4 className="font-medium mb-2 text-white">Responsibilities:</h4>
                <ul className="list-disc pl-5 space-y-1 text-gray-300">
                  {exp.description.map((item, i) => (
                    <li key={i} className="text-gray-300">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2 text-white">Key Achievements:</h4>
                <ul className="list-disc pl-5 space-y-1 text-gray-300">
                  {exp.achievements.map((item, i) => (
                    <li key={i} className="text-gray-300">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
