# podcaster

A general purpose podcast bot, running on Discord. A public bot is not currently available because of storage and performance concerns.

## Features

* High-quality 320kb/s recording of a Discord channel.
* Separate audio files per person in the Discord channel. This allows you to edit the recording with much higher control.
* Secure MEGA upload (may be changed in the future).

TODO:
* User-selection of a codec (i.e. using AAC or opus instead of MP3).

## Installation

Requirements:
* node.js 6.0.0 or newer
* git 2.10 or newer

To install `podcaster` on any Unix-based system, run the following command.

```
$ npm install -g podcaster
```

If this command fails (most likely due to node-opus), run the following command and then follow the Contributing section.

```
$ npm uninstall -g podcaster
```

## Usage

```
$ podcaster [opts]
```

**Every option is required.** The following options are:
* `-t=TOKEN` - The discord bot token that podcaster will log into and run on.
* `-e=EMAIL` - Your MEGA email, used to upload processed audio.
* `-p=PASWD` - Your MEGA password, used to upload processed audio.

## Contributing

To set up your development environment, run the following commands. The installation requirements apply here as well.

```
$ git clone https://github.com/winneon/podcaster.git
$ cd podcaster && npm install
```

The usage instructions are the same as listed in the Usage section. However, instead of running `podcaster`, run `./bin/podcaster` in your `podcaster` directory.
