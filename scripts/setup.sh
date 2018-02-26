# Sets the system up for usage
# Should be run whenever the repo is cloned or updated to alleviate permission issues

# Making the website visible
chmod o=r ../web/home/*
chmod o=r ../web/create/*
chmod o=r ../web/common/*
chmod o=r ../web/control-panel/*
chmod o=r ../web/requests/*

# Making scripts executable
chmod +x ./*
