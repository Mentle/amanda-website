import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'sy1y9q7w',
    dataset: 'production'
  },
  deployment: {
    appId: 'zke3wv9bv5ugu1dvgjdvh91a',
    /**
     * Enable auto-updates for studios.
     * Learn more at https://www.sanity.io/docs/cli#auto-updates
     */
    autoUpdates: true,
  }
})
