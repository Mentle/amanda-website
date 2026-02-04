import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'

function Header() {
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef(null)
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const toggleMenu = (e) => {
    e.stopPropagation()
    console.log('Menu button clicked! Current state:', isMenuOpen, '-> New state:', !isMenuOpen)
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        closeMenu()
      }
    }

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeMenu()
      }
    }

    if (isMenuOpen) {
      document.addEventListener('click', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isMenuOpen])

  return (
    <>
      <header className="persistent-header">
        <Link to="/" className="header-logo" onClick={scrollToTop}>
          AMANDA MICHELENA
        </Link>
        <div className="header-actions">
          <button className="header-menu-btn" onClick={toggleMenu}>
            <i className="fas fa-bars"></i>
          </button>
        </div>
      </header>

      <div id="nav-menu" className={`nav-menu ${isMenuOpen ? 'active' : ''}`} ref={menuRef}>
        <div className="nav-menu-content">
          <Link to="/" className="nav-menu-item" onClick={closeMenu}>
            <i className="fas fa-home"></i>
            <span>Home</span>
          </Link>
          <Link to="/about" className="nav-menu-item" onClick={closeMenu}>
            <i className="fas fa-user"></i>
            <span>About</span>
          </Link>
          <Link to="/portfolio" className="nav-menu-item" onClick={closeMenu}>
            <i className="fas fa-briefcase"></i>
            <span>Portfolio</span>
          </Link>
          <Link to="/contact" className="nav-menu-item" onClick={closeMenu}>
            <i className="fas fa-envelope"></i>
            <span>Contact</span>
          </Link>
        </div>
      </div>
    </>
  )
}

export default Header
