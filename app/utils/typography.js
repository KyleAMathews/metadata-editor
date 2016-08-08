import Typography from 'typography'
import moragaTheme from 'typography-theme-moraga'

moragaTheme.baseFontSize = '14px'
moragaTheme.baseLineHeight = '21px'
moragaTheme.modularScales[0].scale = 1.75

const typography = new Typography(moragaTheme)
typography.injectStyles()

export default typography
