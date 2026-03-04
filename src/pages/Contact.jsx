import { useState, useEffect } from 'react'
import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'
import '../styles/services.css'

const client = createClient({
  projectId: 'sy1y9q7w',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2024-01-01'
})

const builder = imageUrlBuilder(client)
function urlFor(source) { return builder.image(source) }

const fallbackServices = [
  {
    title: 'STRATEGY & CONSULTANCY',
    description: 'Building culturally aware foundations for brands that value long-term relevance. She specializes in translating Latin American heritage and archival research into elevated, global visual languages.'
  },
  {
    title: 'CREATIVE DIRECTION & STILL LIFE',
    description: 'Leading the visual vision through sharp aesthetics and a curated point of view. She treats still life as a narrative tool, using objects and nature to build sophisticated brand worlds for editorial and social-first campaigns.'
  },
  {
    title: 'PRODUCTION',
    description: 'Translating ambitious concepts into reality through end-to-end execution. She manages logistics, talent, and workflows across Europe and the US to ensure a seamless delivery from idea to final asset.'
  }
]

let cachedServicesPage = null

function Contact() {
  const [activeIndex, setActiveIndex] = useState(null)
  const [pageTitle, setPageTitle] = useState(() => cachedServicesPage?.pageTitle || 'Services')
  const [services, setServices] = useState(() => cachedServicesPage?.services || fallbackServices)
  const [tagline, setTagline] = useState(() => cachedServicesPage?.tagline || 'Collaborating with teams worldwide in English and Spanish.')
  const [sideImage, setSideImage] = useState(() => cachedServicesPage?.sideImage || null)

  useEffect(() => {
    if (cachedServicesPage) return
    client.fetch(`*[_type == "servicesPage" && _id == "servicesPage"][0]{ pageTitle, services, tagline, sideImage }`)
      .then(result => {
        if (result) {
          cachedServicesPage = result
          if (result.pageTitle) setPageTitle(result.pageTitle)
          if (result.services?.length) setServices(result.services)
          if (result.tagline) setTagline(result.tagline)
          if (result.sideImage) setSideImage(result.sideImage)
        }
      })
      .catch(() => {})
  }, [])

  const imageUrl = sideImage
    ? urlFor(sideImage).width(800).url()
    : '/services.jpeg'

  return (
    <div className="services-page">
      <div className="services-text-col">
        <h1 className="services-page-title">{pageTitle}</h1>

        <ul className="services-list">
          {services.map((s, i) => (
            <li
              key={s._key || i}
              className={`services-item ${activeIndex === i ? 'active' : ''}`}
              onMouseEnter={() => setActiveIndex(i)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <div className="services-item-header">
                <span className="services-number">{i + 1}</span>
                <h2 className="services-title">{s.title}</h2>
              </div>
              <p className="services-description">{s.description}</p>
            </li>
          ))}
        </ul>

        <p className="services-tagline">
          <em>{tagline}</em>
        </p>

      </div>

      <div className="services-image-col">
        <div className="services-image-wrap">
          <img src={imageUrl} alt={pageTitle} />
        </div>
      </div>
    </div>
  )
}

export default Contact
