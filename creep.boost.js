var creepboost = {
    run: function (creep, room, boost) {
        // [boost] = [{BP, mineral, max}]
        // if (creep.memory.role != 'upgraderstorage') {
        //     console.log(creep, room, JSON.stringify(boost), creep.ticksToLive, creep.memory.boosted)
        // }
        if (creep.ticksToLive != undefined) {
            if (creep.ticksToLive > 1450 && creep.ticksToLive != undefined && creep.memory.boosted == undefined) {
                //Schau obs boost gibt und hohl ihn
                for (let i = 0; i < boost.length; i++) {
                    if (Memory.rooms[room].Labs != undefined) {
                        if (Memory.rooms[room].Labs.Boosts != undefined) {
                            if (Memory.rooms[room].Labs.Boosts[boost[i].mineral] == undefined) {
                                //Kein Boost in diesem Raum vorhanden
                                boost[i].boosted = false
                            } else {
                                var lab = Game.getObjectById(Memory.rooms[room].Labs.Boosts[boost[i].mineral].id)
                                if (lab) {
                                    var minneed = boost[i].max * 30

                                    if (lab.mineralAmount < minneed) {
                                        //zuwenig Minerals vorhanden, es wird nocht geboosted
                                        boost[i].boosted = false
                                    } else {
                                        //Es kann geboosted werden!
                                        console.log(lab.mineralAmount, minneed)
                                        boost[i].boosted = 'goto'
                                        creep.memory.boosted = 'goto'
                                    }
                                }
                            }
                        } else { boost[i].boosted = false }
                    } else { boost[i].boosted = false }
                }
                if (_.some(boost, 'boosted', 'goto')) {
                    creep.memory.boosted = 'goto'
                    creep.memory.boost = boost
                } else {
                    creep.memory.boosted = false
                }
            }

            if (creep.memory.boosted == 'goto') {
                boost = creep.memory.boost
                for (let i = 0; i < boost.length; i++) {
                    if (boost[i].boosted == 'goto') {
                        var labpos = Memory.rooms[room].Labs.Boosts[boost[i].mineral].pos
                        //var labpos = new RoomPosition(labkoord.x,labkoord.y,labkoord)
                        if (creep.pos.isNearTo(labpos.x, labpos.y)) {
                            var lab = Game.getObjectById(Memory.rooms[room].Labs.Boosts[boost[i].mineral].id)
                            if (lab) {
                                var creepBP = creep.getActiveBodyparts(boost[i].BP)
                                var labamount = lab.mineralAmount
                                if (creepBP > boost[i].max) { creepBP = boost[i].max }
                                if (lab.mineralAmount < creepBP * 30) {
                                    creepBP = Math.floor(lab.mineralAmount / 30)
                                }
                                if (lab.boostCreep(creep, creepBP) == OK) {
                                    boost[i].boosted = true
                                } else {
                                    boost[i].boosted = false
                                }
                            } else { boost[i].boosted = false }
                        } else {
                            creep.moveTo2(labpos.x, labpos.y)
                            boost[i].boosted = 'goto'
                        }
                        i = boost.length
                    }
                }
                creep.memory.boost = boost
                if (_.some(boost, 'boosted', 'goto')) {
                    creep.memory.boosted = 'goto'
                } else {
                    if (_.every(boost, 'boosted', false)) {
                        creep.memory.boosted = false
                        delete creep.memory.boost
                    } else if (_.some(boost, 'boosted', true)) {
                        creep.memory.boosted = true
                        delete creep.memory.boost
                    }
                }
            }
        } 
    }
}

module.exports = creepboost;