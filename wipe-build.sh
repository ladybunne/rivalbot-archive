# RivalBot Restart Script - wipe-build.sh
# Author: Ladybunne
# Purpose: Wipe RivalBot's working directory, to allow for new files to be deployed.
# ---

# Wipe the build folder
rm -rf ~/RivalBot/build/*

# Nothing should be in ./build now.
# At this point, transfer new files.
# Finally, run up.sh.
