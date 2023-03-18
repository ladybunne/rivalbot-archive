# RivalBot Restart Script - up.sh
# Author: Ladybunne
# Purpose: Arrange all config files correctly, then bring RivalBot back up!
# ---

# Move files from credentials/ to build/
cp ./credentials/.env ./build/.env
cp ./credentials/rivalbot-config-dev.json ./build/src/configs/rivalbot-config.json
cp ./credentials/rivalbot-config-dev.json ./build/dist/configs/rivalbot-config.json

# Move to build/ and run npm start
# ...is what I'd like to say, but it's fucky.
# npm run dev-server it is.
cd build
npm install
npx prisma generate
npm run dev-server
# Make that & at the end.

# Somehow get the PID and put it in bot.pid
echo $! > ~/RivalBot/bot.pid
