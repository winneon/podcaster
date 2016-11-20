'use strict'

class Listeners {
  constructor (bot) {
    this.bot = bot
  }

  register (listener) {
    let simplified = listener.constructor.name
    let name = simplified.charAt(0).toLowerCase() + simplified.slice(1)

    this.bot.on(name, (...args) => {
      args.unshift(this.bot)
      listener.onEvent(...args)
    })
  }
}

export default Listeners
