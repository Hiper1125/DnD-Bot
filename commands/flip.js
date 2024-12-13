const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder().setName("flip").setDescription("Flip a coin"),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const flipCoin = () => {
      const result = Math.round(Math.random());
      return {
        flip: result === 0 ? "Head" : "Tails",
        url: `https://kilihbr.github.io/coinflip-api/images/${
          result === 0 ? "head.png" : "tails.png"
        }`,
      };
    };

    const { flip, url } = flipCoin();

    const embed = new EmbedBuilder()
      .setColor("#e6101d")
      .setTitle(`You flipped ${flip}`)
      .setDescription(
        `You've launched a coin with all your might and obtained: **${flip}**!`
      )
      .setAuthor({
        name: "Dungeon Helper",
        iconURL: interaction.client.user.displayAvatarURL(),
      })
      .setThumbnail(url)
      .setFooter({
        text: "Dungeon Helper",
        iconURL: interaction.client.user.displayAvatarURL(),
      });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("flip")
        .setEmoji("🪙")
        .setLabel("Flip again")
        .setStyle(ButtonStyle.Primary)
    );

    await interaction.editReply({
      content: "‎",
      embeds: [embed],
      components: [row],
    });

    const collector = interaction.channel.createMessageComponentCollector({
      filter: (i) => i.customId === "flip" && i.user.id === interaction.user.id,
      time: 60000,
    });

    collector.on("collect", async (i) => {
      const { flip, url } = flipCoin();

      const newEmbed = new EmbedBuilder()
        .setColor("#e6101d")
        .setTitle(`You flipped ${flip}`)
        .setDescription(
          `You've launched a coin with all your might and obtained: **${flip}**!`
        )
        .setAuthor({
          name: "Dungeon Helper",
          iconURL: interaction.client.user.displayAvatarURL(),
        })
        .setThumbnail(url)
        .setFooter({
          text: "Dungeon Helper",
          iconURL: interaction.client.user.displayAvatarURL(),
        });

      await i.update({
        content: "‎",
        embeds: [newEmbed],
        components: [row],
      });
    });

    collector.on("end", async () => {
      row.components.forEach((c) => c.setDisabled(true));
      await interaction.editReply({
        components: [row],
      });
    });
  },
};
