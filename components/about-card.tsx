"use client"

import { motion } from "framer-motion"
import { ExternalLink } from "lucide-react"

export default function AboutCard() {
  return (
    <motion.div
      className="bg-gray-800/80 backdrop-blur-sm p-6 rounded-lg shadow-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="prose prose-invert max-w-none">
        <p className="text-lg text-white">
          My name is <span className="text-purple-400 font-medium">Meshack Bwire</span> from{" "}
          <span className="text-purple-400 font-medium">Nairobi, Kenya</span>
        </p>

        <p className="text-gray-300">
          Throughout my career, I have consistently demonstrated expertise and innovation in software engineering and
          data management. Currently, I am employed as a Software Engineer at{" "}
          <a
            href="https://www.linkedin.com/company/tracom-services/mycompany/"
            className="text-purple-400 hover:text-purple-300 no-underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Tracom Services Limited <ExternalLink className="inline h-4 w-4" />
          </a>
          , specializing in Android development and working with technologies such as C#, JavaScript, and .NET for desk
          POS systems. My other roles involve integrating client Web APIs, ensuring PCI compliance, creation of
          Bitbucket pipelines and deployment of applications.
        </p>

        <p className="text-gray-300">
          My notable achievements include developing the current payment application for{" "}
          <a
            href="https://awashbank.com/"
            className="text-purple-400 hover:text-purple-300 no-underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Awash Bank <ExternalLink className="inline h-4 w-4" />
          </a>{" "}
          of Ethiopia on Ingenico's{" "}
          <a
            href="https://ingenico.com/en/products-services/payment-terminals/axium-dx8000-series"
            className="text-purple-400 hover:text-purple-300 no-underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            DX <ExternalLink className="inline h-4 w-4" />
          </a>{" "}
          devices and the current{" "}
          <a
            href="https://www.nexgoglobal.com/smart-pos/n86.html"
            className="text-purple-400 hover:text-purple-300 no-underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Nexgo <ExternalLink className="inline h-4 w-4" />
          </a>{" "}
          device SDK for{" "}
          <a
            href="https://www.crdbbank.co.tz/en"
            className="text-purple-400 hover:text-purple-300 no-underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Cooperative Rural Development Bank (CRDB) <ExternalLink className="inline h-4 w-4" />
          </a>{" "}
          of Tanzania.
        </p>

        <p className="text-gray-300">
          Previously, I worked as a Telecommunications Engineer at{" "}
          <a
            href="https://www.g-tech.co.ke/"
            className="text-purple-400 hover:text-purple-300 no-underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Guzzer Technologies <ExternalLink className="inline h-4 w-4" />
          </a>
          , where I excelled in network troubleshooting, construction, and maintenance.
        </p>

        <h3 className="text-2xl font-semibold mb-4 flex items-center text-white">
          Apart from coding, some other activities that I love to do!
        </h3>

        <ul className="space-y-2">
          <li className="flex items-center">
            <svg className="h-5 w-5 text-purple-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-gray-300">Researching Quantum and Astro-Physics</span>
          </li>
          <li className="flex items-center">
            <svg className="h-5 w-5 text-purple-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-gray-300">Writing Tech Blogs</span>
          </li>
          <li className="flex items-center">
            <svg className="h-5 w-5 text-purple-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-gray-300">Travelling</span>
          </li>
        </ul>

        <blockquote className="border-l-4 border-purple-400 pl-4 italic mt-6">
          <p className="text-purple-400">"Strive to build things that make a difference!"</p>
          <footer className="text-gray-400">- Bwire</footer>
        </blockquote>
      </div>
    </motion.div>
  )
}
