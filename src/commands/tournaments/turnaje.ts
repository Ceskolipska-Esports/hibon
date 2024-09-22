import { SlashCommandBuilder, CommandInteraction } from "discord.js";

export default {
	data: new SlashCommandBuilder()
		.setName("turnaje")
		.setDescription("Získej nadcházející turnaje"),
	execute: async (interaction: CommandInteraction) => {
		await interaction.reply("ok");
	},
};
