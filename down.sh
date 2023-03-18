# RivalBot Restart Script - down.sh
# Author: Ladybunne
# Purpose: Down RivalBot, to prepare for (optional) wiping and re-upping.
# ---

# Kill existing RivalBot process
cat ~/RivalBot/bot.pid | xargs kill

# Copy database out of build
cp ~/RivalBot/build/prisma/prod.db ~/RivalBot/prisma/prod-temp.db

# Next, run wipe-build.sh if you want to nuke...
# ...or, run up.sh if you just want to restart.