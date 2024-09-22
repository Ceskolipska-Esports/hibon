import "dotenv/config";
import { Client, Collection, Events, GatewayIntentBits } from "discord.js";
import fs from "node:fs";
import path from "node:path";

const token = process.env["TOKEN"]!;
const client: Client = new Client({
	intents: [GatewayIntentBits.Guilds],
});

// patch the Client class
declare module "discord.js" {
	interface Client {
		commands: Collection<unknown, unknown>;
	}
}

client.commands = new Collection();

const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);
for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs
		.readdirSync(commandsPath)
		.filter((file) => file.endsWith(".ts"));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const { default: command } = await import(filePath);
		if (command.data && command.execute) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`${filePath} is missing "data" or "execute"`);
		}
	}
}

client.once(Events.ClientReady, () => {
	console.log("ready");
});

client.on(Events.InteractionCreate, async (interaction) => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);
	if (!command) {
		console.error(`No command matches ${interaction.commandName}.`);
		return;
	}

	try {
		// FIXME: this is not the correct way to do this
		// @ts-expect-error typescript freaks out idk
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({
				content: "Někde se stala chyba.",
				ephemeral: true,
			});
		} else {
			await interaction.reply({
				content: "Někde se stala chyba.",
				ephemeral: true,
			});
		}
	}
});

client.login(token);
