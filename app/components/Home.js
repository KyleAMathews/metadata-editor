import React, { Component } from 'react'
import { Grid } from 'reflexbox'
import glob from 'glob'
import path from 'path'
import exif from 'simple-exiftool'
import _ from 'lodash'
import DatePicker from 'react-datepicker'
import moment from 'moment'
import Fuse from 'fuse.js'
import exiftool from 'node-exiftool'

import TextHighlight from './TextHighlight'
import { rhythm } from '../utils/typography'

require('react-datepicker/dist/react-datepicker.css')

const ep = new exiftool.ExiftoolProcess('/usr/local/bin/exiftool')
ep.open()
.then((pid) => {
  console.log('Started exiftool process %s', pid)
})
.catch((err) => console.log('error starting exiftool process', err))

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

const exifDateFormat = 'YYYY:MM:DD HH:mm:ssZZ'

export default class Home extends Component {
  constructor () {
    super()
    this.state = {
      files: [],
      choosenFile: {
        relative: '',
        absolute: '',
      },
      query: '',
      search: new Fuse([], fuseOptions),
      metadata: {
        Caption: '',
        Date: moment().format(exifDateFormat),
      },
      message: '',
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
    console.log(this.state)
    // Search through files if query is set.
    let filteredFiles
    if (this.state.query !== '') {
      filteredFiles = this.state.search.search(this.state.query)
    } else {
      filteredFiles = this.state.files
    }

    // Create file elements for list.
    const fileItems = filteredFiles.map((file) => (
      <div
        onClick={() => {
          this.setState({
            choosenFile: file,
            message: null,
          })
          //exif(file.absolute, (err, metadata) => this.setState({ metadata }))
          ep.readMetadata(file.absolute).then((res) => {
            console.log('ep metadata', res)
            // Clean up metadata
            const metadata = {
              Caption: _.get(res, 'data[0].Caption', ''),
              Date: _.get(res, 'data[0].Date')
            }
            console.log(metadata)
            this.setState({ metadata })
          })
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
          col={3}
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
          col={5}
          style={{
            borderRight: '1px solid gray',
            height: '100vh',
            padding: rhythm(1),
            paddingRight: `calc(${rhythm(1)} - 1px)`,
            overflow: 'auto',
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
            overflow: 'auto',
          }}
        >
          <h1>Edit Metadata</h1>
          {(() => {
            if (this.state.message) {
              return (
                <div
                  style={{
                    marginBottom: rhythm(1),
                    padding: rhythm(1),
                    background: 'lightgreen',
                  }}
                >
                  {this.state.message}
                </div>
              )
            }
            return null
          })()}
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
            value={this.state.metadata.Caption}
            onChange={(e) => {
              console.log(e, e.target.value)
              const metadataClone = this.state.metadata
              this.setState({
                metadata: _.set(metadataClone, 'Caption', e.target.value, ''),
              })
            }}
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
            dateFormat="YYYY/MM/DD"
            selected={moment(this.state.metadata.Date, exifDateFormat)}
            onChange={(value) => {
              value.add(12, 'hours') // datepicker puts out date at midnight
              // in Greenwich Mean Time, this ensures we're somewhere in the middle of the day
              // for any events that happen in the US/South America.
              console.log('onChange datepicker', value, value.format(exifDateFormat))
              const metadataClone = this.state.metadata
              this.setState({
                metadata: _.set(metadataClone, 'Date', value.format(exifDateFormat)),
              })
            }}
          />
          <br />
          <br />
          <button
            onClick={() => {
              const args = []
              console.log(this.state.metadata)
              _.forEach(this.state.metadata, (v, k) => {
                switch (k) {
                  default:
                    args.push(`${k}=${v}`)
                }
              })
              console.log(args)
              //const toWrite = this.state.metadata.map((k,v) => console.log(k,v))
              ep._executeCommand(this.state.choosenFile.absolute, args).then((res) => {
                console.log('ep write response', res)
                if (res.error === '1 image files updated') {
                  this.setState({ message: 'Metadata saved' })
                }
              })

            }}
          >
            Save
          </button>
        </Grid>
      </div>
    )
  }
}
