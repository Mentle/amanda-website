export default {
  name: 'homePage',
  title: 'Home',
  type: 'document',
  icon: () => '🏠',
  fields: [
    {
      name: 'heroTitle',
      title: 'Hero Heading',
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
      description: 'The large intro text visitors see first on the homepage.'
    },
    {
      name: 'heroSubtitle',
      title: 'Hero Subtext',
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
      description: 'Smaller body text shown below the heading.'
    },
    {
      name: 'scrollText',
      title: 'Scroll Prompt',
      type: 'string',
      description: 'Text shown above the scroll arrow (e.g. "Scroll Down For More").',
      initialValue: 'Scroll Down For More'
    }
  ],
  preview: {
    prepare() {
      return {title: 'Home'}
    }
  }
}
