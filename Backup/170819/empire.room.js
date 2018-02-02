var creepspawn = require('creepspawn')
var subroom = require('empire.subroom')
var subroomclaim = require('empire.subroom.claim')
var subroomattack = require('empire.subroom.attack')
var buildextensions = require('build.extensions')
var buildbase = require('build.base')

var empireroom = {
    run: function (room, subrooms) {
        //Wenn kein Spawn im Room besteht wird abgebrochen!
        var xspawns = Game.rooms[room].find(FIND_MY_STRUCTURES, {
            filter: struc => struc.structureType == STRUCTURE_SPAWN
        });
        if (xspawns.length == 0 || xspawns == null || xspawns == undefined) {
            console.log('Kein Spawn in ' + room)
            return;
        } else {
            var xspawn = xspawns[0]
        }

        //buildbase.run(Game.rooms[room].getPositionAt(25,25))

        //Set Memory
        if (Memory.rooms[room] == undefined) {
            Memory.rooms[room] = {}
        }
        if (Memory.rooms[room].Lager == undefined || Memory.rooms[room].tick == undefined || Memory.rooms[room].tick < Game.time - 5) {
            Memory.rooms[room].tick = Game.time
            if (xspawn == undefined) {
                console.log('Abbruch')
                return;
            } else {
                var Lagercont = xspawn.pos.findInRange(FIND_STRUCTURES, 3, {
                    filter: st => st.structureType == STRUCTURE_CONTAINER
                });
                if (Game.rooms[room].storage != undefined) {
                    Memory.rooms[room].Lager = Game.rooms[room].storage.id
                    Memory.rooms[room].havestore = true
                } else if (Lagercont.length > 0) {
                    Memory.rooms[room].Lager = Lagercont[0].id
                    Memory.rooms[room].havestore = false
                } else {
                    Memory.rooms[room].Lager = false
                    Memory.rooms[room].havestore = false
                }
            }
        }

        //Set Memory für Links
        if (Memory.rooms[room].links == undefined || Memory.rooms[room].links.tick == undefined || Memory.rooms[room].links.tick < Game.time - 5) {
            Memory.rooms[room].links = {}
            Memory.rooms[room].links.tick = Game.time
            Memory.rooms[room].links.center = []
            Memory.rooms[room].links.upgrade = []
            var alllinks = Game.rooms[room].find(FIND_MY_STRUCTURES, {
                filter: st => st.structureType == STRUCTURE_LINK
            })
            if (alllinks.length > 0) {
                // centerlink
                var centerlinks = Game.rooms[room].storage.pos.findInRange(FIND_MY_STRUCTURES, 3, {
                    filter: st => st.structureType == STRUCTURE_LINK
                })
                i = 0
                centerlinks.forEach(function (link) {
                    Memory.rooms[room].links.center[i] = link.id
                    i = i + 1
                }, this);
                // sourcelinks
                Memory.rooms[room].links.source = {}
                var sources = Game.rooms[room].find(FIND_SOURCES)
                var sourcelinks = []
                for (var j in sources) {
                    var sourcelink = sources[j].pos.findInRange(FIND_MY_STRUCTURES, 3, {
                        filter: st => st.structureType == STRUCTURE_LINK
                    })
                    i = 0
                    sourcelink.forEach(function (link) {
                        sourcelinks.push({spot: sources[j].id, link: link.id})
                        i = i + 1
                    }, this);
                }
                Memory.rooms[room].links.source = sourcelinks
                // upgradelink
                var upgradelinks = Game.rooms[room].controller.pos.findInRange(FIND_MY_STRUCTURES, 3, {
                    filter: st => st.structureType == STRUCTURE_LINK
                })
                i = 0
                upgradelinks.forEach(function (link) {
                    Memory.rooms[room].links.upgrade[i] = link.id
                    i = i + 1
                }, this);
                // importlink
                // FEHLT!!!!
            }
        }

        //raumvariablen
        const maxenergy = Game.rooms[room].energyCapacityAvailable
        const haveenergy = Game.rooms[room].energyAvailable
        if (Game.rooms[room].storage == undefined) {
            var havestore = false
            var reserve = 0
        } else {
            var havestore = true
            var reserve = Game.rooms[room].storage.store[RESOURCE_ENERGY]
        }
        if (Memory.rooms[room].links.center[0]) { var centerli = true } else { var centerli = false }
        if (Memory.rooms[room].links.upgrade[0]) { var upgradeli = true } else { var upgradeli = false }

        //notfallplan  -->  wenn keine creeps vorhanden. 
        //                  Es wird die Größe von Miner und Carry beschränkt auf das was da ist

        var carry = Game.rooms[room].find(FIND_CREEPS, {
            filter: cr => cr.memory.role == 'carry'
        })
        var miner = Game.rooms[room].find(FIND_CREEPS, {
            filter: cr => cr.memory.role == 'miner'
        })

        if (!Game.rooms[room].memory.notfall && carry.length < 1 && miner.length < 1 && havestore < 801) {
            console.log('Notfall')
            Game.rooms[room].memory.notfall = true
            var notfall = true
        }
        if (havestore) {
            if (Game.rooms[room].memory.notfall && carry.length > 3 && miner.length > 1) {
                Game.rooms[room].memory.notfall = false
                var notfall = false
            }
        } else {
            if (Game.rooms[room].memory.notfall && carry.length > 1 && miner.length > 0) {
                Game.rooms[room].memory.notfall = false
                var notfall = false
            }
        }

        //----------creeps------------------
        //size
        if (haveenergy + reserve < maxenergy) {
            var maxcreepsize = haveenergy + reserve
        } else {
            var maxcreepsize = maxenergy
        }
        var creepsize
        var needminer = false
        var needcarry = false
        var needbmstr = false
        var needdef = false
        //----------  Miner + Carry  ----------
        //Wenn Storage gebaut dann zwei Miner (einer pro Spot) sonst nur einer am zum Spawn nächstgelegenen
        //Je Miner 2 Carrier
        if (havestore) {
            if (1 == 2) {      // Wenn resource + centerlink --> Miner mit Carrypart legt in resourcelink ab und keine Carry ab Container --> storage

            } else {  //Wenn keine
                var miningspots = Game.rooms[room].find(FIND_SOURCES)
                for (var spots in miningspots) {
                    //spawn miner mit spot im memory
                    var cmem = { role: 'miner', spot: miningspots[spots].id, home: room, targetroom: '' }
                    var cbody = [WORK, WORK, MOVE]
                    if (maxcreepsize > 800) { creepsize = 800 } else { creepsize = maxcreepsize }    // Beschränkt maxcreepsize
                    if (Game.rooms[room].memory.notfall) { creepsize = haveenergy; console.log('Notfall') }         // Falls Notfall!
                    var ccreep = _.filter(Game.creeps, (creep) =>
                        creep.memory.role == cmem.role
                        && creep.memory.spot == cmem.spot
                        && creep.memory.home == cmem.home
                        && creep.memory.targetroom == cmem.targetroom
                        && (creep.ticksToLive > 50 || creep.ticksToLive == undefined));
                    if (ccreep.length < 1) {
                        needminer = true
                        creepspawn.newcreep(room, 'miner', creepsize, cbody, cmem)
                    }
                    //spawn carrier mit spot im Memory
                    if (!needminer) {  //zuerst werden miner gebaut, wenn vorhanden dann carry
                        var cmem = { role: 'carry', spot: miningspots[spots].id, home: room, targetroom: room, harvesting: true }
                        var cbody = [CARRY, CARRY, MOVE]
                        if (maxcreepsize > 800) { creepsize = 800 } else { creepsize = maxcreepsize }    // Beschränkt maxcreepsize
                        if (Game.rooms[room].memory.notfall) { creepsize = haveenergy; console.log('Notfall') }       // Falls Notfall!
                        var ccreep = _.filter(Game.creeps, (creep) =>
                            creep.memory.role == cmem.role
                            && creep.memory.spot == cmem.spot
                            && creep.memory.home == cmem.home
                            && creep.memory.targetroom == cmem.targetroom);
                        if (ccreep.length < 2) {
                            needcarry = true
                            creepspawn.newcreep(room, 'carry', creepsize, cbody, cmem)
                        }
                    }
                }
            }
        } else {
            var miningspots = xspawn.pos.findClosestByRange(FIND_SOURCES)
            //spawn miner mit spot im memory
            var cmem = { role: 'miner', spot: miningspots.id, home: room, targetroom: '' }
            var cbody = [WORK, WORK, MOVE]
            if (maxcreepsize > 800) { creepsize = 800 } else { creepsize = maxcreepsize }    // Beschränkt maxcreepsize
            if (Game.rooms[room].memory.notfall) { creepsize = haveenergy; console.log('Notfall') }       // Falls Notfall!
            var ccreep = _.filter(Game.creeps, (creep) =>
                creep.memory.role == cmem.role
                && creep.memory.spot == cmem.spot
                && creep.memory.home == cmem.home
                && creep.memory.targetroom == cmem.targetroom
                && creep.ticksToLive > 15);
            if (ccreep.length < 1) {
                needminer = true
                creepspawn.newcreep(room, 'miner', creepsize, cbody, cmem)
            }
            //spawn carrier mit spot im Memory
            if (!needminer) {
                var cmem = { role: 'carry', spot: miningspots.id, home: room, targetroom: room, harvesting: true }
                var cbody = [CARRY, CARRY, MOVE]
                if (maxcreepsize > 800) { creepsize = 800 } else { creepsize = maxcreepsize }    // Beschränkt maxcreepsize
                if (Game.rooms[room].memory.notfall) { creepsize = haveenergy; console.log('Notfall') }       // Falls Notfall!
                var ccreep = _.filter(Game.creeps, (creep) =>
                    creep.memory.role == cmem.role
                    && creep.memory.spot == cmem.spot
                    && creep.memory.home == cmem.home
                    && creep.memory.targetroom == cmem.targetroom);
                if (ccreep.length < 2) {
                    needcarry = true
                    creepspawn.newcreep(room, 'carry', creepsize, cbody, cmem)
                }
            }
        }
        //---------- defence  ----------

        var defender = 0
        var hostile = Game.rooms[room].find(FIND_HOSTILE_CREEPS)
        if (hostile.length > 0) {
            var defender = 3
        }

        if (defender > 0) {
            var cmem = { role: 'defend', home: room, targetroom: room }
            var cbody = [TOUGH, MOVE, MOVE, ATTACK]
            maxcreepsize = haveenergy
            if (maxcreepsize > 1200) { creepsize = 1200 } else { creepsize = maxcreepsize }    // Beschränkt maxcreepsize
            var ccreep = _.filter(Game.creeps, (creep) =>
                creep.memory.role == cmem.role
                && creep.memory.home == cmem.home
                && creep.memory.targetroom == cmem.targetroom);
            if (ccreep.length < defender) {
                creepspawn.newcreep(room, 'def', creepsize, cbody, cmem)
                needdef = true
            }
        }


        //---------- bmstr Baumeister  ----------
        var bmstrsites = Game.rooms[room].find(FIND_MY_CONSTRUCTION_SITES)
        var bmst = 0
        switch (true) {
            case (bmstrsites.length > 15):
                bmst = 4
                break;
            case (bmstrsites.length > 5):
                bmst = 3
                break;
            default:
                bmst = 2
                break;
        }

        if (!needminer && !needcarry && !needdef) {
            var cmem = { role: 'bmstr', home: room, targetroom: room, working: false, onsite: false }
            var cbody = [MOVE, MOVE, WORK, CARRY, CARRY]
            if (maxcreepsize > 1800) { creepsize = 1800 } else { creepsize = maxcreepsize }    // Beschränkt maxcreepsize
            var ccreep = _.filter(Game.creeps, (creep) =>
                creep.memory.role == cmem.role
                //&& creep.memory.home == cmem.home                             //Es werden auch bmstr die aus anderen Räumen geschickt wurden gezählt!
                && creep.memory.targetroom == cmem.targetroom);
            if (ccreep.length < bmst) {
                needbmstr = true
                creepspawn.newcreep(room, 'bmstr', creepsize, cbody, cmem)
            }
        }

        //----------   upgrader    ----------
        if (!needminer && !needcarry && !needbmstr && !needdef) {
            if (havestore) {
                if (reserve >= 10000) {
                    var upgraderstore = Math.ceil((reserve - 10000) / 25000)
                } else {
                    var upgraderstore = 0
                }
                var cmem = { role: 'upgraderstorage', home: room, targetroom: '', upgrading: false }
                var cbody = [MOVE, MOVE, WORK, CARRY, CARRY]
                if (maxcreepsize > 1200) { creepsize = 1200 } else { creepsize = maxcreepsize }    // Beschränkt maxcreepsize
                var ccreep = _.filter(Game.creeps, (creep) =>
                    creep.memory.role == cmem.role
                    && creep.memory.home == cmem.home
                    && creep.memory.targetroom == cmem.targetroom);
                if (ccreep.length < upgraderstore) {
                    creepspawn.newcreep(room, 'upgraderstorage', creepsize, cbody, cmem)
                }
            } else {
                upgrader = 8
                var miningspots = xspawn.room.controller.pos.findClosestByRange(FIND_SOURCES)
                var cmem = { role: 'upgrader', spot: miningspots, home: room, targetroom: '', upgrading: false }
                var cbody = [MOVE, WORK, CARRY]
                if (maxcreepsize > 1200) { creepsize = 1200 } else { creepsize = maxcreepsize }    // Beschränkt maxcreepsize
                var ccreep = _.filter(Game.creeps, (creep) =>
                    creep.memory.role == cmem.role
                    && creep.memory.home == cmem.home
                    && creep.memory.targetroom == cmem.targetroom);
                if (ccreep.length < upgrader) {
                    creepspawn.newcreep(room, 'upgrader', creepsize, cbody, cmem)
                }
            }
        }

        if (needminer) {
            console.log('Warte auf Miner in ' + room)
        }
        if (needcarry) {
            console.log('Warte auf Carry in ' + room)
        }
        if (needbmstr) {
            console.log('Warte auf Bmstr in ' + room)
        }
        if (needdef) {
            console.log('Warte auf Defender in ' + room)
        }

        if (needminer || needcarry || needbmstr || needdef) {
            var wait = true
        } else { var wait = false }

        //subräume harvest claim attack
        for (var i in subrooms) {
            if (subrooms[i].todo == 'harvest') {
                subroom.run(room, subrooms[i].targetroom, wait)
            }
            if (subrooms[i].todo == 'claim') {
                subroomclaim.run(room, subrooms[i].targetroom, wait)
            }
            if (subrooms[i].todo == 'attack') {
                subroomattack.run(room, subrooms[i].targetroom, wait)
            }
        }

        var xspawnr = Game.rooms[room].find(FIND_MY_STRUCTURES, {
            filter: struc => struc.structureType == STRUCTURE_SPAWN && struc.spawning != null
        })
        for (var s in xspawnr) {
            console.log(room + ' ' + xspawnr[s].name + ' spawnt:  ' + xspawnr[s].spawning.name + '  in ' + xspawnr[s].spawning.remainingTime + '/' + xspawnr[s].spawning.needTime)
        }



        //build lager

        //build extensions

        //build wall

        //build road

        //build buildings



    }



}

module.exports = empireroom