import React from "react";
import Card from "react-bootstrap/Card";
import { ImPointRight } from "react-icons/im";

function AboutCard() {
  return (
    <Card className="quote-card-view">
      <Card.Body>
        <blockquote className="blockquote mb-0">
          <p style={{ textAlign: "justify", fontSize: "18px" }}>
            My name is <span className="purple">Meshack Bwire </span>
            from <span className="purple"> Nairobi, Kenya</span>
            <br />
            Throughout my career, I have consistently demonstrated expertise and innovation in software engineering and data management. Currently, I am employed as a Software Engineer at <a href="https://www.linkedin.com/company/tracom-services/mycompany/" className="link-style" target="_blank" rel="noopener noreferrer">Tracom Services Limited</a>, specializing in Android development and working with technologies such as C#, JavaScript, and .NET for desk POS systems. My other roles involve integrating client Web APIs, ensuring PCI compliance, creation of Bitbucket pipelines and deployment of applications. 
            <br />
            My notable achievements include developing the current payment application for <a href="https://awashbank.com/" className="link-style" target="_blank" rel="noopener noreferrer">Awash Bank</a> of Ethiopia on Ingenico's <a href="https://ingenico.com/en/products-services/payment-terminals/axium-dx8000-series" className="link-style" target="_blank" rel="noopener noreferrer">DX</a> devices and the current <a href="https://www.nexgoglobal.com/smart-pos/n86.html" className="link-style" target="_blank" rel="noopener noreferrer">Nexgo</a> device SDK for <a href="https://www.crdbbank.co.tz/en" className="link-style" target="_blank" rel="noopener noreferrer">Cooperative Rural Development Bank (CRDB)</a> of Tanzania, improving the current Unix/Linux C-based application to enhance Terminal Management System functionalities for <a href="https://combanketh.et/ " className="link-style" target="_blank" rel="noopener noreferrer">Commercial Bank of Ethiopia</a> on Ingenico's <a href="https://ingenico.com/en/resources/move2500-0" className="link-style" target="_blank" rel="noopener noreferrer">Move 2500</a> devices and developing a cashless fuel transaction application for <a href="https://www.linkedin.com/company/quantum-technology-plc/?originalSubdomain=et" className="link-style" target="_blank" rel="noopener noreferrer">Quantum Technology PLC</a> on Ingenico's <a href="https://cdn.ingenico.com/binaries/content/assets/us-website/library/datasheets/payment-solutions/smart-terminals/telium-2/iwl-series/usa_datasheet_iwlseries_igwl_201012.pdf" className="link-style" target="_blank" rel="noopener noreferrer">iwl220</a> devices.
            <br />
            Previously, I worked as a Telecommunications Engineer at <a href="https://www.g-tech.co.ke/" className="link-style" target="_blank" rel="noopener noreferrer">Guzzer Technologies</a>, where I excelled in network troubleshooting, construction, and maintenance. During my internship as a Data Engineer at <a href="https://aercafrica.org/" className="link-style" target="_blank" rel="noopener noreferrer">African Economic Research Consortium</a>, I did data digitization of their physical archives by use of <a href="https://helpjuice.com/blog/edms" className="link-style" target="_blank" rel="noopener noreferrer">EDMS</a>. Earlier in my career, as an IT Support Technician at <a href="https://www.instagram.com/ritacreationske/" className="link-style" target="_blank" rel="noopener noreferrer">Rita Creations</a>, I coordinated technical assessments and event setups, ensuring customer satisfaction.
            <br />
            Apart from coding, some other activities that I love to do!
          </p>
          <ul>
            <li className="about-activity">
              <ImPointRight /> Researching Quantum and Astro-Physics
            </li>
            <li className="about-activity">
              <ImPointRight /> Writing Tech Blogs
            </li>
            <li className="about-activity">
              <ImPointRight /> Travelling
            </li>
          </ul>

          <p style={{ color: "rgb(155 126 172)" }}>
            "Strive to build things that make a difference!"{" "}
          </p>
          <footer className="blockquote-footer">Bwire</footer>
        </blockquote>
      </Card.Body>
    </Card>
  );
}

export default AboutCard;
