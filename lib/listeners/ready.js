'use strict'

import Listener from '../interfaces/listener'

class Ready extends Listener {
  onEvent (bot, message) {
    bot.user.setGame('v' + require('../../package.json').version)
  }
}

export default Ready
