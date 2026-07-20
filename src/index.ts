import { Client, ChannelType, GuildChannel, BaseInteraction, TextChannel, ChatInputCommandInteraction, ThreadChannel, EmbedBuilder, User, VoiceState, MessageFlags } from "discord.js";
import { GatewayIntentBits } from "discord-api-types/v10";
const fs = require("fs");
const path = require("path");
const dotenv = require('dotenv');

dotenv.config();

const guildId = process.env.GUILD_ID as string;
const clientId = process.env.CLIENT_ID as string;
const modBotCommands = process.env.MOD_BOT_COMMANDS as string;
const botCommands = process.env.BOT_COMMANDS as string;
const token = process.env.BOT_TOKEN as string;

if (!guildId) throw new Error("Guild ID not defined in .env");
if (!clientId) throw new Error("Client ID not defined in .env");
if (!modBotCommands) throw new Error("Mod bot commands not defined in .env");
if (!botCommands) throw new Error("Bot commands not defined in .env");
if (!token) throw new Error("Token not defined in .env");

const xpAmount = 2 * 1 // amount of xp to reward
const boosterAmount = 2 * 2 // amount of xp to reward members/boosters

const boosterRole = '879208362615660605';
const memberRole = '991035937544896572';
const twitchRole = '1336122168706207784';

const client = new Client({
  allowedMentions: {
    parse: [],
    repliedUser: false,
    roles: [],
    users: [],
  },
  intents: 0 |
    GatewayIntentBits.GuildModeration |
    GatewayIntentBits.GuildIntegrations |
    GatewayIntentBits.GuildMessageReactions |
    GatewayIntentBits.GuildMessageTyping |
    GatewayIntentBits.GuildMessages |
    GatewayIntentBits.GuildWebhooks |
    GatewayIntentBits.Guilds |
    GatewayIntentBits.GuildVoiceStates |
    0,
});

function isChannelPartOfStaffCategory(channel: GuildChannel): boolean {
  switch (channel.id) {
    case "1208857141394411537": // mod commands
      return true;
    default:
      const parent = channel.parent;
      return parent ? isChannelPartOfStaffCategory(parent) : false;
  }
}

function isInteractionOutsideStaffCategory(interaction: BaseInteraction): boolean {
  return interaction.channel ? !isChannelPartOfStaffCategory(interaction.channel as GuildChannel) : false;
}

interface UserData {
  id: string;
  xp: number;
  level: number;
  rank: number;
}

async function getUserArray() {
  const userDataDir = path.join(process.cwd(), "userData");
  let userArray: UserData[] = [];

  // read all files in the userData directory
  const files = fs.readdirSync(userDataDir);

  // loop through each file and log the contents
  files.forEach((file: string) => {
    if (file.endsWith(".json")) { // Check if the file is a JSON file
      const data: UserData = JSON.parse(fs.readFileSync(path.join(userDataDir, file), "utf8"));
      userArray.push(data);
    }
  });
  return userArray;
}

const COMMAND_exclusions = async (interaction: ChatInputCommandInteraction) => {
  if (!interaction.guild) {
    interaction.reply({ content: "This command must be used in a server!", flags: MessageFlags.Ephemeral });
    return;
  }

  if (interaction && interaction.member?.user.id !== "492041819446575115") {
    interaction.reply({ 
      content: "You don't have permission to use this command.",
       flags: MessageFlags.Ephemeral 
    });
  };

  // staff IDs to filter (mod leaderboard)
  const TARGET_ROLE_IDS = [
    "885732929161011252", // Server Staff
    "885733761134759957", // Other Staff
    "897673280369090602", // Brainlet
  ];

  const exclusionsFolderPath = path.join(process.cwd(), "exclusions");

  // exclusions folder for mod leaderboard
  if (!fs.existsSync(exclusionsFolderPath)) {
    fs.mkdirSync(exclusionsFolderPath);
  }

  // fetch all members from the guild
  const members = await interaction.guild.members.fetch();

  // filter members who have any of the target roles
  const filteredMembers = members.filter(member =>
    TARGET_ROLE_IDS.some(roleId => member.roles.cache.has(roleId))
  );

  // create empty JSON files for each filtered user
  filteredMembers.forEach(member => {
    const userFilePath = path.join(exclusionsFolderPath, `${member.id}.json`);
    if (!fs.existsSync(userFilePath)) {
      fs.writeFileSync(userFilePath, JSON.stringify({}, null, 2)); // Create empty JSON
    }
  });

  interaction.reply({
    content: `✅ Generated ${filteredMembers.size} exclusion files in the "exclusions" folder!`,
  });
};

