'use strict'

import path from 'path'
import fs from 'fs'

class Database {
  constructor (jsonFile, create) {
    let database = undefined
    let jsonPath = path.resolve(jsonFile)

    if (create) {
      try {
        fs.accessSync(jsonPath, fs.F_OK)
      } catch (err) {
        try {
          fs.writeFileSync(jsonPath, JSON.stringify({ }), 'utf8')
        } catch (err) {
          console.error("Unable to generate a database file at the provided path.")
          console.error(err)

          process.exit(1)
        }
      }
    }

    try {
      database = require(jsonPath)
    } catch (err) {
      console.error("The provided database file doesn't exist or is not valid JSON.")
      console.error(err)

      process.exit(1)
    }

    this.jsonPath = jsonPath
    this.database = database
  }

  getValue (key) {
    return this.database[key]
  }

  getKey (value) {
    for (let key in this.database) {
      let iterValue = this.database[key]

      if (iterValue === value) {
        return key
      }
    }

    return undefined
  }

  setKey (key, value) {
    this.database[key] = value
    this.save()

    return this
  }

  remKey (key) {
    return this.setKey(key, undefined)
  }

  async save () {
    try {
      await fs.writeFile(this.jsonPath, JSON.stringify(this.database, undefined, 2), 'utf8')
    } catch (err) {
      console.error("Unable to save a database file.")
      console.error(err)
    }
  }
}

export default Database
