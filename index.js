const { Client, Collection, GatewayIntentBits } = require("discord.js");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { token, clientId, guildId } = require("./config.json");
const fs = require("fs");

const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));

const DungeonHelper = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

DungeonHelper.commands = new Collection();
global.DungeonHelper = DungeonHelper;

DungeonHelper.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (!DungeonHelper.commands.has(commandName)) return;

  try {
    await DungeonHelper.commands.get(commandName).execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.editReply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });
  }
});

const Fetch = () => {
  const commands = [];

  for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
  }

  const rest = new REST({ version: "9" }).setToken(token);

  (async () => {
    try {
      console.log("[!]: Fetch started");

      await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
        body: commands,
      });

      console.log("[!]: Fetch endend");
    } catch (error) {
      console.error(error);
    }
  })();
};

const Start = () => {
  Fetch();

  DungeonHelper.login(token);

  for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    DungeonHelper.commands.set(command.data.name, command);
  }
};

DungeonHelper.on("ready", () => {
  console.log("[>]: Bot online");

  DungeonHelper.user.setActivity("a D&D match!", {type: 'WATCHING'});
  DungeonHelper.user.setStatus("dnd");
});

Start();