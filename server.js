require('dotenv').config();

// Require the necessary discord.js classes
const { Client, Events, GatewayIntentBits, Routes, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Load json static beta
const animals = require('./data/animal.json');

// map command list
const commands = [
	new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	new SlashCommandBuilder()
		.setName('animal')
		.setDescription('Encyclopedia animal')
		.addStringOption(option =>
			option.setName('animal')
				.setDescription('role category')
				.setRequired(true)
				.addChoices(
					{ name: 'Hippopotamus', value: 'Hippopotamus'},
					{ name: 'Tiger', value: 'Tiger'},
					{ name: 'Asian Elephant', value: 'Asian Elephant'},
					{ name: 'Capybara', value: 'Capybara'},
				)
		),
  ].map(command => command.toJSON());
  
  // register command
  const rest = new REST({ version: '10' }).setToken(process.env.token);
  rest.put(Routes.applicationGuildCommands(process.env.clientId, process.env.guildId), { body: commands })
	  .then(() => console.log('Successfully registered application commands.'))
	  .catch(console.error);

// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// Reply Command
client.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const { commandName } = interaction;

	if (commandName === 'ping') {
		const timeTaken = Date.now() - interaction.createdTimestamp;
		await interaction.reply(`Pong! This message had a latency of ${timeTaken}ms.`);
	} else if (commandName === 'animal') {
		const animalInput = interaction.options.getString('animal');
		const animalOutput = animals.find(animal => animal.name_en == animalInput);
		const embed = new EmbedBuilder()
			.setColor(0x0099FF)
			.setTitle(animalOutput.name_en)
			.setURL(animalOutput.reference_url)
			.setAuthor({ name: 'zookeeper', iconURL: "https://i.imgur.com/dxeXsqc.jpeg", url: 'https://khaokheow.zoothailand.org/intro.php' })
			.setDescription(animalOutput.description)
			.setThumbnail(animalOutput.image_url)
			.addFields(
				{ name: 'Scientific Name', value: animalOutput.scientific_name, inline: true },
				{ name: 'Food', value: animalOutput.diet },
				{ name: 'Zoo Place', value: animalOutput.place, inline: true },
			)
			.setImage(animalOutput.image_url)
			.setTimestamp()
			.setFooter({ text: '❤️', iconURL: "https://i.imgur.com/dxeXsqc.jpeg" });
		const button = new ButtonBuilder()
            .setLabel('ข้อมูลเพิ่มเติม')
            .setStyle(ButtonStyle.Link)
            .setURL(animalOutput.reference_url);
        const row = new ActionRowBuilder().addComponents(button);
        await interaction.reply({ embeds: [embed], components: [row] });
	}
});

// Log in to Discord with your client's token
client.login(process.env.token);