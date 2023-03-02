# AOP TeamSpeak3
This is my offical AOP to TeamSpeak3 resource. This resource takes the current aop and edits a space or channel and description in the teamspeak. 

---

## How to install:
1. Navagate to src/server.js and open it in any text editor like [Visual Studio Code](https://code.visualstudio.com/Download), Notepad, or [Notepad++](https://notepad-plus-plus.org/)
2. Editing the **config**

| Option                    | Value                                              | Explanation                                                                                                                                                                     |
|---------------------------|----------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| teamspeak_ip              | localhost or serverip                              | In most cases this is 'localhost' but sometimes servers that run on pterodactyl panel for example need to set it to their server IP address                                     |
| query_password            | Server generated password                          | This password is generated when you first create the teamspeak and can be changed. Just look up how to change server query password and I am sure you will find plenty results. |
| teamspeak_bot_username    | Username that will display for the bot             | This username should not go over 20 characters                                                                                                                                  |
| aop_channel_id            | The channel that you want your aop to go to        | Self explanatory. The channel the aop displays in                                                                                                                               |
| updatePlayerCount         | If the player count feature is enabled             | Toggles our player count feature that displays how many people are on your server                                                                                               |
| updatePlayerCountInterval | How long it takes to update the player count       | How long it takes for the bot to update your playercount                                                                                                                        |
| use_time                  | If you want the time to display of last AOP change | Toggles if you want to show the last aop change                                                                                                                                 |
| timezone                  | What timezone the clock is in                      | sets the timezone of the time                                                                                                                                                   |
---
3. Navigate to your `server.cfg` and add `ensure aop-ts3` to start the resource. The dependencies should install on start, but if they don't respect files are placed to assist you if needed.

### Debugging
*We currently do not have errors logged if you find an error please notify us so we can update this table!*

| Error | Soultion |
|-------|----------|
|       |          |
|       |          |

### How to get support:
- Join my [Discord](https://discord.gg/EqEcKzNkDB)
- Create a [GitHub Issue](https://github.com/AstraWrld/aop-ts3/issues)
---

### Credits:

- Programming: Scentral#9999
- Consultation: racc#0001
- Inspiration: [WorldwideRP](https://wwrp.io)

