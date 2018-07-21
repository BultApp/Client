# Bult Client
## About
This client is at it's core a wrapper around [ChatBotCE](https://github.com/MarkedBots/ChatBot-CE). It allows you to install addons via zip file, it allows you to start and configure the bot with ease.

## Known Bugs
Although it's still in beta, there may be a few bugs.

- On Linux the dependencies will need to be modified to allowed to be executed (`$ chmod +x ./deps/ChatBotCE && chmod +x ./deps/Ember`)

## Installation/Packaging
There's scripts are a part of `npm`'s package file. Development is pretty easy. Just run `$ npm run full-start`. This will run grunt and compile the TypeScript code as well as starting the application or you can make a release with `$ npm run release`

## Contributions
TODO

## License
You're not allowed to redistribute or reuse the code. This code is published for people to review for their own piece of mind. You can, however, package the code or use the code for yourself and only for yourself.