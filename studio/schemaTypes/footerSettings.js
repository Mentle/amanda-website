export default {
  name: 'footerSettings',
  title: 'Footer',
  type: 'document',
  icon: () => '🔻',
  fields: [
    {
      name: 'copyrightText',
      title: 'Copyright Text',
      type: 'string',
      description: 'Name shown in the copyright line. The year is added automatically.',
      initialValue: 'Amanda Michelena'
    }
  ],
  preview: {
    prepare() {
      return {title: 'Footer'}
    }
  }
}
