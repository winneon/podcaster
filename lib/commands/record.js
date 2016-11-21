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

  async onCommand (bot, message, args) {
    let channels = message.guild.channels.filter((channel) => {
      if (channel.type === 'voice' && channel.members.size > 0) {
        return channel.members.filter(member => member.id === message.author.id).size > 0
      }
    })

    if (channels.size > 0){
      try {
        let channel = channels.values().next().value
        let sent = await logger.announce('Loading...', message.channel)
        let connection = await channel.join()
        let fetched = await message.channel.fetchMessage(sent.id)

        fetched.edit(logger.format('Ready and recording.', logger.LoggerType.ANNOUNCE))

        let receiver = connection.createReceiver()

        connection.on('speaking', (member, speaking) => {
          let timecode = Date.now()
          console.log(timecode)

          if (speaking) {
            let memberDir = path.join(bot.directory, member.id)

            try {
              fs.accessSync(memberDir, fs.F_OK)
            } catch (err) {
              try {
                fs.mkdirSync(memberDir)
              } catch (err) {
                console.error("Unable to create a member directory.")
                console.error(err)

                return
              }
            }

            let stream = fs.createWriteStream(path.join(memberDir, `${timecode}.mp3`))
            stream.on('error', console.error)

            ffmpeg(receiver.createPCMStream(member))
              .inputFormat('s32le')
              .format('mp3')
              .audioCodec('libmp3lame')
              .audioBitrate(320)
              .audioChannels(2)
              .audioFrequency(48000)
              .audioFilters('asetrate=r=48K')
              .pipe(stream)
          }
        })
      } catch (err) {
        console.error(err)
        logger.bare('```' + err + '```', message.channel)
      }
    } else {
      logger.error('You\'re not in a voice channel!', message.channel)
    }
  }
}

export default Record
