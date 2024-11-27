require('dotenv').config();

// Require the necessary discord.js classes
const { Client, Events, GatewayIntentBits, Routes } = require('discord.js');
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
		await interaction.reply(animalOutput.name_th);
	}
});

// Log in to Discord with your client's token
client.login(process.env.token);