import { useState, useEffect } from 'react'
import { createClient } from '@sanity/client'
import '../styles/footer.css'

const client = createClient({
  projectId: 'sy1y9q7w',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2024-01-01'
})

let cachedFooter = null

function Footer() {
  const currentYear = new Date().getFullYear()
  const [copyrightText, setCopyrightText] = useState(() => cachedFooter?.copyrightText || 'Amanda Michelena')

  useEffect(() => {
    if (cachedFooter) return
    client.fetch(`*[_type == "footerSettings" && _id == "footerSettings"][0]{ copyrightText }`)
      .then(result => {
        if (result) {
          cachedFooter = result
          if (result.copyrightText) setCopyrightText(result.copyrightText)
        }
      })
      .catch(() => {})
  }, [])

  return (
    <footer className="footer">
      <div className="footer-bottom">
        <p>&copy; {currentYear} {copyrightText}. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer
