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
          {title: 'Clients', value: 'clients'},
          {title: 'Publications', value: 'publications'},
          {title: 'Personal Work', value: 'personal-work'},
        ],
        layout: 'radio'
      },
      validation: Rule => Rule.required()
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
      mainImage: 'mainMedia.image'
    },
    prepare(selection) {
      const {title, category, role, mainImage} = selection
      return {
        title: title,
        subtitle: `${category || 'No category'} - ${role || 'No role'}`,
        media: mainImage
      }
    }
  }
}
