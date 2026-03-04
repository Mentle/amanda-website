export default {
  name: 'servicesPage',
  title: 'Services',
  type: 'document',
  icon: () => '⚙️',
  fields: [
    {
      name: 'pageTitle',
      title: 'Page Title',
      type: 'string',
      description: 'Heading at the top of the Services page.',
      initialValue: 'Services'
    },
    {
      name: 'services',
      title: 'Service List',
      type: 'array',
      description: 'Each service shown on the page. Numbers are assigned automatically from the order here — just drag to reorder.',
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
              name: 'description',
              title: 'Description',
              type: 'text',
              rows: 4,
              validation: Rule => Rule.required()
            }
          ],
          preview: {
            select: {title: 'title', subtitle: 'description'},
            prepare({title, subtitle}) {
              return {
                title,
                subtitle: subtitle?.substring(0, 80) + '…'
              }
            }
          }
        }
      ]
    },
    {
      name: 'tagline',
      title: 'Bottom Text',
      type: 'string',
      description: 'Italicised line shown below the service list.'
    },
    {
      name: 'sideImage',
      title: 'Side Image',
      type: 'image',
      options: {hotspot: true},
      description: 'Photo displayed in the right column.'
    }
  ],
  preview: {
    prepare() {
      return {title: 'Services'}
    }
  }
}
