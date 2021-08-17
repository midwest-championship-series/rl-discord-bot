const tmi = require('tmi.js');
const axios = require('axios').default;
const dotenv = require('dotenv');
dotenv.config();
// axios.<method> will now provide autocomplete and parameter typings
// Define configuration options
const opts = {
  identity: {
    username: process.env.BOT_USERNAME,
    password: process.env.OAUTH_TOKEN
  },
  channels: [
    process.env.CHANNEL_NAME
  ]
};

// Create a client with our options
const client = new tmi.client(opts);

// Register our event handlers (defined below)
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

// Connect to Twitch:
client.connect();

// Called every time a message comes in
 async function onMessageHandler (target, context, msg, self) 
{
    if (self) { return; } // Ignore messages from the bot

    // Remove whitespace from chat message
    const commandName = msg.split(' ')[0];

    // If the command is known, let's execute it
    if (commandName === '!dice') {
        const num = rollDice(commandName);
        client.say(target, `You rolled a ${num}.`);
        console.log(`* Executed ${commandName} command`);
    }
    else if(commandName === '!goat'){
        client.say(target,`Grape is the GOAT`)
        console.log(`* Executed ${commandName} command`)
    }
    else if(commandName === '!candy'){
        client.say(target,`Snickers`)
        console.log(`* Executed ${commandName} command`)
    }
    else if(commandName === '!stats'){
        // const playerName = msg.split(' ')[1]
        var playerName = msg.split(' ')[1]
        for (let i = 3; i <= msg.split(' ').length; i++) {
          playerName = playerName + ' ' + msg.split(' ')[i-1];
        }
        console.log(playerName)
        const playerStats = await getPlayerStats(playerName)
        const saves = playerStats.total_saves.value
        const goals = playerStats.total_goals.value
        const assists = playerStats.total_assists.value
        console.log(playerStats)
        client.say(target,`${playerName} has ${goals} goals, ${assists} assists, and ${saves} saves this season`)
        console.log(`* Executed ${commandName} command`)
    }
    else {
        // console.log(`* Unknown command ${commandName}`);
    }
}


// Function called when the "dice" command is issued
function rollDice () {
    const sides = 20;
    return Math.floor(Math.random() * sides) + 1;
}

// Called every time the bot connects to Twitch chat
    function onConnectedHandler (addr, port) {
        console.log(`* Connected to ${addr}:${port}, channel: ${process.env.CHANNEL_NAME}`);
}

// Axios get request
async function getPlayerStats(screen_name) {
    const params = {headers:{'x-api-key':process.env.rl_stats_key}}
    const request_url = process.env.stats_url + '/v2/players?screen_name=' + screen_name
    console.log(`/v2/players?screen_name=${screen_name}`)
    try {
      const response = await axios.get(request_url,params);
      const playerID = response.data[0]._id
      console.log(playerID);
      // return response.data[0]._id
      const postQuery = {
        "size": 200, 
        "query": {
          "bool": {
            "must": [
              {
                "terms": {
                  "player_id": [playerID]
                }
              }
            ],
            "filter": {
                "terms": {
                  "season_name": ["4"]
                }
            }
          }
        },
        "aggs": {
          "total_goals": {
            "sum": {
              "field": "goals"
            }
          },
          "total_assists": {
            "sum": {
              "field": "assists"
            }
          },
              "total_saves": {
            "sum": {
              "field": "saves"
            }
          }
        },
        "sort": [
          {
            "epoch_processed": {
              "order": "desc"
            }
          }
        ]
      }
      const post_url = process.env.stats_url + '/v2/stats/player_games'
      const basic_stats = await axios.post(post_url, postQuery, params)
      // console.log(basic_stats.data.aggregations)
      return basic_stats.data.aggregations
    } catch (error) {
      console.error(error);
    }
    

  }