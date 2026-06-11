"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var discord_js_1 = require("discord.js");
var v10_1 = require("discord-api-types/v10");
var fs = require("fs");
var path = require("path");
var dotenv = require('dotenv');
dotenv.config();
var guildId = process.env.GUILD_ID;
var clientId = process.env.CLIENT_ID;
var modBotCommands = process.env.MOD_BOT_COMMANDS;
var botCommands = process.env.BOT_COMMANDS;
var token = process.env.BOT_TOKEN;
if (!guildId)
    throw new Error("Guild ID not defined in .env");
if (!clientId)
    throw new Error("Client ID not defined in .env");
if (!modBotCommands)
    throw new Error("Mod bot commands not defined in .env");
if (!botCommands)
    throw new Error("Bot commands not defined in .env");
if (!token)
    throw new Error("Token not defined in .env");
var xpAmount = 2 * 1; // amount of xp to reward
var boosterAmount = 2 * 2; // amount of xp to reward members/boosters
var boosterRole = '879208362615660605';
var memberRole = '991035937544896572';
var twitchRole = '1336122168706207784';
var client = new discord_js_1.Client({
    allowedMentions: {
        parse: [],
        repliedUser: false,
        roles: [],
        users: [],
    },
    intents: 0 |
        v10_1.GatewayIntentBits.GuildModeration |
        v10_1.GatewayIntentBits.GuildIntegrations |
        v10_1.GatewayIntentBits.GuildMembers |
        v10_1.GatewayIntentBits.GuildMessageReactions |
        v10_1.GatewayIntentBits.GuildMessageTyping |
        v10_1.GatewayIntentBits.GuildMessages |
        v10_1.GatewayIntentBits.GuildPresences |
        v10_1.GatewayIntentBits.GuildWebhooks |
        v10_1.GatewayIntentBits.Guilds |
        v10_1.GatewayIntentBits.MessageContent |
        v10_1.GatewayIntentBits.GuildVoiceStates |
        0,
});
function isChannelPartOfStaffCategory(channel) {
    switch (channel.id) {
        case "1208857141394411537": // mod commands
            return true;
        default:
            var parent_1 = channel.parent;
            return parent_1 ? isChannelPartOfStaffCategory(parent_1) : false;
    }
}
function isInteractionOutsideStaffCategory(interaction) {
    return interaction.channel ? !isChannelPartOfStaffCategory(interaction.channel) : false;
}
function getUserArray() {
    return __awaiter(this, void 0, void 0, function () {
        var userDataDir, userArray, files;
        return __generator(this, function (_a) {
            userDataDir = path.join(process.cwd(), "userData");
            userArray = [];
            files = fs.readdirSync(userDataDir);
            // loop through each file and log the contents
            files.forEach(function (file) {
                if (file.endsWith(".json")) { // Check if the file is a JSON file
                    var data = JSON.parse(fs.readFileSync(path.join(userDataDir, file), "utf8"));
                    userArray.push(data);
                }
            });
            return [2 /*return*/, userArray];
        });
    });
}
var COMMAND_exclusions = function (interaction) { return __awaiter(void 0, void 0, void 0, function () {
    var TARGET_ROLE_IDS, exclusionsFolderPath, members, filteredMembers;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (!interaction.guild) {
                    interaction.reply({ content: "This command must be used in a server!", ephemeral: true });
                    return [2 /*return*/];
                }
                if (interaction && ((_a = interaction.member) === null || _a === void 0 ? void 0 : _a.user.id) !== "492041819446575115") {
                    interaction.reply({
                        content: "You don't have permission to use this command.",
                        ephemeral: true
                    });
                }
                ;
                TARGET_ROLE_IDS = [
                    "885732929161011252", // Server Staff
                    "885733761134759957", // Other Staff
                    "897673280369090602", // Brainlet
                ];
                exclusionsFolderPath = path.join(process.cwd(), "exclusions");
                // exclusions folder for mod leaderboard
                if (!fs.existsSync(exclusionsFolderPath)) {
                    fs.mkdirSync(exclusionsFolderPath);
                }
                return [4 /*yield*/, interaction.guild.members.fetch()];
            case 1:
                members = _b.sent();
                filteredMembers = members.filter(function (member) {
                    return TARGET_ROLE_IDS.some(function (roleId) { return member.roles.cache.has(roleId); });
                });
                // create empty JSON files for each filtered user
                filteredMembers.forEach(function (member) {
                    var userFilePath = path.join(exclusionsFolderPath, "".concat(member.id, ".json"));
                    if (!fs.existsSync(userFilePath)) {
                        fs.writeFileSync(userFilePath, JSON.stringify({}, null, 2)); // Create empty JSON
                    }
                });
                interaction.reply({
                    content: "\u2705 Generated ".concat(filteredMembers.size, " exclusion files in the \"exclusions\" folder!"),
                });
                return [2 /*return*/];
        }
    });
}); };
var COMMAND_leaderboard = function (interaction) { return __awaiter(void 0, void 0, void 0, function () {
    var rankArray, exclusionsFolderPath, excludedUserIds, filteredRankArray, topThree, rest, topThreeContent, leaderboardContent, embed;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (interaction && interaction.channel) {
                    if (interaction.channel.id === '874784242557653023') {
                    }
                    else if (interaction.channel.id !== '1353874751352995840') { // bot commands channel
                        interaction.reply({
                            content: 'You can only use this command in <#1353874751352995840>',
                            ephemeral: true
                        });
                        return [2 /*return*/];
                    }
                }
                // defer reply for time to fetch files
                return [4 /*yield*/, interaction.deferReply()];
            case 1:
                // defer reply for time to fetch files
                _a.sent();
                return [4 /*yield*/, getUserArray()];
            case 2:
                rankArray = _a.sent();
                exclusionsFolderPath = path.join(process.cwd(), "exclusions");
                // exclusions folder exists
                if (!fs.existsSync(exclusionsFolderPath)) {
                    fs.mkdirSync(exclusionsFolderPath);
                }
                excludedUserIds = fs.readdirSync(exclusionsFolderPath)
                    .map(function (file) { return file.replace(".json", ""); });
                filteredRankArray = rankArray.filter(function (user) { return !excludedUserIds.includes(user.id); });
                // sort the filtered array by level in descending order, using XP as a tiebreaker
                filteredRankArray.sort(function (a, b) { return b.level - a.level || b.xp - a.xp; });
                // assign ranks
                filteredRankArray.forEach(function (user, index) {
                    user.rank = index + 1;
                    var userFilePath = path.join(__dirname, "userData", "".concat(user.id, ".json"));
                    if (fs.existsSync(userFilePath)) {
                        var userData = JSON.parse(fs.readFileSync(userFilePath, "utf8"));
                        userData.rank = user.rank;
                        fs.writeFileSync(userFilePath, JSON.stringify(userData, null, 2));
                    }
                });
                topThree = filteredRankArray.slice(0, 3);
                rest = filteredRankArray.slice(3, 10);
                topThreeContent = topThree
                    .map(function (user, index) { return "**#".concat(index + 1, " <@").concat(user.id, ">**\nLevel: ").concat(user.level, "\nXP: ").concat(user.xp); })
                    .join("\n\n");
                leaderboardContent = rest
                    .map(function (user, index) { return "#".concat(index + 4, " <@").concat(user.id, "> | Level: ").concat(user.level, " | XP: ").concat(user.xp); })
                    .join("\n");
                embed = {
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
                return [4 /*yield*/, interaction.editReply({
                        content: '',
                        embeds: [embed],
                    })];
            case 3:
                // send the embed (no deferred reply needed)
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
var COMMAND_modleaderboard = function (interaction) { return __awaiter(void 0, void 0, void 0, function () {
    var rankArray, exclusionsFolderPath, includedUserIds, filteredRankArray, topThree, rest, topThreeContent, leaderboardContent, embed;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (interaction && interaction.channel) {
                    if (interaction.channel.id === '874784242557653023') {
                    }
                    else if (interaction.channel.id !== '1353874751352995840') { // bot commands channel
                        interaction.reply({
                            content: 'You can only use this command in <#1353874751352995840>',
                            ephemeral: true
                        });
                        return [2 /*return*/];
                    }
                }
                return [4 /*yield*/, getUserArray()];
            case 1:
                rankArray = _a.sent();
                exclusionsFolderPath = path.join(process.cwd(), "exclusions");
                // exclusions folder exists
                if (!fs.existsSync(exclusionsFolderPath)) {
                    fs.mkdirSync(exclusionsFolderPath);
                }
                includedUserIds = fs.readdirSync(exclusionsFolderPath)
                    .map(function (file) { return file.replace(".json", ""); });
                filteredRankArray = rankArray.filter(function (user) { return includedUserIds.includes(user.id); });
                // sort the filtered array by level in descending order, using XP as a tiebreaker
                filteredRankArray.sort(function (a, b) { return b.level - a.level || b.xp - a.xp; });
                // assign ranks
                filteredRankArray.forEach(function (user, index) {
                    user.rank = index + 1;
                    var userFilePath = path.join(__dirname, "userData", "".concat(user.id, ".json"));
                    if (fs.existsSync(userFilePath)) {
                        var userData = JSON.parse(fs.readFileSync(userFilePath, "utf8"));
                        userData.rank = user.rank;
                        fs.writeFileSync(userFilePath, JSON.stringify(userData, null, 2));
                    }
                });
                topThree = filteredRankArray.slice(0, 3);
                rest = filteredRankArray.slice(3, 10);
                topThreeContent = topThree
                    .map(function (user, index) { return "**#".concat(index + 1, " <@").concat(user.id, ">**\nLevel: ").concat(user.level, "\nXP: ").concat(user.xp); })
                    .join("\n\n");
                leaderboardContent = rest
                    .map(function (user, index) { return "#".concat(index + 4, " <@").concat(user.id, "> | Level: ").concat(user.level, " | XP: ").concat(user.xp); })
                    .join("\n");
                embed = {
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
                return [2 /*return*/];
        }
    });
}); };
var COMMAND_givexp = function (interaction) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, amount;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (interaction && interaction.channel) {
                    if (interaction.channel.id === '874784242557653023') {
                    }
                    else {
                        interaction.reply({
                            content: "You don't have permission to use this command.",
                            ephemeral: true
                        });
                        return [2 /*return*/];
                    }
                }
                userId = interaction.options.getString('userid', true);
                amount = interaction.options.getInteger('xp', true);
                return [4 /*yield*/, updateXP(userId, amount)];
            case 1:
                _a.sent();
                interaction.reply({
                    content: "Successfully gave ".concat(amount, " XP for user <@").concat(userId, ">."),
                    ephemeral: false
                });
                return [2 /*return*/];
        }
    });
}); };
var COMMAND_setlevel = function (interaction) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, level, userDataDir, userDataFile, userData;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (interaction && interaction.channel) {
                    if (interaction.channel.id === '874784242557653023') {
                    }
                    else {
                        interaction.reply({
                            content: "You don't have permission to use this command.",
                            ephemeral: true
                        });
                        return [2 /*return*/];
                    }
                }
                userId = interaction.options.getString('userid', true);
                level = interaction.options.getInteger('level', true);
                userDataDir = "./userData";
                userDataFile = path.join(userDataDir, "".concat(userId, ".json"));
                if (!fs.existsSync(userDataFile)) {
                    userData = {
                        id: userId,
                        xp: 0,
                        level: level,
                        rank: null,
                    };
                }
                else {
                    userData = JSON.parse(fs.readFileSync(userDataFile, "utf8"));
                    userData.level = level;
                }
                fs.writeFileSync(userDataFile, JSON.stringify(userData, null, 2));
                return [4 /*yield*/, updateLevel(userId)];
            case 1:
                _a.sent();
                interaction.reply({
                    content: "Successfully set Level ".concat(level, " for user <@").concat(userId, ">."),
                    ephemeral: false
                });
                return [2 /*return*/];
        }
    });
}); };
function getLevelData(userId) {
    return new Promise(function (resolve, reject) {
        var filePath = path.join(process.cwd(), "./userData/".concat(userId, ".json"));
        fs.readFile(filePath, "utf8", function (err, data) {
            if (err) {
                if (err.code === "ENOENT") {
                    resolve(null); // return null if the file does not exist
                }
                else {
                    reject(err); // reject the promise for other errors
                }
            }
            else {
                try {
                    var userData = JSON.parse(data); // use the UserData interface here
                    resolve({
                        id: userId,
                        level: userData.level,
                        xp: userData.xp,
                        rank: 0, // placeholder rank to be calculated later
                    });
                }
                catch (parseError) {
                    reject(parseError); // reject if JSON parsing fails
                }
            }
        });
    });
}
var COMMAND_level = function (interaction) { return __awaiter(void 0, void 0, void 0, function () {
    var targetUser, targetUserId, allUsers, userRank, userData, embed;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (interaction && interaction.channel) {
                    if (interaction.channel.id === '874784242557653023') {
                    }
                    else if (interaction.channel.id !== '1353874751352995840') { // bot commands channel
                        interaction.reply({
                            content: 'You can only use this command in <#1353874751352995840>',
                            ephemeral: true
                        });
                        return [2 /*return*/];
                    }
                }
                targetUser = interaction.options.getUser("user") || interaction.user;
                targetUserId = targetUser.id;
                return [4 /*yield*/, getUserArray()];
            case 1:
                allUsers = _a.sent();
                allUsers.sort(function (a, b) { return b.level - a.level || b.xp - a.xp; }); // sort by level and XP
                userRank = 0;
                allUsers.forEach(function (user, index) {
                    if (user.id === targetUserId) {
                        userRank = index + 1; // Rank starts at 1
                    }
                });
                return [4 /*yield*/, getLevelData(targetUserId)];
            case 2:
                userData = _a.sent();
                if (!userData) {
                    interaction.reply({
                        content: "".concat(targetUser === interaction.user
                            ? "You have no level data yet. Start interacting to gain XP!"
                            : "".concat(targetUser.username, " has no level data yet.")),
                        ephemeral: true,
                    });
                    return [2 /*return*/];
                }
                embed = {
                    color: 0x00FF00, // Green color
                    title: "".concat(targetUser.username, "'s Profile"),
                    thumbnail: {
                        url: targetUser.displayAvatarURL(), // profile picture
                    },
                    fields: [
                        { name: "Level", value: userData.level.toString(), inline: true },
                        { name: "XP", value: userData.xp.toString(), inline: true },
                        { name: "Rank", value: "#".concat(userRank), inline: true },
                    ],
                    timestamp: new Date().toISOString(),
                    footer: {
                        text: "Keep leveling up to climb the leaderboard!",
                    },
                };
                // reply with the embed
                interaction.reply({
                    embeds: [embed],
                });
                return [2 /*return*/];
        }
    });
}); };
function updateXP(userId, amount) {
    return __awaiter(this, void 0, void 0, function () {
        var userDataDir, userDataFile, userData;
        return __generator(this, function (_a) {
            userDataDir = "./userData";
            userDataFile = path.join(userDataDir, "".concat(userId, ".json"));
            // check if the user file exists, and if not, create it with default values
            if (!fs.existsSync(userDataFile)) {
                userData = {
                    id: userId,
                    xp: 0,
                    level: 1,
                    rank: null,
                };
            }
            else {
                // read existing data
                userData = JSON.parse(fs.readFileSync(userDataFile, "utf8"));
            }
            // update XP
            userData.xp += amount;
            // write updated data back to the file
            fs.writeFileSync(userDataFile, JSON.stringify(userData, null, 2));
            return [2 /*return*/];
        });
    });
}
var milestones = [
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
function assignRole(userId, milestoneId, previousMilestoneId, guild) {
    return __awaiter(this, void 0, void 0, function () {
        var member;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, guild.members.fetch(userId)];
                case 1:
                    member = _a.sent();
                    if (!!member.roles.cache.has(milestoneId)) return [3 /*break*/, 3];
                    return [4 /*yield*/, member.roles.add(milestoneId)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    if (!(previousMilestoneId && member.roles.cache.has(previousMilestoneId))) return [3 /*break*/, 5];
                    return [4 /*yield*/, member.roles.remove(previousMilestoneId)];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5: return [2 /*return*/];
            }
        });
    });
}
function updateLevel(userId) {
    return __awaiter(this, void 0, void 0, function () {
        var userDataDir, userDataFile, userData, nextLevelXp, guild, milestone, previousMilestone5, previousMilestone10;
        return __generator(this, function (_a) {
            userDataDir = "./userData";
            userDataFile = path.join(userDataDir, "".concat(userId, ".json"));
            userData = JSON.parse(fs.readFileSync(userDataFile, "utf8"));
            nextLevelXp = userData.level * 100;
            // level-up logic
            if (userData.xp >= nextLevelXp) {
                userData.level++;
                userData.xp = 0; // Reset XP after leveling up
            }
            guild = client.guilds.cache.get(guildId);
            if (!guild) {
                console.log("Guild is undefined!");
                return [2 /*return*/];
            }
            milestone = milestones.find(function (m) { return parseInt(m.level) === userData.level; });
            previousMilestone5 = milestones.find(function (m) { return parseInt(m.level) === userData.level - 5; });
            previousMilestone10 = milestones.find(function (m) { return parseInt(m.level) === userData.level - 10; });
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
            return [2 /*return*/];
        });
    });
}
var cooldowns = new Map();
client.on("messageCreate", function (message) { return __awaiter(void 0, void 0, void 0, function () {
    var cooldown, messageTime;
    var _a, _b, _c;
    return __generator(this, function (_d) {
        console.log("Channel Name: ".concat(message.channel.id, " | isVoiceBased: ").concat(message.channel.isVoiceBased()));
        if (message.author.bot)
            return [2 /*return*/];
        if (message.member && message.member.roles.cache.has('1355615190665924698'))
            return [2 /*return*/];
        if (message.channel.isThread())
            return [2 /*return*/];
        if (message.channel.isVoiceBased())
            return [2 /*return*/];
        cooldown = 2 * 1000;
        messageTime = cooldowns.get(message.author.id) || 0;
        if (Date.now() - messageTime < cooldown) {
            return [2 /*return*/];
        }
        if (((_a = message.member) === null || _a === void 0 ? void 0 : _a.roles.cache.has(boosterRole)) || ((_b = message.member) === null || _b === void 0 ? void 0 : _b.roles.cache.has(memberRole)) || ((_c = message.member) === null || _c === void 0 ? void 0 : _c.roles.cache.has(twitchRole))) {
            updateXP(message.author.id, boosterAmount);
            updateLevel(message.author.id);
        }
        else {
            updateXP(message.author.id, xpAmount);
            updateLevel(message.author.id);
        }
        cooldowns.set(message.author.id, Date.now());
        return [2 /*return*/];
    });
}); });
var voiceTimers = new Map();
client.on("voiceStateUpdate", function (oldState, newState) { return __awaiter(void 0, void 0, void 0, function () {
    var stateMember, userId, restrictedRoleId, timer, timer;
    return __generator(this, function (_a) {
        stateMember = newState.member || oldState.member;
        if (!stateMember || !stateMember.user)
            return [2 /*return*/];
        userId = stateMember.user.id;
        restrictedRoleId = '1355615190665924698';
        if (!oldState.channelId && newState.channelId) {
            if (stateMember.roles.cache.has(restrictedRoleId))
                return [2 /*return*/];
            if (!voiceTimers.has(userId)) {
                timer = setInterval(function () {
                    var currentMember = newState.guild.members.cache.get(userId);
                    if (!currentMember ||
                        !currentMember.voice.channel ||
                        currentMember.voice.channel.members.size < 2 ||
                        currentMember.roles.cache.has(restrictedRoleId)) {
                        return;
                    }
                    if (currentMember.roles.cache.has(boosterRole) || currentMember.roles.cache.has(memberRole) || currentMember.roles.cache.has(twitchRole)) {
                        updateXP(userId, 60);
                        updateLevel(userId);
                    }
                    else {
                        updateXP(userId, 30);
                        updateLevel(userId);
                    }
                }, 60000 * 15);
                voiceTimers.set(userId, timer);
            }
        }
        if (oldState.channelId && !newState.channelId) {
            if (voiceTimers.has(userId)) {
                timer = voiceTimers.get(userId);
                if (timer) {
                    clearInterval(timer);
                    voiceTimers.delete(userId);
                }
            }
        }
        return [2 /*return*/];
    });
}); });
// Terrible Command Handler
client.on("interactionCreate", function (interaction) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, error_1, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                if (!interaction.isChatInputCommand()) return [3 /*break*/, 23];
                _c.label = 1;
            case 1:
                _c.trys.push([1, 17, , 23]);
                _a = interaction.commandName;
                switch (_a) {
                    case "leaderboard": return [3 /*break*/, 2];
                    case "modleaderboard": return [3 /*break*/, 4];
                    case "level": return [3 /*break*/, 6];
                    case "givexp": return [3 /*break*/, 8];
                    case "setlevel": return [3 /*break*/, 10];
                    case "exclusions": return [3 /*break*/, 12];
                }
                return [3 /*break*/, 14];
            case 2: return [4 /*yield*/, COMMAND_leaderboard(interaction)];
            case 3:
                _c.sent();
                return [2 /*return*/];
            case 4: return [4 /*yield*/, COMMAND_modleaderboard(interaction)];
            case 5:
                _c.sent();
                return [2 /*return*/];
            case 6: return [4 /*yield*/, COMMAND_level(interaction)];
            case 7:
                _c.sent();
                return [2 /*return*/];
            case 8: return [4 /*yield*/, COMMAND_givexp(interaction)];
            case 9:
                _c.sent();
                return [2 /*return*/];
            case 10: return [4 /*yield*/, COMMAND_setlevel(interaction)];
            case 11:
                _c.sent();
                return [2 /*return*/];
            case 12: return [4 /*yield*/, COMMAND_exclusions(interaction)];
            case 13:
                _c.sent();
                return [2 /*return*/];
            case 14: return [4 /*yield*/, interaction.reply({
                    content: "Unknown command.",
                })];
            case 15:
                _c.sent();
                _c.label = 16;
            case 16: return [3 /*break*/, 23];
            case 17:
                error_1 = _c.sent();
                _c.label = 18;
            case 18:
                _c.trys.push([18, 20, , 22]);
                return [4 /*yield*/, interaction.reply({
                        content: "An error has occured.",
                        ephemeral: isInteractionOutsideStaffCategory(interaction),
                    })];
            case 19:
                _c.sent();
                return [3 /*break*/, 22];
            case 20:
                _b = _c.sent();
                return [4 /*yield*/, interaction.editReply({
                        content: "An error has occured",
                    })];
            case 21:
                _c.sent();
                return [3 /*break*/, 22];
            case 22:
                console.error(error_1);
                return [3 /*break*/, 23];
            case 23: return [2 /*return*/];
        }
    });
}); });
// When bot is ready
client.on("ready", function () { return __awaiter(void 0, void 0, void 0, function () {
    var dataFolder;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 0); })];
            case 1:
                _c.sent();
                dataFolder = './userData';
                if (!fs.existsSync(dataFolder)) {
                    fs.mkdirSync(dataFolder);
                    console.log('created data folder');
                }
                else {
                    console.log("".concat((_a = client.user) === null || _a === void 0 ? void 0 : _a.username, " is ready"));
                    return [2 /*return*/];
                }
                console.log("".concat((_b = client.user) === null || _b === void 0 ? void 0 : _b.username, " is ready."));
                return [2 /*return*/];
        }
    });
}); });
// Login
client.login(token);
