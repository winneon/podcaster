'use strict'

import discord from 'discord.js'
import path from 'path'
import fs from 'fs'

import Database from './database'
import Logger from './logger'

import Listeners from './Listeners'
import Commands from './commands'

import Message from './listeners/message'

import Done from './commands/done'
import Help from './commands/help'
import Record from './commands/record'

class Bot extends discord.Client {
  constructor () {
    super()

    this.directory = path.join(process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'], '.' + require('../package.json').name)

    try {
      fs.accessSync(this.directory, fs.F_OK)
    } catch (err) {
      try {
        fs.mkdirSync(this.directory)
      } catch (err) {
        console.error("Unable to create the main directory.")
        console.error(err)

        process.exit(1)
      }
    }

    global.database = new Database('database.json', true)
    global.logger = new Logger(this)

    this.listeners = new Listeners(this)
    this.commands = new Commands(this)

    this.listeners.register(new Message())

    this.commands.register(new Done())
    this.commands.register(new Help())
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
