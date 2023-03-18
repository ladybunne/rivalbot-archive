# RivalBot Restart Script - down.sh
# Author: Ladybunne
# Purpose: Down RivalBot and wipe its working directory, to allow for new files to be deployed.
# ---

# Kill existing RivalBot process
cat ~/RivalBot/bot.pid | xargs kill

# Wipe the build folder
rm -rf ~/RivalBot/build/*

# Nothing should be in ./build now.
# At this point, transfer new files.
# Then, run up.sh.
