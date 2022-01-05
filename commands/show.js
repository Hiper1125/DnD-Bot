const { SlashCommandBuilder } = require("@discordjs/builders");
const { Permissions, MessageEmbed } = require("discord.js");
var XMLHttpRequest = require("xhr2");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("show")
    .setDescription("Show a category of the D&D documentation")

    .addStringOption((option) =>
      option
        .setName("category")
        .setDescription("The category of the information you're looking for")
        .setRequired(true)
        .addChoice("Feats", "feats")
        .addChoice("Races", "races")
        .addChoice("Spells", "spells")
        .addChoice("Classes", "classes")
        .addChoice("Monsters", "monsters")
        .addChoice("Languages", "languages")
        .addChoice("Equipement", "equipement")
    ),

  async execute(interaction) {
    await interaction.deferReply({ content: "Executing...", ephemeral: true });

    const category = interaction.options.getString("category");
    var url = "https://www.dnd5eapi.co/api/" + category;

    console.log(url);

    getJSON(url, async function (err, data) {
      if (err !== null) {
        const embed = new MessageEmbed()
          .setColor("#e6101d")
          .setTitle("Error " + err)
          .setDescription(
            "The searched category (" +
              interaction.options.getString("keyword") +
              ") was not found on the documentation, try with a different one!"
          )
          .setAuthor("Dungeon Helper", DungeonHelper.user.displayAvatarURL())
          .setThumbnail(DungeonHelper.user.displayAvatarURL())
          .setFooter("Dungeon Helper", DungeonHelper.user.displayAvatarURL());

        await interaction.editReply({
          content: "‎",
          ephemeral: true,
          embeds: [embed],
        });
      } else {
        //different embed based on the choosen category

        let embed = new MessageEmbed()
          .setColor("#e6101d")
          .setTitle(data.name)
          .setAuthor("Dungeon Helper", DungeonHelper.user.displayAvatarURL())
          .setThumbnail(DungeonHelper.user.displayAvatarURL())
          .setFooter("Dungeon Helper", DungeonHelper.user.displayAvatarURL());

        switch (category) {
          case "classes":
            break;
          case "races":
            break;
          case "equipement":
            break;
          case "spells":
            embed.setDescription(data.desc[0]);
            break;
          case "monsters":
            break;
          case "feats":
            break;
          case "languages":
            break;
        }

        await interaction.editReply({
          content: "‎",
          ephemeral: true,
          embeds: [embed],
        });

        //console.log(JSON.stringify(data, null, 2));
      }
    });
  },
};

const getJSON = (url, callback) => {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.responseType = "json";
  xhr.onload = function () {
    var status = xhr.status;
    if (status === 200) {
      callback(null, xhr.response);
    } else {
      callback(status, xhr.response);
    }
  };
  xhr.send();
};