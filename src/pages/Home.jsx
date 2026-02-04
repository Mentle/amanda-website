function Home() {
  return (
    <>
      <section className="hero-section">
        <div className="hero-content">
          <div className="intro-text">
            <span className="greeting">¡Hola! </span>I am a Creative Producer for fashion and luxury. I spend most of my time researching, creating and sharing beautiful content related to my biggest obsessions: <em>Fashion, Food and Flowers</em>
          </div>
          <div className="social-links">
            <a href="mailto:amandamichelena@gmail.com" className="social-link">
              <i className="fas fa-envelope"></i>
            </a>
            <a href="https://instagram.com/amandamichelena" target="_blank" rel="noopener noreferrer" className="social-link">
              <i className="fab fa-instagram"></i>
            </a>
          </div>
          <div className="scroll-indicator">
            Scroll Down For More
            <div className="arrow-down">
              <i className="fas fa-chevron-down"></i>
            </div>
          </div>
        </div>
      </section>
      <div className="scroll-spacer"></div>
    </>
  )
}

export default Home
