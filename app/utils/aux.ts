export const isDev = () => !!import.meta.dev

const SVG_VIEWBOX = '0 0 100 100'
const SVG_TAG_START = '<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%22' + SVG_VIEWBOX + '%22>'
const SVG_TAG_END = '</svg>'

const SVG_TEXT_X = '-.1em'
const SVG_TEXT_Y = '.95em'
const SVG_TEXT_FONT_SIZE = '85'

const SVG_TEXT_TAG_START = '<text x=%22' + SVG_TEXT_X + '%22 y=%22' + SVG_TEXT_Y + '%22 font-size=%22' + SVG_TEXT_FONT_SIZE + '%22>'
const SVG_TEXT_TAG_END = '</text>'

export const buildSvgFavicon = (emoji: string) => {
  return 'data:image/svg+xml,' + SVG_TAG_START + SVG_TEXT_TAG_START + emoji + SVG_TEXT_TAG_END + SVG_TAG_END
}
