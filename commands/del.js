const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  EmbedBuilder,
  PermissionsBitField,
  ChannelType,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("del")
    .setDescription("Delete a campaign or a note")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("campaign")
        .setDescription("Delete a campaign")
        .addStringOption((option) =>
          option
            .setName("name")
            .setDescription("Name of the campaign to delete")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("note")
        .setDescription("Delete a note")
        .addStringOption((option) =>
          option
            .setName("campaign")
            .setDescription("Name of the campaign containing the note")
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const guild = interaction.client.guilds.cache.get(interaction.guildId);
    const memberRoles = interaction.member.roles.cache;

    if (
      memberRoles.has(
        guild.roles.cache.find((r) => r.name === "Commander")?.id
      ) ||
      memberRoles.has(
        guild.roles.cache.find((r) => r.name === "Adventurer")?.id
      )
    ) {
      if (interaction.options.getSubcommand() === "campaign") {
        const name = capitalize(interaction.options.getString("name"));

        if (
          memberRoles.has(
            guild.roles.cache.find((r) => r.name === `${name} Owner`)?.id
          )
        ) {
          const campaignRole = guild.roles.cache.find((r) => r.name === name);
          const masterRole = guild.roles.cache.find(
            (r) => r.name === `${name} Master`
          );
          const ownerRole = guild.roles.cache.find(
            (r) => r.name === `${name} Owner`
          );

          campaignRole?.delete();
          masterRole?.delete();
          ownerRole?.delete();

          const category = guild.channels.cache.find(
            (c) =>
              c.name === `🎲・${name}` && c.type === ChannelType.GuildCategory
          );

          if (category) {
            for (const channel of category.children.cache.values()) {
              await channel.delete();
            }
            await category.delete();
          }

          const embed = new EmbedBuilder()
            .setColor("#013455")
            .setTitle(`Campaign ${name} deleted!`)
            .setDescription(
              "Your campaign has been deleted, and you lose your owner permissions!"
            )
            .setAuthor({
              name: "Dungeon Helper",
              iconURL: interaction.client.user.displayAvatarURL(),
            })
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setFooter({
              text: `Dungeon Helper`,
              iconURL: interaction.client.user.displayAvatarURL(),
            });

          await interaction.editReply({
            content: "Success!",
            embeds: [embed],
          });
        } else {
          const embed = new EmbedBuilder()
            .setColor("#013455")
            .setTitle(`Campaign ${name} can't be deleted!`)
            .setDescription("You're not the owner of the campaign!")
            .setAuthor({
              name: "Dungeon Helper",
              iconURL: interaction.client.user.displayAvatarURL(),
            })
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setFooter({
              text: `Dungeon Helper`,
              iconURL: interaction.client.user.displayAvatarURL(),
            });

          await interaction.editReply({
            content: "Error!",
            embeds: [embed],
          });
        }
      } else if (interaction.options.getSubcommand() === "note") {
        const campaignName = capitalize(
          interaction.options.getString("campaign")
        );
        const campaignCategory = guild.channels.cache.find(
          (c) =>
            c.type === ChannelType.GuildCategory &&
            c.name === `🎲・${campaignName}`
        );

        if (campaignCategory) {
          if (
            memberRoles.has(
              guild.roles.cache.find((r) => r.name === campaignName)?.id
            )
          ) {
            const noteChannel = guild.channels.cache.find(
              (c) =>
                c.type === ChannelType.GuildText &&
                c.topic ===
                  `Note of the campaign ${campaignName} of ${interaction.user.id}`
            );

            if (noteChannel) {
              await noteChannel.delete();

              const embed = new EmbedBuilder()
                .setColor("#013455")
                .setTitle("Note deleted!")
                .setDescription("Your note channel has been deleted.")
                .setAuthor({
                  name: "Dungeon Helper",
                  iconURL: interaction.client.user.displayAvatarURL(),
                })
                .setThumbnail(interaction.client.user.displayAvatarURL())
                .setFooter({
                  text: `Dungeon Helper`,
                  iconURL: interaction.client.user.displayAvatarURL(),
                });

              await interaction.editReply({
                content: "Success!",
                embeds: [embed],
              });
            } else {
              const embed = new EmbedBuilder()
                .setColor("#013455")
                .setTitle("Note doesn't exist!")
                .setDescription("You don't have any note channel")
                .setAuthor({
                  name: "Dungeon Helper",
                  iconURL: interaction.client.user.displayAvatarURL(),
                })
                .setThumbnail(interaction.client.user.displayAvatarURL())
                .setFooter({
                  text: `Dungeon Helper`,
                  iconURL: interaction.client.user.displayAvatarURL(),
                });

              await interaction.editReply({
                content: "Error!",
                embeds: [embed],
              });
            }
          } else {
            const embed = new EmbedBuilder()
              .setColor("#013455")
              .setTitle("You are not in the campaign")
              .setDescription(
                `You aren't an adventurer of the campaign ${campaignName}`
              )
              .setAuthor({
                name: "Dungeon Helper",
                iconURL: interaction.client.user.displayAvatarURL(),
              })
              .setThumbnail(interaction.client.user.displayAvatarURL())
              .setFooter({
                text: `Dungeon Helper`,
                iconURL: interaction.client.user.displayAvatarURL(),
              });

            await interaction.editReply({
              content: "Error!",
              embeds: [embed],
            });
          }
        } else {
          const embed = new EmbedBuilder()
            .setColor("#013455")
            .setTitle("The campaign doesn't exist")
            .setDescription(`The campaign ${campaignName} doesn't exist!`)
            .setAuthor({
              name: "Dungeon Helper",
              iconURL: interaction.client.user.displayAvatarURL(),
            })
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setFooter({
              text: `Dungeon Helper`,
              iconURL: interaction.client.user.displayAvatarURL(),
            });

          await interaction.editReply({
            content: "Error!",
            embeds: [embed],
          });
        }
      }
    } else {
      const embed = new EmbedBuilder()
        .setColor("#013455")
        .setTitle("Accept the rules")
        .setDescription("To use the commands you have to accept the rules")
        .setAuthor({
          name: "Dungeon Helper",
          iconURL: interaction.client.user.displayAvatarURL(),
        })
        .setThumbnail(interaction.client.user.displayAvatarURL())
        .setFooter({
          text: `Dungeon Helper`,
          iconURL: interaction.client.user.displayAvatarURL(),
        });

      await interaction.editReply({
        content: "Error!",
        embeds: [embed],
      });
    }
  },
};

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
