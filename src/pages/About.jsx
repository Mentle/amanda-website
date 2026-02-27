import '../styles/about.css'

function About() {
  return (
    <div className="about-page">

      <div className="about-image-col">
        <div className="about-image-wrap">
          <img src="/images/profile.webp" alt="Amanda Michelena" />
        </div>
        <p className="about-location">Based between London and Barcelona — working globally.</p>
      </div>

      <div className="about-text-col">
        <header className="about-header">
          <h1>Amanda<br />Michelena</h1>
          <p className="about-subtitle">Creative Director & Consultant</p>
        </header>

        <div className="about-body">
          <p>Amanda Michelena is a creative director and consultant specializing in the intersection of culture, heritage, and nature. With a background forged between the London College of Fashion and the vibrant landscape of Latin America, she approaches brand building as a dialogue between archival depth and contemporary aesthetics. Her practice is built on a "maker" philosophy: the belief that the strongest creative visions are those informed by a rigorous understanding of how they are physically and strategically executed.</p>

          <p>Her perspective is deeply influenced by her Venezuelan roots and an obsession with still life as a narrative tool. Whether collaborating with Guajira artisans to redefine luxury craft or developing social-first frameworks for global fragrance houses, Amanda prioritizes cultural awareness as a driver for long-term relevance. This ability to translate heritage into elevated visual language has led her to manage complex productions and art direction across Europe and the US, bridging the gap between high-end digital content and tactile, botanical environments.</p>

          <p>Currently, she leads projects that demand a sharp, curated point of view—ranging from creative consultancy for emerging brands to large-scale production for industry leaders like Carolina Herrera, Sézane, and Louis Vuitton. By integrating a distinct botanical identity into her still life and spatial work, she creates immersive brand worlds that feel both grounded and aspirational.</p>
        </div>

        <div className="about-contact">
          <p className="about-cta">Let's work together.</p>
          <div className="about-contact-details">
            <p className="about-location-text">Based between London and Barcelona.<br />Working worldwide.</p>
            <div className="about-social">
              <a href="https://www.instagram.com/amandamichelena" target="_blank" rel="noreferrer">Instagram</a>
              <span className="about-social-dot">·</span>
              <a href="https://es.linkedin.com/in/amanda-michelena-59aa2a351?trk=people-guest_people_search-card" target="_blank" rel="noreferrer">LinkedIn</a>
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}

export default About
