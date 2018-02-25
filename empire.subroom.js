var creepspawn = require('creepspawn')
var buildroad = require('build.roads')

//Costmatrix für Raum
function cmroomf(room) {
    var cmroom = new PathFinder.CostMatrix
    if (Game.rooms[room] == undefined) { } else {
        Game.rooms[room].find(FIND_STRUCTURES).forEach(function (struct) {
            if (struct.structureType === STRUCTURE_ROAD) {
                cmroom.set(struct.pos.x, struct.pos.y, 1);
            } else if (struct.structureType !== STRUCTURE_CONTAINER &&
                (struct.structureType !== STRUCTURE_RAMPART ||
                    !struct.my)) {
                cmroom.set(struct.pos.x, struct.pos.y, 255);
            }
        });
    }
    return cmroom
}

var subroom = {
    run: function (room, subroom, wait) {
        var CPUvor = Game.cpu.getUsed()
        if (Game.time % 5 === 0) {

            //raumvariablen
            const xspawns = Game.rooms[room].find(FIND_MY_STRUCTURES, {
                filter: struc => struc.structureType == STRUCTURE_SPAWN
            });
            const xspawn = xspawns[0]
            const maxenergy = Game.rooms[room].energyCapacityAvailable
            const haveenergy = Game.rooms[room].energyAvailable
            if (Game.rooms[room].storage == undefined) {
                var havestore = false
                var reserve = 0
            } else {
                var havestore = true
                var reserve = Game.rooms[room].storage.store[RESOURCE_ENERGY]
            }
            var roomcontroll = false
            if (Game.rooms[subroom] == undefined) {
                var insight = false
            } else {
                var insight = true
                if (Game.rooms[subroom].controller.owner == undefined) {
                    if (Game.rooms[subroom].controller.reservation == undefined) {
                        roomcontroll = true
                    } else if (Game.rooms[subroom].controller.reservation.username == 'zapziodon') {
                        roomcontroll = true
                    }
                } else if (Game.rooms[subroom].controller.owner.username != 'zapZiodon') {
                    roomcontroll = false
                }
            }
            //Invasion
            var invasion = false
            if (Memory.rooms[room].Invasion == undefined) { Memory.rooms[room].Invasion = {} }
            var invaders = Game.rooms[room].find(FIND_HOSTILE_CREEPS, {
                filter: sa => sa.owner.username != 'SteveTrov'
            })
            if (invaders.length > 0) {
                Memory.rooms[room].Invasion.Invasion = true
                invasion = true
                // var inBPheal = 0; //var inBPranged = 0; var inBPtough = 0        //Ermittlung der Heal und ranged Bodyparts der Invader, boosted = *4
                // invaders.forEach(inv => {
                //     var inBP = inv.body
                //     inBP.forEach(BP => {
                //         //if (BP.type == HEAL && BP.boost == undefined) { inBPheal += 1 } else if (BP.type == HEAL) { inBPheal += 4 }
                //         //if (BP.type == RANGED_ATTACK && BP.boost == undefined) { inBPranged += 1 } else if (BP.type == RANGED_ATTACK) { inBPranged += 4 }
                //         //if (BP.type == TOUGH && BP.boost == undefined) { inBPtough += 1 } else if (BP.type == TOUGH) { inBPtough += 4 }
                //     })
                // });
                // //if (room == 'W2S19'){ console.log (inBPheal)}
                // var invtype = 'verysmall'
                // var DDneed = 0
                // var boost = false
                // if (inBPheal > 10) { invtype = 'small'; DDneed = 1 }
                // if (inBPheal > 50) { invtype = 'big'; DDneed = 2; boost = true }
                // // if (inBPheal > 45) { invtype = 'verybig'; DDneed = 3 }
                // // if (inBPheal > 60) { invtype = 'nope'; DDneed = 0 } //keine verteidigung!!
                // Memory.rooms[room].Invasion.type = invtype

                // if (invtype == 'big') {
                //     console.log('________________________')
                //     console.log('Große Invasion in', room, inBPheal)
                //     console.log('________________________')
                // }


            } else {
                Memory.rooms[room].Invasion.Invasion = false
                Memory.rooms[room].Invasion.type = ''
                invasion = false
            }
            // Rep und Bauzeugs in Memory schreiben
            if (insight) {
                HomeRCL = Game.rooms[room].controller.level
                if (Memory.rooms[subroom] == undefined) { Memory.rooms[subroom] = {} }
                if (Memory.rooms[subroom].Bmstr == undefined) { Memory.rooms[subroom].Bmstr = {} }
                if (Memory.rooms[subroom].Bmstr.tick == undefined || Memory.rooms[subroom].Bmstr.tick < Game.time - 500) {
                    Memory.Bmstr = {}
                    Memory.rooms[subroom].Bmstr.tick = Game.time
                    var bmstrsites = Game.rooms[subroom].find(FIND_MY_CONSTRUCTION_SITES)
                    var bmstrsites2 = _.sum(bmstrsites, 'progressTotal') - _.sum(bmstrsites, 'progress')
                    Memory.rooms[subroom].Bmstr.constructionsites = bmstrsites.length
                    Memory.rooms[subroom].Bmstr.constructionprogress = bmstrsites2
                    var bauBP = 0
                    switch (true) {
                        case (bmstrsites2 > 10000):
                            bauBP = 8; break;// <---- work Bodyparts -- Anhand dieser Geschwindigkeit wird die benötigte Anzahl an Bmstr ermittelt
                        case (bmstrsites2 > 4000):
                            bauBP = 4; break;
                        case (bmstrsites2 > 300):
                            bauBP = 2; break;
                    }
                    var bauBPRCL = 8
                    switch (true) {
                        case (HomeRCL == 2):
                            bauBPRCL = 2; break;
                        case (HomeRCL == 3):
                            bauBPRCL = 4; break;
                    }
                    if (bauBP > bauBPRCL) { bauBP = bauBPRCL }
                    Memory.rooms[subroom].Bmstr.baubodyparts = bauBP

                    var repstreets = _.sum(Game.rooms[subroom].find(FIND_STRUCTURES, {
                        filter: (s) => s.structureType == STRUCTURE_ROAD
                    }), 'hitsMax') / 5000
                    var repcont = Game.rooms[subroom].find(FIND_STRUCTURES, {
                        filter: (s) => s.structureType == STRUCTURE_CONTAINER
                    })
                    Memory.rooms[subroom].Bmstr.streets = repstreets
                    Memory.rooms[subroom].Bmstr.cont = repcont.length
                    var repamount = Math.ceil((repstreets * 0.1 + repcont.length * 50) / 100 * 3)  //hits die pro tick repariert werden müssen. 100hits = 1 energy * 3 für beschaffen und weg
                    Memory.rooms[subroom].Bmstr.reppbodyparts = repamount
                }
                //Wege in Memory schreiben und Straßen bauen
                if (Memory.rooms[subroom].Wege == undefined) { Memory.rooms[subroom].Wege = {} }
                if (Memory.rooms[subroom].Wege.tick == undefined || Memory.rooms[subroom].Wege.tick < Game.time - 1500) {
                    if (insight) {
                        Memory.rooms[subroom].Wege.tick = Game.time
                        var spots = Game.rooms[subroom].find(FIND_SOURCES)
                        spots.forEach(function (spot) {
                            Memory.rooms[subroom].Wege[spot] = {}
                            Memory.rooms[subroom].Wege[spot].Spawn = PathFinder.search(spot.pos, { pos: xspawn.pos, range: 1 }, {
                                plainCost: 2, swampCost: 10,
                                roomCallback: function (roomName) { return cmroomf(roomName); }
                            })
                            var pathcost = Memory.rooms[subroom].Wege[spot].Spawn.cost
                            var ept = 50 / ((pathcost * 2) + 25) * 300  //energy pro bodypart pro 300ticks
                            var energyav = 3000 - ((Memory.rooms[subroom].Bmstr.reppbodyparts + Memory.rooms[subroom].Bmstr.baubodyparts) / 1 * 300)
                            var carrybpneed = energyav / ept //benötigte bodyparts um 3000 energy in 300 ticks zuverwerken
                            Memory.rooms[subroom].Wege[spot].Spawn.carrybpneed = carrybpneed
                        })
                    }
                }
            }

            //Straßen bauen
            //if (subroom == 'W7S18') {

            if (Memory.rooms[subroom] == undefined) { Memory.rooms[subroom] = {} }
            if (Memory.rooms[subroom].Straßenbau == undefined) { Memory.rooms[subroom].Straßenbau = {} }
            if ((Memory.rooms[subroom].Straßenbau.tick == undefined) || Memory.rooms[subroom].Straßenbau.tick < Game.time - 1499 && Memory.rooms[subroom].Straßenbau.fertig == true) {
                Memory.rooms[subroom].Straßenbau = {}
                Memory.rooms[subroom].Straßenbau.tick = Game.time
                Memory.rooms[subroom].Straßenbau.fertig = false
                Memory.rooms[subroom].Straßenbau.Schritt = 0
            }
            if (Memory.rooms[subroom].Straßenbau.fertig == false) {
                if (insight) {
                    var spots = Game.rooms[subroom].find(FIND_SOURCES)
                    //var minerals = Game.rooms[subroom].find(FIND_MINERALS)
                    //spots.push(minerals[0])
                    Memory.rooms[subroom].Straßenbau.Gesamtschritte = spots.length
                    if (Memory.rooms[subroom].Straßenbau.Schritt < Memory.rooms[subroom].Straßenbau.Gesamtschritte) {
                        if (insight) {
                            var start
                            if (Game.rooms[room].storage) {
                                start = Game.rooms[room].storage.pos
                            } else {
                                start = Game.rooms[room].find(FIND_MY_SPAWNS)[0].pos
                            }
                            buildroad.run(start, spots[Memory.rooms[subroom].Straßenbau.Schritt].pos, 1)
                        }
                    } else {
                        Memory.rooms[subroom].Straßenbau.fertig = true
                    }
                    Memory.rooms[subroom].Straßenbau.Schritt += 1
                }
            }
            //}

            //----------creeps------------------
            //size
            if (haveenergy + reserve < maxenergy) {
                var maxcreepsize = haveenergy + reserve
            } else {
                var maxcreepsize = maxenergy
            }
            if (maxcreepsize < (maxenergy / 2)) {
                maxcreepsize = maxenergy / 2
            }
            var creepsize
            var needminer = false
            var needcarry = false
            var needbmstr = false
            var needdef = false
            var creepcost = 0
            //---------- Scout -----------------
            if (!wait && (!insight || Game.rooms[subroom].controller.sign.text !== Memory.signtext)) {
                var cmem = { role: 'scout', home: room, targetroom: subroom }
                var cbody = [MOVE]
                if (maxcreepsize > 50) { creepsize = 50 } else { creepsize = maxcreepsize }    // Beschränkt maxcreepsize
                var ccreep = _.filter(Game.creeps, (creep) =>
                    creep.memory.role == cmem.role
                    && creep.memory.home == cmem.home
                    && creep.memory.targetroom == cmem.targetroom);
                if (ccreep.length < 1) {
                    creepcost = creepspawn.newcreep(room, 'scout_' + subroom, creepsize, cbody, cmem)
                    if (creepcost > 0) { Memory.Statistik[subroom].aktuell.role.scout = Memory.Statistik[subroom].aktuell.role.scout + creepcost, creepcost = 0 }
                }
            }

            //----------  Miner + Carry  ----------
            //Je Miner 2 Carrier
            if (insight && !wait && roomcontroll && !invasion) {
                var miningspots = Game.rooms[subroom].find(FIND_SOURCES)
                for (var spots in miningspots) {
                    //spawn miner mit spot im memory
                    var cmem = { role: 'miner', spot: miningspots[spots].id, home: room, targetroom: subroom }
                    var cbody = [WORK, WORK, MOVE]
                    if (maxcreepsize > 800) { creepsize = 800 } else { creepsize = maxcreepsize }    // Beschränkt maxcreepsize
                    var ccreep = _.filter(Game.creeps, (creep) =>
                        creep.memory.role == cmem.role
                        && creep.memory.spot == cmem.spot
                        && creep.memory.home == cmem.home
                        && creep.memory.targetroom == cmem.targetroom
                        && (creep.ticksToLive > 50 || creep.ticksToLive == undefined));
                    if (ccreep.length < 1) {
                        needminer = true
                        creepcost = creepspawn.newcreep(room, 'miner_' + subroom, creepsize, cbody, cmem)
                        if (creepcost > 0) { Memory.Statistik[subroom].aktuell.role.miner = Memory.Statistik[subroom].aktuell.role.miner + creepcost, creepcost = 0 }
                    }

                    //spawn carrier mit spot im Memory
                    if (!needminer) {
                        var cmem = { role: 'carry', spot: miningspots[spots].id, home: room, targetroom: subroom, harvesting: true, statistik: true }
                        var ccreep = _.filter(Game.creeps, (creep) =>
                            creep.memory.role == cmem.role
                            && creep.memory.spot == cmem.spot
                            && creep.memory.home == cmem.home
                            && creep.memory.targetroom == cmem.targetroom);
                        var bodyparts = 0
                        for (var i in ccreep) {
                            bodyparts = bodyparts + ccreep[i].getActiveBodyparts(CARRY)
                        }
                        if (Memory.rooms[subroom].Wege[miningspots[spots]].Spawn == undefined) {
                            Memory.rooms[subroom].Wege.tick = 0
                            Memory.rooms[subroom].Wege[miningspots[spots]].Spawn = {}
                            Memory.rooms[subroom].Wege[miningspots[spots]].Spawn.carrybpneed = 10
                        }
                        Memory.rooms[subroom].Wege[miningspots[spots]].Spawn.carrybphave = bodyparts
                        if (bodyparts < Memory.rooms[subroom].Wege[miningspots[spots]].Spawn.carrybpneed) {
                            needcarry = true
                            var cbody = [CARRY, CARRY, MOVE]
                            var cbodycost = 75
                            var bodypartsneed = Memory.rooms[subroom].Wege[miningspots[spots]].Spawn.carrybpneed - bodyparts
                            bodypartsneed = Math.ceil(bodypartsneed / 2) * 2 + 2
                            //console.log(room + ' ' + subroom + '  ' + Memory.rooms[subroom].Wege[miningspots[spots]].Spawn.carrybpneed + ' ' + bodyparts)
                            if (bodypartsneed < 8) { bodypartsneed = 8 }

                            var bodypartsneedcost = bodypartsneed * cbodycost

                            if (bodypartsneedcost < maxcreepsize) { maxcreepsize = bodypartsneedcost }
                            if (maxcreepsize > 1500) { creepsize = 1500 } else { creepsize = maxcreepsize }    // Beschränkt maxcreepsize
                            //console.log(Math.floor(creepsize))
                            creepcost = creepspawn.newcreep(room, 'carry_' + subroom, creepsize, cbody, cmem)
                            if (creepcost > 0) { Memory.Statistik[subroom].aktuell.role.carry = Memory.Statistik[subroom].aktuell.role.carry + creepcost, creepcost = 0 }
                        }

                    }
                }
            }

            //---------- bmstr Baumeister  ----------
            if (insight && !wait && !invasion) {
                var BPneed = Memory.rooms[subroom].Bmstr.baubodyparts + Memory.rooms[subroom].Bmstr.reppbodyparts
                var cmem = { role: 'bmstr', home: room, targetroom: subroom, working: false, onsite: false }
                var ccreep = _.filter(Game.creeps, (creep) =>
                    creep.memory.role == cmem.role
                    && creep.memory.home == cmem.home
                    && creep.memory.targetroom == cmem.targetroom);
                var bodyparts = 0
                for (var i in ccreep) {
                    bodyparts = bodyparts + ccreep[i].getActiveBodyparts(WORK)
                }
                Memory.rooms[subroom].Bmstr.bodypartshave = bodyparts
                if (bodyparts < BPneed) {
                    needbmstr = true
                    var cbody = [MOVE, MOVE, WORK, CARRY, CARRY]
                    var cbodycost = 300
                    var bodypartsneed = BPneed - bodyparts
                    bodypartsneed = Math.ceil(bodypartsneed) + 2
                    var bodypartsneedcost = bodypartsneed * cbodycost
                    if (bodypartsneedcost < maxcreepsize) { maxcreepsize = bodypartsneedcost }
                    if (maxcreepsize > 1500) { creepsize = 1500 } else { creepsize = maxcreepsize }    // Beschränkt maxcreepsize
                    //console.log(maxcreepsize)
                    creepcost = creepspawn.newcreep(room, 'bmstr_' + subroom, creepsize, cbody, cmem)
                    if (creepcost > 0) { Memory.Statistik[subroom].aktuell.role.bmstr = Memory.Statistik[subroom].aktuell.role.bmstr + creepcost, creepcost = 0 }
                }

            }
            //----------   claim    ----------
            // && Game.rooms[subroom].controller.reservation.ticksToEnd < 4000
            if (insight && !wait && !invasion) {
                var claimneed = true
                if (roomcontroll) {
                    if (Game.rooms[subroom].controller.reservation) {
                        if (Game.rooms[subroom].controller.reservation.ticksToEnd > 3000) {
                            claimneed = false
                        }
                    }
                    var cmem = { role: 'claim', home: room, targetroom: subroom, controll: 'reserve' }
                    var cbody = [CLAIM, MOVE, MOVE]
                    if (maxcreepsize > 2800) { creepsize = 2800 } else { creepsize = maxcreepsize }    // Beschränkt maxcreepsize                  
                } else {
                    var cmem = { role: 'claim', home: room, targetroom: subroom, controll: 'attack' }
                    var cbody = [CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, MOVE, MOVE, MOVE, MOVE, MOVE]
                    if (maxcreepsize > 7000) { creepsize = 7000 } else { creepsize = maxcreepsize }    // Beschränkt maxcreepsize
                }
                if (claimneed) {
                    var ccreep = _.filter(Game.creeps, (creep) =>
                        creep.memory.role == cmem.role
                        && creep.memory.home == cmem.home
                        && creep.memory.controll == cmem.controll
                        && creep.memory.targetroom == cmem.targetroom);
                    var claimparts = 0
                    for (var i in ccreep) {
                        claimparts = claimparts + ccreep[i].getActiveBodyparts(CLAIM)
                    }
                    switch (claimparts) {
                        case 0:
                            creepcost = creepspawn.newcreep(room, 'reserv_' + subroom, creepsize, cbody, cmem)
                            if (creepcost > 0) { Memory.Statistik[subroom].aktuell.role.claim = Memory.Statistik[subroom].aktuell.role.claim + creepcost, creepcost = 0 }
                            break;
                        case 1:
                            creepcost = creepspawn.newcreep(room, 'reserv_' + subroom, creepsize, cbody, cmem)
                            if (creepcost > 0) { Memory.Statistik[subroom].aktuell.role.claim = Memory.Statistik[subroom].aktuell.role.claim + creepcost, creepcost = 0 }
                            break;
                    }
                }

            }

            //defence
            if (invasion && insight) {
                var defender = 0
                var hostile = Game.rooms[subroom].find(FIND_HOSTILE_CREEPS)
                if (hostile.length > 0) {
                    console.log(subroom, _.sum(hostile, function (creep) { return creep.body.length }))
                    if (_.sum(hostile, function (creep) { return creep.body.length }) > 2) {
                        var defender = 1
                    }
                }

                if (defender > 0) {
                    var cmem = { role: 'defend', home: room, targetroom: subroom }
                    var cbody = [TOUGH, MOVE, MOVE, ATTACK]
                    maxcreepsize = haveenergy
                    if (maxcreepsize > 1200) { creepsize = 1200 } else { creepsize = maxcreepsize }    // Beschränkt maxcreepsize
                    var ccreep = _.filter(Game.creeps, (creep) =>
                        creep.memory.role == cmem.role
                        && creep.memory.home == cmem.home
                        && creep.memory.targetroom == cmem.targetroom);
                    if (ccreep.length < defender) {
                        needdef = true
                        creepcost = creepspawn.newcreep(room, 'def_' + subroom, creepsize, cbody, cmem)
                        if (creepcost > 0) { Memory.Statistik[subroom].aktuell.role.defend = Memory.Statistik[subroom].aktuell.role.defend + creepcost, creepcost = 0 }
                    }

                }
                if (hostile.length < 1) {                //Wenn Bedrohung vorbei wird die Rolle der Defender auf destruct gesetzt
                    var cmem = { role: 'defend', home: room, targetroom: subroom }
                    var ccreep = _.filter(Game.creeps, (creep) =>
                        creep.memory.role == cmem.role
                        && creep.memory.home == cmem.home
                        && creep.memory.targetroom == cmem.targetroom);
                    if (ccreep.length > defender) {
                        for (var i = 0; i < ccreep.length - 1; i++) {
                            //ccreep[i].memory.role = 'destruct'
                        }
                    }
                }
            }
        }
        if (needminer || needcarry || needbmstr || needdef) {
            var wait = true
        } else { var wait = false }

        //subräume



        //build lager

        //build extensions

        //build wall

        //build road

        //build buildings

        var CPUnach = Game.cpu.getUsed()
        Memory.stats['CPU.rooms.' + subroom] = CPUnach - CPUvor
        return (wait)
    }



}

module.exports = subroom