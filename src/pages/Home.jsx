import { useState, useEffect, useRef } from 'react'
import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'
import InfiniteMenu from '../components/InfiniteMenu'
import '../styles/portfolio-filters.css'
import '../styles/home-portfolio.css'

const client = createClient({
  projectId: 'sy1y9q7w',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2024-01-01',
})

const builder = imageUrlBuilder(client)
const urlFor = (source) => builder.image(source)

function Home() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('all')
  const [formationProgress, setFormationProgress] = useState(0)
  const portfolioRef = useRef(null)

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

  // Fade in portfolio when orchid animation completes - use ref to avoid re-renders
  useEffect(() => {
    // ⬇️⬇️⬇️ EASY CONTROLS - Set fade timing for each screen size ⬇️⬇️⬇️
    const FADE_TIMING = {
      // 📱 MOBILE (0-768px) - Phone sizes
      mobile: {
        start: 0.5,   // When fade/fly-in STARTS
        end: 0.53     // When FULLY visible/formed
      },
      // 💻 TABLET (768-1024px) - iPad sizes
      tablet: {
        start: 0.5,
        end: 0.53
      },
      // 🖥️ DESKTOP (1024px+) - Laptop/Desktop sizes
      desktop: {
        start: 0.5,
        end: 0.53 
      }
    }
    // ⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️
    
    const handleScroll = () => {
      if (!portfolioRef.current) return
      
      // Detect current breakpoint
      const width = window.innerWidth
      let timing
      if (width < 768) {
        timing = FADE_TIMING.mobile
      } else if (width < 1024) {
        timing = FADE_TIMING.tablet
      } else {
        timing = FADE_TIMING.desktop
      }
      
      const FADE_START = timing.start
      const FADE_END = timing.end
      const scrollProgress = window.scrollY / window.innerHeight
      const duration = FADE_END - FADE_START
      let newOpacity = 0
      let newFormation = 0
      
      // Calculate opacity and formation based on scroll position
      if (scrollProgress >= FADE_END) {
        newOpacity = 1
        newFormation = 1
      } else if (scrollProgress > FADE_START) {
        const progress = (scrollProgress - FADE_START) / duration
        newOpacity = 1
        newFormation = progress
      } else {
        newOpacity = 0
        newFormation = 0
      }
      
      // Directly update DOM without React state for opacity
      portfolioRef.current.style.opacity = newOpacity
      portfolioRef.current.style.pointerEvents = newOpacity > 0 ? 'auto' : 'none'
      
      // Update formation progress (this triggers React state update for InfiniteMenu)
      setFormationProgress(newFormation)
      
      // Logging for scroll timeline
      let status = ''
      let breakpoint = ''
      if (width < 768) {
        breakpoint = '📱 MOBILE'
      } else if (width < 1024) {
        breakpoint = '💻 TABLET'
      } else {
        breakpoint = '🖥️ DESKTOP'
      }
      
      if (scrollProgress >= FADE_END) {
        status = '✅ FULLY VISIBLE & FORMED'
      } else if (scrollProgress > FADE_START) {
        status = '🔄 FADING IN & DISCS FLYING'
      } else {
        status = '👻 HIDDEN & SCATTERED'
      }
      console.log(`${breakpoint} (${width}px) | 📜 Scroll: ${(scrollProgress * 100).toFixed(1)}% | Opacity: ${newOpacity.toFixed(2)} | Formation: ${(newFormation * 100).toFixed(0)}% | ${status} | Range: ${(FADE_START * 100).toFixed(0)}-${(FADE_END * 100).toFixed(0)}%`)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Check initial state

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
    <>
      <section className="hero-section">
        <div className="hero-content">
          <div className="intro-text">
            <span className="greeting">¡Hola! </span>I am a Creative Producer for fashion and luxury. I spend most of my time researching, creating and sharing beautiful content related to my biggest obsessions: <em>Fashion, Food and Flowers</em>
          </div>
          <div className="social-links">
            <a href="mailto:amandamichelena@gmail.com" className="social-link">
              <i className="fas fa-envelope"></i>
            </a>
            <a href="https://instagram.com/amandamichelena" target="_blank" rel="noopener noreferrer" className="social-link">
              <i className="fab fa-instagram"></i>
            </a>
          </div>
          <div className="scroll-indicator">
            Scroll Down For More
            <div className="arrow-down">
              <i className="fas fa-chevron-down"></i>
            </div>
          </div>
        </div>
      </section>
      <div className="scroll-spacer"></div>
      
      {/* Portfolio section appears in white space after scroll */}
      {!loading && projects.length > 0 && (
        <section ref={portfolioRef} className="portfolio-section" style={{ opacity: 0, pointerEvents: 'none', willChange: 'opacity', transition: 'opacity 0.1s linear' }}>
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
          <div style={{ height: '100vh', width: '100%', position: 'relative' }}>
            <InfiniteMenu items={items} scale={3} formationProgress={formationProgress} />
          </div>
        </section>
      )}
    </>
  )
}

export default Home