const COMMAND_leaderboard = async (interaction: ChatInputCommandInteraction) => {
  if (interaction && interaction.channel) {
    if (interaction.channel.id === '874784242557653023') {

    } else if (interaction.channel.id !== '1353874751352995840') { // bot commands channel
      interaction.reply({
        content: 'You can only use this command in <#1353874751352995840>',
        flags: MessageFlags.Ephemeral
      });
      return;
    }
  }

  // defer reply for time to fetch files
  await interaction.deferReply();

  const rankArray = await getUserArray();

  // exclusions folder
  const exclusionsFolderPath = path.join(process.cwd(), "exclusions");

  // exclusions folder exists
  if (!fs.existsSync(exclusionsFolderPath)) {
    fs.mkdirSync(exclusionsFolderPath);
  }

  // get excluded user IDs from the filenames in exclusions
  const excludedUserIds = fs.readdirSync(exclusionsFolderPath)
    .map((file: string) => file.replace(".json", "")); // Convert file names back into user IDs

  // filter out users present in the exclusions folder
  const filteredRankArray = rankArray.filter((user: UserData) => !excludedUserIds.includes(user.id));

  // sort the filtered array by level in descending order, using XP as a tiebreaker
  filteredRankArray.sort((a: UserData, b: UserData) => b.level - a.level || b.xp - a.xp);

  // assign ranks
  filteredRankArray.forEach((user: UserData, index: number) => {
    user.rank = index + 1;

    const userFilePath = path.join(__dirname, "userData", `${user.id}.json`);
    if (fs.existsSync(userFilePath)) {
      const userData = JSON.parse(fs.readFileSync(userFilePath, "utf8"));
      userData.rank = user.rank;
      fs.writeFileSync(userFilePath, JSON.stringify(userData, null, 2));
    }
  });

  // create leaderboard content
  const topThree = filteredRankArray.slice(0, 3);
  const rest = filteredRankArray.slice(3, 10);

  const topThreeContent = topThree
    .map((user, index) => `**#${index + 1} <@${user.id}>**\nLevel: ${user.level}\nXP: ${user.xp}`)
    .join("\n\n");

  const leaderboardContent = rest
    .map((user, index) => `#${index + 4} <@${user.id}> | Level: ${user.level} | XP: ${user.xp}`)
    .join("\n");

  // build the embed
  const embed = {
    color: 0xFFD700, // Gold color
    title: "🏆 Leaderboard 🏆",
    description: "Here are the top players in the server!",
    fields: [
      { name: "🥇 Top 3 Players", value: topThreeContent || "No players yet!", inline: false },
      { name: "Other Rankings", value: leaderboardContent || "No other players ranked yet!", inline: false },
    ],
    timestamp: new Date().toISOString(),
    footer: {
      text: "Keep grinding to climb the leaderboard!",
    },
  };

  // send the embed (no deferred reply needed)
  await interaction.editReply({
    content: '',
    embeds: [embed],
  });
};

