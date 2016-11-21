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

  bare (message, channel) {
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

  message (message, channel, type = this.LoggerType.MESSAGE) {
    return this.bare(this.format(message, type), channel)
  }

  announce (message, channel) {
    return this.message(message, channel, this.LoggerType.ANNOUNCE)
  }

  error (message, channel) {
    return this.message(message, channel, this.LoggerType.ERROR)
  }
}

export default Logger
