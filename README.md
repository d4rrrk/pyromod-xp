# Pyrocord XP Bot
Simple, no-nonsense leveling for Discord. This bot tracks Voice Channel (VC) status and message activity to award XP and assign ranks within your server.

## Features
VC Tracking: Tracks time spent in voice channels to award XP.

Message Activity: Rewards engagement by tracking sent messages without storing message content.

Leaderboards: Clean ranking system for server members.

Zero Bloat: Minimal data footprint. Only stores necessary IDs, XP, and rank values.

## Technical Details
Language: Built using [TypeScript/JavaScript].

Data: Strictly stores Discord User IDs, XP, and Level data. No message content is ever logged or saved.

Intents: Requires GUILD_MESSAGES to detect activity and update XP.

## Privacy Policy & Terms of Service
Transparency is key. You can find the full details regarding data handling and usage rules here:

[https://d4rrrk.github.io/pyromod-xp/privacy-policy/](Privacy)

[Terms of Service Link]

Deployment
This bot is built to be lightweight and efficient. It is designed to run in a containerized environment (Docker recommended) and connects to a backend database for persistent rank storage.
