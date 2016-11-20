'use strict'

import Command from '../interfaces/command'

class Record extends Command {
  constructor () {
    super({
      usage: '%CMD%',
      description: 'Start recording a session.',
      args: 0
    })
  }

  onCommand(bot, message, args) {
    console.log(args)
  }
}

export default Record
