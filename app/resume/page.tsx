"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Download, Printer, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import jsPDF from "jspdf"

export default function ResumePage() {
  const [expandedSections, setExpandedSections] = useState({
    summary: true,
    skills: true,
    experience: true,
    education: true,
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = async () => {
    // Show loading state
    const loadingToast = document.createElement("div")
    loadingToast.className = "fixed top-4 right-4 bg-gray-800 text-white px-4 py-2 rounded shadow-lg z-50"
    loadingToast.textContent = "Generating PDF..."
    document.body.appendChild(loadingToast)

    try {
      // Create a new PDF document
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      // Define text styles
      const titleStyle = { fontSize: 18, fontStyle: "bold" }
      const headingStyle = { fontSize: 14, fontStyle: "bold" }
      const subheadingStyle = { fontSize: 12, fontStyle: "bold" }
      const normalStyle = { fontSize: 10 }
      const smallStyle = { fontSize: 9 }
      const linkStyle = { fontSize: 10, textColor: [0, 0, 255] }

      // Set margins
      const margin = 15
      let y = margin

      // Add header
      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(titleStyle.fontSize)
      pdf.text("MESHACK BWIRE", 105, y, { align: "center" })
      y += 8

      pdf.setFontSize(normalStyle.fontSize)
      pdf.setFont("helvetica", "normal")
      pdf.text("P.O Box 268-50400, Kenya", 105, y, { align: "center" })
      y += 5

      // Make email clickable
      const emailText = "Email: bmwandera14@gmail.com"
      const phoneText = "Cellphone: +254794142204"
      const contactText = `${phoneText} | ${emailText}`
      pdf.text(contactText, 105, y, { align: "center" })
      pdf.link(
        105 - pdf.getTextWidth(contactText) / 2 + pdf.getTextWidth(phoneText + " | "),
        y - 5,
        pdf.getTextWidth("bmwandera14@gmail.com"),
        5,
        { url: "mailto:bmwandera14@gmail.com" },
      )
      y += 5

      // Make LinkedIn clickable
      const linkedInText = "LinkedIn: linkedin.com/in/meshack-bwire-b2390a213"
      pdf.setTextColor(0, 0, 255)
      pdf.text(linkedInText, 105, y, { align: "center" })
      pdf.link(105 - pdf.getTextWidth(linkedInText) / 2, y - 5, pdf.getTextWidth(linkedInText), 5, {
        url: "https://linkedin.com/in/meshack-bwire-b2390a213",
      })
      pdf.setTextColor(0, 0, 0)
      y += 10

      // Add horizontal line
      pdf.setDrawColor(0)
      pdf.setLineWidth(0.5)
      pdf.line(margin, y, 210 - margin, y)
      y += 8

      // Professional Summary
      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(headingStyle.fontSize)
      pdf.text("Professional Summary", margin, y)
      y += 6

      pdf.setFont("helvetica", "normal")
      pdf.setFontSize(normalStyle.fontSize)
      const summaryText =
        "A proactive and results-driven Software Engineer with extensive experience in the integration, deployment, " +
        "and support of Point of Sale (POS) systems and mobile applications. Skilled in providing onsite and " +
        "offsite client support, ensuring smooth system implementations, and delivering user training for the " +
        "applications developed. Proficient in data analysis and transactional data management using SQL and Python " +
        "to support business decisions. Experienced in POS terminal development, API integrations, and PCI " +
        "compliance, with a strong ability to troubleshoot issues and optimize system performance for enhanced " +
        "operational efficiency."

      const splitSummary = pdf.splitTextToSize(summaryText, 210 - 2 * margin)
      pdf.text(splitSummary, margin, y)
      y += splitSummary.length * 5 + 5

      // Technical Skills
      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(headingStyle.fontSize)
      pdf.text("Technical Skills", margin, y)
      y += 6

      const skills = [
        { category: "Programming Languages", items: "Java, Python, Go, C#, JavaScript, SQL, .NET" },
        { category: "Frameworks & Tools", items: "Spring Boot, Flutter, Angular, Kubernetes, Docker" },
        { category: "POS Systems", items: "Ingenico, Nexgo, Telpo, Base24, JPOS, ISO 8583" },
        { category: "Cloud Environments", items: "AWS, GCP, Microsoft Azure" },
        { category: "API Integration", items: "REST, GraphQL, SOAP" },
        { category: "Data Analysis", items: "SQL, PowerBI, Python (Pandas, NumPy)" },
        { category: "Development Tools", items: "Git, Jira, Bitbucket, Jenkins (CI/CD)" },
        { category: "Compliance & Standards", items: "PCI-DSS, Visa & Mastercard Certification" },
        { category: "Agile", items: "Scrum, Kanban" },
        { category: "Other Skills", items: "Troubleshooting, User Training, System Deployment" },
      ]

      pdf.setFont("helvetica", "normal")
      pdf.setFontSize(normalStyle.fontSize)

      // Create two columns for skills
      const colWidth = (210 - 2 * margin - 10) / 2
      let currentY = y
      let col = 0

      skills.forEach((skill, index) => {
        const x = margin + col * (colWidth + 10)
        pdf.setFont("helvetica", "bold")
        pdf.text(`${skill.category}:`, x, currentY)
        pdf.setFont("helvetica", "normal")
        const skillText = pdf.splitTextToSize(skill.items, colWidth)
        pdf.text(skillText, x, currentY + 4)

        // Move to next position
        if (col === 0) {
          col = 1
        } else {
          col = 0
          currentY += 12
        }

        // Check if we need a new page
        if (currentY > 270) {
          pdf.addPage()
          currentY = margin
        }
      })

      // Update y to the max of the two columns
      y = col === 0 ? currentY : currentY + 12
      y += 5

      // Professional Experience
      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(headingStyle.fontSize)
      pdf.text("Professional Experience", margin, y)
      y += 8

      // Experience entries
      const experiences = [
        {
          title: "Software Engineer (Point of Sale systems)",
          company: "Tracom Services Limited",
          period: "May 2023 – Current",
          responsibilities: [
            "Specialized in Android development for mobile and POS applications.",
            "Provided onsite and offsite client support, troubleshooting POS issues and ensuring smooth system operations.",
            "Integrated RESTful APIs and GraphQL APIs for real-time communication and data flow between systems.",
            "Ensured PCI compliance for all payment systems, focusing on secure transactions.",
            "Led client training sessions on POS system operations, enhancing user experience and system adoption.",
            "Managed the deployment and orchestration of containerized applications using Kubernetes.",
            "Utilized SQL and Python for data analysis, focusing on transactional data for cashless fuel transactions and terminal management.",
            "Worked in an Agile environment, participating in scrum meetings and sprint reviews.",
          ],
          achievements: [
            "Developed the current SDK being used in Awash Bank (Ethiopia) on all Ingenico Axium DX POS devices by S2M switch and deployed to production.",
            "Developed the current application and successfully completed Visa and MasterCard certification for Bunna Bank's (Ethiopia) Ingenico DX8000 SDK on BASE24-eps® Version 3.0.17 switch.",
            "Developed an Android Archive (AAR) file and improved the SDK currently being used by the Cooperative and Rural Development Bank (CRDB) of Tanzania on Nexgo and Telpo POS devices.",
            "Developed and implemented Terminal Management System (TMS) functionalities across POS devices, for NMB Bank – Tanzania, CBE (Commercial Bank of Ethiopia), Awash Bank, Bunna Bank and Quantum – Ethiopia, significantly enhancing remote management capabilities and efficiency.",
            "Developed and implemented a fuel module for CRDB Bank on Ingenico Move-2500 POS devices.",
            "Developed an application for cashless fuel transactions powered by Quantum Technology PLC – Ethiopia, on Move-2500 POS devices.",
            "Delivered effective client training, ensuring optimal system usage and minimizing troubleshooting needs.",
          ],
        },
        {
          title: "Telecommunications Engineer",
          company: "Guzzer Technologies",
          period: "December 2021 – May 2022",
          responsibilities: [
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
          period: "September 2021 – November 2021",
          responsibilities: [
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
          period: "2020 – 2021",
          responsibilities: [
            "Provided technical support during event setups, resolving IT issues swiftly and ensuring operations ran smoothly.",
            "Coordinated event setups, ensuring the technical requirements were met.",
          ],
          achievements: [
            "Ensured event success by swiftly resolving technical issues and optimizing operations during the events.",
          ],
        },
      ]

      experiences.forEach((exp, index) => {
        // Check if we need a new page
        if (y > 250) {
          pdf.addPage()
          y = margin
        }

        pdf.setFont("helvetica", "bold")
        pdf.setFontSize(subheadingStyle.fontSize)
        pdf.text(exp.title, margin, y)
        y += 5

        pdf.setFont("helvetica", "normal")
        pdf.setFontSize(normalStyle.fontSize)
        pdf.text(`${exp.company} | ${exp.period}`, margin, y)
        y += 6

        pdf.setFont("helvetica", "bold")
        pdf.text("Responsibilities:", margin, y)
        y += 5

        pdf.setFont("helvetica", "normal")
        exp.responsibilities.forEach((resp) => {
          // Check if we need a new page
          if (y > 270) {
            pdf.addPage()
            y = margin
          }

          const bulletText = `• ${resp}`
          const splitResp = pdf.splitTextToSize(bulletText, 210 - 2 * margin - 5)
          pdf.text(splitResp, margin + 5, y)
          y += splitResp.length * 5
        })
        y += 3

        // Check if we need a new page
        if (y > 260) {
          pdf.addPage()
          y = margin
        }

        pdf.setFont("helvetica", "bold")
        pdf.text("Achievements:", margin, y)
        y += 5

        pdf.setFont("helvetica", "normal")
        exp.achievements.forEach((ach, i) => {
          // Check if we need a new page
          if (y > 270) {
            pdf.addPage()
            y = margin
          }

          const bulletText = `• ${ach}`
          const splitAch = pdf.splitTextToSize(bulletText, 210 - 2 * margin - 5)
          pdf.text(splitAch, margin + 5, y)
          y += splitAch.length * 5
        })
        y += 8
      })

      // Education
      // Check if we need a new page
      if (y > 240) {
        pdf.addPage()
        y = margin
      }

      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(headingStyle.fontSize)
      pdf.text("Educational and Training", margin, y)
      y += 8

      const education = [
        {
          degree: "Bachelor of Science in Computer Science",
          institution: "The Co-operative University of Kenya",
          period: "2018 – 2022",
        },
        {
          degree: "Data Science with Python",
          institution: "National Research Fund – Kenya",
          period: "July 2021 – October 2021",
          details: "Vetted by University of Nairobi, Kenyatta University, and The Co-operative University of Kenya",
        },
        {
          degree: "Multimedia University of Kenya",
          period: "2019 June – December",
        },
      ]

      education.forEach((edu) => {
        pdf.setFont("helvetica", "bold")
        pdf.setFontSize(subheadingStyle.fontSize)
        pdf.text(edu.degree, margin, y)
        y += 5

        pdf.setFont("helvetica", "normal")
        pdf.setFontSize(normalStyle.fontSize)

        if (edu.institution) {
          pdf.text(`${edu.institution} | ${edu.period}`, margin, y)
        } else {
          pdf.text(edu.period, margin, y)
        }
        y += 4

        if (edu.details) {
          pdf.setFontSize(smallStyle.fontSize)
          pdf.text(edu.details, margin, y)
          y += 4
        }

        y += 4
      })

      // Referees
      y += 5
      pdf.setFont("helvetica", "italic")
      pdf.setFontSize(normalStyle.fontSize)
      pdf.text("Referees available upon request", 105, y, { align: "center" })

      // Save the PDF
      pdf.save("meshack-bwire-resume.pdf")

      // Remove loading toast
      document.body.removeChild(loadingToast)

      // Show success toast
      const successToast = document.createElement("div")
      successToast.className = "fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50"
      successToast.textContent = "PDF downloaded successfully!"
      document.body.appendChild(successToast)

      // Remove success toast after 3 seconds
      setTimeout(() => {
        document.body.removeChild(successToast)
      }, 3000)
    } catch (error) {
      console.error("Error generating PDF:", error)

      // Remove loading toast
      document.body.removeChild(loadingToast)

      // Show error toast
      alert("Failed to generate PDF. Please try again.")
    }
  }

  return (
    <main className="container mx-auto px-4 py-12 max-w-4xl print:py-2">
      <div className="flex justify-between items-center mb-8 print:hidden">
        <h1 className="text-3xl font-bold">
          My <span className="text-purple-400">Resume</span>
        </h1>
        <div className="flex gap-3">
          <Button
            onClick={handlePrint}
            variant="outline"
            className="flex items-center gap-2 border-gray-700 hover:bg-gray-700 text-gray-300"
          >
            <Printer size={16} />
            <span>Print</span>
          </Button>
          <Button onClick={handleDownload} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700">
            <Download size={16} />
            <span>Download PDF</span>
          </Button>
        </div>
      </div>

      <motion.div
        id="resume-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-800/80 backdrop-blur-sm p-8 rounded-lg shadow-md print:bg-white print:text-black print:shadow-none print:p-0"
      >
        {/* Header */}
        <div className="text-center mb-8 border-b border-gray-700 pb-6 print:border-gray-300">
          <h1 className="text-3xl font-bold mb-2 text-purple-400 print:text-purple-800">MESHACK BWIRE</h1>
          <p className="text-gray-300 print:text-gray-700">P.O Box 268-50400, Kenya</p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2 text-sm">
            <span className="text-gray-300 print:text-gray-700">Cellphone: +254794142204</span>
            <span className="text-gray-300 print:text-gray-700">Email: bmwandera14@gmail.com</span>
            <a
              href="https://www.linkedin.com/in/meshack-bwire-b2390a213/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 print:text-purple-800"
            >
              LinkedIn Profile
            </a>
          </div>
        </div>

        {/* Professional Summary */}
        <div className="mb-8">
          <div
            className="flex justify-between items-center cursor-pointer print:cursor-default mb-4"
            onClick={() => toggleSection("summary")}
          >
            <h2 className="text-xl font-bold text-purple-400 print:text-purple-800">Professional Summary</h2>
            <button className="print:hidden">
              {expandedSections.summary ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          </div>
          {expandedSections.summary && (
            <p className="text-gray-300 print:text-gray-700">
              A proactive and results-driven Software Engineer with extensive experience in the integration, deployment,
              and support of Point of Sale (POS) systems and mobile applications. Skilled in providing onsite and
              offsite client support, ensuring smooth system implementations, and delivering user training for the
              applications developed. Proficient in data analysis and transactional data management using SQL and Python
              to support business decisions. Experienced in POS terminal development, API integrations, and PCI
              compliance, with a strong ability to troubleshoot issues and optimize system performance for enhanced
              operational efficiency.
            </p>
          )}
        </div>

        {/* Technical Skills */}
        <div className="mb-8">
          <div
            className="flex justify-between items-center cursor-pointer print:cursor-default mb-4"
            onClick={() => toggleSection("skills")}
          >
            <h2 className="text-xl font-bold text-purple-400 print:text-purple-800">Technical Skills</h2>
            <button className="print:hidden">
              {expandedSections.skills ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          </div>
          {expandedSections.skills && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
              <div className="flex items-start">
                <span className="text-purple-400 mr-2 print:text-purple-800">•</span>
                <p className="text-gray-300 print:text-gray-700">
                  <span className="font-medium">Programming Languages:</span> Java, Python, Go, C#, JavaScript, SQL,
                  .NET
                </p>
              </div>
              <div className="flex items-start">
                <span className="text-purple-400 mr-2 print:text-purple-800">•</span>
                <p className="text-gray-300 print:text-gray-700">
                  <span className="font-medium">Frameworks & Tools:</span> Spring Boot, Flutter, Angular, Kubernetes,
                  Docker
                </p>
              </div>
              <div className="flex items-start">
                <span className="text-purple-400 mr-2 print:text-purple-800">•</span>
                <p className="text-gray-300 print:text-gray-700">
                  <span className="font-medium">POS Systems:</span> Ingenico, Nexgo, Telpo, Base24, JPOS, ISO 8583
                </p>
              </div>
              <div className="flex items-start">
                <span className="text-purple-400 mr-2 print:text-purple-800">•</span>
                <p className="text-gray-300 print:text-gray-700">
                  <span className="font-medium">Cloud Environments:</span> AWS, GCP, Microsoft Azure
                </p>
              </div>
              <div className="flex items-start">
                <span className="text-purple-400 mr-2 print:text-purple-800">•</span>
                <p className="text-gray-300 print:text-gray-700">
                  <span className="font-medium">API Integration:</span> REST, GraphQL, SOAP
                </p>
              </div>
              <div className="flex items-start">
                <span className="text-purple-400 mr-2 print:text-purple-800">•</span>
                <p className="text-gray-300 print:text-gray-700">
                  <span className="font-medium">Data Analysis:</span> SQL, PowerBI, Python (Pandas, NumPy)
                </p>
              </div>
              <div className="flex items-start">
                <span className="text-purple-400 mr-2 print:text-purple-800">•</span>
                <p className="text-gray-300 print:text-gray-700">
                  <span className="font-medium">Development Tools:</span> Git, Jira, Bitbucket, Jenkins (CI/CD)
                </p>
              </div>
              <div className="flex items-start">
                <span className="text-purple-400 mr-2 print:text-purple-800">•</span>
                <p className="text-gray-300 print:text-gray-700">
                  <span className="font-medium">Compliance & Standards:</span> PCI-DSS, Visa & Mastercard Certification
                </p>
              </div>
              <div className="flex items-start">
                <span className="text-purple-400 mr-2 print:text-purple-800">•</span>
                <p className="text-gray-300 print:text-gray-700">
                  <span className="font-medium">Agile:</span> Scrum, Kanban
                </p>
              </div>
              <div className="flex items-start">
                <span className="text-purple-400 mr-2 print:text-purple-800">•</span>
                <p className="text-gray-300 print:text-gray-700">
                  <span className="font-medium">Other Skills:</span> Troubleshooting, User Training, System Deployment
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Professional Experience */}
        <div className="mb-8">
          <div
            className="flex justify-between items-center cursor-pointer print:cursor-default mb-4"
            onClick={() => toggleSection("experience")}
          >
            <h2 className="text-xl font-bold text-purple-400 print:text-purple-800">Professional Experience</h2>
            <button className="print:hidden">
              {expandedSections.experience ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          </div>
          {expandedSections.experience && (
            <div className="space-y-6">
              {/* Tracom Services */}
              <div className="border-l-2 border-purple-500 pl-4 print:border-purple-800">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-2">
                  <h3 className="text-lg font-semibold text-white print:text-black">
                    Software Engineer (Point of Sale systems)
                  </h3>
                  <div className="text-purple-400 text-sm print:text-purple-800">May 2023 – Current</div>
                </div>
                <p className="text-gray-300 mb-3 print:text-gray-700">Tracom Services Limited</p>
                <div className="mb-3">
                  <h4 className="font-medium mb-2 text-white print:text-black">Responsibilities:</h4>
                  <ul className="list-disc pl-5 space-y-1 text-gray-300 print:text-gray-700">
                    <li>Specialized in Android development for mobile and POS applications.</li>
                    <li>
                      Provided onsite and offsite client support, troubleshooting POS issues and ensuring smooth system
                      operations.
                    </li>
                    <li>
                      Integrated RESTful APIs and GraphQL APIs for real-time communication and data flow between
                      systems.
                    </li>
                    <li>Ensured PCI compliance for all payment systems, focusing on secure transactions.</li>
                    <li>
                      Led client training sessions on POS system operations, enhancing user experience and system
                      adoption.
                    </li>
                    <li>Managed the deployment and orchestration of containerized applications using Kubernetes.</li>
                    <li>
                      Utilized SQL and Python for data analysis, focusing on transactional data for cashless fuel
                      transactions and terminal management.
                    </li>
                    <li>Worked in an Agile environment, participating in scrum meetings and sprint reviews.</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2 text-white print:text-black">Achievements:</h4>
                  <ol className="list-decimal pl-5 space-y-1 text-gray-300 print:text-gray-700">
                    <li>
                      Developed the current SDK being used in Awash Bank (Ethiopia) on all Ingenico Axium DX POS devices
                      by S2M switch and deployed to production.
                    </li>
                    <li>
                      Developed the current application and successfully completed Visa and MasterCard certification for
                      Bunna Bank's (Ethiopia) Ingenico DX8000 SDK on BASE24-eps® Version 3.0.17 switch.
                    </li>
                    <li>
                      Developed an Android Archive (AAR) file and improved the SDK currently being used by the
                      Cooperative and Rural Development Bank (CRDB) of Tanzania on Nexgo and Telpo POS devices.
                    </li>
                    <li>
                      Developed and implemented Terminal Management System (TMS) functionalities across POS devices, for
                      NMB Bank – Tanzania, CBE (Commercial Bank of Ethiopia), Awash Bank, Bunna Bank and Quantum –
                      Ethiopia, significantly enhancing remote management capabilities and efficiency – this was done
                      for Ingenico Move 2500, Ingenico DX 8000, Ingenico DX 5000.
                    </li>
                    <li>Developed and implemented a fuel module for CRDB Bank on Ingenico Move-2500 POS devices.</li>
                    <li>
                      Developed an application for cashless fuel transactions powered by Quantum Technology PLC –
                      Ethiopia, on Move-2500 POS devices.
                    </li>
                    <li>
                      Delivered effective client training, ensuring optimal system usage and minimizing troubleshooting
                      needs.
                    </li>
                  </ol>
                </div>
              </div>

              {/* Guzzer Technologies */}
              <div className="border-l-2 border-purple-500 pl-4 print:border-purple-800">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-2">
                  <h3 className="text-lg font-semibold text-white print:text-black">Telecommunications Engineer</h3>
                  <div className="text-purple-400 text-sm print:text-purple-800">December 2021 – May 2022</div>
                </div>
                <p className="text-gray-300 mb-3 print:text-gray-700">Guzzer Technologies</p>
                <div className="mb-3">
                  <h4 className="font-medium mb-2 text-white print:text-black">Responsibilities:</h4>
                  <ul className="list-disc pl-5 space-y-1 text-gray-300 print:text-gray-700">
                    <li>Provided technical troubleshooting and issue resolution on network devices.</li>
                    <li>
                      Worked on network system migrations, construction, and maintenance of HFC and GPON networks.
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2 text-white print:text-black">Achievements:</h4>
                  <ol className="list-decimal pl-5 space-y-1 text-gray-300 print:text-gray-700">
                    <li>
                      Contributed to the enhancement of system stability through network power migration projects in
                      Nairobi.
                    </li>
                  </ol>
                </div>
              </div>

              {/* AERC */}
              <div className="border-l-2 border-purple-500 pl-4 print:border-purple-800">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-2">
                  <h3 className="text-lg font-semibold text-white print:text-black">Data Engineer (Internship)</h3>
                  <div className="text-purple-400 text-sm print:text-purple-800">September 2021 – November 2021</div>
                </div>
                <p className="text-gray-300 mb-3 print:text-gray-700">African Economic Research Consortium (AERC)</p>
                <div className="mb-3">
                  <h4 className="font-medium mb-2 text-white print:text-black">Responsibilities:</h4>
                  <ul className="list-disc pl-5 space-y-1 text-gray-300 print:text-gray-700">
                    <li>
                      Managed electronic document storage, indexing, and scanning to ensure secure and efficient data
                      retrieval.
                    </li>
                    <li>Leveraged Microsoft Azure and SQL to manage data securely and support research data needs.</li>
                    <li>Used PowerBI to create interactive reports and dashboards for stakeholders.</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2 text-white print:text-black">Achievements:</h4>
                  <ol className="list-decimal pl-5 space-y-1 text-gray-300 print:text-gray-700">
                    <li>
                      Enhanced document retrieval processes through the successful implementation of the Electronic
                      Document and Record Management System (EDMS).
                    </li>
                  </ol>
                </div>
              </div>

              {/* Rita Creations */}
              <div className="border-l-2 border-purple-500 pl-4 print:border-purple-800">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-2">
                  <h3 className="text-lg font-semibold text-white print:text-black">IT Support Technician (Casual)</h3>
                  <div className="text-purple-400 text-sm print:text-purple-800">2020 – 2021</div>
                </div>
                <p className="text-gray-300 mb-3 print:text-gray-700">
                  Rita Creations, Events and Luxury Rentals Company
                </p>
                <div className="mb-3">
                  <h4 className="font-medium mb-2 text-white print:text-black">Responsibilities:</h4>
                  <ul className="list-disc pl-5 space-y-1 text-gray-300 print:text-gray-700">
                    <li>
                      Provided technical support during event setups, resolving IT issues swiftly and ensuring
                      operations ran smoothly.
                    </li>
                    <li>Coordinated event setups, ensuring the technical requirements were met.</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2 text-white print:text-black">Achievements:</h4>
                  <ol className="list-decimal pl-5 space-y-1 text-gray-300 print:text-gray-700">
                    <li>
                      Ensured event success by swiftly resolving technical issues and optimizing operations during the
                      events.
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Education */}
        <div className="mb-8">
          <div
            className="flex justify-between items-center cursor-pointer print:cursor-default mb-4"
            onClick={() => toggleSection("education")}
          >
            <h2 className="text-xl font-bold text-purple-400 print:text-purple-800">Educational and Training</h2>
            <button className="print:hidden">
              {expandedSections.education ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          </div>
          {expandedSections.education && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white print:text-black">
                  Bachelor of Science in Computer Science
                </h3>
                <p className="text-gray-300 print:text-gray-700">The Co-operative University of Kenya | 2018 – 2022</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white print:text-black">Data Science with Python</h3>
                <p className="text-gray-300 print:text-gray-700">
                  National Research Fund – Kenya | July 2021 – October 2021
                </p>
                <p className="text-sm text-gray-400 print:text-gray-700">
                  Vetted by University of Nairobi, Kenyatta University, and The Co-operative University of Kenya
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white print:text-black">Multimedia University of Kenya</h3>
                <p className="text-gray-300 print:text-gray-700">2019 June – December</p>
              </div>
            </div>
          )}
        </div>

        {/* Referees */}
        <div className="text-center text-gray-400 print:text-gray-700 italic">Referees available upon request</div>
      </motion.div>
    </main>
  )
}
