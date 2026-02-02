import { createClient } from 'https://cdn.skypack.dev/@sanity/client';
import imageUrlBuilder from 'https://cdn.skypack.dev/@sanity/image-url';

const client = createClient({
  projectId: 'sy1y9q7w',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2024-01-01',
});

const builder = imageUrlBuilder(client);

export function urlFor(source) {
  return builder.image(source);
}

export async function getPortfolioProjects() {
  const query = `*[_type == "portfolio" && published == true] | order(order asc) {
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
      alt
    },
    order,
    featured
  }`;
  
  try {
    const projects = await client.fetch(query);
    console.log('✅ Fetched projects from Sanity:', projects);
    return projects;
  } catch (error) {
    console.error('❌ Error fetching from Sanity:', error);
    return [];
  }
}

export default client;
