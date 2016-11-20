'use strict'

import ffmpeg from 'fluent-ffmpeg'
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
            let homedir = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME']
            let stream = fs.createWriteStream(path.join(homedir, `${member.id}-${Date.now()}.mp3`))

            stream.on('error', console.error)

            ffmpeg(receiver.createPCMStream(member))
              .inputFormat('s32le')
              .format('s32le')
              .audioCodec('libmp3lame')
              .audioBitrate(320)
              .audioChannels(2)
              .audioFrequency(48000)
              .pipe(stream)
          }
        })
      } catch (err) {
        console.error(err)
      }
    }
  }
}

export default Record
