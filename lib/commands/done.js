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

      let processMessage = await logger.announce('Stopped recording. Processing the generated audio... `[1/4]`', message.channel)

      ASYNC.each(memberDirs, (directory, callbackMain) => {
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

        ASYNC.eachOf(files, (currentTimecode, index, callbackSecondary) => {
          if (index > 0) {
            let extLength = path.extname(files[index]).length
            let previousTimecode = files[index - 1]

            currentTimecode = currentTimecode.substring(0, currentTimecode.length - extLength)
            previousTimecode = previousTimecode.substring(0, previousTimecode.length - extLength)

            exec('ffmpeg -f lavfi -i anullsrc -t ' + ((currentTimecode - previousTimecode) / 2000) + ' -c:a libmp3lame -ar 48000 -ac 2 ' + path.join(filledDir, index + '.mp3'), (err, stdout, stderr) => callbackSecondary(err))
          } else {
            callbackSecondary()
          }
        }, (err) => {
          if (err) {
            console.error(err)
          }

          processMessage.edit(logger.format('Merging individual files together... [2/4]', logger.LoggerType.ANNOUNCE)).then((message) => {
            let filledFiles = fs.readdirSync(filledDir).filter(file => fs.statSync(path.join(filledDir, file)).isFile())
            let cmd = ffmpeg()

            for (let index in files) {
              let file = files[index]

              if (index > 0) {
                let filledFile = filledFiles[index - 1]
                cmd = cmd.input(path.join(filledDir, filledFile))
              }

              cmd = cmd.input(path.join(fullDir, file))
            }

            let member = message.guild.members.get(directory).user

            cmd
              .on('end', callbackMain)
              .on('error', callbackMain)
              .mergeToFile(path.join(guildDirectory, member.username + '#' + member.discriminator + '.mp3'), path.join(fullDir, 'tmp'))
          })
        })
      }, (err) => {
        if (err) {
          console.error(err)
        }

        processMessage.edit(logger.format('Zipping the audio files... [3/4]', logger.LoggerType.ANNOUNCE)).then((message) => {
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
            processMessage.edit(logger.format('Uploading... [4/4]', logger.LoggerType.ANNOUNCE)).then((message) => {
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
