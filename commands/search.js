const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("search")
    .setDescription("Search in the D&D documentation")
    .addStringOption((option) =>
      option
        .setName("category")
        .setDescription("The category of the information you're looking for")
        .setRequired(true)
        .addChoices(
          { name: "Adventurer", value: "adventurer" },
          { name: "Race", value: "races" },
          { name: "Skill", value: "skills" },
          { name: "Spell", value: "spells" },
          { name: "Class", value: "classes" },
          { name: "Monster", value: "monsters" },
          { name: "Language", value: "languages" },
          { name: "Condition", value: "conditions" },
          { name: "Equipment", value: "equipment" },
          { name: "Magic Item", value: "magic-items" }
        )
    )
    .addStringOption((option) =>
      option
        .setName("keyword")
        .setDescription("The keyword that you want to search")
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply({ content: "Executing...", ephemeral: true });

    const category = interaction.options.getString("category");
    const keyword = interaction.options.getString("keyword");
    let url = "https://www.dnd5eapi.co/api/" + category;

    let words = keyword.toLowerCase().split(" ");
    url += "/" + words.join("-");
    console.log(url);

    try {
      const data = await fetchJSON(url);

      if (!data) {
        const embed = new EmbedBuilder()
          .setColor("#e6101d")
          .setTitle("Error")
          .setDescription(
            `The searched key ("${interaction.options.getString(
              "keyword"
            )}") was not found in the documentation. Try a different keyword!`
          )
          .setAuthor({
            name: "Dungeon Helper",
            iconURL: interaction.client.user.displayAvatarURL(),
          })
          .setThumbnail(interaction.client.user.displayAvatarURL())
          .setFooter({
            text: "Dungeon Helper",
            iconURL: interaction.client.user.displayAvatarURL(),
          });

        return await interaction.editReply({
          content: "‎",
          ephemeral: true,
          embeds: [embed],
        });
      }

      let embed = new EmbedBuilder()
        .setColor("#e6101d")
        .setTitle(data.name)
        .setAuthor({
          name: "Dungeon Helper",
          iconURL: interaction.client.user.displayAvatarURL(),
        })
        .setThumbnail(interaction.client.user.displayAvatarURL())
        .setFooter({
          text: "Dungeon Helper",
          iconURL: interaction.client.user.displayAvatarURL(),
        });

      // Handle different categories and data accordingly
      switch (category) {
        case "races":
          let traits = data.traits.map((trait) => trait.name).join("\n");
          embed.addFields(
            { name: "Alignment", value: data.alignment || "N/A", inline: true },
            { name: "Age", value: data.age || "N/A", inline: true },
            {
              name: "Size",
              value: data.size_description || "N/A",
              inline: true,
            },
            {
              name: "Languages",
              value: data.language_desc || "N/A",
              inline: true,
            },
            { name: "Traits", value: traits || "None", inline: false },
            {
              name: "Speed",
              value: data.speed.toString() || "N/A",
              inline: true,
            }
          );
          break;

        case "skills":
          embed.setDescription(data.desc[0] || "No description available.");
          break;

        case "spells":
          embed.setDescription(data.desc[0] || "No description available.");
          if (data.higher_level) {
            embed.addFields(
              {
                name: "Higher level",
                value: data.higher_level[0] || "N/A",
                inline: false,
              },
              { name: "Range", value: data.range || "N/A", inline: true },
              { name: "Duration", value: data.duration || "N/A", inline: true },
              {
                name: "Casting time",
                value: data.casting_time || "N/A",
                inline: true,
              },
              {
                name: "Attack Type",
                value: data.school.name || "N/A",
                inline: true,
              }
            );
          }
          if (data.damage) {
            embed.addFields({
              name: "Damage",
              value: data.damage.damage_type.name || "N/A",
              inline: true,
            });
          }
          embed.addFields(
            { name: "Level", value: data.level.toString(), inline: true },
            {
              name: "Classes",
              value: data.classes.map((c) => c.name).join("\n") || "None",
              inline: true,
            }
          );
          break;

        case "classes":
          if (data.spellcasting) {
            data.spellcasting.info.forEach((cast) => {
              embed.addFields({
                name: cast.name,
                value: cast.desc[0],
                inline: false,
              });
            });
          }

          if (
            data.proficiency_choices &&
            data.proficiency_choices[0].from.options
          ) {
            const skills = data.proficiency_choices[0].from.options
              .map((option) => option.item.name.replace("Skill: ", "")) // Extract the skill names
              .join("\n");
            embed.addFields({
              name: "Skills",
              value: skills || "None",
              inline: true,
            });
          }

          const items = data.proficiencies.map((item) => item.name).join("\n");

          embed.addFields({
            name: "Items",
            value: items || "None",
            inline: true,
          });
          break;

        case "monsters":
          embed.addFields(
            { name: "Size", value: data.size || "N/A", inline: true },
            {
              name: "Type",
              value: data.type.capitalize() || "N/A",
              inline: true,
            },
            {
              name: "Alignment",
              value: data.alignment.capitalize() || "N/A",
              inline: true,
            },
            { name: "Damage", value: data.hit_dice || "N/A", inline: true },
            {
              name: "Life",
              value: data.hit_points.toString() || "N/A",
              inline: true,
            },
            {
              name: "XP",
              value: (data.xp / 10).toString() || "N/A",
              inline: true,
            },
            {
              name: "Languages",
              value: data.languages.capitalize() || "N/A",
              inline: false,
            }
          );
          data.actions.forEach((action) => {
            embed.addFields({
              name: action.name,
              value: action.desc || "No description",
              inline: false,
            });
          });

          if (data.legendary_actions) {
            data.legendary_actions.forEach((action) => {
              embed.addFields({
                name: action.name,
                value: action.desc || "No description",
                inline: false,
              });
            });
          }

          if (data.special_abilities) {
            data.special_abilities.forEach((action) => {
              embed.addFields({
                name: action.name,
                value: action.desc || "No description",
                inline: false,
              });
            });
          }
          break;

        case "languages":
          embed.setDescription(data.desc || "No description available.");
          const speakers = data.typical_speakers.join("\n") || "N/A";
          embed.addFields(
            { name: "Speakers", value: speakers, inline: true },
            { name: "Type", value: data.type || "N/A", inline: true }
          );
          break;

        case "conditions":
          let conditionDesc = data.desc
            .map((desc) => desc.replace("- ", ""))
            .join("\n");
          embed.setDescription(conditionDesc || "No description available.");
          break;

        case "equipment":
          objectToEmbed(data, embed, true);
          break;

        case "magic-items":
          let magicDesc = data.desc.join("\n") || "No description available.";
          embed.setDescription(magicDesc);
          embed.addFields({
            name: "Category",
            value: data.equipment_category.name,
            inline: false,
          });
          break;

        default:
          embed.setDescription("No valid category selected.");
      }

      await interaction.editReply({
        content: "‎",
        ephemeral: true,
        embeds: [embed],
      });
    } catch (error) {
      console.error(error);
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
          text: "Dungeon Helper",
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

const fetchJSON = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};

const objectToEmbed = (obj, embed, isFirst = false) => {
  if (typeof obj === "object") {
    obj = Object.entries(obj);
  }

  obj.forEach(([key, value]) => {
    if (value) {
      key = key.toString();

      if ((value.isArray && value.length > 0) || typeof value === "object") {
        // Exceptions
        if (key === "cost") {
          embed.addFields({
            name: key.capitalize().replaceAll("_", " "),
            value: value.quantity.toString() + value.unit.toString(),
            inline: true,
          });
        } else {
          embed.addFields({
            name: key.capitalize().replaceAll("_", " "),
            value: objectToString(value, embed),
            inline: true,
          });
        }
      } else {
        if (!isFirst && key === "name" && key !== "index" && key !== "url") {
          embed.addFields({
            name: key.capitalize().replaceAll("_", " "),
            value: value.toString(),
            inline: true,
          });
        }
      }
    }
  });
};

const objectToString = (obj, embed) => {
  let string = "";

  if (typeof obj === "object") {
    obj = Object.entries(obj);
  }

  obj.forEach(([key, value]) => {
    if (value) {
      key = key.toString();

      if (typeof value === "object") {
        string += objectToString(value, embed);
      } else {
        if (key !== "index" && key !== "url") {
          string += value.toString() + "\n";
        }
      }
    }
  });

  return string;
};

String.prototype.capitalize = function () {
  return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase();
};
