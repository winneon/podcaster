'use strict'

import Listener from '../interfaces/listener'

class Message extends Listener {
  onEvent(bot, message) {
    let text = message.content

    if (text.toLowerCase().startsWith('!') && text.length > 1) {
      let split = text.split(' ')
      let command = split[0].slice(1).toLowerCase()
      let args = split.slice(1)
      let commandList = bot.commands.list

      if (Object.keys(commandList).indexOf(command) > -1) {
        if (commandList[command].args <= args.length) {
          commandList[command].onCommand(bot, message, args)
        } else {
          // TODO: usage call
        }
      } else {
        // TODO: invalid command call
      }
    }
  }
}

export default Message
