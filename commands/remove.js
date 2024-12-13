const { SlashCommandBuilder } = require("discord.js");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("remove")
    .setDescription("Remove a user from a campaign")
    .addStringOption((option) =>
      option.setName("campaign").setDescription("Campaign").setRequired(true)
    )
    .addUserOption((option) =>
      option.setName("user").setDescription("User to remove").setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply({ content: "Executing...", ephemeral: true });

    const guild = interaction.guild; // Use the interaction guild directly
    const commanderRole = guild.roles.cache.find((r) => r.name === "Commander");
    const adventurerRole = guild.roles.cache.find(
      (r) => r.name === "Adventurer"
    );

    if (
      interaction.member.roles.cache.has(commanderRole.id) ||
      interaction.member.roles.cache.has(adventurerRole.id)
    ) {
      const campaign = interaction.options.getString("campaign").capitalize();
      const user = interaction.options.getUser("user");
      const member = guild.members.cache.get(user.id);

      const campaignRole = guild.roles.cache.find((r) => r.name === campaign);
      const campaignRoleMaster = guild.roles.cache.find(
        (r) => r.name === campaign + " Master"
      );
      const campaignRoleOwner = guild.roles.cache.find(
        (r) => r.name === campaign + " Owner"
      );

      if (interaction.member.roles.cache.has(campaignRoleMaster.id)) {
        if (
          member.roles.cache.has(campaignRoleMaster.id) &&
          member.roles.cache.has(campaignRoleOwner.id)
        ) {
          await member.roles.remove(campaignRole);
          success(interaction, campaign, user);
        } else {
          error(interaction, campaign, user);
        }
      } else if (interaction.member.roles.cache.has(campaignRoleOwner.id)) {
        await member.roles.remove(campaignRole);
        await member.roles.remove(campaignRoleMaster);
        success(interaction, campaign, user);
      } else {
        error(interaction, campaign, user);
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
        ephemeral: true,
        embeds: [embed],
      });
    }
  },
};

async function error(interaction, campaign, user) {
  const embed = new EmbedBuilder()
    .setColor("#013455")
    .setTitle("You don't have the permission to remove")
    .setDescription(
      `Cannot remove the user ${user.username} from the campaign ${campaign}`
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
    ephemeral: true,
    embeds: [embed],
  });
}

async function success(interaction, campaign, user) {
  const embed = new EmbedBuilder()
    .setColor("#013455")
    .setTitle("You have removed")
    .setDescription(
      `The user ${user.username} is removed from the campaign ${campaign}`
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
    ephemeral: true,
    embeds: [embed],
  });
}

String.prototype.capitalize = function () {
  return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase();
};
