# RivalBot Restart Script - up.sh
# Author: Ladybunne
# Purpose: Arrange all config files correctly, then bring RivalBot back up!
#
# Intended to be run as: nohup up.sh &
# ---

# Move files from credentials/ to build/
cp ~/RivalBot/credentials/.env ~/RivalBot/build/.env
cp ~/RivalBot/credentials/rivalbot-config-dev.json ~/RivalBot/build/src/configs/rivalbot-config.json
cp ~/RivalBot/credentials/rivalbot-config-dev.json ~/RivalBot/build/dist/configs/rivalbot-config.json

# Move to build/ and run npm start
# ...is what I'd like to say, but it's fucky.
# npm run dev-server it is.
cd ~/RivalBot/build
npm install
npx prisma generate
npx prisma migrate -dev
npm run dev-server &

# Somehow get the PID and put it in bot.pid
echo $! > ~/RivalBot/bot.pid
