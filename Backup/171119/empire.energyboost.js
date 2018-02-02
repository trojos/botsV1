var creepspawn = require('creepspawn')

var energyboost = {
    run: function (room, subroom) {
        //raumvariablen
        if (Game.rooms[room].controller.level < 6) {             //Wenn Kontroller level kleiner als 6 kann kein Terminal sein, daher wird abgebrochen
            return;
        }

        //Terminal voll --> an Market verkaufen
        if (Game.rooms[room].terminal) {
            if (Game.rooms[room].terminal.cooldown == 0) {
                if (Game.rooms[subroom].terminal.store[RESOURCE_ENERGY] < 30000) {
                    var mstore
                    var mstores
                    var energystore
                    energystore = Game.rooms[room].storage.store[RESOURCE_ENERGY]
                    mstore = (Game.rooms[room].terminal.store[RESOURCE_ENERGY])

                    if (energystore > 50000) {
                        var amount = 15000

                    }
                    if (mstore >= amount) {
                        ant = Game.rooms[room].terminal.send(RESOURCE_ENERGY, amount, subroom)
                        if (ant == 0) {
                            console.log(room + ' hat ' + subroom + ' ' + amount + ' gesendet')
                        } else {
                            console.log('Fehler beim senden von energy in  ' + room + ' Code: ' + ant)
                        }
                    }
                }
            }
        }

        return
    }



}

module.exports = energyboost