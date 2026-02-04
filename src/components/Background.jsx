import { useEffect, useRef } from 'react'

// Store animation instance globally to prevent multiple instances
let backgroundAnimationInstance = null
let scriptsInitialized = false

function Background({ onLoadComplete, isActive = true }) {
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    // If animation already exists, just update active state
    // Don't call onLoadComplete - it will be called by the animation when model loads
    if (backgroundAnimationInstance) {
      if (window.BackgroundAnimation && backgroundAnimationInstance.setActive) {
        backgroundAnimationInstance.setActive(isActive)
      }
      return
    }

    // Check if scripts already loaded
    const scriptsLoaded = window.THREE && window.BackgroundAnimation

    if (scriptsLoaded && !backgroundAnimationInstance) {
      // Scripts loaded but no instance yet - create with callback
      backgroundAnimationInstance = new window.BackgroundAnimation(onLoadComplete)
      return
    }

    if (scriptsInitialized) {
      // Scripts are being loaded, wait for them
      return
    }

    scriptsInitialized = true

    // Load CSS particles for floating background effect (only once)
    if (!window.CSSParticles && !document.querySelector('script[src="/js/cssParticles.js"]')) {
      const particlesScript = document.createElement('script')
      particlesScript.src = '/js/cssParticles.js'
      document.body.appendChild(particlesScript)
    }

    // Load Three.js first
    if (!window.THREE) {
      const threeScript = document.createElement('script')
      threeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'
      threeScript.onload = loadPLYLoader
      document.head.appendChild(threeScript)
    } else {
      loadPLYLoader()
    }

    function loadPLYLoader() {
      if (!window.THREE.PLYLoader) {
        const plyScript = document.createElement('script')
        plyScript.src = '/js/PLYLoader.js'
        plyScript.onload = loadGUI
        document.body.appendChild(plyScript)
      } else {
        loadGUI()
      }
    }

    function loadGUI() {
      if (!window.dat) {
        const guiScript = document.createElement('script')
        guiScript.src = '/js/dat.gui.min.js'
        guiScript.onload = loadBackground
        document.body.appendChild(guiScript)
      } else {
        loadBackground()
      }
    }

    function loadBackground() {
      if (!window.BackgroundAnimation) {
        const bgScript = document.createElement('script')
        bgScript.src = '/js/background.js'
        bgScript.onload = () => {
          if (window.BackgroundAnimation && !backgroundAnimationInstance) {
            backgroundAnimationInstance = new window.BackgroundAnimation(onLoadComplete)
          }
        }
        document.body.appendChild(bgScript)
      } else if (!backgroundAnimationInstance) {
        backgroundAnimationInstance = new window.BackgroundAnimation(onLoadComplete)
      }
    }
  }, [onLoadComplete])

  // Update active state when isActive prop changes
  useEffect(() => {
    if (backgroundAnimationInstance && backgroundAnimationInstance.setActive) {
      backgroundAnimationInstance.setActive(isActive)
    }
  }, [isActive])

  return <canvas id="background-canvas" />
}

export default Background
