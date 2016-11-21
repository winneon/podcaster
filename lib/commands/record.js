'use strict'

import ffmpeg from 'fluent-ffmpeg'
import rmdir from 'rmdir'
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

    let connections = bot.voiceConnections.filter(connection => connection.channel.guild.id === message.guild.id)

    if (connections.size > 0) {
      logger.error('I\'m already recording or currently processing.', message.channel)
    } else if (channels.size > 0) {
      try {
        let guildDirectory = path.join(bot.directory, message.guild.id)

        try {
          fs.accessSync(guildDirectory, fs.F_OK)
        } catch (err) {
          try {
            fs.mkdirSync(guildDirectory)
          } catch (err) {
            console.error("Unable to create a guild directory.")
            console.error(err)

            return
          }
        }

        let directories = fs.readdirSync(guildDirectory)

        try {
          for (let directory of directories) {
            await rmdir(path.join(guildDirectory, directory))
          }
        } catch (err) {
          console.error('Unable to remove existing files.')
          console.error(err)

          return
        }

        let channel = channels.values().next().value
        let sent = await logger.announce('Loading...', message.channel)
        let connection = await channel.join()

        sent.edit(logger.format('Ready and recording.', logger.LoggerType.ANNOUNCE))
        database.setKey(message.guild.id + '_start', Date.now())

        let receiver = connection.createReceiver()

        connection.on('speaking', (member, speaking) => {
          let timecode = Date.now()

          if (speaking) {
            let memberDir = path.join(guildDirectory, member.id)

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
