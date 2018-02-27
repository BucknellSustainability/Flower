# Sets the system up for usage
# Should be run whenever the repo is cloned or updated to alleviate permission issues

# Making the website visible
# TODO: possible improvement would allow this script to be run from anywhere
chmod o=r ../web/home/*
chmod o=r ../web/create/*
chmod o=r ../web/common/*
chmod o=r ../web/control-panel/*
chmod o=r ../web/requests/*
chmod o=r ../deployment.json

# Making scripts executable
chmod +x ./*
