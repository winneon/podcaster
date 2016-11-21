'use strict'

class Logger {
  constructor (bot) {
    this.bot = bot

    this.LoggerType = {
      MESSAGE: 0,
      ANNOUNCE: 1,
      ERROR: 2
    }
  }

  format (message, type) {
    let emoji = ''

    switch (type) {
      case this.LoggerType.MESSAGE:
      default:
        emoji = ':notepad_spiral:'
        break
      case this.LoggerType.ANNOUNCE:
        emoji = ':mega:'
        break
      case this.LoggerType.ERROR:
        emoji = ':no_entry_sign:'
        break
    }

    return emoji + ' ' + message
  }

  bare (channel, message) {
    if (channel) {
      channel = this.bot.resolver.resolveChannel(channel)

      if (channel.type === 'text') {
        channel.stopTyping(true)
        return channel.sendMessage(message).catch(console.error)
      } else {
        return Promise.reject(new Error('Channel provided is not a text channel.'))
      }
    } else {
      return Promise.reject(new Error('No channel provided.'))
    }
  }

  message (channel, message, type = this.LoggerType.MESSAGE) {
    return this.bare(channel, this.format(message, type))
  }

  announce (channel, message) {
    return this.message(channel, message, this.LoggerType.ANNOUNCE)
  }

  error (channel, message) {
    return this.message(channel, message, this.LoggerType.ERROR)
  }
}

export default Logger