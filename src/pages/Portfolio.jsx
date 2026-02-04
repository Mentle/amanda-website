import { useState, useEffect } from 'react'
import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'
import InfiniteMenu from '../components/InfiniteMenu'
import '../styles/portfolio-filters.css'

const client = createClient({
  projectId: 'sy1y9q7w',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2024-01-01',
})

const builder = imageUrlBuilder(client)
const urlFor = (source) => builder.image(source)

function Portfolio() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('all')

  useEffect(() => {
    async function fetchProjects() {
      const query = `*[_type == "portfolio" && published == true] | order(order asc) {
        _id,
        title,
        slug,
        category,
        projectDescription,
        role,
        mainMedia{
          mediaType,
          image{
            asset,
            crop,
            hotspot
          },
          "videoUrl": video.asset->url,
          videoThumbnail{
            asset,
            crop,
            hotspot
          }
        },
        order,
        featured
      }`
      
      try {
        const result = await client.fetch(query)
        setProjects(result)
      } catch (error) {
        console.error('Error fetching projects:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchProjects()
  }, [])

  // Don't show loading state to avoid flash - InfiniteMenu will handle empty state
  if (loading || projects.length === 0) {
    // Return empty container while loading
    return <div style={{ height: '100vh', width: '100%', position: 'relative' }}></div>
  }

  // Filter projects based on active filter (media type)
  const filteredProjects = activeFilter === 'all' 
    ? projects 
    : projects.filter(project => project.mainMedia?.mediaType === activeFilter);

  const items = filteredProjects.map(project => {
    let imageUrl = null;
    
    // Handle image type
    if (project.mainMedia?.mediaType === 'image' && project.mainMedia?.image?.asset) {
      imageUrl = urlFor(project.mainMedia.image).width(300).height(300).url();
    }
    // Handle video type - use thumbnail if available, otherwise skip
    else if (project.mainMedia?.mediaType === 'video' && project.mainMedia?.videoThumbnail?.asset) {
      imageUrl = urlFor(project.mainMedia.videoThumbnail).width(300).height(300).url();
    }

    return {
      image: imageUrl,
      link: `/portfolio/${project.slug?.current || project._id}`,
      title: project.title,
      description: project.role || project.projectDescription?.substring(0, 50) || '',
      isVideo: project.mainMedia?.mediaType === 'video'
    };
  }).filter(item => item.image !== null);

  const filters = [
    { label: 'All', value: 'all' },
    { label: 'Images', value: 'image' },
    { label: 'Videos', value: 'video' }
  ];

  return (
    <div style={{ height: '100vh', width: '100%', position: 'relative' }}>
      <div className="portfolio-filters">
        {filters.map(filter => (
          <button
            key={filter.value}
            className={`filter-button ${activeFilter === filter.value ? 'active' : ''}`}
            onClick={() => setActiveFilter(filter.value)}
          >
            {filter.label}
          </button>
        ))}
      </div>
      <InfiniteMenu items={items} scale={3} />
    </div>
  )
}

export default Portfolio
