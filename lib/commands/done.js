'use strict'

import ffmpeg from 'fluent-ffmpeg'
import async from 'async'
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

  onCommand (bot, message, args) {
    let connections = bot.voiceConnections.filter(connection => connection.channel.guild.id === message.guild.id)

    if (connections.size > 0) {
      let connection = connections.values().next().value
      connection.channel.leave()

      let memberDirs = fs.readdirSync(bot.directory).filter(file => fs.statSync(path.join(bot.directory, file)).isDirectory())

      async.each(memberDirs, (directory, callbackMain) => {
        let fullDir = path.join(bot.directory, directory)
        let filledDir = path.join(fullDir, 'filled')

        try {
          fs.mkdirSync(filledDir)
        } catch (err) {
          console.error("Unable to create a filled directory.")
          console.error(err)

          callbackMain(err)
        }

        let files = fs.readdirSync(fullDir).filter(file => fs.statSync(path.join(fullDir, file)).isFile())

        async.eachOf(files, (currentTimecode, index, callbackSecondary) => {
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

          cmd
            .on('end', callbackMain)
            .mergeToFile(path.join(fullDir, 'merged.mp3'), path.join(fullDir, 'tmp'))
        })
      }, (err) => {
        if (err) {
          console.error(err)
        }

        console.log('finished!')
      })
    } else {
      logger.error('I\'m not recording on any voice channels!', message.channel)
    }
  }
}

export default Done