const COMMAND_modleaderboard = async (interaction: ChatInputCommandInteraction) => {
  if (interaction && interaction.channel) {
    if (interaction.channel.id === '874784242557653023') {

    } else if (interaction.channel.id !== '1353874751352995840') { // bot commands channel
      interaction.reply({
        content: 'You can only use this command in <#1353874751352995840>',
        flags: MessageFlags.Ephemeral
      });
      return;
    }
  }

  const rankArray = await getUserArray();

  // exclusions folder
  const exclusionsFolderPath = path.join(process.cwd(), "exclusions");

  // exclusions folder exists
  if (!fs.existsSync(exclusionsFolderPath)) {
    fs.mkdirSync(exclusionsFolderPath);
  }

  // get filtered user IDs in exclusions
  const includedUserIds = fs.readdirSync(exclusionsFolderPath)
    .map((file: string) => file.replace(".json", "")); // Convert filenames to user IDs

  // filter to only include users in exclusions (mods only leaderboard)
  const filteredRankArray = rankArray.filter((user: UserData) => includedUserIds.includes(user.id));

  // sort the filtered array by level in descending order, using XP as a tiebreaker
  filteredRankArray.sort((a: UserData, b: UserData) => b.level - a.level || b.xp - a.xp);

  // assign ranks
  filteredRankArray.forEach((user: UserData, index: number) => {
    user.rank = index + 1;

    const userFilePath = path.join(__dirname, "userData", `${user.id}.json`);
    if (fs.existsSync(userFilePath)) {
      const userData = JSON.parse(fs.readFileSync(userFilePath, "utf8"));
      userData.rank = user.rank;
      fs.writeFileSync(userFilePath, JSON.stringify(userData, null, 2));
    }
  });

  // create leaderboard content
  const topThree = filteredRankArray.slice(0, 3);
  const rest = filteredRankArray.slice(3, 10);

  const topThreeContent = topThree
    .map((user: UserData, index: number) => `**#${index + 1} <@${user.id}>**\nLevel: ${user.level}\nXP: ${user.xp}`)
    .join("\n\n");

  const leaderboardContent = rest
    .map((user: UserData, index: number) => `#${index + 4} <@${user.id}> | Level: ${user.level} | XP: ${user.xp}`)
    .join("\n");

  // build the embed
  const embed = {
    color: 0xFFD700, // Gold color
    title: "🏆 Mod Leaderboard 🏆",
    description: "Here are the top ranked staff and brainlet members!",
    fields: [
      { name: "🥇 Top 3 Mods", value: topThreeContent || "No mods ranked yet!", inline: false },
      { name: "Other Rankings", value: leaderboardContent || "No other mods ranked yet!", inline: false },
    ],
    timestamp: new Date().toISOString(),
    footer: {
      text: "Keep grinding to climb the mod leaderboard!",
    },
  };

  // send the embed (no deferred reply needed)
  interaction.reply({
    embeds: [embed],
  });
};

const COMMAND_givexp = async (interaction: ChatInputCommandInteraction) => {
  if (interaction && interaction.channel) {
    if (interaction.channel.id === '874784242557653023') {

    } else {
      interaction.reply({
        content: "You don't have permission to use this command.",
        flags: MessageFlags.Ephemeral
      })
      return;
    }
  }

  const userId = interaction.options.getString('userid', true);
  const amount = interaction.options.getInteger('xp', true);

  await updateXP(userId, amount);

  interaction.reply({
    content: `Successfully gave ${amount} XP for user <@${userId}>.`,
    ephemeral: false
  });
};

