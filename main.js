const config = require("./config.json");
const express = require('express');
const app = express();

const trustedIPs = ["::ffff:2.58.113.72", "::ffff:127.0.0.1", "::ffff:0.0.0.0"]

// skidded von ragemp forum, war zu faul eigene function zu schreiben, aber es geht.
function getPlayer(playerNameOrPlayerId) {
    if (playerNameOrPlayerId == parseInt(playerNameOrPlayerId)) {
      return mp.players.at(playerNameOrPlayerId);
    }
    else
    {
      let foundPlayer = null;
      mp.players.forEach((rageMpPlayer) => {
          if (rageMpPlayer.name.toLowerCase().startsWith(playerNameOrPlayerId.toLowerCase())) {
            foundPlayer = rageMpPlayer;
            return;
          }
      });
      return foundPlayer;
    }
  }

function getVariableFromPlayer(player, variable) 
{

    if(typeof player === 'undefined') {
        return false;
    }

    var _index = variable.indexOf('.')
    if(_index > -1) {
        return getVariableFromPlayer(player[variable.substring(0, _index)], variable.substr(_index + 1));
    }

    return player[variable];
}

app.get("/", (request, response) => {
    response.send("klaus");
});

app.get("/player/get", (request, response) => {
    // auth failed
    if(!trustedIPs.includes(request.ip)) return response.send(JSON.stringify({ status: false }));

    const { name, variable } = request.query;
    console.log(request.ip);
    try 
    {
        const player = getPlayer(name);
        // Spieler nicht gefunden / oder nicht gültig
        if(!mp.players.exists(player)) {
            console.log("spieler nicht gefunden");
            return response.send(JSON.stringify({ status: false }));
        } 

        response.send(JSON.stringify({ status: true, callback: getVariableFromPlayer(player, variable) }));
    } 
    catch (e) 
    {
        // spieler möglicherweiße nicht gefunden oder irgendein error
        console.log("spieler net gefunden / irgendein error")
        response.send(JSON.stringify({ status: false }));
        console.log(e);
    }
});

app.get("/player/kick", (request, response) => {
    // auth failed
    if(!trustedIPs.includes(request.ip)) return response.send(JSON.stringify({ status: false }));

    const { name, reason } = request.query;
    try 
    {
        const player = getPlayer(name);
        // Spieler nicht gefunden / oder nicht gültig
        if(!mp.players.exists(player)) {
            console.log("spieler nicht gefunden");
            return response.send(JSON.stringify({ status: false }));
        }

        player.notify("~r~Sie werden in 10 Sekunden vom Server gekickt!");
        player.notify(`~r~Grund: ${reason}`);
        response.send(JSON.stringify({ status: true }));
        setTimeout(() => {
            player.kick(reason);
        }, 10000);
    } 
    catch (e) 
    {
        // spieler möglicherweiße nicht gefunden oder irgendein error
        console.log("spieler net gefunden / irgendein error")
        response.send(JSON.stringify({ status: false }));
        console.log(e);
    }
});

app.get("/player/notify", (request, response) => {
    // auth failed
    if(!trustedIPs.includes(request.ip)) return response.send(JSON.stringify({ status: false }));

    const { name, message } = request.query;
    try 
    {
        const player = getPlayer(name);
        // Spieler nicht gefunden / oder nicht gültig
        if(!mp.players.exists(player)) {
            console.log("spieler nicht gefunden");
            return response.send(JSON.stringify({ status: false }));
        }

        if(!message) {
            console.log("grund ist ungültig.")
            return response.send(JSON.stringify({ status: false }));
        }

        player.notify(`~g~Benachrichtigung: ${message}`);
        response.send(JSON.stringify({ status: true }));
    } 
    catch (e) 
    {
        // spieler möglicherweiße nicht gefunden oder irgendein error
        console.log("spieler net gefunden / irgendein error")
        response.send(JSON.stringify({ status: false }));
        console.log(e);
    }
});

app.listen(config.port, () => {
    console.log("Api läuft.")
});