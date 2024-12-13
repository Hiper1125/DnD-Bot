const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("show")
    .setDescription("Show a category of the D&D documentation")
    .addStringOption((option) =>
      option
        .setName("category")
        .setDescription("The category of the information you're looking for")
        .setRequired(true)
        .addChoices(
          { name: "Feats", value: "feats" },
          { name: "Races", value: "races" },
          { name: "Spells", value: "spells" },
          { name: "Classes", value: "classes" },
          { name: "Monsters", value: "monsters" },
          { name: "Languages", value: "languages" },
          { name: "Equipments", value: "equipment" }
        )
    ),

  async execute(interaction) {
    await interaction.deferReply({ content: "Executing...", ephemeral: true });

    const category = interaction.options.getString("category");
    const url = `https://www.dnd5eapi.co/api/${category}`;
    console.log(url);

    try {
      const data = await fetchJSON(url);

      if (!data) {
        const embed = new EmbedBuilder()
          .setColor("#e6101d")
          .setTitle("Error")
          .setDescription(
            `The category (${category}) was not found in the documentation. Try again with a different one!`
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

        return await interaction.editReply({
          content: "‎",
          ephemeral: true,
          embeds: [embed],
        });
      }

      let amountToShow = 30;
      let index = 0;
      let coloumn = 3;

      let embed = new EmbedBuilder()
        .setColor("#e6101d")
        .setTitle(`Found ${data.count} ${category.toLowerCase()}`)
        .setDescription(
          `Page ${index + 1}/${Math.ceil(data.count / amountToShow)}`
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

      // Add fields to the embed
      for (let i = 0; i < coloumn; i++) {
        let elements = elementsToString(
          getElements(
            data.results,
            index * amountToShow + i * (amountToShow / coloumn),
            amountToShow / coloumn
          )
        );

        if (elements.length > 0) {
          embed.addFields({ name: elements, value: "‎", inline: true });
        }
      }

      // Buttons for pagination
      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId("before")
            .setLabel("﹤")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true)
        )
        .addComponents(
          new ButtonBuilder()
            .setCustomId("next")
            .setLabel("﹥")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(amountToShow >= data.count)
        );

      await interaction.editReply({
        content: "‎",
        ephemeral: true,
        embeds: [embed],
        components: [row],
      });

      const filter = (btnInteraction) => {
        return interaction.member === btnInteraction.member;
      };

      const collector = interaction.channel.createMessageComponentCollector({
        filter,
        time: 60000,
      });

      collector.on("collect", async (btnInteraction) => {
        if (btnInteraction.customId === "before" && index > 0) {
          index--;
        } else if (
          btnInteraction.customId === "next" &&
          amountToShow * (index + 1) < data.count
        ) {
          index++;
        }

        embed = new EmbedBuilder()
          .setColor("#e6101d")
          .setTitle(`Found ${data.count} ${category.toLowerCase()}`)
          .setDescription(
            `Page ${index + 1}/${Math.ceil(data.count / amountToShow)}`
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

        for (let i = 0; i < coloumn; i++) {
          let elements = elementsToString(
            getElements(
              data.results,
              index * amountToShow + i * (amountToShow / coloumn),
              amountToShow / coloumn
            )
          );

          if (elements.length > 0) {
            embed.addFields({ name: elements, value: "‎", inline: true });
          }
        }

        const row = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId("before")
              .setLabel("﹤")
              .setStyle(ButtonStyle.Primary)
              .setDisabled(index === 0)
          )
          .addComponents(
            new ButtonBuilder()
              .setCustomId("next")
              .setLabel("﹥")
              .setStyle(ButtonStyle.Primary)
              .setDisabled(amountToShow * (index + 1) >= data.count)
          );

        await btnInteraction.update({
          content: "‎",
          embeds: [embed],
          components: [row],
        });
      });
    } catch (err) {
      console.error(err);
      const embed = new EmbedBuilder()
        .setColor("#e6101d")
        .setTitle("Error")
        .setDescription("An error occurred while fetching the data.")
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
        content: "‎",
        ephemeral: true,
        embeds: [embed],
      });
    }
  },
};

const getElements = (data, startIndex, amount) => {
  return data.slice(startIndex, startIndex + amount);
};

const elementsToString = (data) => {
  return data
    .map((element) => element.index.capitalize().replaceAll("-", " "))
    .join("\n");
};

const fetchJSON = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    console.error("Error fetching data:", err);
    return null;
  }
};

String.prototype.capitalize = function () {
  return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase();
};
