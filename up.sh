# RivalBot Restart Script - up.sh
# Author: Ladybunne
# Purpose: Arrange all config files correctly, then bring RivalBot back up!
# ---

# Move files from credentials/ to build/
cp ~/RivalBot/credentials/.env ~/RivalBot/build/.env
cp ~/RivalBot/credentials/rivalbot-config-prod.json ~/RivalBot/build/src/configs/rivalbot-config.json

# Move to build/ and run npm start
# ...is what I'd like to say, but it's fucky.
# npm run dev-server it is.
cd ~/RivalBot/build
npm install
npx prisma generate

# We may need to be a little more careful with this.
# npx prisma migrate deploy

# Replace this with some better logging at some point.
nohup npm run dev-server > nohup.out 2> nohup.err < /dev/null &

# Somehow get the PID and put it in bot.pid
echo $! > ~/RivalBot/bot.pid
