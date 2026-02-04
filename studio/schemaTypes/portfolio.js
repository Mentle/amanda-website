export default {
  name: 'portfolio',
  title: 'Portfolio Projects',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Project Title',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: Rule => Rule.required()
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          {title: 'Social Media Content', value: 'social-media-content'},
          {title: 'Editorials & Publications', value: 'editorials-publications'},
          {title: 'Music Videos', value: 'music-videos'},
        ],
        layout: 'radio'
      },
      validation: Rule => Rule.required()
    },
    {
      name: 'clientLogos',
      title: 'Client Logo(s)',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {
            hotspot: true,
          },
          fields: [
            {
              name: 'alt',
              title: 'Alt Text',
              type: 'string',
            }
          ]
        }
      ],
      description: 'Optional - can add multiple client logos'
    },
    {
      name: 'projectDescription',
      title: 'Project Description',
      type: 'text',
      rows: 6,
      validation: Rule => Rule.required()
    },
    {
      name: 'role',
      title: 'Role',
      type: 'string',
      description: 'Short role title (e.g., "Creative & Art Director")',
      validation: Rule => Rule.required()
    },
    {
      name: 'roleDescription',
      title: 'Role Description',
      type: 'text',
      rows: 4,
      description: 'Detailed description of your role and responsibilities'
    },
    {
      name: 'skills',
      title: 'Skills & Tools Used',
      type: 'array',
      of: [{type: 'string'}],
      description: 'Add individual skills and tools (e.g., "Visual Direction", "Adobe Suite", "ChatGPT")'
    },
    {
      name: 'metrics',
      title: 'Metrics',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'platform',
              title: 'Platform',
              type: 'string',
              options: {
                list: [
                  {title: 'Instagram', value: 'instagram'},
                  {title: 'TikTok', value: 'tiktok'},
                  {title: 'YouTube', value: 'youtube'},
                  {title: 'Facebook', value: 'facebook'},
                  {title: 'LinkedIn', value: 'linkedin'},
                  {title: 'Twitter/X', value: 'twitter'},
                  {title: 'Views', value: 'views'},
                  {title: 'Other', value: 'other'},
                ]
              }
            },
            {
              name: 'value',
              title: 'Value',
              type: 'string',
              description: 'e.g., "2.5M", "102K"'
            }
          ],
          preview: {
            select: {
              platform: 'platform',
              value: 'value'
            },
            prepare({platform, value}) {
              return {
                title: `${platform}: ${value}`
              }
            }
          }
        }
      ]
    },
    {
      name: 'location',
      title: 'Location',
      type: 'string',
      description: 'Optional (e.g., "Barcelona, Spain")'
    },
    {
      name: 'campaignName',
      title: 'Campaign Name',
      type: 'string',
      description: 'Optional (e.g., "Summer 2023")'
    },
    {
      name: 'agency',
      title: 'Agency',
      type: 'string',
      description: 'Optional (e.g., "Dazzle Agency")'
    },
    {
      name: 'mainMedia',
      title: 'Main Image/Video/GIF',
      type: 'object',
      fields: [
        {
          name: 'mediaType',
          title: 'Media Type',
          type: 'string',
          options: {
            list: [
              {title: 'Image', value: 'image'},
              {title: 'Video', value: 'video'},
            ]
          }
        },
        {
          name: 'image',
          title: 'Image',
          type: 'image',
          options: {
            hotspot: true,
          },
          hidden: ({parent}) => parent?.mediaType !== 'image'
        },
        {
          name: 'video',
          title: 'Video',
          type: 'file',
          options: {
            accept: 'video/*'
          },
          hidden: ({parent}) => parent?.mediaType !== 'video'
        },
        {
          name: 'videoThumbnail',
          title: 'Video Thumbnail (Required for fast loading)',
          type: 'image',
          options: {
            hotspot: true,
          },
          description: 'Upload a thumbnail image for the video - this will be shown in the portfolio grid for fast loading',
          hidden: ({parent}) => parent?.mediaType !== 'video',
          validation: Rule => Rule.custom((thumbnail, context) => {
            const parent = context.parent;
            if (parent?.mediaType === 'video' && !thumbnail) {
              return 'Video thumbnail is required for fast portfolio loading';
            }
            return true;
          })
        }
      ],
      validation: Rule => Rule.required()
    },
    {
      name: 'supportingMedia',
      title: 'Supporting Images/Videos/GIFs',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {
            hotspot: true,
          },
          fields: [
            {
              name: 'alt',
              title: 'Alt Text',
              type: 'string',
            }
          ]
        },
        {
          type: 'file',
          options: {
            accept: 'video/*,image/gif'
          }
        }
      ]
    },
    {
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Lower numbers appear first',
      validation: Rule => Rule.required().min(0)
    },
    {
      name: 'featured',
      title: 'Featured Project',
      type: 'boolean',
      description: 'Show this project prominently',
      initialValue: false
    },
    {
      name: 'published',
      title: 'Published',
      type: 'boolean',
      description: 'Only published projects will appear on the website',
      initialValue: true
    }
  ],
  preview: {
    select: {
      title: 'title',
      category: 'category',
      role: 'role',
      mainMediaType: 'mainMedia.mediaType',
      mainImage: 'mainMedia.image',
      clientLogo: 'clientLogos.0'
    },
    prepare(selection) {
      const {title, category, role, mainImage, clientLogo} = selection
      return {
        title: title,
        subtitle: `${category || 'No category'} - ${role || 'No role'}`,
        media: clientLogo || mainImage
      }
    }
  },
  orderings: [
    {
      title: 'Display Order',
      name: 'orderAsc',
      by: [
        {field: 'order', direction: 'asc'}
      ]
    },
    {
      title: 'Year (Newest First)',
      name: 'yearDesc',
      by: [
        {field: 'year', direction: 'desc'}
      ]
    }
  ]
}
