import {Command} from "discord-akairo";
import {Message} from "discord.js";

export default class PingCommand extends Command {
    public constructor() {
        super('ping', {
            aliases: ['ping']
        });
    }

    public async exec(msg: Message) {
        return msg.channel.send({content: `<@${msg.author.id}>, pong!`})
    }

}
