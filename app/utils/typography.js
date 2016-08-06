import Typography from 'typography'
import moragaTheme from 'typography-theme-moraga'

moragaTheme.baseFontSize = '12px'
moragaTheme.baseLineHeight = '18px'
moragaTheme.modularScales[0].scale = 1.75

const typography = new Typography(moragaTheme)
typography.injectStyles()

export default typography
