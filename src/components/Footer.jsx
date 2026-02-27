import { Link, useNavigate } from 'react-router-dom'
import '../styles/footer.css'

function Footer() {
  const currentYear = new Date().getFullYear()
  const navigate = useNavigate()

  const handleWorkClick = (e) => {
    e.preventDefault()
    sessionStorage.setItem('scrollToPortfolioOnHome', '1')
    navigate('/', { state: { scrollToPortfolio: true } })
  }

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3 className="footer-title">Amanda Michelena</h3>
          <p className="footer-subtitle">Creative Director & Consultant</p>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">Navigation</h4>
          <ul className="footer-links">
            <li><Link to="/">Home</Link></li>
            <li><a href="#portfolio" onClick={handleWorkClick}>Work</a></li>
            <li><Link to="/services">Services</Link></li>
            <li><Link to="/about">About</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">Connect</h4>
          <ul className="footer-links">
            <li><a href="https://www.instagram.com/amandamichelena/" target="_blank" rel="noopener noreferrer">Instagram</a></li>
            <li><a href="https://www.linkedin.com/in/amandamichelena/" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
            <li><a href="mailto:amandamichelena@gmail.com">Email</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} Amanda Michelena. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer
