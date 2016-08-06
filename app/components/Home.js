import React, { Component } from 'react'
import { Grid } from 'reflexbox'
import glob from 'glob'
import path from 'path'
import exif from 'simple-exiftool'
import _ from 'lodash'
import DatePicker from 'react-datepicker'
import moment from 'moment'
import Fuse from 'fuse.js'
import TextHighlight from './TextHighlight'

import { rhythm } from '../utils/typography'

require('react-datepicker/dist/react-datepicker.css')

const directory = '/Users/kylemathews/programs/gary-mathews/pages/chapters/'

const fuseOptions = {
  caseSensitive: false,
  shouldSort: true,
  tokenize: false,
  threshold: 0.2,
  location: 0,
  distance: 200,
  maxPatternLength: 32,
  keys: [
    'relative',
  ],
}

export default class Home extends Component {
  constructor () {
    super()
    this.state = {
      files: [],
      choosenFile: {
        relative: 'placeholder',
        absolute: 'http://techmeme.com/160805/i14.jpg',
      },
      query: '',
      search: new Fuse([], fuseOptions),
    }
  }
  componentDidMount () {
    glob(`${directory}**`, { nodir: true }, (err, files) => {
      let mappedFiles = files.map((filePath) => {
        const relativePath = path.relative(directory, filePath)
        if (relativePath === '..') {
          return {
            relative: '',
            absolute: filePath,
          }
        } else {
          return {
            relative: relativePath,
            absolute: filePath,
          }
        }
      })
      mappedFiles = mappedFiles.filter((file) => file.relative !== '')
      this.setState({
        files: mappedFiles,
        search: new Fuse(mappedFiles, fuseOptions)
      })
    })
  }
  render () {
    console.log(this.state.metadata)
    let filteredFiles
    if (this.state.query !== '') {
      filteredFiles = this.state.search.search(this.state.query)
    } else {
      filteredFiles = this.state.files
    }
    const fileItems = filteredFiles.map((file) => (
      <div
        onClick={() => {
          this.setState({
            choosenFile: file,
            metadata: {},
          })
          exif(file.absolute, (err, metadata) => this.setState({ metadata }))
        }}
        style={{
          cursor: 'pointer',
          marginBottom: rhythm(1/4),
        }}
      >
        <TextHighlight
          highlight={this.state.query}
          text={file.relative}
        />
      </div>)
    )
    return (
      <div>
        <Grid
          col={4}
          style={{
            padding: rhythm(1),
            paddingRight: `calc(${rhythm(1)} - 1px)`,
            borderRight: '1px solid gray',
            height: '100vh',
            overflow: 'auto',
          }}
        >
          <h1>Search</h1>
          <input
            type="search"
            style={{
              width: '100%',
              marginBottom: rhythm(1),
            }}
            value={this.state.query}
            onChange={(e) => this.setState({ query: e.target.value })}
          />
          {fileItems}
        </Grid>
        <Grid
          col={4}
          style={{
            borderRight: '1px solid gray',
            height: '100vh',
            padding: rhythm(1),
            paddingRight: `calc(${rhythm(1)} - 1px)`,
          }}
        >
          <h1>Preview</h1>
          <h3>File</h3>
          <p>{this.state.choosenFile.relative}</p>
          <img
            src={this.state.choosenFile.absolute}
            alt="preview"
          />
        </Grid>
        <Grid
          col={4}
          style={{
            height: '100vh',
            padding: rhythm(1),
          }}
        >
          <h1>Edit MetadataPreview</h1>
          <label
            style={{
              display: 'block',
              marginTop: rhythm(1/4),
              fontWeight: 'bold',
            }}
          >
            Caption
          </label>
          <textarea
            style={{
              width: '100%',
            }}
            value={_.get(this, 'state.metadata.Caption', '')}
          />
          <label
            style={{
              display: 'block',
              marginTop: rhythm(1/4),
              fontWeight: 'bold',
            }}
          >
            Date
          </label>
          <DatePicker
            style={{
              width: '100%',
            }}
            selected={moment(_.get(this, 'state.metadata.Date', ''), 'YYYY:MM:DD HH:mm:ssZZ')}
            onChange={(value) => console.log(value)}
          />
        </Grid>
      </div>
    )
  }
}
