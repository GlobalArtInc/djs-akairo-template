import {AkairoClient, CommandHandler, ListenerHandler} from 'discord-akairo';
import {DiscordAPIError, Message} from 'discord.js';
import {Logger} from 'tslog';
import {join} from 'path';
import DebugLogger from '../utils/DebugLogger';

// Import Configuration Constants
const config = require('../../data/config.json');

declare module 'discord-akairo' {
    interface AkairoClient {
        commandHandler: CommandHandler;
        listenerHandler: ListenerHandler;
        log: Logger
    }
}

export default class AppClient extends AkairoClient {
    public log = DebugLogger;

    // Loads all files in the '../listeners/' directory as Listeners
    public listenerHandler: ListenerHandler = new ListenerHandler(this, {
        directory: join(__dirname, '..', 'listeners'),
    });

    // Loads all files in the '../commands/' directory as Commands
    public commandHandler: CommandHandler = new CommandHandler(this, {
        directory: join(__dirname, '..', 'commands'),
        prefix: "/",
        automateCategories: true,
        commandUtilLifetime: 600000,
        handleEdits: true,
        commandUtil: true,
        allowMention: true,
        argumentDefaults: {
            prompt: {
                modifyStart: (_: Message, str: string): string => `${str}\n\nType \`cancel\` to cancel the commmand...`,
                modifyRetry: (_: Message, str: string): string => `${str}\n\nType \`cancel\` to cancel the commmand...`,
                timeout: 'Command timeout',
                ended: 'You reached the maximum retries, command cancelled.',
                retries: 3,
                time: 3e4,
            },
        },
    });

    // Bot Initialization Function
    private _init(): void {
        const initLog = this.log.getChildLogger({
            name: 'Bot Init Function',
            prefix: ['[BotInit]'],
        });

        initLog.debug('Starting Initialization');
        initLog.info('Setting Up Listener Handler');
        this.commandHandler.useListenerHandler(this.listenerHandler);

        this.listenerHandler.setEmitters({
            commandHandler: this.commandHandler,
            listenerHandler: this.listenerHandler,
            process,
        });
        initLog.debug('Emitters Set');
        initLog.info('Loading Command and Listener Handlers');
        this.commandHandler.loadAll();
        this.listenerHandler.loadAll();
    }

    public async start(): Promise<string> {
        this._init();

        process.on('unhandledRejection', (reason: DiscordAPIError, promise) => {
            this.log.error(reason['stack'] || reason)
        })

        process.on("uncaughtException", (err) => {
            this.log.error(err)
        })

        this.log.debug('Start Complete');
        return this.login(config.token)
    }
}
