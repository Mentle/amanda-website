export default {
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    {
      name: 'heroTitle',
      title: 'Hero Title',
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
      description: 'Large bold headline shown at the top of the hero section.'
    },
    {
      name: 'heroSubtitle',
      title: 'Hero Subtitle',
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
      description: 'Smaller body text shown below the title.'
    }
  ],
  preview: {
    prepare() {
      return { title: 'Site Settings' }
    }
  }
}
