import React from "react";
import Card from "react-bootstrap/Card";
import { ImPointRight } from "react-icons/im";

function AboutCard() {
  return (
    <Card className="quote-card-view">
      <Card.Body>
        <blockquote className="blockquote mb-0">
          <p style={{ textAlign: "justify" }}>
            Hi Everyone, I am <span className="purple">MESHACK BWIRE </span>
            from <span className="purple"> Nairobi, Kenya</span>
            <br />
            Throughout my career, I have consistently demonstrated expertise and innovation in software engineering and data management. Currently, I am employed as a Software Engineer at <a href="https://www.linkedin.com/company/tracom-services/mycompany/" className="link-style" target="_blank" rel="noopener noreferrer">Tracom Services Limited</a>, specializing in Android development and working with technologies such as C#, JavaScript, and .NET for desk POS systems. My other roles involve integrating client Web APIs, ensuring PCI compliance, creation of Bitbucket pipelines and deployment of applications. 
            <br />
            My notable achievements include developing the current payment application for <a href="https://awashbank.com/" className="link-style" target="_blank" rel="noopener noreferrer">Awash Bank</a> of Ethiopia on Ingenico's DX devices and the current Nexgo device SDK for <a href="https://www.crdbbank.co.tz/en" className="link-style" target="_blank" rel="noopener noreferrer">Cooperative Rural Development Bank (CRDB)</a> of Tanzania, improving the current Unix/Linux C-based application to enhance Terminal Management System functionalities for <a href="https://combanketh.et/ " className="link-style" target="_blank" rel="noopener noreferrer">Commercial Bank of Ethiopia</a> on Move 2500 devices and developing a cashless fuel transaction application for <a href="https://www.linkedin.com/company/quantum-technology-plc/?originalSubdomain=et" className="link-style" target="_blank" rel="noopener noreferrer">Quantum Technology PLC</a> on iwl220 devices.
            <br />
            Previously, I worked as a Telecommunications Engineer at Guzzer Technologies, where I excelled in network troubleshooting, construction, and maintenance. During my internship as a Data Engineer at African Economic Research Consortium, I managed digital initiatives and created interactive dashboards. Earlier in my career, as an IT Support Technician at Rita Creations, Events and Luxury Rentals Company, I coordinated technical assessments and event setups, ensuring customer satisfaction.
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
