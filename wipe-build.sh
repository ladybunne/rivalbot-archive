# RivalBot Restart Script - wipe-build.sh
# Author: Ladybunne
# Purpose: Wipe RivalBot's working directory, to allow for new files to be deployed.
#          Also transfer crucial files back to build.
# ---

# Copy database out of build
cp ~/RivalBot/build/prisma/prod.db ~/RivalBot/prisma/prod-backup.db

# Wipe the build folder
rm -rf ~/RivalBot/build/*

# Move files from credentials/ to build/
cp ~/RivalBot/credentials/.env ~/RivalBot/build/.env
cp ~/RivalBot/credentials/rivalbot-config-prod.json ~/RivalBot/build/src/configs/rivalbot-config.json
cp ~/RivalBot/prisma/prod-backup.db ~/RivalBot/build/prisma/prod.db

# Nothing should be in ./build now except credentials.
# At this point, transfer new files.
# Finally, run up.sh.
