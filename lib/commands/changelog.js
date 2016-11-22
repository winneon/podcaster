'use strict'

import Command from '../interfaces/command'

class Changelog extends Command {
  constructor () {
    super({
      usage: '%CMD%',
      description: 'Display the changelog for the latest release.',
      args: 0
    })
  }

  async onCommand (bot, message, args) {
    try {
      let response = await bot.github.repos.getLatestRelease({
        owner: 'winneon',
        repo: 'podcaster'
      })

      logger.announce('GitHub link: ' + response.html_url, message.channel)
    } catch (err) {
      console.log('An error occurred connecting to the GitHub API.')
      console.log(err)

      logger.error('An error occurred connecting to the GitHub API.', message.channel)
      logger.bare('```' + err + '```', message.channel)
    }
  }
}

export default Changelog
