import { useState } from 'react'
import '../styles/services.css'

const services = [
  {
    number: '1',
    title: 'STRATEGY & CONSULTANCY',
    description: 'Building culturally aware foundations for brands that value long-term relevance. She specializes in translating Latin American heritage and archival research into elevated, global visual languages.'
  },
  {
    number: '2',
    title: 'CREATIVE DIRECTION & STILL LIFE',
    description: 'Leading the visual vision through sharp aesthetics and a curated point of view. She treats still life as a narrative tool, using objects and nature to build sophisticated brand worlds for editorial and social-first campaigns.'
  },
  {
    number: '3',
    title: 'PRODUCTION',
    description: 'Translating ambitious concepts into reality through end-to-end execution. She manages logistics, talent, and workflows across Europe and the US to ensure a seamless delivery from idea to final asset.'
  }
]

function Contact() {
  const [activeIndex, setActiveIndex] = useState(null)

  return (
    <div className="services-page">
      <div className="services-inner">
        <h1 className="services-page-title">Services</h1>

        <ul className="services-list">
          {services.map((s, i) => (
            <li
              key={i}
              className={`services-item ${activeIndex === i ? 'active' : ''}`}
              onMouseEnter={() => setActiveIndex(i)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <div className="services-item-header">
                <span className="services-number">{s.number}</span>
                <h2 className="services-title">{s.title}</h2>
              </div>
              <p className="services-description">{s.description}</p>
            </li>
          ))}
        </ul>

        <p className="services-tagline">
          <em>Collaborating with teams worldwide in English and Spanish.</em>
        </p>

      </div>
    </div>
  )
}

export default Contact
