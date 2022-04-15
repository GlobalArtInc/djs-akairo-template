import {Listener} from 'discord-akairo';
export default class ReadyListener extends Listener {
    public constructor() {
        super('readyListener', {
            emitter: 'client',
            event: 'ready',
            category: 'client'
        });
    }

    public setPresence(client) {
        return client.user.setPresence({
            status: 'online',
            activities: [{
                name: `/help`,
                //type: 'PLAYING'
            }]
        });
    }

    public async exec(): Promise<void> {
        await this.setPresence(this.client);
        await this.client.log.info(`${this.client.user.tag} has started successfully and is ready!`);
    }
}
