const PRODUCTION_URL = 'https://life-visualizer.netlify.app/'
const THUMBNAIL_URL = '/thumbnail.jpg'

export const useAppSeoConfig = (faviconEmoji = '⌛') => {
  const appTitle = 'Life Visualizer'
  const appDescription = 'Little project to visualize your whole life like a Github contributions heatmap'
  const faviconLink = {
    rel: 'icon',
    href: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2296%22>' + faviconEmoji + '</text></svg>',
  }
  const titleTemplate = (pageTitle: string | undefined) => pageTitle ? `${appTitle} - ${pageTitle}` : appTitle
  const imageUrl = (process.env.URL || '') + THUMBNAIL_URL

  const seoMeta = {
    ogTitle: appTitle,
    ogDescription: appDescription,
    ogUrl: PRODUCTION_URL,
    twitterTitle: appTitle,
    twitterDescription: appDescription,
    twitterImage: imageUrl,
    ogImage: imageUrl,
  }

  return {
    appTitle,
    appDescription,
    faviconLink,
    titleTemplate,
    seoMeta,
  }
}
