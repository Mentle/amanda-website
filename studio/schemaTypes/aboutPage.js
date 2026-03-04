export default {
  name: 'aboutPage',
  title: 'About',
  type: 'document',
  icon: () => '👤',
  fields: [
    {
      name: 'name',
      title: 'Name',
      type: 'string',
      description: 'Displayed as the large heading on the About page.',
      initialValue: 'Amanda Michelena'
    },
    {
      name: 'subtitle',
      title: 'Subtitle',
      type: 'string',
      description: 'Shown directly below the name.',
      initialValue: 'Creative Director & Consultant'
    },
    {
      name: 'bio',
      title: 'Bio',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [{title: 'Normal', value: 'normal'}],
          lists: [],
          marks: {
            decorators: [
              {title: 'Bold', value: 'strong'},
              {title: 'Italic', value: 'em'},
            ],
            annotations: []
          }
        }
      ],
      description: 'The main biography text. Each paragraph becomes a separate block.'
    },
    {
      name: 'profileImage',
      title: 'Profile Photo',
      type: 'image',
      options: {hotspot: true},
      description: 'Photo shown in the left column.'
    },
    {
      name: 'imageCaption',
      title: 'Image Caption',
      type: 'string',
      description: 'Text overlaid at the bottom of the profile photo.',
      initialValue: 'Based between London and Barcelona — working globally.'
    },
    {
      name: 'disciplines',
      title: 'Disciplines',
      type: 'array',
      description: 'Your areas of expertise. Each discipline can have an optional description and any number of client/credit lists.',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'title',
              title: 'Title',
              type: 'string',
              validation: Rule => Rule.required()
            },
            {
              name: 'subtitle',
              title: 'Subtitle',
              type: 'string',
              description: 'Optional — e.g. "Based in Barcelona. Working Worldwide."'
            },
            {
              name: 'description',
              title: 'Description',
              type: 'text',
              rows: 4,
              description: 'Optional longer description of this discipline.'
            },
            {
              name: 'clientLists',
              title: 'Client & Credit Lists',
              type: 'array',
              description: 'Add as many named lists as you need (e.g. "Clients & Collaborators", "Featured in").',
              of: [
                {
                  type: 'object',
                  fields: [
                    {
                      name: 'label',
                      title: 'Label',
                      type: 'string',
                      description: 'e.g. "Clients & Collaborators" or "Featured in"',
                      validation: Rule => Rule.required()
                    },
                    {
                      name: 'items',
                      title: 'Names',
                      type: 'text',
                      rows: 3,
                      description: 'Comma-separated list of names.',
                      validation: Rule => Rule.required()
                    }
                  ],
                  preview: {
                    select: {title: 'label', subtitle: 'items'},
                    prepare({title, subtitle}) {
                      return {
                        title,
                        subtitle: subtitle?.substring(0, 60) + '…'
                      }
                    }
                  }
                }
              ]
            }
          ],
          preview: {
            select: {title: 'title', subtitle: 'subtitle'},
            prepare({title, subtitle}) {
              return {title, subtitle: subtitle || ''}
            }
          }
        }
      ]
    },
    {
      name: 'closingCta',
      title: 'Closing Line',
      type: 'string',
      description: 'Call-to-action text shown after the disciplines.',
      initialValue: "Let's create something timeless."
    },
    {
      name: 'socialLinks',
      title: 'Social Links',
      type: 'array',
      description: 'Social handles and contact links. Leave URL empty to display as plain text.',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'label',
              title: 'Label',
              type: 'string',
              description: 'What visitors see (e.g. "@amandamichelena" or an email address).',
              validation: Rule => Rule.required()
            },
            {
              name: 'url',
              title: 'URL',
              type: 'url',
              description: 'Optional link. Leave empty if this is just display text.',
              validation: Rule => Rule.uri({
                allowRelative: true,
                scheme: ['http', 'https', 'mailto', 'tel']
              })
            }
          ],
          preview: {
            select: {title: 'label', subtitle: 'url'},
            prepare({title, subtitle}) {
              return {title, subtitle: subtitle || 'No link'}
            }
          }
        }
      ]
    }
  ],
  preview: {
    prepare() {
      return {title: 'About'}
    }
  }
}
