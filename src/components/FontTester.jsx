import { useState, useEffect } from 'react'
import '../styles/font-tester.css'

const SERIF_FONTS = [
  'Cambo',
  'Roboto Serif',
  'Arapey',
  'Domine',
  'Bodoni Moda',
  'Ledger'
]

const SANS_SERIF_FONTS = [
  'Ubuntu',
  'Montserrat',
  'Puritan',
  'Funnel Display',
  'Special Gothic',
  'DM Sans',
  'Roboto',
  'Bricolage Grotesque'
]

const applyFonts = (serifFont, sansSerifFont) => {
  console.log('[FontTester] Applying fonts:', serifFont, sansSerifFont)
  
  const styleId = 'font-tester-styles'
  let styleEl = document.getElementById(styleId)
  if (!styleEl) {
    styleEl = document.createElement('style')
    styleEl.id = styleId
    document.head.appendChild(styleEl)
    console.log('[FontTester] Created style element')
  }

  // Always wrap font names in quotes for CSS
  const serifFontFamily = `'${serifFont}'`
  const sansSerifFontFamily = `'${sansSerifFont}'`

  styleEl.textContent = `
    h1, h2, h3, h4, h5, h6,
    .main-title,
    .page-title,
    .portfolio-title,
    .about-header h1,
    .about-cta,
    .footer-title,
    .footer-heading,
    .portfolio-detail-meta-block h3,
    .portfolio-detail-hero-info-top h1,
    .portfolio-card-info h3,
    .portfolio-modal-header h2,
    .section-header h4,
    .expertise-item h5,
    .highlight-item h4,
    .contact-intro h3,
    .contact-form-container h3,
    .project-info h3,
    .logo,
    .header-logo,
    .back-btn,
    .content-window h2,
    .contact-info .contact-message,
    .pill-nav-item,
    .pill-nav-item-text,
    .services-page-title,
    .services-title,
    .services-number,
    .metric-value {
      font-family: ${serifFontFamily}, serif !important;
    }

    body,
    p,
    span,
    a,
    li,
    .intro-tagline,
    .section-content p,
    .expertise-item p,
    .highlight-item p,
    .contact-intro p,
    .contact-form-container p,
    .project-info p,
    .project-link,
    .metric-platform,
    .footer-links a,
    .footer-bottom p,
    .footer-subtitle,
    .services-description,
    .services-tagline,
    .filter-button,
    .scroll-indicator,
    .hero-text,
    input,
    textarea,
    .form-group label,
    .form-group input,
    .form-group textarea,
    .submit-btn,
    .back-btn span,
    .circle-overlay,
    .nav-menu-item,
    .page-info {
      font-family: ${sansSerifFontFamily}, sans-serif !important;
    }
  `
}

export default function FontTester() {
  const [isOpen, setIsOpen] = useState(false)
  const [serifFont, setSerifFont] = useState(() => {
    return localStorage.getItem('fontTester_serif') || 'Cambo'
  })
  const [sansSerifFont, setSansSerifFont] = useState(() => {
    return localStorage.getItem('fontTester_sansSerif') || 'Montserrat'
  })

  // Load all Google Fonts on mount
  useEffect(() => {
    const existingLink = document.getElementById('font-tester-gfonts')
    if (!existingLink) {
      const fontList = [...SERIF_FONTS, ...SANS_SERIF_FONTS]
      const families = fontList.map(f => `family=${f.replace(/\s+/g, '+')}:wght@400;700`).join('&')
      const link = document.createElement('link')
      link.id = 'font-tester-gfonts'
      link.href = `https://fonts.googleapis.com/css2?${families}&display=swap`
      link.rel = 'stylesheet'
      document.head.appendChild(link)
    }
  }, [])

  // Apply fonts and save to localStorage whenever selections change
  useEffect(() => {
    localStorage.setItem('fontTester_serif', serifFont)
    localStorage.setItem('fontTester_sansSerif', sansSerifFont)
    applyFonts(serifFont, sansSerifFont)
  }, [serifFont, sansSerifFont])

  return (
    <div className="font-tester-container">
      <button
        className="font-tester-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title="Font Tester"
      >
        ⚙
      </button>

      {isOpen && (
        <div className="font-tester-panel">
          <div className="font-tester-header">
            <h3>Font Tester</h3>
            <button
              className="font-tester-close"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className="font-tester-content">
            <div className="font-tester-group">
              <label>Headings (Serif)</label>
              <select
                value={serifFont}
                onChange={(e) => {
                  console.log('[FontTester] Serif font changed to:', e.target.value)
                  setSerifFont(e.target.value)
                }}
                className="font-tester-select"
              >
                {SERIF_FONTS.map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>
            </div>

            <div className="font-tester-group">
              <label>Body (Sans-Serif)</label>
              <select
                value={sansSerifFont}
                onChange={(e) => {
                  console.log('[FontTester] Sans-serif font changed to:', e.target.value)
                  setSansSerifFont(e.target.value)
                }}
                className="font-tester-select"
              >
                {SANS_SERIF_FONTS.map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>
            </div>

            <div className="font-tester-preview">
              <p className="preview-label">
                <strong>{serifFont}</strong> / {sansSerifFont}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
