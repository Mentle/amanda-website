import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2024-01-01'}).withConfig({useCdn: false})

async function seed() {
  // 1. Copy heroTitle/heroSubtitle from existing siteSettings into homePage
  const existing = await client.fetch(`*[_type == "siteSettings" && _id == "siteSettings"][0]{ heroTitle, heroSubtitle }`)
  
  const homeDoc = {
    _id: 'homePage',
    _type: 'homePage',
    heroTitle: existing?.heroTitle || [],
    heroSubtitle: existing?.heroSubtitle || [],
    scrollText: 'Scroll Down For More'
  }

  // 2. Services page
  const servicesDoc = {
    _id: 'servicesPage',
    _type: 'servicesPage',
    pageTitle: 'Services',
    services: [
      {
        _key: 'svc1',
        _type: 'object',
        title: 'STRATEGY & CONSULTANCY',
        description: 'Building culturally aware foundations for brands that value long-term relevance. She specializes in translating Latin American heritage and archival research into elevated, global visual languages.'
      },
      {
        _key: 'svc2',
        _type: 'object',
        title: 'CREATIVE DIRECTION & STILL LIFE',
        description: 'Leading the visual vision through sharp aesthetics and a curated point of view. She treats still life as a narrative tool, using objects and nature to build sophisticated brand worlds for editorial and social-first campaigns.'
      },
      {
        _key: 'svc3',
        _type: 'object',
        title: 'PRODUCTION',
        description: 'Translating ambitious concepts into reality through end-to-end execution. She manages logistics, talent, and workflows across Europe and the US to ensure a seamless delivery from idea to final asset.'
      }
    ],
    tagline: 'Collaborating with teams worldwide in English and Spanish.'
  }

  // 3. About page
  const aboutDoc = {
    _id: 'aboutPage',
    _type: 'aboutPage',
    name: 'Amanda Michelena',
    subtitle: 'Creative Director & Consultant',
    bio: [
      {
        _key: 'bio1',
        _type: 'block',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _key: 'bio1c',
            _type: 'span',
            marks: [],
            text: 'Amanda Michelena is a creative director and consultant specializing in the intersection of culture, heritage, and nature. With a background forged between the London College of Fashion and the vibrant landscape of Latin America, she approaches brand building as a dialogue between archival depth and contemporary aesthetics. Her practice is built on a "maker" philosophy: the belief that the strongest creative visions are those informed by a rigorous understanding of how they are physically and strategically executed.'
          }
        ]
      },
      {
        _key: 'bio2',
        _type: 'block',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _key: 'bio2c',
            _type: 'span',
            marks: [],
            text: 'Her perspective is deeply influenced by her Venezuelan roots and an obsession with still life as a narrative tool. Whether collaborating with Guajira artisans to redefine luxury craft or developing social-first frameworks for global fragrance houses, Amanda prioritizes cultural awareness as a driver for long-term relevance. This ability to translate heritage into elevated visual language has led her to manage complex productions and art direction across Europe and the US, bridging the gap between high-end digital content and tactile, botanical environments.'
          }
        ]
      },
      {
        _key: 'bio3',
        _type: 'block',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _key: 'bio3c',
            _type: 'span',
            marks: [],
            text: 'Currently, she leads projects that demand a sharp, curated point of view—ranging from creative consultancy for emerging brands to large-scale production for industry leaders like Carolina Herrera, Sézane, and Louis Vuitton. By integrating a distinct botanical identity into her still life and spatial work, she creates immersive brand worlds that feel both grounded and aspirational.'
          }
        ]
      }
    ],
    imageCaption: 'Based between London and Barcelona — working globally.',
    disciplines: [
      {
        _key: 'disc1',
        _type: 'object',
        title: 'Creative direction & consultancy',
        subtitle: 'Based in Barcelona. Working Worldwide.',
        description: 'Crafting emotionally resonant, concept-driven visuals. With a background in fashion and spatial storytelling, Amanda builds campaigns, installations, branded content & experiences where aesthetic precision meets botanical expression.',
        clientLists: []
      },
      {
        _key: 'disc2',
        _type: 'object',
        title: 'Fashion & Creative Direction',
        subtitle: '',
        description: '',
        clientLists: [
          {
            _key: 'cl1',
            _type: 'object',
            label: 'Clients & Collaborators',
            items: 'Carolina Herrera x Andrea Cuervo, Zara, Desigual, Sony Music UK, Sita Abellán, Olivia Palermo, Massimo Dutti, Sezane, Self-Portrait, Adolfo Dominguez, Barcelona Bridal Fashion Week.'
          },
          {
            _key: 'cl2',
            _type: 'object',
            label: 'Featured in',
            items: '(check publication list)'
          }
        ]
      },
      {
        _key: 'disc3',
        _type: 'object',
        title: 'Botanical Installations & Floral Artistry',
        subtitle: '',
        description: '',
        clientLists: [
          {
            _key: 'cl3',
            _type: 'object',
            label: 'Selected Projects & Collaborations',
            items: 'Louis Vuitton, Audemars Piguet, Zimmermann, Mandarin Oriental Hotel, Edition Hotel, Le Méridien, World Trade Center, Pedralbes Monastery, Marès Museum, Born Cultural Center.'
          }
        ]
      }
    ],
    closingCta: "Let's create something timeless.",
    socialLinks: [
      { _key: 'sl1', _type: 'object', label: '@amandamichelena', url: 'https://www.instagram.com/amandamichelena' },
      { _key: 'sl2', _type: 'object', label: '@theamandamichelena', url: 'https://www.instagram.com/theamandamichelena' },
      { _key: 'sl3', _type: 'object', label: 'amandamichelena', url: 'mailto:amandamichelena@example.com' }
    ]
  }

  // 4. Footer
  const footerDoc = {
    _id: 'footerSettings',
    _type: 'footerSettings',
    copyrightText: 'Amanda Michelena'
  }

  console.log('Seeding homePage...')
  await client.createOrReplace(homeDoc)
  
  console.log('Seeding servicesPage...')
  await client.createOrReplace(servicesDoc)
  
  console.log('Seeding aboutPage...')
  await client.createOrReplace(aboutDoc)
  
  console.log('Seeding footerSettings...')
  await client.createOrReplace(footerDoc)

  console.log('✅ All documents seeded successfully!')
}

seed().catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})