const COMMAND_setlevel = async (interaction: ChatInputCommandInteraction) => {
  if (interaction && interaction.channel) {
    if (interaction.channel.id === '874784242557653023') {

    } else {
      interaction.reply({
        content: "You don't have permission to use this command.",
        flags: MessageFlags.Ephemeral
      })
      return;
    }
  }

  const userId = interaction.options.getString('userid', true);
  const level = interaction.options.getInteger('level', true);

  const userDataDir = "./userData";
  const userDataFile = path.join(userDataDir, `${userId}.json`);

  let userData;
  if (!fs.existsSync(userDataFile)) {
    userData = {
      id: userId,
      xp: 0,
      level: level,
      rank: null,
    };
  } else {
    userData = JSON.parse(fs.readFileSync(userDataFile, "utf8"));
    userData.level = level;
  }

  fs.writeFileSync(userDataFile, JSON.stringify(userData, null, 2));
  await updateLevel(userId);

  interaction.reply({
    content: `Successfully set Level ${level} for user <@${userId}>.`,
    ephemeral: false
  });
};

function getLevelData(userId: string): Promise<UserData | null> {
  return new Promise((resolve, reject) => {
    const filePath = path.join(process.cwd(), `./userData/${userId}.json`);
    fs.readFile(filePath, "utf8", (err: any, data: any) => {
      if (err) {
        if (err.code === "ENOENT") {
          resolve(null); // return null if the file does not exist
        } else {
          reject(err); // reject the promise for other errors
        }
      } else {
        try {
          const userData: UserData = JSON.parse(data); // use the UserData interface here
          resolve({
            id: userId,
            level: userData.level,
            xp: userData.xp,
            rank: 0, // placeholder rank to be calculated later
          });
        } catch (parseError) {
          reject(parseError); // reject if JSON parsing fails
        }
      }
    });
  });
}

const COMMAND_level = async (interaction: ChatInputCommandInteraction) => {
  if (interaction && interaction.channel) {
    if (interaction.channel.id === '874784242557653023') {

    } else if (interaction.channel.id !== '1353874751352995840') { // bot commands channel
      interaction.reply({
        content: 'You can only use this command in <#1353874751352995840>',
        flags: MessageFlags.Ephemeral
      });
      return;
    }
  }

  await interaction.deferReply();

  // get the target user (optional input), default to the command user
  const targetUser = interaction.options.getUser("user") || interaction.user;
  const targetUserId = targetUser.id;

  // fetch all user data to determine ranks
  const allUsers = await getUserArray();
  allUsers.sort((a, b) => b.level - a.level || b.xp - a.xp); // sort by level and XP

  // determine the rank for the target user
  let userRank = 0;
  allUsers.forEach((user, index) => {
    if (user.id === targetUserId) {
      userRank = index + 1; // Rank starts at 1
    }
  });

  // fetch the target user's specific data
  const userData = await getLevelData(targetUserId);

  if (!userData) {
    interaction.editReply({
      content: `${
        targetUser === interaction.user
          ? "You have no level data yet. Start interacting to gain XP!"
          : `${targetUser.username} has no level data yet.`
      }`
    });
    return;
  }

  // build the embed
  const embed = {
    color: 0x00FF00, // Green color
    title: `${targetUser.username}'s Profile`,
    thumbnail: {
      url: targetUser.displayAvatarURL(), // profile picture
    },
    fields: [
      { name: "Level", value: userData.level.toString(), inline: true },
      { name: "XP", value: userData.xp.toString(), inline: true },
      { name: "Rank", value: `#${userRank}`, inline: true },
    ],
    timestamp: new Date().toISOString(),
    footer: {
      text: "Keep leveling up to climb the leaderboard!",
    },
  };

  // reply with the embed
  interaction.editReply({
    embeds: [embed],
  });
};

async function updateXP(userId: string, amount: number) {
  const userDataDir = "./userData";
  const userDataFile = path.join(userDataDir, `${userId}.json`);

  let userData;

  // check if the user file exists, and if not, create it with default values
  if (!fs.existsSync(userDataFile)) {
    userData = {
      id: userId,
      xp: 0,
      level: 1,
      rank: null,
    };
  } else {
    // read existing data
    userData = JSON.parse(fs.readFileSync(userDataFile, "utf8"));
  }

  // update XP
  userData.xp += amount;

  // write updated data back to the file
  fs.writeFileSync(userDataFile, JSON.stringify(userData, null, 2));
}

