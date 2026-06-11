@echo off
del index.js
del deploy-commands.js
cd src
call tsc index.ts
call tsc deploy-commands.ts
move index.js ..
move deploy-commands.js ..
cd ..
node deploy-commands.js
cls
node index.js