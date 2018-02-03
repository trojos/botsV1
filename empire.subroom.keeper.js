var creepspawn = require('creepspawn')
var buildroad = require('build.roads')

//Costmatrix für Raum
function iscenter(croom) {
    if (croom.indexOf('S') != -1) {
        var EW = croom.substring(1, croom.indexOf('S'))
        var SN = croom.substring(croom.indexOf('S') + 1)
    } else {
        var EW = croom.substring(1, croom.indexOf('N'))
        var SN = croom.substring(croom.indexOf('N') + 1)
    }
    if ((EW / 5) % 2 == 1) { var EWcenter = true } else { var EWcenter = false }
    if ((SN / 5) % 2 == 1) { var SNcenter = true } else { var SNcenter = false }

    if (EWcenter && SNcenter) { return true; } else { return false; }
}

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
        //Set Memory für Statistik
        if (Memory.Statistik == undefined) {
            Memory.Statistik = {}
        }
        if (Memory.Statistik[subroom] == undefined) {
            Memory.Statistik[subroom] = {}
            Memory.Statistik[subroom].aktuell = {}
            Memory.Statistik[subroom].aktuell.role = {}
            Memory.Statistik[subroom].aktuell.energy = 0
            Memory.Statistik[subroom].aktuell.start = 0
            Memory.Statistik[subroom].Ergebniss = []
        }
        //Statistik iteration
        if (Memory.Statistik[subroom].aktuell.start < Game.time - 5000) {
            Memory.Statistik[subroom].aktuell.Summe = Memory.Statistik[subroom].aktuell.energy - _.sum(Memory.Statistik[subroom].aktuell.role)

            Memory.Statistik[subroom].Ergebniss.push(Memory.Statistik[subroom].aktuell)
            Memory.Statistik[subroom].aktuell = {}
            Memory.Statistik[subroom].aktuell.role = {}
            var rolear = { 'scout': 0, 'miner': 0, 'carry': 0, 'bmstr': 0, 'claim': 0, 'defend': 0, 'keeperheal': 0, 'keeperFernDD': 0, 'keeperNahDD': 0 }
            Memory.Statistik[subroom].aktuell.role = rolear
            Memory.Statistik[subroom].aktuell.energy = 0
            Memory.Statistik[subroom].aktuell.Summe = 0
            Memory.Statistik[subroom].aktuell.start = Game.time
        }

        //raumvariablen
        const xspawns = Game.rooms[room].find(FIND_MY_STRUCTURES, {
            filter: struc => struc.structureType == STRUCTURE_SPAWN
        });
        const xspawn = xspawns[0]
        const maxenergy = Game.rooms[room].energyCapacityAvailable
        if (maxenergy < 2300) { return; }
        const haveenergy = Game.rooms[room].energyAvailable
        if (Game.rooms[room].storage == undefined) {
            var havestore = false
            var reserve = 0
        } else {
            var havestore = true
            var reserve = Game.rooms[room].storage.store[RESOURCE_ENERGY]
        }

        if (Game.rooms[subroom] == undefined) {
            var insight = false
        } else {
            var insight = true
        }

        var center = iscenter(subroom)

        // Rep und Bauzeugs in Memory schreiben
        if (insight) {
            HomeRCL = Game.rooms[room].controller.level
            if (Memory.rooms[subroom] == undefined) { Memory.rooms[subroom] = {} }
            if (Memory.rooms[subroom].Bmstr == undefined) { Memory.rooms[subroom].Bmstr = {} }
            if (Memory.rooms[subroom].Bmstr.tick == undefined || Memory.rooms[subroom].Bmstr.tick < Game.time - 151) {
                Memory.Bmstr = {}
                Memory.rooms[subroom].Bmstr.tick = Game.time
                var bmstrsites = Game.rooms[subroom].find(FIND_MY_CONSTRUCTION_SITES)
                var bmstrsites2 = _.sum(bmstrsites, 'progressTotal') - _.sum(bmstrsites, 'progress')
                Memory.rooms[subroom].Bmstr.constructionsites = bmstrsites.length
                Memory.rooms[subroom].Bmstr.constructionprogress = bmstrsites2
                var bauBP = 0
                switch (true) {
                    case (bmstrsites2 > 10000):
                        bauBP = 16; break;// <---- work Bodyparts -- Anhand dieser Geschwindigkeit wird die benötigte Anzahl an Bmstr ermittelt
                    case (bmstrsites2 > 4000):
                        bauBP = 8; break;
                    case (bmstrsites2 > 300):
                        bauBP = 2; break;
                }

                Memory.rooms[subroom].Bmstr.baubodyparts = bauBP

                var repstreets = _.sum(Game.rooms[subroom].find(FIND_STRUCTURES, {
                    filter: (s) => s.structureType == STRUCTURE_ROAD
                }), 'hitsMax') / 5000
                var repcont = Game.rooms[subroom].find(FIND_STRUCTURES, {
                    filter: (s) => s.structureType == STRUCTURE_CONTAINER
                })
                Memory.rooms[subroom].Bmstr.streets = repstreets
                Memory.rooms[subroom].Bmstr.cont = repcont.length
                var repamount = Math.ceil((repstreets * 0.5 + repcont.length * 50) / 100 * 3)  //hits die pro tick repariert werden müssen. 100hits = 1 energy * 3 für beschaffen und weg
                Memory.rooms[subroom].Bmstr.reppbodyparts = repamount
            }
            //Wege in Memory schreiben
            if (Memory.rooms[subroom].Wege == undefined) { Memory.rooms[subroom].Wege = {} }
            if (Memory.rooms[subroom].Wege.tick == undefined || Memory.rooms[subroom].Wege.tick < Game.time - 151) {
                Memory.rooms[subroom].Wege = {}
                Memory.rooms[subroom].Wege.tick = Game.time
                if (insight) {
                    Memory.rooms[subroom].spots = {}
                    var sources = Game.rooms[subroom].find(FIND_SOURCES)
                    var minerals = Game.rooms[subroom].find(FIND_MINERALS)
                    sources.push(minerals[0])
                    sources.forEach(function (spot) {
                        Memory.rooms[subroom].Wege[spot.id] = {}

                        Memory.rooms[subroom].Wege[spot.id].Spawn = PathFinder.search(spot.pos, { pos: xspawn.pos, range: 1 }, {
                            plainCost: 2, swampCost: 10,
                            roomCallback: function (roomName) { return cmroomf(roomName); }
                        })
                        var pathcost = Memory.rooms[subroom].Wege[spot.id].Spawn.cost
                        var ept = 50 / (25 + 50 + (pathcost * 2) + 2) * 300  //energy pro bodypart pro 300ticks
                        var energyav = 4600 - ((Memory.rooms[subroom].Bmstr.reppbodyparts + Memory.rooms[subroom].Bmstr.baubodyparts) / 1 * 200)
                        var carrybpneed = energyav / ept //benötigte bodyparts um 3000 energy in 300 ticks zuverwerken
                        Memory.rooms[subroom].Wege[spot.id].Spawn.carrybpneed = carrybpneed
                        Memory.rooms[subroom].spots[spot.id] = {}
                        if (spot.energyCapacity == undefined) {
                            Memory.rooms[subroom].spots[spot.id].mineral = true
                        } else {
                            Memory.rooms[subroom].spots[spot.id].mineral = false
                        }
                        Memory.rooms[subroom].spots[spot.id].id = spot.id
                        Memory.rooms[subroom].spots[spot.id].cost = pathcost
                        var lairbyspot = spot.pos.findInRange(FIND_HOSTILE_STRUCTURES, 5, {
                            filter: { structureType: STRUCTURE_KEEPER_LAIR }
                        })

                        if (lairbyspot.length > 0 || spot.length > 0) {
                            Memory.rooms[subroom].spots[spot.id].lair = lairbyspot[0].id
                            Memory.rooms[subroom].spots[spot.id].tts = lairbyspot[0].ticksToSpawn
                            if (lairbyspot[0] == undefined) { lairbyspot[0] = spot[0] }
                            if (spot == undefined) { spot = lairbyspot[0] }
                            var goals = []
                            goals.push({ pos: lairbyspot[0].pos, range: 3 })
                            goals.push({ pos: spot.pos, range: 2 })
                            var fleepath = PathFinder.search(spot.pos, goals, {
                                flee: true,
                                plainCost: 2,
                                swampCost: 10,
                                roomCallback: function (roomName) {
                                    let room = Game.rooms[roomName];
                                    if (!room) return;
                                    let costs = new PathFinder.CostMatrix;
                                    var antix = [0, 1, 2, 3, 46, 47, 48, 49]
                                    var antiy = [0, 1, 2, 3, 46, 47, 48, 49]
                                    antix.forEach(function (x) {
                                        for (var y = 0; y < 50; y++) {
                                            costs.set(x, y, 255)
                                        }
                                    });
                                    antiy.forEach(function (y) {
                                        for (var x = 0; x < 50; x++) {
                                            costs.set(x, y, 255)
                                        }
                                    });
                                    return costs;
                                }
                            })
                        var waitpoint = fleepath.path[fleepath.path.length - 1]
                        Memory.rooms[subroom].spots[spot.id].waitpoint = waitpoint    
                        }
                        

                    })
                    // Begrenzen der Source Ziele wenn RCL 6
                    HomeRCL = Game.rooms[room].controller.level
                    if (HomeRCL < 7) {
                        if (sources.length > 2) {
                            for (var i = 2; i < sources.length; i++) { // i = Anzahl der spots die bearbeitet werden sollen
                                spotcosts = Memory.rooms[subroom].spots
                                var maxcost = _.max(spotcosts, 'cost')
                                delete Memory.rooms[subroom].spots[maxcost.id]
                            }
                        }
                    }
                }
            }
        }
        //Straßen bauen
        if (insight) {
            if (Game.time % 500 == 0) {
                var spots = Game.rooms[subroom].find(FIND_SOURCES)
                var minerals = Game.rooms[subroom].find(FIND_MINERALS)
                spots.push(minerals[0])
                var start
                if (Game.rooms[room].storage) {
                    start = Game.rooms[room].storage.pos
                } else {
                    start = Game.rooms[room].find(FIND_MY_SPAWNS)[0].pos
                }
                spots.forEach(spot => {
                    console.log(start, spot.pos)
                    buildroad.run(start, spot.pos, 0)
                })
            }
        }

        // Keeper pos und spawnzeiten in Memory schreiben
        if (insight) {
            HomeRCL = Game.rooms[room].controller.level
            if (Memory.rooms[subroom] == undefined) { Memory.rooms[subroom] = {} }
            if (Memory.rooms[subroom].keeper == undefined) { Memory.rooms[subroom].keeper = {} }
            if (Memory.rooms[subroom].keeper.tick == undefined || Memory.rooms[subroom].keeper.tick < Game.time - 0) {
                Memory.rooms[subroom].keeper.tick = Game.time
                //keepers
                var keepers
                keepers = Game.rooms[subroom].find(FIND_HOSTILE_CREEPS, {
                    filter: { owner: { username: 'Source Keeper' } }
                })
                Memory.rooms[subroom].keeper.keepers = {}
                Memory.rooms[subroom].keeper.keepers = keepers
                var invaders
                invaders = Game.rooms[subroom].find(FIND_HOSTILE_CREEPS, {
                    filter: { owner: { username: 'Invader' } }
                })
                //invaders
                var DDneed = 1
                if (invaders.length > 0) {
                    Memory.rooms[subroom].keeper.invaders = true
                    Memory.rooms[subroom].keeper.invader = {}
                    var invasion = true; var inBPheal = 0; var inBPranged = 0; var inBPtough = 0        //Ermittlung der Heal und ranged Bodyparts der Invader, boosted = *4
                    invaders.forEach(inv => {
                        var inBP = inv.body
                        inBP.forEach(BP => {
                            if (BP.type == HEAL && BP.boost == undefined) { inBPheal += 1 } else if (BP.type == HEAL) { inBPheal += 4 }
                            if (BP.type == RANGED_ATTACK && BP.boost == undefined) { inBPranged += 1 } else if (BP.type == RANGED_ATTACK) { inBPranged += 4 }
                            if (BP.type == TOUGH && BP.boost == undefined) { inBPtough += 1 } else if (BP.type == TOUGH) { inBPtough += 4 }
                        })
                    });

                    Memory.rooms[subroom].keeper.invader.heal = inBPheal
                    Memory.rooms[subroom].keeper.invader.ranged = inBPranged
                    Memory.rooms[subroom].keeper.invader.tough = inBPtough

                    //Berechnung ob kleine oder große Invasion
                    var invtype = 'verysmall'

                    if (center) {
                        invtype = 'nope'; DDneed = 0
                    } else {
                        if (inBPheal > 10) { invtype = 'small' }
                        if (inBPheal >= 20) { invtype = 'big'; DDneed = 2 }
                        if (inBPheal > 45) { invtype = 'verybig'; DDneed = 3 }
                        if (inBPheal > 60) { invtype = 'nope'; DDneed = 0 } //keine verteidigung!!
                    }
                    Memory.rooms[subroom].keeper.invader.type = invtype


                    //Je nach Invtype creeps heimschicken
                    var evac = false
                    if (invtype == 'verysmall' || invtype == 'small') {
                        var DDinRoom = Game.rooms[subroom].find(FIND_MY_CREEPS, {
                            filter: cr => cr.memory.role == 'keeperFernDD'
                        })
                        if (DDinRoom.length < DDneed) {
                            evac = true
                        }
                    } else {
                        evac = true
                    }
                    if (evac) {  //evakuieren und creeps destruct
                        for (var name in Game.creeps) {
                            var creep = Game.creeps[name];
                            if (creep.memory.targetroom == subroom && creep.memory.role != 'keeperFernDD') {
                                creep.memory.role = 'destruct'
                            }
                        }
                    }
                } else {
                    Memory.rooms[subroom].keeper.invaders = false
                    Memory.rooms[subroom].keeper.invader = {}
                    var invasion = false
                }
                Memory.rooms[subroom].keeper.DDneed = DDneed
                //lairs
                Memory.rooms[subroom].keeper.lairs = {}
                lairs = Game.rooms[subroom].find(FIND_HOSTILE_STRUCTURES, {
                    filter: { structureType: STRUCTURE_KEEPER_LAIR }
                })
                for (var lair in lairs) {
                    var tts = lairs[lair].ticksToSpawn
                    if (tts == undefined) {
                        lairs[lair].tts = 1000
                    } else {
                        lairs[lair].tts = tts
                    }
                    var lairsource = lairs[lair].pos.findInRange(FIND_SOURCES, 5)
                    if (lairsource[0] == undefined) {
                        lairsource = lairs[lair].pos.findInRange(FIND_MINERALS, 5)
                    }
                    lairs[lair].source = lairsource[0].id
                }
                Memory.rooms[subroom].keeper.lairs = lairs
                //Costmatrix für Savetravel
                var cmsave = new PathFinder.CostMatrix
                Game.rooms[subroom].find(FIND_STRUCTURES).forEach(function (struct) {
                    if (struct.structureType === STRUCTURE_ROAD) {
                        cmsave.set(struct.pos.x, struct.pos.y, 1);
                    } else if (struct.structureType !== STRUCTURE_CONTAINER &&
                        (struct.structureType !== STRUCTURE_RAMPART ||
                            !struct.my)) {
                        cmsave.set(struct.pos.x, struct.pos.y, 255);
                    }
                });
                for (var i in keepers) {
                    var dx = 6
                    var dy = 6
                    for (var x = 0; x < dx; x++) {
                        var ex = keepers[i].pos.x - (dx / 2) + x
                        for (var y = 0; y < dy; y++) {
                            var ey = keepers[i].pos.y - (dy / 2) + y
                            cmsave.set(ex, ey, 255)
                        }
                    }
                }
                Memory.rooms[subroom].savetravel = cmsave.serialize()
                //Angriffsziel festlegen
                var spots = Memory.rooms[subroom].spots
                Memory.rooms[subroom].keeper.targetkeeper = false
                for (var i in spots) {
                    var targetkeeper = Game.getObjectById(spots[i].id).pos.findInRange(FIND_HOSTILE_CREEPS, 4)
                    if (targetkeeper.length > 0) { Memory.rooms[subroom].keeper.targetkeeper = targetkeeper[0].id; break; }
                }
                //Next Spawn
                var nextlairs = []
                for (var i in spots) {
                    var spotlair = _.filter(Memory.rooms[subroom].keeper.lairs, { 'source': spots[i].id })
                    nextlairs.push(spotlair[0])
                }
                var next = _.min(nextlairs, 'tts')
                Memory.rooms[subroom].keeper.tts = next.tts
                if (next.pos) {
                    if (next.pos.findInRange(FIND_SOURCES, 5).length) {
                        Memory.rooms[subroom].keeper.nextspot = next.pos.findInRange(FIND_SOURCES, 5)[0].id
                    } else {
                        Memory.rooms[subroom].keeper.nextspot = next.pos.findInRange(FIND_MINERALS, 5)[0].id
                    }
                    Memory.rooms[subroom].keeper.nextlair = next.id
                }
            }
        }
        if (insight) {
            var constructing  // wenn mehr als 7 constructionsites dann werden keine miner und carryer gespawnt
            if (Memory.rooms[subroom].Bmstr.constructionsites > 7) { constructing = true } else { constructing = false }
        } else {
            constructing = false
        }

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
        var needheal = false
        var needFernDD = false
        var needdef = false
        var needsourcedef = false
        var creepcost = 0
        //---------- Scout -----------------
        if (!insight) {
            var cmem = { role: 'keeperscout', home: room, targetroom: subroom }
            var cbody = [MOVE]
            if (maxcreepsize > 50) { creepsize = 50 } else { creepsize = maxcreepsize }    // Beschränkt maxcreepsize
            var ccreep = _.filter(Game.creeps, (creep) =>
                creep.memory.role == cmem.role
                && creep.memory.home == cmem.home
                && creep.memory.targetroom == cmem.targetroom);
            if (ccreep.length < 1) {
                creepcost = creepspawn.newcreep(room, 'k_scout_' + subroom, creepsize, cbody, cmem)
                if (creepcost > 0) { Memory.Statistik[subroom].aktuell.role.scout = Memory.Statistik[subroom].aktuell.role.scout + creepcost, creepcost = 0 }
            }
        }

        if (maxenergy >= 5600 && !center) {
            if (Memory.rooms[subroom] != undefined) {
                var invasion = Memory.rooms[subroom].keeper.invaders
                var NahDD = Memory.rooms[subroom].keeper.DDneed
            } else { var invastion = false; var NahDD = 0 }
            //Wird aus invasionberechnung übernommen
            if (invasion || !insight) { console.log(subroom + '  INVASION') }
            var cmem = { role: 'keeperFernDD', home: room, targetroom: subroom }
            var cbody = [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, HEAL, HEAL, MOVE, MOVE, HEAL]
            var ccreep = _.filter(Game.creeps, (creep) =>
                creep.memory.role == cmem.role
                && creep.memory.home == cmem.home
                && creep.memory.targetroom == cmem.targetroom
                && (creep.ticksToLive > 200 || creep.ticksToLive == undefined));
            var ccreep2 = _.filter(ccreep, (creep) =>
                creep.memory.role == cmem.role
                && creep.memory.home == cmem.home
                && creep.memory.targetroom == cmem.targetroom
                && (creep.ticksToLive > 200));
            if (invasion) { cmem.wait = true } else { cmem.wait = false }
            if (ccreep2.length >= NahDD) {           //wenn genung creeps vorhanden wird wair auf false gesetzt damit diese gemeinsam angreifen
                ccreep2.forEach(cr => { cr.memory.wait = false });
            } else if (ccreep2.length < NahDD && invasion) {      //Wenn invasion und zuwenige creeps werden dies auf wait gesetzt --> laut role gehen sie zu spawn und warten bis genug da sind
                ccreep2.forEach(cr => { cr.memory.wait = true });
            }
            if (ccreep.length < NahDD) {
                needsourcedef = true
                creepcost = creepspawn.newcreep(room, 'k_FernDD_' + subroom, creepsize, cbody, cmem)
                if (creepcost > 0) { Memory.Statistik[subroom].aktuell.role.miner = Memory.Statistik[subroom].aktuell.role.keeperNahDD + creepcost, creepcost = 0 }
            } else if (ccreep.length > NahDD && !invasion) {
                dcreep = _.min(ccreep, 'ticksToLive')
                if (dcreep != undefined) {
                    dcreep.memory.role = 'destruct'
                }
            }
        }

        //Heiler - Keeper          
        if (maxenergy < 5600 && !center) {
            var Heiler = 1
            if (Heiler > 0) {
                var cmem = { role: 'keeperheal', home: room, targetroom: subroom }
                var cbody = [TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, MOVE]
                maxcreepsize = haveenergy
                if (maxcreepsize > 1800) { creepsize = 1800 } else { creepsize = maxcreepsize }    // Beschränkt maxcreepsize
                var ccreep = _.filter(Game.creeps, (creep) =>
                    creep.memory.role == cmem.role
                    && creep.memory.home == cmem.home
                    && creep.memory.targetroom == cmem.targetroom
                    && (creep.ticksToLive > 200 || creep.ticksToLive == undefined))
                if (ccreep.length < Heiler) {
                    needheal = true
                    creepcost = creepspawn.newcreep(room, 'k_heal_' + subroom, creepsize, cbody, cmem)
                    if (creepcost > 0) { Memory.Statistik[subroom].aktuell.role.keeperheal = Memory.Statistik[subroom].aktuell.role.keeperheal + creepcost, creepcost = 0 }
                }
            }

            //FernDD - Keeper
            if (!needheal && !center) {
                var FernDD = 2
                if (FernDD > 0) {
                    var cmem = { role: 'keeperFernDD', home: room, targetroom: subroom }
                    var cbody = [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, MOVE, HEAL]
                    //var cbody = [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK]
                    maxcreepsize = haveenergy
                    if (maxcreepsize > 2300) { creepsize = 2300 } else { creepsize = maxcreepsize }    // Beschränkt maxcreepsize
                    var ccreep = _.filter(Game.creeps, (creep) =>
                        creep.memory.role == cmem.role
                        && creep.memory.home == cmem.home
                        && creep.memory.targetroom == cmem.targetroom
                        && (creep.ticksToLive > 200 || creep.ticksToLive == undefined))
                    if (ccreep.length < FernDD) {
                        needFernDD = true
                        creepcost = creepspawn.newcreep(room, 'k_FernDD_' + subroom, creepsize, cbody, cmem)
                        if (creepcost > 0) { Memory.Statistik[subroom].aktuell.role.keeperFernDD = Memory.Statistik[subroom].aktuell.role.keeperFernDD + creepcost, creepcost = 0 }
                    }
                }
            }
        }

        //----------  Miner + Carry  ----------
        //Je Miner 2 Carrier
        if (insight && !needheal && !needFernDD && !needsourcedef && !invasion) {
            var miningspots = Memory.rooms[subroom].spots
            for (var spots in miningspots) {
                if (!miningspots[spots].mineral) {
                    //spawn miner mit spot im memory
                    if (!needsourcedef && !wait) {
                        var cmem = { role: 'keeper_miner', spot: miningspots[spots].id, home: room, targetroom: subroom }
                        var cbody = [MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK]
                        if (maxcreepsize > 1150) { creepsize = 1150 } else { creepsize = maxcreepsize }    // Beschränkt maxcreepsize
                        var ccreep = _.filter(Game.creeps, (creep) =>
                            creep.memory.role == cmem.role
                            && creep.memory.spot == cmem.spot
                            && creep.memory.home == cmem.home
                            && creep.memory.targetroom == cmem.targetroom
                            && (creep.ticksToLive > 80 || creep.ticksToLive == undefined));
                        if (ccreep.length < 1) {
                            needminer = true
                            creepcost = creepspawn.newcreep(room, 'k_miner_' + subroom, creepsize, cbody, cmem)
                            if (creepcost > 0) { Memory.Statistik[subroom].aktuell.role.miner = Memory.Statistik[subroom].aktuell.role.miner + creepcost, creepcost = 0 }
                        }
                    }

                    //spawn carrier mit spot im Memory
                    if (!needminer && !needsourcedef && !wait && !constructing) {
                        var cmem = { role: 'keeper_carry', spot: miningspots[spots].id, home: room, targetroom: subroom, harvesting: true, statistik: true }
                        var ccreep = _.filter(Game.creeps, (creep) =>
                            creep.memory.role == cmem.role
                            && creep.memory.spot == cmem.spot
                            && creep.memory.home == cmem.home
                            && creep.memory.targetroom == cmem.targetroom);
                        var bodyparts = 0
                        for (var i in ccreep) {
                            bodyparts = bodyparts + ccreep[i].getActiveBodyparts(CARRY)
                        }
                        if (Memory.rooms[subroom].Wege[miningspots[spots].id].Spawn == undefined) {
                            Memory.rooms[subroom].Wege.tick = 0
                            Memory.rooms[subroom].Wege[miningspots[spots].id].Spawn = {}
                            Memory.rooms[subroom].Wege[miningspots[spots].id].Spawn.carrybpneed = 10
                        }
                        Memory.rooms[subroom].Wege[miningspots[spots].id].Spawn.carrybphave = bodyparts
                        var BPneed = Memory.rooms[subroom].Wege[miningspots[spots].id].Spawn.carrybpneed
                        //var BPneed = 20
                        if (bodyparts < BPneed) {
                            needcarry = true
                            var cbody = [CARRY, CARRY, MOVE]
                            var cbodycost = 75
                            var bodypartsneed = Memory.rooms[subroom].Wege[miningspots[spots].id].Spawn.carrybpneed - bodyparts
                            bodypartsneed = Math.ceil(bodypartsneed / 2) * 2 + 2
                            //console.log(room + ' ' + subroom + '  ' + Memory.rooms[subroom].Wege[miningspots[spots]].Spawn.carrybpneed + ' ' + bodyparts)
                            if (bodypartsneed < 4) { bodypartsneed = 4 }

                            var bodypartsneedcost = bodypartsneed * cbodycost

                            if (bodypartsneedcost < maxcreepsize) { maxcreepsize = bodypartsneedcost }
                            if (maxcreepsize > 2250) { creepsize = 2250 } else { creepsize = maxcreepsize }    // Beschränkt maxcreepsize
                            creepcost = creepspawn.newcreep(room, 'k_carry_' + subroom, creepsize, cbody, cmem)
                            if (creepcost > 0) { Memory.Statistik[subroom].aktuell.role.carry = Memory.Statistik[subroom].aktuell.role.carry + creepcost, creepcost = 0 }
                        }

                    }
                } else {
                    var HomeRCL = Game.rooms[room].controller.level
                    if (Game.rooms[room].terminal == undefined) {
                        console.log('In Raum ' + room + ' muss ein Terminal gebaut werden!!!')
                        var haveterm = false
                    } else {
                        var haveterm = true
                    }
                    var mineralspot = Game.getObjectById(miningspots[spots].id)
                    if (mineralspot.mineralAmount == 0) { var mempty = true } else { var mempty = false }
                    //spawn MinHarv mit spot im memory
                    if (!needsourcedef && !wait && !mempty && haveterm && !constructing) {
                        var cmem = { role: 'keeper_MinHarv', spot: miningspots[spots].id, home: room, targetroom: subroom }
                        var cbody = [WORK, MOVE, CARRY]
                        if (HomeRCL < 7) { var creepsize = 2300 } else { var creepsize = 3200 }
                        //if (maxcreepsize > 3200) { creepsize = 3200 } else { creepsize = maxcreepsize }    // Beschränkt maxcreepsize
                        var ccreep = _.filter(Game.creeps, (creep) =>
                            creep.memory.role == cmem.role
                            && creep.memory.spot == cmem.spot
                            && creep.memory.home == cmem.home
                            && creep.memory.targetroom == cmem.targetroom
                            && (creep.ticksToLive > 80 || creep.ticksToLive == undefined));
                        if (ccreep.length < 1) {
                            needminer = true
                            creepcost = creepspawn.newcreep(room, 'k_MinHarv_' + subroom, creepsize, cbody, cmem)
                            if (creepcost > 0) { Memory.Statistik[subroom].aktuell.role.miner = Memory.Statistik[subroom].aktuell.role.miner + creepcost, creepcost = 0 }
                        }
                    }
                }
            }
        }

        //---------- bmstr Baumeister  ----------
        if (insight && !wait && !needheal && !needFernDD && !needsourcedef && !needminer && !invasion) {
            var BPneed = Memory.rooms[subroom].Bmstr.baubodyparts + Memory.rooms[subroom].Bmstr.reppbodyparts
            var cmem = { role: 'keeperbmstr', home: room, targetroom: subroom, working: false, onsite: false }
            var ccreep = _.filter(Game.creeps, (creep) =>
                creep.memory.role == cmem.role
                && creep.memory.home == cmem.home
                && creep.memory.targetroom == cmem.targetroom);
            var bodyparts = 0
            for (var i in ccreep) {
                bodyparts = bodyparts + ccreep[i].getActiveBodyparts(WORK)
            }
            var maxcreep = 4
            Memory.rooms[subroom].Bmstr.bodypartshave = bodyparts

            if (bodyparts < BPneed && maxcreep >= ccreep.length) {
                needbmstr = true
                var cbody = [MOVE, MOVE, WORK, CARRY, CARRY]
                var cbodycost = 300
                var bodypartsneed = BPneed - bodyparts
                bodypartsneed = Math.ceil(bodypartsneed) + 2
                var bodypartsneedcost = bodypartsneed * cbodycost
                if (bodypartsneedcost < maxcreepsize) { maxcreepsize = bodypartsneedcost }
                if (maxcreepsize > 1500) { creepsize = 1500 } else { creepsize = maxcreepsize }    // Beschränkt maxcreepsize
                //console.log(maxcreepsize)
                creepcost = creepspawn.newcreep(room, 'k_bmstr_' + subroom, creepsize, cbody, cmem)
                if (creepcost > 0) { Memory.Statistik[subroom].aktuell.role.bmstr = Memory.Statistik[subroom].aktuell.role.bmstr + creepcost, creepcost = 0 }
            }
        }

        if (needminer || needcarry || needbmstr || needheal || needFernDD || needsourcedef) {
            var wait = true
        } else { var wait = false }

        wait = false

        var CPUnach = Game.cpu.getUsed()
        Memory.stats['CPU.rooms.' + subroom] = CPUnach - CPUvor

        return (wait)

    }

}

module.exports = subroom