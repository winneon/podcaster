'use strict'

class Command {
  constructor (opts) {
    this.usage = opts.usage
    this.description = opts.description
    this.args = opts.args
  }

  onCommand (bot, message, args) { }
}

export default Command
