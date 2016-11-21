'use strict'

import discord from 'discord.js'

import Database from './database'
import Logger from './logger'

import Listeners from './Listeners'
import Commands from './commands'

import Message from './listeners/message'

import Record from './commands/record'

class Bot extends discord.Client {
  constructor () {
    super()

    global.database = new Database('database.json', true)
    global.logger = new Logger(this)

    this.listeners = new Listeners(this)
    this.commands = new Commands(this)

    this.listeners.register(new Message())

    this.commands.register(new Record())
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
