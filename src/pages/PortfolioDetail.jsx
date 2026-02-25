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
  const [heroLoaded, setHeroLoaded] = useState(false)

  const getImageAspect = (project) => {
    // Parse dimensions from Sanity _ref: "image-xxxx-WxH-ext"
    const ref = project?.mainMedia?.image?.asset?._ref || ''
    const match = ref.match(/-([0-9]+)x([0-9]+)-/)
    if (!match) return 'landscape'
    const ratio = parseInt(match[1]) / parseInt(match[2])
    if (ratio < 0.85) return 'portrait'
    if (ratio < 1.2) return 'square'
    return 'landscape'
  }

  useEffect(() => {
    async function fetchProject() {
      const query = `*[_type == "portfolio" && slug.current == $slug][0] {
        _id,
        title,
        slug,
        category,
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

      {/* Top nav bar */}
      <div className="portfolio-detail-topbar">
        <button className="back-button" onClick={() => navigate(-1)}>← Work</button>
        <span className="portfolio-detail-category">{getCategoryLabel(project.category)}</span>
      </div>

      {/* Hero + info */}
      <div className="portfolio-detail-main" data-aspect={getImageAspect(project)}>
        <div className={`portfolio-detail-hero-image ${heroLoaded ? 'hero-loaded' : ''}`}>
          {project.mainMedia?.mediaType === 'video' && project.mainMedia?.videoUrl ? (
            <video
              src={project.mainMedia.videoUrl}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              onCanPlay={() => setHeroLoaded(true)}
            />
          ) : project.mainMedia?.image ? (
            <img
              src={urlFor(project.mainMedia.image).width(1200).format('webp').quality(85).url()}
              alt={project.title}
              onLoad={() => setHeroLoaded(true)}
            />
          ) : null}
        </div>

        <div className="portfolio-detail-hero-info">
          <div className="portfolio-detail-hero-info-top">
            <h1>{project.title}</h1>
            <p className="portfolio-detail-role-inline">{project.role}</p>
          </div>

          <div className="portfolio-detail-hero-info-body">
            <p className="portfolio-detail-desc-text">{project.projectDescription}</p>
            {project.roleDescription && <p className="role-desc">{project.roleDescription}</p>}
          </div>

          <div className="portfolio-detail-hero-info-meta">
            {project.skills?.length > 0 && (
              <div className="portfolio-detail-meta-block">
                <h3>Skills & Tools</h3>
                <div className="skills-tags">
                  {project.skills.map((skill, i) => (
                    <span key={i} className="skill-tag">{skill}</span>
                  ))}
                </div>
              </div>
            )}

            {project.metrics?.length > 0 && (
              <div className="portfolio-detail-meta-block">
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
              <div className="portfolio-detail-meta-block">
                {project.location && (
                  <div className="detail-row">
                    <span className="detail-label">Location</span>
                    <span className="detail-value">{project.location}</span>
                  </div>
                )}
                {project.agency && (
                  <div className="detail-row">
                    <span className="detail-label">Agency</span>
                    <span className="detail-value">{project.agency}</span>
                  </div>
                )}
                {project.campaignName && (
                  <div className="detail-row">
                    <span className="detail-label">Campaign</span>
                    <span className="detail-value">{project.campaignName}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {project.supportingMedia?.length > 0 && (
        <div className="portfolio-detail-gallery">
          <div className="gallery-masonry">
            {project.supportingMedia.map((media, i) => (
              <div key={i} className="gallery-item">
                {media._type === 'image' ? (
                  <img src={urlFor(media).width(900).url()} alt={media.alt || `Gallery image ${i + 1}`} />
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