interface Milestone {
  level: string;
  id: string; // Role ID
}

const milestones: Milestone[] = [
  { level: '5', id: '1353900276158955571' },
  { level: '10', id: '1353900328780566628' },
  { level: '15', id: '1355249867722592369' },
  { level: '20', id: '1353900370115690587' },
  { level: '30', id: '1353900382916448306' },
  { level: '40', id: '1353900397244186735' },
  { level: '50', id: '1353900414398890115' },
  { level: '60', id: '1353900431595667466' },
  { level: '70', id: '1353900443998097541' },
  { level: '80', id: '1353900457801814058' },
  { level: '90', id: '1353900468006289498' },
  { level: '100', id: '1353900481961000971' },
];

async function assignRole(userId: string, milestoneId: string, previousMilestoneId: any, guild: any) {
  const member = await guild.members.fetch(userId);

  // add the current milestone role if the user doesn't have it
  if (!member.roles.cache.has(milestoneId)) {
    await member.roles.add(milestoneId);
  }

  // remove the previous milestone role if it exists and the user has it
  if (previousMilestoneId && member.roles.cache.has(previousMilestoneId)) {
    await member.roles.remove(previousMilestoneId);
  }
}


async function updateLevel(userId: string) {
  const userDataDir = "./userData";
  const userDataFile = path.join(userDataDir, `${userId}.json`);

  let userData;
  userData = JSON.parse(fs.readFileSync(userDataFile, "utf8"));

  // calculate next level XP
  const nextLevelXp = userData.level * 100;

  // level-up logic
  if (userData.xp >= nextLevelXp) {
    userData.level++;
    userData.xp = 0; // Reset XP after leveling up
  }

  // milestone roles assignment
  const guild = client.guilds.cache.get(guildId);
  if (!guild) {
    console.log("Guild is undefined!");
    return;
  }

  const milestone = milestones.find(m => parseInt(m.level) === userData.level);
  const previousMilestone5 = milestones.find(m => parseInt(m.level) === userData.level - 5);
  const previousMilestone10 = milestones.find(m => parseInt(m.level) === userData.level - 10)

  switch (milestone) {
    case milestones[0]: // level 5
      assignRole(userId, milestone.id, null, guild);
      break;
    case milestones[1]: // level 10
      assignRole(userId, milestone.id, previousMilestone5 ? previousMilestone5.id : null, guild);
      break;
    case milestones[2]: // level 15
      assignRole(userId, milestone.id, previousMilestone5 ? previousMilestone5.id : null, guild);
      break;
    case milestones[3]: // level 20
      assignRole(userId, milestone.id, previousMilestone5 ? previousMilestone5.id : null, guild);
      break;
    case milestones[4]: // level 30
      assignRole(userId, milestone.id, previousMilestone10 ? previousMilestone10.id : null, guild);
      break;
    case milestones[5]: // level 40
      assignRole(userId, milestone.id, previousMilestone10 ? previousMilestone10.id : null, guild);
      break;
    case milestones[6]: // level 50
      assignRole(userId, milestone.id, previousMilestone10 ? previousMilestone10.id : null, guild);
      break;
    case milestones[7]: // level 60
      assignRole(userId, milestone.id, previousMilestone10 ? previousMilestone10.id : null, guild);
      break;
    case milestones[8]: // level 70
      assignRole(userId, milestone.id, previousMilestone10 ? previousMilestone10.id : null, guild);
      break;
    case milestones[9]: // level 80
      assignRole(userId, milestone.id, previousMilestone10 ? previousMilestone10.id : null, guild);
      break;
    case milestones[10]: // level 90
      assignRole(userId, milestone.id, previousMilestone10 ? previousMilestone10.id : null, guild);
      break;
    case milestones[11]: // level 100
      assignRole(userId, milestone.id, previousMilestone10 ? previousMilestone10.id : null, guild);
      break;
    default:
      break;
  }
  fs.writeFileSync(userDataFile, JSON.stringify(userData, null, 2));
}

