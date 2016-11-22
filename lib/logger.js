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
      case this.LoggerType.BARE:
      default:
        break;
      case this.LoggerType.MESSAGE:
        emoji = ':notepad_spiral:'
        break
      case this.LoggerType.ANNOUNCE:
        emoji = ':mega:'
        break
      case this.LoggerType.ERROR:
        emoji = ':no_entry_sign:'
        break
    }

    return (emoji !== '' ? emoji + ' ' : emoji) + message
  }

  bare (message, channel, type = this.LoggerType.BARE) {
    if (channel) {
      channel = this.bot.resolver.resolveChannel(channel)

      if (channel.type === 'text') {
        channel.stopTyping(true)
        return channel.sendMessage(this.format(message, type)).catch(console.error)
      } else {
        return Promise.reject(new Error('Channel provided is not a text channel.'))
      }
    } else {
      return Promise.reject(new Error('No channel provided.'))
    }
  }

  message (message, channel) {
    return this.bare(message, channel, this.LoggerType.MESSAGE)
  }

  announce (message, channel) {
    return this.bare(message, channel, this.LoggerType.ANNOUNCE)
  }

  error (message, channel) {
    return this.bare(message, channel, this.LoggerType.ERROR)
  }
}

export default Logger
