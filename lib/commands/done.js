'use strict'

import ffmpeg from 'fluent-ffmpeg'
import ASYNC from 'async'
import archiver from 'archiver'
import path from 'path'
import fs from 'fs'
import { exec } from 'child_process'

import Command from '../interfaces/command'

class Done extends Command {
  constructor () {
    super({
      usage: '%CMD%',
      description: 'Stop recording and process the recorded data.',
      args: 0
    })
  }

  async onCommand (bot, message, args) {
    let connections = bot.voiceConnections.filter(connection => connection.channel.guild.id === message.guild.id)

    if (connections.size > 0) {
      let connection = connections.values().next().value
      let speaking = connection.channel.members.filter(member => member.speaking)

      if (speaking.size > 0) {
        logger.error('Someone is talking right now, which means I\'m unable to stop recording. Sorry :cry:', message.channel)
        return
      }

      let guildDirectory = path.join(bot.directory, message.guild.id)
      let memberDirs = fs.readdirSync(guildDirectory).filter(file => fs.statSync(path.join(guildDirectory, file)).isDirectory())

      let processMessage = await logger.announce('`[1/3]` Processing...', message.channel)
      let lowestTimecode = undefined;

      ASYNC.eachSeries(memberDirs, (directory, callbackMain) => {
        let fullDir = path.join(guildDirectory, directory)
        let filledDir = path.join(fullDir, 'filled')

        try {
          fs.mkdirSync(filledDir)
        } catch (err) {
          console.error("Unable to create a filled directory.")
          console.error(err)

          callbackMain(err)
        }

        let files = fs.readdirSync(fullDir).filter(file => fs.statSync(path.join(fullDir, file)).isFile())

        ASYNC.eachOfSeries(files, (currentTimecode, index, callbackSecondary) => {
          let previousTimecode = undefined;
          let extLength = path.extname(files[index]).length

          if (index > 0) {
            previousTimecode = files[index - 1]
            previousTimecode = previousTimecode.substring(0, previousTimecode.length - extLength)
          } else {
            previousTimecode = database.getValue(message.guild.id + '_start')
          }

          currentTimecode = currentTimecode.substring(0, currentTimecode.length - extLength)

          exec('ffmpeg -f lavfi -i anullsrc -t ' + ((currentTimecode - previousTimecode) / 2000) + ' -c:a libmp3lame -ar 48000 -ac 2 ' + path.join(filledDir, index + '.mp3'), (err, stdout, stderr) => callbackSecondary(err))
        }, (err) => {
          if (err) {
            console.error(err)
          }

          let filledFiles = fs.readdirSync(filledDir).filter(file => fs.statSync(path.join(filledDir, file)).isFile())
          let cmd = ffmpeg()

          for (let index in files) {
            let file = files[index]
            let filledFile = filledFiles[index]

            cmd = cmd
              .input(path.join(filledDir, filledFile))
              .input(path.join(fullDir, file))
          }

          let member = message.guild.members.get(directory).user

          cmd
            .on('end', callbackMain)
            .on('error', callbackMain)
            .mergeToFile(path.join(guildDirectory, member.username + '#' + member.discriminator + '.mp3'), path.join(fullDir, 'tmp'))
        })
      }, (err) => {
        if (err) {
          console.error(err)
        }

        processMessage.edit(logger.format('`[2/3]` Zipping the audio files...', logger.LoggerType.ANNOUNCE)).then((message) => {
          let archive = archiver('zip')
          let files = fs.readdirSync(guildDirectory).filter(file => fs.statSync(path.join(guildDirectory, file)).isFile())

          archive.on('error', (err) => {
            console.error('Unable to zip the merged audio files.')
            console.error(err)
          })

          for (let file of files) {
            archive.append(fs.createReadStream(path.join(guildDirectory, file)), {
              name: file
            })
          }

          let audioZip = path.join(guildDirectory, 'audio.zip')
          let zipped = fs.createWriteStream(audioZip)

          archive.pipe(zipped)
          archive.finalize()

          zipped.on('close', () => {
            processMessage.edit(logger.format('`[3/3]` Uploading...', logger.LoggerType.ANNOUNCE)).then((message) => {
              message.channel.sendFile(audioZip).then((message) => {
                processMessage.delete()
                connection.channel.leave()
              })
            })
          })
        })
      })
    } else {
      logger.error('I\'m not recording on any voice channels!', message.channel)
    }
  }
}

export default Done
