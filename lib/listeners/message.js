'use strict'

import Listener from '../interfaces/listener'

class Message extends Listener {
  onEvent (bot, message) {
    let text = message.content
    let lowered = text.toLowerCase()
    let mention = bot.user.toString()

    if ((lowered.startsWith('!') && lowered.length > 1) || (lowered.startsWith(mention) && lowered.length > mention.length + 1)) {
      let split = text.split(' ')

      if (split[0] === mention) {
        split.splice(0, 1)
      } else {
        split[0] = split[0].slice(1)
      }

      let command = split[0].toLowerCase()
      let args = split.slice(1)
      let commandList = bot.commands.list

      if (Object.keys(commandList).indexOf(command) > -1) {
        if (commandList[command].args <= args.length) {
          console.log(`Command: ${command}, User: ${message.author.username}#${message.author.discriminator}`)
          commandList[command].onCommand(bot, message, args)
        } else {
          logger.message('Usage: `!' + commandList[command].usage.replace('%CMD%', command) + '`', message.channel)
        }
      } else {
        logger.error('That command doesn\'t exist! Try running `!help` for a list of commands.', message.channel)
      }
    }
  }
}

export default Message
