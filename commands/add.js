const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("add")
    .setDescription("Add a user to a campaign")
    .addStringOption((option) =>
      option.setName("campaign").setDescription("Campaign").setRequired(true)
    )
    .addUserOption((option) =>
      option.setName("user").setDescription("User to add").setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("role")
        .setDescription("Role to add")
        .setRequired(true)
        .addChoices(
          { name: "Adventurer", value: "adventurer" },
          { name: "Master", value: "master" }
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
      const campaign = capitalize(interaction.options.getString("campaign"));
      const user = interaction.options.getUser("user");
      const role = interaction.options.getString("role");

      const member = guild.members.cache.get(user.id);

      const campaignRole = guild.roles.cache.find((r) => r.name === campaign);
      const campaignRoleMaster = guild.roles.cache.find(
        (r) => r.name === `${campaign} Master`
      );
      const campaignRoleOwner = guild.roles.cache.find(
        (r) => r.name === `${campaign} Owner`
      );

      if (role === "adventurer") {
        if (memberRoles.has(campaignRoleMaster?.id)) {
          if (
            !member.roles.cache.has(campaignRoleMaster?.id) &&
            !member.roles.cache.has(campaignRoleOwner?.id)
          ) {
            await member.roles.add(campaignRole);
            await success(interaction, campaign, role, user);
          } else {
            await error(interaction, campaign, role, user);
          }
        } else if (memberRoles.has(campaignRoleOwner?.id)) {
          await member.roles.add(campaignRole);
          await member.roles.remove(campaignRoleMaster);
          await success(interaction, campaign, role, user);
        } else {
          await error(interaction, campaign, role, user);
        }
      } else if (role === "master") {
        if (memberRoles.has(campaignRoleOwner?.id)) {
          await member.roles.add(campaignRoleMaster);
          await member.roles.remove(campaignRole);
          await success(interaction, campaign, role, user);
        } else {
          await error(interaction, campaign, role, user);
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

async function error(interaction, campaign, role, user) {
  const embed = new EmbedBuilder()
    .setColor("#013455")
    .setTitle(`You don't have permission to add the ${role}`)
    .setDescription(
      `Cannot add ${role} to user ${user.username} in the campaign ${campaign}`
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

async function success(interaction, campaign, role, user) {
  const embed = new EmbedBuilder()
    .setColor("#013455")
    .setTitle(`You have added a new ${role}`)
    .setDescription(
      `The user ${user.username} is now a ${role} of the campaign ${campaign}`
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
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
