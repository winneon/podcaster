'use strict'

import path from 'path'
import fs from 'fs'

import Command from '../interfaces/command'

class Record extends Command {
  constructor () {
    super({
      usage: '%CMD%',
      description: 'Start recording a session.',
      args: 0
    })
  }

  async onCommand(bot, message, args) {
    let channels = message.guild.channels.filter((channel) => {
      if (channel.type === 'voice' && channel.members.size > 0) {
        return channel.members.filter(member => member.id === message.author.id).size > 0
      }
    })

    if (channels.size > 0){
      try {
        let channel = channels.values().next().value
        let connection = await channel.join()
        let receiver = connection.createReceiver()

        connection.on('speaking', (member, speaking) => {
          if (speaking) {
            let audio = receiver.createPCMStream(member)

            let homedir = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME']
            let output = fs.createWriteStream(path.join(homedir, `${member.id}-${Date.now()}.pcm`))

            audio.pipe(output)
          }
        })
      } catch (err) {
        console.error(err)
      }
    }
  }
}

export default Record
