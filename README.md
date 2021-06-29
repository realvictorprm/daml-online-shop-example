# Welcome to the Daml Online Shop example!
## Getting started
To run the app do:
1. Regenerate the bindings via `exec/regenerateBindings`
1. Start the sandbox via `exec/startSandbox`
1. Start the background task via `application/exec/start`
1. Download the deps, build & start the UI via this single command `ui/exec/quickstart`

In the last step a browser window should have opened with the online shop being displayed.
Have fun!

## Development

If you change the daml code make sure to:
1. Regenerate the bindings via `exec/regenerateBindings`
1. Reinstall the ui dependencies as the hash of the daml package changed (just stop the ui and run `ui/exec/quickstart`)
1. Restart the sandbox via pressing `r` in the terminal it's open or completely restarting it
1. Restarting the background task (stop it and then start it again via `application/exec/start`)
