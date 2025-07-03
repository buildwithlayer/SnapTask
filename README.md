## Running SnapLinear Locally

To run SnapLinear locally:

- Create `.env` files in the root directory and client directory, copying the `.example.env` file in each location and filling in the required keys.
- Run `npm i`
- Run `npm run dev:all`

If you are testing the recording feature, you'll need to:

- Create a tunnel to your front-end using [ngrok](https://ngrok.com/)
- Update the `VITE_CALLBACK_URL` in your `client/.env` file to the ngrok link
- Add the ngrok link in `server.allowedHosts` of `client/vite.config.ts`

## User Workflow

- Upload audio file
- Hit send to chat
- Review returned actions
- Approve/deny actions

## Behind the Scenes

- Upload audio / transcript file
- Transcribe (if audio)
- Get a detailed summary (in Markdown format) - Not currently used in front end
- Using summary, get any actions to execute, as well as follow-up questions
- Return action requests and questions

## TODO

- [ ] Compile list of applicable MCP Servers
  - NOT StdIO
  - Compatible authentication
- [ ] File upload -> transcription
- [ ] Transcription -> summary generation
- [ ] Summary generation -> actions + questions
- [ ] Approve/deny actions
- [ ] Chat interface to respond to questions
- [ ] UI to auth into certain servers
- [ ] UI to enable/disable certain servers
- [ ] UI to sign in? (might not be needed)
- [ ] Electron migration
- [ ] Can include StdIO servers
