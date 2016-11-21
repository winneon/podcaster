'use strict'

import Command from '../interfaces/command'

class Help extends Command {
  constructor () {
    super({
      usage: '%CMD%',
      description: 'Display help info.',
      args: 0
    })
  }

  onCommand (bot, message, args) {
    let jsonPackage = require('../../package.json')
    let contents = jsonPackage.name + ', running version ' + jsonPackage.version + '\n\n'

    for (let command in bot.commands.list) {
      let obj = bot.commands.list[command]

      contents = contents + obj.usage.replace('%CMD%', '!' + command) + '\n'
      contents = contents + '  ' + obj.description + '\n\n'
    }

    logger.bare('```' + contents + '```', message.channel)
  }
}

export default Help
