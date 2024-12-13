const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

const thumbnail =
  "https://cdn.discordapp.com/attachments/428214132613971979/929025586129682462/image_processing20201020-1513-1a7pmsx.gif";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("roll")
    .setDescription("Roll dice according to a given formula")
    .addStringOption((option) =>
      option
        .setName("formula")
        .setDescription("The formula for the roll")
        .setRequired(true)
    )
    .addBooleanOption((option) =>
      option
        .setName("private")
        .setDescription("Private roll")
        .setRequired(false)
    ),

  async execute(interaction) {
    let private = false;

    if (interaction.options.getBoolean("private")) {
      private = interaction.options.getBoolean("private");
    }

    await interaction.deferReply({
      content: "Executing...",
      ephemeral: private,
    });

    const formula = interaction.options.getString("formula");

    const { numbers, dices } = getTotal(formula);

    let index = 0;

    const embed = new EmbedBuilder()
      .setColor("#e6101d")
      .setTitle(`Your roll result is ${numbers[index]}`)
      .setDescription(
        `You've launched some dice with all your might and you obtained: ${numbers[index]}`
      )
      .addFields(
        { name: "Used Formula", value: formula, inline: false },
        { name: "Singles Rolls", value: dices[index], inline: false }
      )
      .setAuthor({
        name: "Dungeon Helper",
        iconURL: interaction.client.user.displayAvatarURL(),
      })
      .setThumbnail(thumbnail)
      .setFooter({
        text: "Dungeon Helper",
        iconURL: interaction.client.user.displayAvatarURL(),
      });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("back")
        .setLabel("﹤")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(index === 0),
      new ButtonBuilder()
        .setCustomId("roll")
        .setEmoji("🎲")
        .setLabel("Roll again")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("next")
        .setLabel("﹥")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(index === numbers.length - 1)
    );

    await interaction.editReply({
      content: "‎",
      ephemeral: private,
      embeds: [embed],
      components: [row],
    });

    const collector = interaction.channel.createMessageComponentCollector({
      time: 60000,
    });

    collector.on("collect", async (i) => {
      if (i.component.customId === "back" || i.component.customId === "next") {
        if (i.component.customId === "back") {
          index--;
        } else {
          index++;
        }

        const embed = new EmbedBuilder()
          .setColor("#e6101d")
          .setTitle(`Your roll result is ${numbers[index]}`)
          .setDescription(
            `You've launched some dice with all your might and you obtained: ${numbers[index]}`
          )
          .addFields(
            { name: "Used Formula", value: formula, inline: false },
            { name: "Singles Rolls", value: dices[index], inline: false }
          )
          .setAuthor({
            name: "Dungeon Helper",
            iconURL: interaction.client.user.displayAvatarURL(),
          })
          .setThumbnail(thumbnail)
          .setFooter({
            text: "Dungeon Helper",
            iconURL: interaction.client.user.displayAvatarURL(),
          });

        row.components[0].setDisabled(index === 0);
        row.components[row.components.length - 1].setDisabled(
          index === numbers.length - 1
        );

        await i.update({
          content: "‎",
          ephemeral: private,
          embeds: [embed],
          components: [row],
        });
      } else if (i.component.customId === "roll") {
        const { numbers, dices } = getTotal(formula);

        index = 0;

        const embed = new EmbedBuilder()
          .setColor("#e6101d")
          .setTitle(`Your roll result is ${numbers[index]}`)
          .setDescription(
            `You've launched some dice with all your might and you obtained: ${numbers[index]}`
          )
          .addFields(
            { name: "Used Formula", value: formula, inline: false },
            { name: "Singles Rolls", value: dices[index], inline: false }
          )
          .setAuthor({
            name: "Dungeon Helper",
            iconURL: interaction.client.user.displayAvatarURL(),
          })
          .setThumbnail(thumbnail)
          .setFooter({
            text: "Dungeon Helper",
            iconURL: interaction.client.user.displayAvatarURL(),
          });

        row.components[0].setDisabled(index === 0);
        row.components[row.components.length - 1].setDisabled(
          index === numbers.length - 1
        );

        await i.update({
          content: "‎",
          ephemeral: private,
          embeds: [embed],
          components: [row],
        });
      }
    });

    collector.on("end", async () => {
      row.components.forEach((c) => {
        c.setDisabled(true);
      });

      await interaction.editReply({
        content: "‎",
        ephemeral: private,
        embeds: [embed],
        components: [row],
      });
    });
  },
};

const isNumber = (n) => {
  return (
    !isNaN(parseFloat(n)) &&
    isFinite(n) &&
    n !== "," &&
    n !== "+" &&
    n !== "-" &&
    n !== "*" &&
    n !== "/"
  );
};

const getTotal = (formula) => {
  let numbers = [];

  const rolls = formula.split(" ");

  rolls.forEach((roll) => {
    var filtered = roll.split("d").filter(function (el) {
      return el !== null && el !== "";
    });

    if (roll.includes("d")) {
      if (filtered.length > 1) {
        let numTemp = [];
        for (let i = 0; i < filtered[0]; i++) {
          numTemp.push(Math.floor(Math.random() * filtered[1] + 1));
        }
        numbers.push(numTemp);
      } else {
        numbers.push(Math.floor(Math.random() * filtered[0] + 1));
      }
    }
  });

  let total = [];
  let dices = [];

  let numIndex = 0,
    totIndex = -1;
  let operation = ",";

  rolls.forEach((roll) => {
    if (roll.includes("d") || isNumber(roll)) {
      let value = 0;
      let dice = "";

      if (roll.includes("d")) {
        dice = roll + " = ";

        if (Array.isArray(numbers[numIndex])) {
          let tDice = "[";

          for (let i = 0; i < numbers[numIndex].length; i++) {
            let num = numbers[numIndex][i];

            value += parseInt(num);
            tDice += num;

            if (i !== numbers[numIndex].length - 1) {
              tDice += ", ";
            }
          }

          tDice += "] ";

          dice += value;
          dice += tDice + "\n";
        } else {
          value = parseInt(numbers[numIndex]);
          dice += value + "\n";
        }

        if (operation === ",") {
          dices.push(dice);
        } else {
          dices[totIndex] += dice;
        }

        numIndex++;
      } else {
        value = parseInt(roll);
      }

      switch (operation) {
        case "+":
          total[totIndex] += value;
          break;
        case "-":
          total[totIndex] -= value;
          break;
        case "*":
          total[totIndex] *= value;
          break;
        case "/":
          total[totIndex] /= value;
          break;
        case ",":
          total.push(value);
          totIndex++;
          break;
        default:
          break;
      }

      operation = ",";
    } else {
      operation = roll;
    }
  });

  return {
    numbers: total,
    dices: dices,
  };
};
