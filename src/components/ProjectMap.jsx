import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/project-map.css'

const CATEGORY_LABELS = {
  'clients': 'Clients',
  'publications': 'Publications',
  'personal-work': 'Personal Work'
}

const CATEGORY_ORDER = ['clients', 'publications', 'personal-work']

function ProjectMap({ projects, isOpen, onClose, urlFor }) {
  const navigate = useNavigate()

  // Group projects by category
  const groupedProjects = CATEGORY_ORDER.reduce((acc, category) => {
    const categoryProjects = projects.filter(p => p.category === category)
    if (categoryProjects.length > 0) {
      acc[category] = categoryProjects
    }
    return acc
  }, {})

  const handleProjectClick = (slug) => {
    onClose()
    navigate(`/work/${slug}`)
  }

  // Prevent background scroll when map is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('overlay-open')
      document.body.style.overflow = 'hidden'
    } else {
      document.body.classList.remove('overlay-open')
      document.body.style.overflow = ''
    }
    return () => {
      document.body.classList.remove('overlay-open')
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="project-map-overlay" onClick={onClose}>
      <div className="project-map-dropdown" onClick={(e) => e.stopPropagation()}>
        <div className="project-map-header">
          <h2>Project Map</h2>
          <button className="project-map-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        
        <div className="project-map-content">
          {CATEGORY_ORDER.map(category => {
            const categoryProjects = groupedProjects[category]
            if (!categoryProjects || categoryProjects.length === 0) return null

            return (
              <div key={category} className="project-map-category">
                <h3 className="project-map-category-title">{CATEGORY_LABELS[category]}</h3>
                <div className="project-map-list">
                  {categoryProjects.map(project => (
                    <div
                      key={project._id}
                      className="project-map-item"
                      onClick={() => handleProjectClick(project.slug?.current)}
                    >
                      <span className="project-map-title">{project.title}</span>
                      <span className="project-map-role">{project.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default ProjectMap
