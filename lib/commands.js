'use strict'

class Commands {
  constructor (bot) {
    this.bot = bot
    this.list = { }
  }

  register (command) {
    this.list[command.constructor.name.toLowerCase()] = command
  }
}

export default Commands
