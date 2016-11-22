'use strict'

import discord from 'discord.js'
import GitHub from 'github'
import path from 'path'
import fs from 'fs'

import Database from './database'
import Logger from './logger'

import Listeners from './listeners'
import Commands from './commands'

import Message from './listeners/message'
import Ready from './listeners/ready'

import Changelog from './commands/changelog'
import Done from './commands/done'
import Help from './commands/help'
import Record from './commands/record'

class Bot extends discord.Client {
  constructor (opts) {
    super({
      fetchAllMembers: true
    })

    if (opts.mega) {
      this.mega = opts.mega
    }

    this.directory = path.join(process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'], '.' + require('../package.json').name)

    this.github = new GitHub({
      protocol: 'https',
      host: 'api.github.com',
      timeout: 5000,
      headers: {
        'user-agent': 'podcaster'
      }
    })

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
    this.listeners.register(new Ready())

    this.commands.register(new Changelog())
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
