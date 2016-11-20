'use strict'

import discord from 'discord.js'
import Database from './database'

class Bot extends discord.Client {
  constructor () {
    super()

    global.database = new Database('database.json', true)
  }

  login (token) {
    console.log('Attempting to login.')

    return super.login(token)
      .then(token => console.log('Logged in.'))
      .catch((err) => {
        console.error('Unable to login. Wrong token?')
        console.error(err)

        process.exit(1)
      })
  }
}

export default Bot
