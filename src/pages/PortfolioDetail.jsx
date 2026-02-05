import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

const client = createClient({
  projectId: 'sy1y9q7w',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2024-01-01',
})

const builder = imageUrlBuilder(client)
const urlFor = (source) => builder.image(source)

function PortfolioDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProject() {
      const query = `*[_type == "portfolio" && slug.current == $slug][0] {
        _id,
        title,
        slug,
        category,
        "clientLogos": clientLogos[]{
          asset,
          crop,
          hotspot,
          alt
        },
        projectDescription,
        role,
        roleDescription,
        skills,
        metrics,
        location,
        campaignName,
        agency,
        mainMedia{
          mediaType,
          image{
            asset,
            crop,
            hotspot
          },
          "videoUrl": video.asset->url
        },
        "supportingMedia": supportingMedia[]{
          _type,
          asset,
          crop,
          hotspot,
          alt,
          "url": asset->url
        },
        order,
        featured
      }`
      
      try {
        const result = await client.fetch(query, { slug })
        setProject(result)
      } catch (error) {
        console.error('Error fetching project:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchProject()
  }, [slug])

  const getCategoryLabel = (category) => {
    const labels = {
      'social-media-content': 'Social Media Content',
      'editorials-publications': 'Editorials & Publications',
      'music-videos': 'Music Videos'
    }
    return labels[category] || category
  }

  if (loading) {
    return (
      <div className="portfolio-detail-page">
        <div className="portfolio-detail-loading">Loading project...</div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="portfolio-detail-page">
        <div className="portfolio-detail-error">
          <h2>Project not found</h2>
          <button onClick={() => navigate(-1)}>Back to Portfolio</button>
        </div>
      </div>
    )
  }

  return (
    <div className="portfolio-detail-page">
      <button className="back-button" onClick={() => navigate(-1)}>
        ← Back to Portfolio
      </button>

      <div className="portfolio-detail-header">
        <span className="portfolio-detail-category">{getCategoryLabel(project.category)}</span>
        <h1>{project.title}</h1>
        {project.clientLogos?.length > 0 && (
          <div className="portfolio-detail-logos">
            {project.clientLogos.map((logo, i) => (
              <img key={i} src={urlFor(logo).width(120).url()} alt={logo.alt || 'Client logo'} />
            ))}
          </div>
        )}
      </div>

      <div className="portfolio-detail-media">
        {project.mainMedia?.mediaType === 'video' && project.mainMedia?.videoUrl ? (
          <video src={project.mainMedia.videoUrl} controls autoPlay muted loop />
        ) : project.mainMedia?.image ? (
          <img src={urlFor(project.mainMedia.image).width(1400).url()} alt={project.title} />
        ) : null}
      </div>

      <div className="portfolio-detail-content">
        <div className="portfolio-detail-description">
          <h2>About the Project</h2>
          <p>{project.projectDescription}</p>
        </div>

        <div className="portfolio-detail-meta">
          <div className="portfolio-detail-role">
            <h3>Role</h3>
            <p className="role-title">{project.role}</p>
            {project.roleDescription && <p className="role-desc">{project.roleDescription}</p>}
          </div>

          {project.skills?.length > 0 && (
            <div className="portfolio-detail-skills">
              <h3>Skills & Tools</h3>
              <div className="skills-tags">
                {project.skills.map((skill, i) => (
                  <span key={i} className="skill-tag">{skill}</span>
                ))}
              </div>
            </div>
          )}

          {project.metrics?.length > 0 && (
            <div className="portfolio-detail-metrics">
              <h3>Results</h3>
              <div className="metrics-grid">
                {project.metrics.map((metric, i) => (
                  <div key={i} className="metric-item">
                    <span className="metric-value">{metric.value}</span>
                    <span className="metric-platform">{metric.platform}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(project.location || project.agency || project.campaignName) && (
            <div className="portfolio-detail-info">
              <h3>Details</h3>
              {project.location && <p><strong>Location:</strong> {project.location}</p>}
              {project.agency && <p><strong>Agency:</strong> {project.agency}</p>}
              {project.campaignName && <p><strong>Campaign:</strong> {project.campaignName}</p>}
            </div>
          )}
        </div>
      </div>

      {project.supportingMedia?.length > 0 && (
        <div className="portfolio-detail-gallery">
          <h2>Gallery</h2>
          <div className="gallery-grid">
            {project.supportingMedia.map((media, i) => (
              <div key={i} className="gallery-item">
                {media._type === 'image' ? (
                  <img src={urlFor(media).width(600).url()} alt={media.alt || `Gallery image ${i + 1}`} />
                ) : (
                  <video src={media.url} controls />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default PortfolioDetail
