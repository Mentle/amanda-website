import { useState, useEffect } from 'react'
import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'
import { PortableText } from '@portabletext/react'
import '../styles/about.css'

const client = createClient({
  projectId: 'sy1y9q7w',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2024-01-01'
})

const builder = imageUrlBuilder(client)
function urlFor(source) { return builder.image(source) }

let cachedAboutPage = null

function About() {
  const [data, setData] = useState(() => cachedAboutPage)

  useEffect(() => {
    if (cachedAboutPage) return
    client.fetch(`*[_type == "aboutPage" && _id == "aboutPage"][0]{
      name, subtitle, bio, profileImage, imageCaption,
      disciplines[]{ title, subtitle, description, clientLists[]{ label, items } },
      closingCta, socialLinks[]{ label, url }
    }`)
      .then(result => {
        if (result) {
          cachedAboutPage = result
          setData(result)
        }
      })
      .catch(() => {})
  }, [])

  const name = data?.name || 'Amanda Michelena'
  const subtitle = data?.subtitle || 'Creative Director & Consultant'
  const imageCaption = data?.imageCaption || 'Based between London and Barcelona — working globally.'
  const closingCta = data?.closingCta || "Let's create something timeless."
  const profileImageUrl = data?.profileImage
    ? urlFor(data.profileImage).width(800).url()
    : '/images/profile.webp'

  const nameParts = name.split(' ')
  const nameDisplay = nameParts.length > 1
    ? <>{nameParts.slice(0, -1).join(' ')}<br />{nameParts[nameParts.length - 1]}</>
    : name

  return (
    <div className="about-page">

      <div className="about-image-col">
        <div className="about-image-wrap">
          <img src={profileImageUrl} alt={name} />
        </div>
        <p className="about-location">{imageCaption}</p>
      </div>

      <div className="about-text-col">
        <header className="about-header">
          <h1>{nameDisplay}</h1>
          <p className="about-subtitle">{subtitle}</p>
        </header>

        <div className="about-body">
          {data?.bio ? (
            <PortableText
              value={data.bio}
              components={{
                block: {
                  normal: ({children}) => <p>{children}</p>
                },
                marks: {
                  strong: ({children}) => <strong>{children}</strong>,
                  em: ({children}) => <em>{children}</em>,
                }
              }}
            />
          ) : (
            <>
              <p>Amanda Michelena is a creative director and consultant specializing in the intersection of culture, heritage, and nature. With a background forged between the London College of Fashion and the vibrant landscape of Latin America, she approaches brand building as a dialogue between archival depth and contemporary aesthetics. Her practice is built on a &quot;maker&quot; philosophy: the belief that the strongest creative visions are those informed by a rigorous understanding of how they are physically and strategically executed.</p>
              <p>Her perspective is deeply influenced by her Venezuelan roots and an obsession with still life as a narrative tool. Whether collaborating with Guajira artisans to redefine luxury craft or developing social-first frameworks for global fragrance houses, Amanda prioritizes cultural awareness as a driver for long-term relevance. This ability to translate heritage into elevated visual language has led her to manage complex productions and art direction across Europe and the US, bridging the gap between high-end digital content and tactile, botanical environments.</p>
              <p>Currently, she leads projects that demand a sharp, curated point of view—ranging from creative consultancy for emerging brands to large-scale production for industry leaders like Carolina Herrera, Sézane, and Louis Vuitton. By integrating a distinct botanical identity into her still life and spatial work, she creates immersive brand worlds that feel both grounded and aspirational.</p>
            </>
          )}
        </div>

        <div className="about-services">
          {(data?.disciplines || []).map((disc, i) => (
            <div className="about-service-item" key={disc._key || i}>
              {i === 0 ? (
                <h3 className="about-service-title">{disc.title}</h3>
              ) : (
                <h4 className="about-service-category">{disc.title}</h4>
              )}
              {disc.subtitle && <p className="about-service-subtitle">{disc.subtitle}</p>}
              {disc.description && <p className="about-service-description">{disc.description}</p>}
              {(disc.clientLists || []).map((cl, j) => (
                <div key={cl._key || j}>
                  <p className="about-service-label">{cl.label}:</p>
                  <p className="about-service-list">{cl.items}</p>
                </div>
              ))}
            </div>
          ))}

          <p className="about-closing-cta">{closingCta}</p>
          <div className="about-social-handles">
            {(data?.socialLinks || []).map((link, i) => (
              <p key={link._key || i}>
                {link.url ? (
                  <a href={link.url} target={link.url.startsWith('mailto:') ? undefined : '_blank'} rel="noreferrer">{link.label}</a>
                ) : (
                  link.label
                )}
              </p>
            ))}
          </div>
        </div>

      </div>

    </div>
  )
}

export default About
