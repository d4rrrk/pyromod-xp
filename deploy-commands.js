"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var builders_1 = require("@discordjs/builders");
var rest_1 = require("@discordjs/rest");
var v10_1 = require("discord-api-types/v10");
var dotenv = require('dotenv');
dotenv.config();
var clientId = process.env.CLIENT_ID;
var token = process.env.BOT_TOKEN;
if (!clientId)
    throw new Error("Client ID not defined in .env");
if (!token)
    throw new Error("Bot Token not defined in .env");
var commands = [
    new builders_1.SlashCommandBuilder().setName("leaderboard").setDefaultMemberPermissions(v10_1.PermissionFlagsBits.SendMessages).setDescription("Shows the leaderboards for who has the most XP in the server."),
    new builders_1.SlashCommandBuilder().setName("level").setDefaultMemberPermissions(v10_1.PermissionFlagsBits.SendMessages).setDescription("Shows your current level or another user's level").addUserOption(function (option) { return option.setName("user").setDescription("The user to check the level for").setRequired(false); }),
    new builders_1.SlashCommandBuilder().setName("givexp").setDefaultMemberPermissions(v10_1.PermissionFlagsBits.ManageNicknames).setDescription("Gives XP to a user").addStringOption(function (option) { return option.setName("userid").setDescription("The user ID to give the XP to").setRequired(true); }).addIntegerOption(function (option) { return option.setName("xp").setDescription("The amount of XP to set").setRequired(true); }),
    new builders_1.SlashCommandBuilder().setName("setlevel").setDefaultMemberPermissions(v10_1.PermissionFlagsBits.ManageNicknames).setDescription("Sets the level of a user").addStringOption(function (option) { return option.setName("userid").setDescription("The user ID to set the level for").setRequired(true); }).addIntegerOption(function (option) { return option.setName("level").setDescription("The level to set").setRequired(true); }),
    new builders_1.SlashCommandBuilder().setName("modleaderboard").setDefaultMemberPermissions(v10_1.PermissionFlagsBits.MoveMembers).setDescription("Shows the leaderboards for who hash the most XP out of the mods/brainlets in the server."),
    new builders_1.SlashCommandBuilder().setName("exclusions").setDefaultMemberPermissions(v10_1.PermissionFlagsBits.MoveMembers).setDescription("Used to add members with certain roles to exclusion list. Only usable by D4rk"),
]
    .map(function (command) { return command.toJSON(); });
var rest = new rest_1.REST({ version: '10' }).setToken(token);
rest.put(v10_1.Routes.applicationCommands(clientId), { body: commands })
    .then(function () { return console.log('Successfully registered main server application commands.'); })
    .catch(console.error);
