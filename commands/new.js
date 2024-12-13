const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  PermissionsBitField,
  ChannelType,
  EmbedBuilder,
  Colors,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("new")
    .setDescription("Create a new campaign or a new note")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("campaign")
        .setDescription("Create a new campaign")
        .addStringOption((option) =>
          option
            .setName("name")
            .setDescription("Define the name of the campaign")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("note")
        .setDescription("Create a new note")
        .addStringOption((option) =>
          option
            .setName("campaign")
            .setDescription("Define the name of the campaign")
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const guild = interaction.client.guilds.cache.get(interaction.guildId);
    const memberRoles = interaction.member.roles.cache;

    const hasRequiredRole =
      memberRoles.has(
        guild.roles.cache.find((role) => role.name === "Commander")?.id
      ) ||
      memberRoles.has(
        guild.roles.cache.find((role) => role.name === "Adventurer")?.id
      );

    if (!hasRequiredRole) {
      const embed = new EmbedBuilder()
        .setColor(Colors.Red)
        .setTitle("Accept the rules")
        .setDescription("To use the commands, you have to accept the rules.")
        .setAuthor({
          name: "Dungeon Helper",
          iconURL: interaction.client.user.displayAvatarURL(),
        })
        .setFooter({
          text: "Dungeon Helper",
          iconURL: interaction.client.user.displayAvatarURL(),
        });

      return interaction.editReply({ content: "Error!", embeds: [embed] });
    }

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "campaign") {
      await this.createCampaign(interaction, guild);
    } else if (subcommand === "note") {
      await this.createNote(interaction, guild);
    }
  },

  async createCampaign(interaction, guild) {
    const name = capitalize(interaction.options.getString("name"));
    const categoryName = `🎲・${name}`;

    if (
      guild.channels.cache.find(
        (channel) =>
          channel.type === ChannelType.GuildCategory &&
          channel.name === categoryName
      )
    ) {
      const embed = new EmbedBuilder()
        .setColor(Colors.Yellow)
        .setTitle(`Campaign ${name} exists!`)
        .setDescription("The campaign already exists.")
        .setAuthor({
          name: "Dungeon Helper",
          iconURL: interaction.client.user.displayAvatarURL(),
        })
        .setFooter({
          text: "Dungeon Helper",
          iconURL: interaction.client.user.displayAvatarURL(),
        });

      return interaction.editReply({ content: "Error!", embeds: [embed] });
    }

    const ownerRole = await guild.roles.create({
      name: `${name} Owner`,
      color: Colors.Yellow,
    });
    const masterRole = await guild.roles.create({
      name: `${name} Master`,
      color: Colors.Red,
    });
    const campaignRole = await guild.roles.create({
      name: name,
      color: Colors.Blue,
    });

    await interaction.member.roles.add(ownerRole);

    const category = await guild.channels.create({
      name: categoryName,
      type: ChannelType.GuildCategory,
      permissionOverwrites: [
        {
          id: guild.roles.everyone.id,
          deny: [PermissionsBitField.Flags.ViewChannel],
        },
        {
          id: campaignRole.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ReadMessageHistory,
          ],
        },
        {
          id: masterRole.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ReadMessageHistory,
          ],
        },
        {
          id: ownerRole.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ReadMessageHistory,
          ],
        },
      ],
    });

    await guild.channels.create({
      name: "🌍｜world",
      type: ChannelType.GuildText,
      parent: category,
    });

    await guild.channels.create({
      name: "🧙｜players",
      type: ChannelType.GuildText,
      parent: category,
    });

    await guild.channels.create({
      name: "🐉｜master",
      type: ChannelType.GuildText,
      parent: category,
      permissionOverwrites: [
        {
          id: guild.roles.everyone.id,
          deny: [PermissionsBitField.Flags.ViewChannel],
        },
        {
          id: campaignRole.id,
          deny: [PermissionsBitField.Flags.ViewChannel],
        },
        {
          id: masterRole.id,
          allow: [PermissionsBitField.Flags.ViewChannel],
        },
        {
          id: ownerRole.id,
          allow: [PermissionsBitField.Flags.ViewChannel],
        },
      ],
    });

    await guild.channels.create({
      name: "🎶｜music",
      type: ChannelType.GuildText,
      parent: category,
    });

    await guild.channels.create({
      name: "👾｜Dungeon Party",
      type: ChannelType.GuildVoice,
      parent: category,
    });

    const embed = new EmbedBuilder()
      .setColor(Colors.Green)
      .setTitle(`Campaign ${name} created!`)
      .setDescription(
        "Your new campaign has been created, and you now have owner permissions."
      )
      .setAuthor({
        name: "Dungeon Helper",
        iconURL: interaction.client.user.displayAvatarURL(),
      })
      .setFooter({
        text: "Dungeon Helper",
        iconURL: interaction.client.user.displayAvatarURL(),
      });

    return interaction.editReply({ content: "Success!", embeds: [embed] });
  },

  async createNote(interaction, guild) {
    const campaignName = capitalize(interaction.options.getString("campaign"));
    const category = guild.channels.cache.find(
      (channel) =>
        channel.type === ChannelType.GuildCategory &&
        channel.name === `🎲・${campaignName}`
    );

    if (!category) {
      const embed = new EmbedBuilder()
        .setColor(Colors.Red)
        .setTitle("The campaign doesn't exist")
        .setDescription(`The campaign ${campaignName} doesn't exist!`)
        .setAuthor({
          name: "Dungeon Helper",
          iconURL: interaction.client.user.displayAvatarURL(),
        })
        .setFooter({
          text: "Dungeon Helper",
          iconURL: interaction.client.user.displayAvatarURL(),
        });

      return interaction.editReply({ content: "Error!", embeds: [embed] });
    }

    const campaignRole = guild.roles.cache.find(
      (role) => role.name === campaignName
    );

    if (!interaction.member.roles.cache.has(campaignRole?.id)) {
      const embed = new EmbedBuilder()
        .setColor(Colors.Red)
        .setTitle("You are not in the campaign")
        .setDescription(
          `You aren't an adventurer of the campaign ${campaignName}.`
        )
        .setAuthor({
          name: "Dungeon Helper",
          iconURL: interaction.client.user.displayAvatarURL(),
        })
        .setFooter({
          text: "Dungeon Helper",
          iconURL: interaction.client.user.displayAvatarURL(),
        });

      return interaction.editReply({ content: "Error!", embeds: [embed] });
    }

    const noteChannel = guild.channels.cache.find(
      (channel) =>
        channel.type === ChannelType.GuildText &&
        channel.topic ===
          `Note of the campaign ${campaignName} of ${interaction.user.id}`
    );

    if (noteChannel) {
      const embed = new EmbedBuilder()
        .setColor(Colors.Yellow)
        .setTitle("Note already created!")
        .setDescription(
          `You already have a note channel.\nYou can find it here <#${noteChannel.id}>.`
        )
        .setAuthor({
          name: "Dungeon Helper",
          iconURL: interaction.client.user.displayAvatarURL(),
        })
        .setFooter({
          text: "Dungeon Helper",
          iconURL: interaction.client.user.displayAvatarURL(),
        });

      return interaction.editReply({ content: "Error!", embeds: [embed] });
    }

    const newNoteChannel = await guild.channels.create({
      name: "📋｜note",
      type: ChannelType.GuildText,
      topic: `Note of the campaign ${campaignName} of ${interaction.user.id}`,
      parent: category,
      permissionOverwrites: [
        {
          id: guild.roles.everyone.id,
          deny: [PermissionsBitField.Flags.ViewChannel],
        },
        {
          id: interaction.user.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ReadMessageHistory,
          ],
        },
      ],
    });

    const embed = new EmbedBuilder()
      .setColor(Colors.Green)
      .setTitle("Note created!")
      .setDescription(
        `Your note channel has been created.\nYou can find it here <#${newNoteChannel.id}>.`
      )
      .setAuthor({
        name: "Dungeon Helper",
        iconURL: interaction.client.user.displayAvatarURL(),
      })
      .setFooter({
        text: "Dungeon Helper",
        iconURL: interaction.client.user.displayAvatarURL(),
      });

    return interaction.editReply({ content: "Success!", embeds: [embed] });
  },
};

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}