const cooldowns = new Map()

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (message.member && message.member.roles.cache.has('1355615190665924698')) return;
  if (message.channel.isThread()) return;
  if (message.channel.isVoiceBased()) return;

  const cooldown = 2 * 1000
  const messageTime = cooldowns.get(message.author.id) || 0;

  if (Date.now() - messageTime < cooldown) {
    return;
  }
  
  if (message.member?.roles.cache.has(boosterRole) || message.member?.roles.cache.has(memberRole) || message.member?.roles.cache.has(twitchRole)) {
    updateXP(message.author.id, boosterAmount)
    updateLevel(message.author.id)
  } else {
    updateXP(message.author.id, xpAmount)
    updateLevel(message.author.id)
  }
  cooldowns.set(message.author.id, Date.now());
});

const voiceTimers: Map<string, NodeJS.Timeout> = new Map();

client.on("voiceStateUpdate", async (oldState: VoiceState, newState: VoiceState) => {
  const stateMember = newState.member || oldState.member;
  if (!stateMember || !stateMember.user) return;
  
  const userId = stateMember.user.id;
  const restrictedRoleId = '1355615190665924698';

  if (!oldState.channelId && newState.channelId) {
    if (stateMember.roles.cache.has(restrictedRoleId)) return;

    if (!voiceTimers.has(userId)) {
      const timer = setInterval(() => {
        const currentMember = newState.guild.members.cache.get(userId);
        
        if (
          !currentMember || 
          !currentMember.voice.channel ||
          currentMember.voice.channel.members.size < 2 ||
          currentMember.roles.cache.has(restrictedRoleId)
        ) {
          return;
        }

        if (currentMember.roles.cache.has(boosterRole) || currentMember.roles.cache.has(memberRole) || currentMember.roles.cache.has(twitchRole)) {
          updateXP(userId, 60);
          updateLevel(userId);
        } else {
          updateXP(userId, 30);
          updateLevel(userId);
        }
      }, 60000 * 15);
      voiceTimers.set(userId, timer);
    }
  }

  if (oldState.channelId && !newState.channelId) {
    if (voiceTimers.has(userId)) {
      const timer = voiceTimers.get(userId);
      if (timer) {
        clearInterval(timer);
        voiceTimers.delete(userId);
      }
    }
  }
});

// Terrible Command Handler

client.on("interactionCreate", async (interaction) => {
  if (interaction.isChatInputCommand()) {
    try {
      // Slash Commands
      switch (interaction.commandName) {
        case "leaderboard":
          await COMMAND_leaderboard(interaction);
          return
        case "modleaderboard":
          await COMMAND_modleaderboard(interaction);
          return;
        case "level":
          await COMMAND_level(interaction);
          return;
        case "givexp":
          await COMMAND_givexp(interaction);
          return;
        case "setlevel":
          await COMMAND_setlevel(interaction);
          return;
        case "exclusions":
          await COMMAND_exclusions(interaction);
          return;
        default:
          await interaction.reply({
            content: "Unknown command.",
          });
      }
    } catch (error) {
      try {
        await interaction.reply({
          content: "An error has occured.",
          ephemeral: isInteractionOutsideStaffCategory(interaction),
        });
      } catch {
        await interaction.editReply({
          content: "An error has occured",
        });
      }
      console.error(error);
    }
  }
});

// When bot is ready
client.on("ready", async () => {
  await new Promise((resolve) => setTimeout(resolve, 0));

  const dataFolder = './userData';

  if (!fs.existsSync(dataFolder)) {
    fs.mkdirSync(dataFolder);
    console.log('created data folder');
  } else {
    console.log(`${client.user?.username} is ready`);
    return
  }
  console.log(`${client.user?.username} is ready.`);
});

// Login
client.login(token);
