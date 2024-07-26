import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import ProjectCard from "./ProjectCards";
import Particle from "../Particle";
import kanda_fashion from "../../Assets/Projects/kanda_fashion.png";

function Projects() {
  return (
    <Container fluid className="project-section">
      <Particle />
      <Container>
        <h1 className="project-heading">
          My Recent <strong className="purple">Works </strong>
        </h1>
        <p style={{ color: "white" }}>
          Here are a few projects I've worked on recently.
        </p>
        <Row style={{ justifyContent: "center", paddingBottom: "10px" }}>
          <Col md={4} className="project-card">
            <ProjectCard
              imgPath={kanda_fashion}
              isBlog={false}
              title="Kanda fashion"
              description="Simple UI of a Fashion sales website in HTML-CSS"
              ghLink="https://github.com/BM-Ghost/Kanda-Fashion"
              demoLink="https://bm-ghost.github.io/Kanda-Fashion/"
            />
          </Col>

        </Row>
      </Container>
    </Container>
  );
}

export default Projects;
