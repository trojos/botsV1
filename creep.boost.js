var creepboost = {
    run: function (creep, room, BP, mineral, max) {
        //console.log(creep, room, BP, mineral, max)
        if (creep.ticksToLive > 1450 && creep.ticksToLive != undefined && creep.memory.boosted == undefined) {
            //Schau obs boost gibt und hohl ihn
            if (Memory.rooms[room].Labs != undefined) {
                if (Memory.rooms[room].Labs.Boosts != undefined) {
                    if (Memory.rooms[room].Labs.Boosts[mineral] == undefined) {
                        //Kein Boost in diesem Raum vorhanden
                        creep.memory.boosted = false
                    } else {
                        var lab = Game.getObjectById(Memory.rooms[room].Labs.Boosts[mineral].id)
                        var minneed = max * 30
                        if (lab.mineralAmount < minneed) {
                            //zuwenig Minerals vorhanden, es wird nocht geboosted
                            creep.memory.boosted = false
                        } else {
                            //Es kann geboosted werden!
                            creep.memory.boosted = 'goto'
                        }
                    }
                } else { creep.memory.boosted = false }
            } else { creep.memory.boosted = false }
        }
        if (creep.memory.boosted == 'goto') {
            var labpos = Memory.rooms[room].Labs.Boosts[mineral].pos
            //var labpos = new RoomPosition(labkoord.x,labkoord.y,labkoord)
            if (creep.pos.isNearTo(labpos.x, labpos.y)) {
                var lab = Game.getObjectById(Memory.rooms[room].Labs.Boosts[mineral].id)
                var creepBP = creep.getActiveBodyparts(BP)
                var labamount = lab.mineralAmount
                if (creepBP > max) { creepBP = max }
                if (lab.mineralAmount < creepBP * 30) {
                    creepBP = Math.floor(lab.mineralAmount / 30)
                }
                if (lab.boostCreep(creep, creepBP) == OK) {
                    creep.memory.boosted = true
                } else {
                    creep.memory.boosted = false
                }
            } else {
                creep.moveTo2(labpos.x, labpos.y)
            }
        }

    }
}

module.exports = creepboost;