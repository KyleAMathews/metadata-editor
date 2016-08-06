import React from 'react'

export default class TextHighlight extends React.Component {
  mark (val='', str='', markTag='strong', caseSensitive=false) {
    const escape = val.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&')
    const tagStr = '<{tag}>$&</{tag}>'

    if (val.length === 0) {
      return str
    }

    return str.replace(
      RegExp(escape, caseSensitive ? 'g':'gi'),
      tagStr.replace(/{tag}/gi, markTag)
    )
  }

  render () {
    const highlightedText = this.mark(
      this.props.highlight,
      this.props.text,
    )
    return (
      <span
        className="TextHighlight"
        dangerouslySetInnerHTML={{ __html: highlightedText }}
      />
    )
  }
}

TextHighlight.propTypes = {
  highlight: React.PropTypes.string.isRequired,
  text: React.PropTypes.string.isRequired,
}

TextHighlight.defaultProps = {
  highlight: null,
  text: null,
}
