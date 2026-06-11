import { SlashCommandBuilder, SlashCommandUserOption, SlashCommandStringOption } from '@discordjs/builders';import { REST } from '@discordjs/rest';
import { Routes, PermissionFlagsBits } from 'discord-api-types/v10';
const dotenv = require('dotenv');

dotenv.config();

const clientId = process.env.CLIENT_ID;
const token = process.env.BOT_TOKEN


if (!clientId) throw new Error("Client ID not defined in .env");
if (!token) throw new Error("Bot Token not defined in .env");

const commands = [
  new SlashCommandBuilder().setName("leaderboard").setDefaultMemberPermissions(PermissionFlagsBits.SendMessages).setDescription("Shows the leaderboards for who has the most XP in the server."),
  new SlashCommandBuilder().setName("level").setDefaultMemberPermissions(PermissionFlagsBits.SendMessages).setDescription("Shows your current level or another user's level").addUserOption(option => option.setName("user").setDescription("The user to check the level for").setRequired(false)),
  new SlashCommandBuilder().setName("givexp").setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames).setDescription("Gives XP to a user").addStringOption(option => option.setName("userid").setDescription("The user ID to give the XP to").setRequired(true)).addIntegerOption(option => option.setName("xp").setDescription("The amount of XP to set").setRequired(true)),
  new SlashCommandBuilder().setName("setlevel").setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames).setDescription("Sets the level of a user").addStringOption(option => option.setName("userid").setDescription("The user ID to set the level for").setRequired(true)).addIntegerOption(option => option.setName("level").setDescription("The level to set").setRequired(true)),
  new SlashCommandBuilder().setName("modleaderboard").setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers).setDescription("Shows the leaderboards for who hash the most XP out of the mods/brainlets in the server."),
  new SlashCommandBuilder().setName("exclusions").setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers).setDescription("Used to add members with certain roles to exclusion list. Only usable by D4rk"),
]
  .map(command => command.toJSON());


const rest = new REST({ version: '10' }).setToken(token);

rest.put(Routes.applicationCommands(clientId), { body: commands })
  .then(() => console.log('Successfully registered main server application commands.'))
  .catch(console.error);
