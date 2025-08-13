const PRODUCTION_URL = 'https://life-visualizer.netlify.app/'
const THUMBNAIL_URL = '/thumbnail.jpg'

export const useAppSeoConfig = (faviconEmoji = '⌛') => {
  const appTitle = 'Life Visualizer'
  const appDescription = 'Little project to visualize your whole life like a Github contributions heatmap'

  const faviconSvgHref = buildSvgFavicon(isDev() ? '⚠️' : faviconEmoji)

  const faviconLink = {
    rel: 'icon',
    href: isDev() ? faviconSvgHref : '/favicon.svg',
  }
  const titleTemplate = (pageTitle?: string) => pageTitle ? `${appTitle} - ${pageTitle}` : appTitle
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
