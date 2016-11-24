'use strict'

import Listener from '../interfaces/listener'

class Ready extends Listener {
  async onEvent (bot, message) {
    await bot.user.setGame('v' + require('../../package.json').version)

    let size = bot.guilds.size
    console.log(`Connected to ${size} guild${size > 1 ? 's' : ''}.`)
  }
}

export default Ready
