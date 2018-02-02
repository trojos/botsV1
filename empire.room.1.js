var creepspawn = require('creepspawn')
var subroom = require('empire.subroom')
var subroomclaim = require('empire.subroom.claim')
var subroomattack = require('empire.subroom.attack')
var subroomkeeper = require('empire.subroom.keeper')
var subroombmstr = require('empire.subroom.bmstr')
var energyboost = require('empire.energyboost')
var mineral = require('empire.minerals')
//var buildextensions = require('build.extensions')
//var buildbase = require('build.base')

//Costmatrix für Raum
function cmroomf(room) {
    var cmroomf = new PathFinder.CostMatrix
    Game.rooms[room].find(FIND_STRUCTURES).forEach(function (struct) {
        if (struct.structureType === STRUCTURE_ROAD) {
            cmroomf.set(struct.pos.x, struct.pos.y, 1);
        } else if (struct.structureType !== STRUCTURE_CONTAINER &&
            (struct.structureType !== STRUCTURE_RAMPART ||
                !struct.my)) {
            cmroomf.set(struct.pos.x, struct.pos.y, 255);
        }
    });
    return cmroomf
}

var empireroom = {
    run: function (room, subrooms) {

        var CPUvor = Game.cpu.getUsed()
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

        //Set Memory
        if (Memory.rooms[room] == undefined) {
            Memory.rooms[room] = {}
        }
        if (Memory.rooms[room].Lager == undefined || Memory.rooms[room].tick == undefined || Memory.rooms[room].tick < Game.time - 505) {
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
                Memory.rooms[room].Spawn = xspawns[0].id
                //Costmatrix für Raum
                var cmroom = cmroomf(room)
                //definieren miningspots:
                var spots = Game.rooms[room].find(FIND_SOURCES)
                var tcosts = {}
                Memory.rooms[room].Wege = {}
                var spotsid = []
                spots.forEach(function (spot) {
                    spotsid.push(spot.id)
                    Memory.rooms[room].Wege[spot] = {}
                    Memory.rooms[room].Wege[spot].Spawn = PathFinder.search(spot.pos, { pos: xspawn.pos, range: 1 }, {
                        plainCost: 2, swampCost: 10,
                        roomCallback: function (roomName) { cotst = cmroom; return cmroom; }
                    })
                    Memory.rooms[room].Wege[spot].Controller = PathFinder.search(spot.pos, { pos: Game.rooms[room].controller.pos, range: 3 }, {
                        plainCost: 2, swampCost: 10,
                        roomCallback: function (roomName) { cotst = cmroom; return cmroom; }
                    })
                })
                Memory.rooms[room].spots = {}
                Memory.rooms[room].spots.Alle = spotsid
                var costvar1 = Memory.rooms[room].Wege[spots[0]].Spawn.cost + Memory.rooms[room].Wege[spots[1]].Controller.cost
                var costvar2 = Memory.rooms[room].Wege[spots[1]].Spawn.cost + Memory.rooms[room].Wege[spots[0]].Controller.cost
                Memory.rooms[room].spots.other = []
                if (costvar1 <= costvar2) {
                    Memory.rooms[room].spots.nearspawn = spots[0].id
                    Memory.rooms[room].spots.other[0] = spots[1].id
                } else {
                    Memory.rooms[room].spots.nearspawn = spots[1].id
                    Memory.rooms[room].spots.other[0] = spots[0].id
                }

                Memory.rooms[room].Wege.Controller = {}
                Memory.rooms[room].Wege.Controller.Spawn = PathFinder.search(xspawn.pos, { pos: Game.rooms[room].controller.pos, range: 3 }, {
                    plainCost: 2, swampCost: 10,
                    roomCallback: function (roomName) { cotst = cmroom; return cmroom; }
                })
                if (Memory.rooms[room].Lager) {
                    var lagerobj = Game.getObjectById(Memory.rooms[room].Lager)
                    Memory.rooms[room].Wege.Controller.Lager = PathFinder.search(lagerobj.pos, { pos: Game.rooms[room].controller.pos, range: 3 }, {
                        plainCost: 2, swampCost: 10,
                        roomCallback: function (roomName) { cotst = cmroom; return cmroom; }
                    })
                }
            }
        }
        HomeRCL = Game.rooms[room].controller.level
        // Rep und Bauzeugs in Memory schreiben
        if (Memory.rooms[room] == undefined) { Memory.rooms[room] = {} }
        if (Memory.rooms[room].Bmstr == undefined) { Memory.rooms[room].Bmstr = {} }
        if (Memory.rooms[room].Bmstr.tick == undefined || Memory.rooms[room].Bmstr.tick < Game.time - 510) {
            Memory.Bmstr = {}
            Memory.rooms[room].Bmstr.tick = Game.time
            var bmstrsites = Game.rooms[room].find(FIND_MY_CONSTRUCTION_SITES)
            var bmstrsites2 = _.sum(bmstrsites, 'progressTotal') - _.sum(bmstrsites, 'progress')
            Memory.rooms[room].Bmstr.constructionsites = bmstrsites.length
            Memory.rooms[room].Bmstr.constructionprogress = bmstrsites2
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
            Memory.rooms[room].Bmstr.baubodyparts = bauBP

            var repstreets = _.sum(Game.rooms[room].find(FIND_STRUCTURES, {
                filter: (s) => s.structureType == STRUCTURE_ROAD
            }), 'hitsMax') / 5000
            var repcont = Game.rooms[room].find(FIND_STRUCTURES, {
                filter: (s) => s.structureType == STRUCTURE_CONTAINER
            })
            var repramp = Game.rooms[room].find(FIND_STRUCTURES, {
                filter: (s) => s.structureType == STRUCTURE_RAMPART
            })
            Memory.rooms[room].Bmstr.streets = repstreets
            Memory.rooms[room].Bmstr.cont = repcont.length
            Memory.rooms[room].Bmstr.ramp = repramp.length
            var repamount = Math.ceil((repstreets * 0.1 + repcont.length * 10 + repramp.length * 3) / 100 * 3)  //hits die pro tick repariert werden müssen. 100hits = 1 energy * 3 für beschaffen und weg
            Memory.rooms[room].Bmstr.reppbodyparts = repamount

            var buildwall = Game.rooms[room].find(FIND_STRUCTURES, {
                filter: (s) => s.structureType == STRUCTURE_WALL && s.hits < s.hitsMax
            })
            Memory.rooms[room].Bmstr.wall = buildwall.length
            if (Memory.rooms[room].havestore) {
                switch (true) {
                    case (Game.rooms[room].storage.store[RESOURCE_ENERGY] > 150000):
                        var wallBP = buildwall.length / 10; break;
                    case (Game.rooms[room].storage.store[RESOURCE_ENERGY] > 100000):
                        var wallBP = buildwall.length / 15; break;
                    case (Game.rooms[room].storage.store[RESOURCE_ENERGY] > 50000):
                        var wallBP = buildwall.length / 25; break;
                    default:
                        var wallBP = buildwall.length / 50; break;
                }
            } else {
                var wallBP = buildwall.length / 50;
            }
            Memory.rooms[room].Bmstr.wallbodyparts = Math.ceil(wallBP)
        }
        //Set Memory für Links
        if (Memory.rooms[room].links == undefined || Memory.rooms[room].links.tick == undefined || Memory.rooms[room].links.tick < Game.time - 520) {
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
                    _.remove(alllinks, 'id', link.id)
                    i = i + 1
                }, this);
                // sourcelinks
                Memory.rooms[room].links.source = {}
                var sources = Game.rooms[room].find(FIND_SOURCES)
                var sourcelinks = []
                for (var j in sources) {
                    Memory.rooms[room].links.source[sources[j].id] = {}
                    var sourcelink = sources[j].pos.findInRange(FIND_MY_STRUCTURES, 3, {
                        filter: st => st.structureType == STRUCTURE_LINK
                    })
                    if (sourcelink.length > 0) {
                        Memory.rooms[room].links.source[sources[j].id].link = sourcelink[0].id
                    }
                }
                // upgradelink
                var upgradelinks = Game.rooms[room].controller.pos.findInRange(FIND_MY_STRUCTURES, 3, {
                    filter: st => st.structureType == STRUCTURE_LINK
                })
                i = 0
                upgradelinks.forEach(function (link) {
                    Memory.rooms[room].links.upgrade[i] = link.id
                    _.remove(alllinks, 'id', link.id)
                    i = i + 1
                }, this);
                // Alle Links ausgenommen upgrade und source (alle die senden)
                var transferlinks = []
                if (alllinks.length > 0) {
                    alllinks.forEach(function (li) {
                        transferlinks.push(li.id)
                    }, this);
                }
                Memory.rooms[room].links.transfer = {}
                Memory.rooms[room].links.transfer = transferlinks
            }
        }


        if (Memory.rooms[room].links.center[0]) { var centerli = true; var centerlinkid = Memory.rooms[room].links.center[0] } else { var centerli = false }
        if (Memory.rooms[room].links.upgrade[0]) { var upgradeli = true; var upgradelinkid = Memory.rooms[room].links.upgrade[0] } else { var upgradeli = false }
        if (Memory.rooms[room].links.transfer) { var transferli = true; var transferlinkids = Memory.rooms[room].links.transfer } else { var upgradeli = false }

        //Set Memory Energiebedarf
        var tellenergy = true
        if (tellenergy) {
            if (Memory.rooms[room].energy == undefined) {
                Memory.rooms[room].energy = {}

            }
            Memory.rooms[room].energy.need = {}
            Memory.rooms[room].energy.have = {}

            if (Memory.rooms[room].Lager) {
                var lager = Game.getObjectById(Memory.rooms[room].Lager)
                if (lager) {
                    Memory.rooms[room].energy.Lager = { id: lager.id, type: lager.structureType, res: RESOURCE_ENERGY, amount: lager.store[RESOURCE_ENERGY], pos: lager.pos }
                }
            }

            var energyneed = []
            var structures = Game.rooms[room].find(FIND_MY_STRUCTURES, {
                filter: st => st.structureType != STRUCTURE_ROAD || st.structureType != STRUCTURE_RAMPART || st.structureType != STRUCTURE_WALL
            })
            structures.forEach(struc => {
                if (struc.structureType == STRUCTURE_SPAWN && struc.energyCapacity > struc.energy) {
                    energyneed.push({ id: struc.id, type: STRUCTURE_SPAWN, res: RESOURCE_ENERGY, amount: struc.energyCapacity - struc.energy, pos: struc.pos })
                }
                if (struc.structureType == STRUCTURE_EXTENSION && struc.energyCapacity > struc.energy) {
                    energyneed.push({ id: struc.id, type: STRUCTURE_EXTENSION, res: RESOURCE_ENERGY, amount: struc.energyCapacity - struc.energy, pos: struc.pos })
                }
                if (struc.structureType == STRUCTURE_TOWER && struc.energyCapacity > struc.energy + 100) {
                    energyneed.push({ id: struc.id, type: STRUCTURE_TOWER, res: RESOURCE_ENERGY, amount: struc.energyCapacity - struc.energy, pos: struc.pos })
                }
                if (struc.structureType == STRUCTURE_LAB && struc.energyCapacity > struc.energy + 500) {
                    energyneed.push({ id: struc.id, type: STRUCTURE_LAB, res: RESOURCE_ENERGY, amount: struc.energyCapacity - struc.energy, pos: struc.pos })
                }
                if (struc.structureType == STRUCTURE_STORAGE) {
                    //energyneed.push({ id: struc.id, type: STRUCTURE_STORAGE, res: RESOURCE_ENERGY, amount: struc.storeCapacity - _.sum(struc.store), pos: struc.pos })
                }
            });
            var term = Game.rooms[room].terminal
            if (term != undefined) {
                if (term.store.energy < 21000) {
                    energyneed.push({ id: term.id, type: STRUCTURE_TERMINAL, res: RESOURCE_ENERGY, amount: 22000 - term.store.energy, pos: term.pos })
                }
            }

            if (upgradeli) { var upgradelink = Game.getObjectById(upgradelinkid) }
            if (centerli) { var centerlink = Game.getObjectById(centerlinkid) }

            if (upgradeli) {
                if (centerli) {
                    if (upgradelink.energy < 400 && centerlink.energy < 800 - upgradelink.energy) {
                        if (centerlink.energy < centerlink.energyCapacity) {
                            energyneed.push({ id: centerlinkid, type: STRUCTURE_LINK, res: RESOURCE_ENERGY, amount: centerlink.energyCapacity - centerlink.energy, pos: centerlink.pos })
                        }
                    }
                } else {
                    if (upgradelink.energy < upgradelink.energyCapacity - 100) {
                        energyneed.push({ id: upgradelinkid, type: STRUCTURE_LINK, res: RESOURCE_ENERGY, amount: upgradelink.energyCapacity - upgradelink.energy, pos: upgradelink.pos })
                    }
                }
            }

            if (Memory.rooms[room].Lager) {
                var lager = Game.getObjectById(Memory.rooms[room].Lager)
                //energyneed.push({ id: lager.id, type: 'test', res: RESOURCE_ENERGY, amount: 1000, pos: lager.pos })  //test zeile
            }

            energyneed.forEach(need => {
                Memory.rooms[room].energy.need[need.id] = need
                Memory.rooms[room].energy.need[need.id].Art = 'push'
            });
            //Memory.rooms[room].energy.need = energyneed

            //Set Memory Energiequellen
            var energysource = []
            var dropped = Game.rooms[room].find(FIND_DROPPED_RESOURCES)
            dropped.forEach(drop => {
                if (drop.resourceType == RESOURCE_ENERGY) {
                    energysource.push({ id: drop.id, type: 'drop', res: RESOURCE_ENERGY, amount: drop.amount, pos: drop.pos })
                }
            })
            if (centerli) {
                if (upgradeli) {
                    if (upgradelink.energy > 400) {
                        if (centerlink.energy > 0) { energysource.push({ id: centerlinkid, type: 'link', res: RESOURCE_ENERGY, amount: centerlink.energy, pos: centerlink.pos }) }
                    }
                } else {
                    if (centerlink.energy > 0) { energysource.push({ id: centerlinkid, type: 'link', res: RESOURCE_ENERGY, amount: centerlink.energy, pos: centerlink.pos }) }
                }
            } else {
                if (transferli) {
                    if (upgradeli || centerli) {
                        var fromtran = false
                    }
                } else {
                    var fromtran = true
                }
                if (transferli) {
                    if (fromtran) {
                        transferlinkids.forEach(link => {
                            linkobj = Game.getObjectById(link)
                            if (linkobj.energy > 0) { energysource.push({ id: link, type: 'link', res: RESOURCE_ENERGY, amount: linkobj.energy, pos: linkobj.pos }) }
                        })
                    }
                }
            }
            var fromcontainer = Game.rooms[room].find(FIND_STRUCTURES, {
                filter: (st) => st.structureType == STRUCTURE_CONTAINER && st.id != Memory.rooms[room].Lager && st.store[RESOURCE_ENERGY] > 500
            })
            fromcontainer.forEach(cont => {
                if (cont.store.energy > 0) { energysource.push({ id: cont.id, type: 'container', res: RESOURCE_ENERGY, amount: cont.store[RESOURCE_ENERGY], pos: cont.pos }) }
            })

            var term = Game.rooms[room].terminal
            if (term != undefined) {
                if (term.store.energy > 25000) {
                    energysource.push({ id: term.id, type: STRUCTURE_TERMINAL, res: RESOURCE_ENERGY, amount: term.store.energy - 21000, pos: term.pos })
                }
            }

            //energysource.push({ id: term.id, type: STRUCTURE_TERMINAL, res: RESOURCE_ENERGY, amount: 500, pos: term.pos }) //test zeile

            energysource.forEach(source => {
                Memory.rooms[room].energy.have[source.id] = source
                Memory.rooms[room].energy.have[source.id].Art = 'get'
            });
            //Memory.rooms[room].energy.have = energysource

            //Memory von creeps auslesen und bestehende Auftrag aktualisieren bzw. von Liste löschen
            if (energysource.length > 0 || energyneed.length > 0) {
                for (var name in Game.creeps) {
                    var creep = Game.creeps[name];
                    if (creep.memory.role == 'carry2' && creep.memory.home == room) {
                        if (creep.memory.Aufträge == undefined) { creep.memory.Aufträge = [] }
                        var Aufträge = creep.memory.Aufträge
                        if (Aufträge.length > 0) {
                            if (Aufträge[0].Art != 'wait') {
                                Aufträge.forEach(Auftrag => {
                                    if (Auftrag.Art == 'get') {
                                        if (Memory.rooms[room].energy.have[Auftrag.id] != undefined) {
                                            if (Memory.rooms[room].energy.have[Auftrag.id].amount - (creep.carryCapacity - _.sum(creep.carry)) <= 0) {
                                                delete Memory.rooms[room].energy.have[Auftrag.id]
                                            } else {
                                                Memory.rooms[room].energy.have[Auftrag.id].amount -= (creep.carryCapacity - _.sum(creep.carry))
                                            }
                                        }
                                    } else if (Auftrag.Art == 'push') {
                                        if (Memory.rooms[room].energy.need[Auftrag.id] != undefined) {
                                            if (Memory.rooms[room].energy.need[Auftrag.id].amount - _.sum(creep.carry) <= 0) {
                                                delete Memory.rooms[room].energy.need[Auftrag.id]
                                            } else {
                                                Memory.rooms[room].energy.need[Auftrag.id].amount -= _.sum(creep.carry)
                                            }
                                        }
                                    } else {
                                        creep.memory.Aufträge = []
                                    }
                                })
                            }
                        }
                    }
                }
            }
        }

        //raumvariablen
        var maxenergy = Game.rooms[room].energyCapacityAvailable
        var haveenergy = Game.rooms[room].energyAvailable
        if (Game.rooms[room].storage == undefined) {
            var havestore = false
            var reserve = 0
        } else {
            var havestore = true
            var reserve = Game.rooms[room].storage.store[RESOURCE_ENERGY]
        }
        var subharv = 0
        var subclaim = 0
        var subattack = 0
        for (var i in subrooms) {
            if (subrooms[i].todo == 'harvest') { subharv = subharv + 1 }
            if (subrooms[i].todo == 'claim') { subclaim = subclaim + 1 }
            if (subrooms[i].todo == 'attack') { subattack = subattack + 1 }
        }
        var HomeRCL = Game.rooms[room].controller.level


        //notfallplan  -->  wenn keine creeps vorhanden. 
        //                  Es wird die Größe von Miner und Carry beschränkt auf das was da ist

        var allcreeps = Game.rooms[room].find(FIND_MY_CREEPS, { filter: (cr) => cr.memory.targetroom == room })
        var carrycreeps = 0; var carrycreepsBP = 0
        var minercreeps = 0; var minercreepsBP = 0
        var bmstrcreeps = 0; var bmstrcreepsBP = 0
        var upgraderstoragecreeps = 0; var upgraderstoragecreepsBP = 0
        var upgradercreeps = 0; var upgradercreepsBP = 0
        var defendcreeps = 0;
        allcreeps.forEach(creep => {
            if (creep.memory.role == 'carry' || creep.memory.role == 'carry2') {
                carrycreeps += 1
                carrycreepsBP += creep.getActiveBodyparts(CARRY)
            } else if (creep.memory.role == 'bmstr') {
                bmstrcreeps += 1
                bmstrcreepsBP += creep.getActiveBodyparts(WORK)
            } else if (creep.memory.role == 'miner') {
                minercreeps += 1
                minercreepsBP += creep.getActiveBodyparts(WORK)
            } else if (creep.memory.role == 'upgraderstorage') {
                upgraderstoragecreeps += 1
                upgraderstoragecreepsBP += creep.getActiveBodyparts(WORK)
            } else if (creep.memory.role == 'upgrader') {
                upgradercreeps += 1
                upgraderBP += creep.getActiveBodyparts(WORK)
            } else if (creep.memory.role == 'defend') {
                defendcreeps += 1
            }
        });
        if (Memory.rooms[room].creeps == undefined) { Memory.rooms[room].creeps = {} }
        Memory.rooms[room].creeps.carry = { creeps: carrycreeps, BP: carrycreepsBP }
        Memory.rooms[room].creeps.bmstr = { creeps: bmstrcreeps, BP: bmstrcreepsBP }
        Memory.rooms[room].creeps.miner = { creeps: minercreeps, BP: minercreepsBP }
        Memory.rooms[room].creeps.upgraderstorage = { creeps: upgraderstoragecreeps, BP: upgraderstoragecreepsBP }
        Memory.rooms[room].creeps.upgrader = { creeps: upgradercreeps, BP: upgradercreepsBP }
        Memory.rooms[room].creeps.defend = { creeps: defendcreeps }



        if (!Game.rooms[room].memory.notfall && HomeRCL > 1 && (carrycreeps < 1 || minercreeps < 1)) {
            console.log(room + ': Notfall')
            Game.rooms[room].memory.notfall = true
            var notfall = true
        }
        if (havestore) {
            if (Game.rooms[room].memory.notfall && carrycreeps > 1 && minercreeps > 0) {
                Game.rooms[room].memory.notfall = false
                var notfall = false
            }
        } else {
            if (Game.rooms[room].memory.notfall && carrycreepsh > 1 && minercreeps > 0) {
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
        if (maxcreepsize < (maxenergy / 2)) {
            maxcreepsize = maxenergy / 2
        }
        var creepsize
        var needminer = false
        var needcarry = false
        var needbmstr = false
        var needdef = false


        //---------- Scout -----------------
        if (Game.rooms[room].controller.sign.text != Memory.signtext) {
            var cmem = { role: 'scout', home: room, targetroom: room }
            var cbody = [MOVE]
            if (maxcreepsize > 50) { creepsize = 50 } else { creepsize = maxcreepsize }    // Beschränkt maxcreepsize
            var ccreep = _.filter(Game.creeps, (creep) =>
                creep.memory.role == cmem.role
                && creep.memory.home == cmem.home
                && creep.memory.targetroom == cmem.targetroom);
            if (ccreep.length < 1) {
                creepcost = creepspawn.newcreep(room, 'scout_' + room, creepsize, cbody, cmem)
            }
        }
        //----------  Miner + Carry  ----------
        //Wenn Storage gebaut dann zwei Miner (einer pro Spot) sonst nur einer am zum Spawn nächstgelegenen
        //Je Miner 2 Carrier
        if (havestore) {
            // Wenn resource + centerlink --> Miner mit Carrypart legt in resourcelink ab und keine Carry ab Container --> storage

            //Wenn keine
            var miningspots = Memory.rooms[room].spots.Alle
            for (var spots in miningspots) {
                if (centerli && Memory.rooms[room].links.source[miningspots[spots]].link) {      // Links vorhanden bekommt Miner einen Carrybodypart
                    var linkminer = true
                    var cbody = [WORK, WORK, MOVE, CARRY]
                    var cmem = { role: 'miner', spot: miningspots[spots], resourcelink: Memory.rooms[room].links.source[miningspots[spots]].link, home: room, targetroom: room }
                    if (maxcreepsize > 950) { creepsize = 950 } else { creepsize = maxenergy }
                } else {
                    var linkminer = false
                    var cbody = [WORK, WORK, MOVE]
                    var cmem = { role: 'miner', spot: miningspots[spots], resourcelink: '', home: room, targetroom: room }
                    if (maxcreepsize > 800) { creepsize = 800 } else { creepsize = maxenergy }   // Beschränkt maxcreepsize
                }
                //spawn miner mit spot im memory
                if (Game.rooms[room].memory.notfall && creepsize > haveenergy) { creepsize = haveenergy; console.log('Notfall miner ') }         // Falls Notfall!

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
                    if (linkminer) {            // Wenn Links vorhanden gibt es keine Carry von Spot zu Lager
                        // Sondern ab centerlink zur befüllung/Lager
                        var cmem = { role: 'carry2', spot: centerlinkid, nummer: spots, home: room, targetroom: room, harvesting: true }
                        if (HomeRCL < 7) {
                            var carryneed = Math.ceil(maxenergy / 120)
                        } else {
                            var spawns = Game.rooms[room].find(FIND_MY_STRUCTURES, {
                                filter: struc => struc.structureType == STRUCTURE_SPAWN
                            });
                            var carryneed = 18 + (spawns.length - 1) + 15
                        }
                    } else {
                        var cmem = { role: 'carry2', spot: miningspots[spots], nummer: spots, home: room, targetroom: room, harvesting: true }
                        var carryneed = 2 * 9
                    }
                    if (Game.rooms[room].memory.notfall) { creepsize = haveenergy; console.log('Notfall') }       // Falls Notfall!
                    var ccreep = _.filter(Game.creeps, (creep) =>
                        (creep.memory.role == cmem.role || creep.memory.role == 'carry')
                        //creep.memory.role == cmem.role
                        && creep.memory.spot == cmem.spot
                        && creep.memory.nummer == cmem.nummer
                        && creep.memory.home == cmem.home
                        && creep.memory.targetroom == cmem.targetroom &&
                        (creep.ticksToLive > 50 || creep.ticksToLive == undefined));
                    var bodyparts = 0
                    for (var i in ccreep) {
                        bodyparts = bodyparts + ccreep[i].getActiveBodyparts(CARRY)
                    }
                    //console.log(room + ': ' + bodyparts + '/' + carryneed)
                    if (bodyparts < carryneed) {
                        needcarry = true
                        var cbody = [CARRY, CARRY, MOVE]
                        var cbodycost = 75
                        var bodypartsneed = carryneed - bodyparts
                        bodypartsneed = Math.ceil(bodypartsneed / 2) * 2 + 6
                        var bodypartsneedcost = bodypartsneed * cbodycost
                        if (bodypartsneedcost < maxcreepsize) { maxcreepsize = bodypartsneedcost }
                        if (maxcreepsize > 2250) { creepsize = 2250 } else { creepsize = maxcreepsize }    // Beschränkt maxcreepsize
                        if (Game.rooms[room].memory.notfall) { creepsize = haveenergy; console.log('Notfall') }
                        creepspawn.newcreep(room, 'carry2', creepsize, cbody, cmem)
                    }

                }
            }

        } else {
            var miningspots = Memory.rooms[room].spots.nearspawn
            //spawn miner mit spot im memory
            var cmem = { role: 'miner', spot: miningspots, home: room, targetroom: '' }
            var cbody = [WORK, WORK, MOVE]
            if (maxcreepsize > 800) { creepsize = 800 } else { creepsize = maxenergy }    // Beschränkt maxcreepsize
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
                var cmem = { role: 'carry2', spot: miningspots, home: room, targetroom: room, harvesting: true }
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



                    creepspawn.newcreep(room, 'carry2', creepsize, cbody, cmem)
                }
            }
            if (HomeRCL > 1 && maxenergy >= 500) {
                var miningspots = Memory.rooms[room].spots.other[0]
                //spawn miner mit spot im memory
                var cmem = { role: 'miner', spot: miningspots, home: room, targetroom: '' }
                var cbody = [WORK, WORK, MOVE]
                if (maxcreepsize > 800) { creepsize = 800 } else { creepsize = maxenergy }    // Beschränkt maxcreepsize
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
            }
        }
        //---------- defence  ----------

        var defender = 0
        var hostile = Game.rooms[room].find(FIND_HOSTILE_CREEPS)
        if (hostile.length > 0) {
            var defender = 0
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

        if (!needminer && !needcarry && !needdef) {
            var BPneed = Memory.rooms[room].Bmstr.wallbodyparts + Memory.rooms[room].Bmstr.reppbodyparts + Memory.rooms[room].Bmstr.baubodyparts
            var cmem = { role: 'bmstr', home: room, targetroom: room, working: false, onsite: false }
            var cbody = [MOVE, MOVE, WORK, CARRY, CARRY]
            if (maxcreepsize > 3000) { creepsize = 3000 } else { creepsize = maxcreepsize }    // Beschränkt maxcreepsize
            var ccreep = _.filter(Game.creeps, (creep) =>
                creep.memory.role == cmem.role
                && creep.memory.targetroom == cmem.targetroom);
            var bodyparts = 0
            for (var i in ccreep) {
                bodyparts = bodyparts + ccreep[i].getActiveBodyparts(WORK)
            }
            Memory.rooms[room].Bmstr.bodypartshave = bodyparts
            if (bodyparts < BPneed) {
                needbmstr = true
                var cbody = [MOVE, MOVE, WORK, CARRY, CARRY]
                var cbodycost = 300
                var bodypartsneed = BPneed - bodyparts
                bodypartsneed = Math.ceil(bodypartsneed) + 2
                var bodypartsneedcost = bodypartsneed * cbodycost
                if (bodypartsneedcost < maxcreepsize) { maxcreepsize = bodypartsneedcost }
                if (maxcreepsize > 3000) { creepsize = 3000 } else { creepsize = maxcreepsize }    // Beschränkt maxcreepsize
                creepcost = creepspawn.newcreep(room, 'bmstr', creepsize, cbody, cmem)
            }
        }
        //----------   upgrader    ----------
        if (Memory.rooms[room].upgrader == undefined) { Memory.rooms[room].upgrader = {} }
        if (!needminer && !needcarry && !needbmstr && !needdef) {
            if (havestore) {
                var upgraderstore = 0
                if (reserve >= 50000) {
                    upgraderstore = Math.ceil((reserve - 50000) / 100000)
                    var minimal = false
                } else {
                    var minimal = true
                }
                if (Game.rooms[room].controller.level < 8) {
                    bpn = upgraderstore * 6
                } else {
                    bpn = 15
                }

                if (subattack || minimal) {
                    bpn = 2
                    if (maxcreepsize > 600) { creepsize = 600 } else { creepsize = maxcreepsize }    // Beschränkt maxcreepsize
                } else {
                    if (maxcreepsize > 3000) { creepsize = 3000 } else { creepsize = maxcreepsize }    // Beschränkt maxcreepsize
                }
                Memory.rooms[room].upgrader.BPneed = bpn
                var cmem = { role: 'upgraderstorage', home: room, targetroom: room, upgrading: false }
                if (centerli && upgradeli) {
                    var cbody = [MOVE, WORK, WORK, CARRY]
                } else {
                    var cbody = [MOVE, MOVE, WORK, CARRY, CARRY]
                }
                var ccreep = _.filter(Game.creeps, (creep) =>
                    creep.memory.role == cmem.role
                    && creep.memory.home == cmem.home
                    && creep.memory.targetroom == cmem.targetroom);
                var bodyparts = 0
                for (var i in ccreep) {
                    bodyparts = bodyparts + ccreep[i].getActiveBodyparts(WORK)
                }
                Memory.rooms[room].upgrader.BPhave = bodyparts
                //console.log(room + " " + bpn + " / " + bodyparts)
                if (bodyparts < bpn) {
                    creepspawn.newcreep(room, 'upgraderstorage', creepsize, cbody, cmem)
                }
            } else {
                if (Game.rooms[room].controller.level < 4) {
                    upgrader = 3 * Game.rooms[room].controller.level
                } else {
                    upgrader = 10
                }
                otherspots = Memory.rooms[room].spots.other
                if (otherspots.length > 0) {
                    for (var i in otherspots) {
                        var miningspots = Game.getObjectById(otherspots[i])
                        var pathlength = Memory.rooms[room].Wege[miningspots].Controller.cost

                        var ept = 50 / (50 + (pathlength * 2) + 2) * 300  //energy pro bodypart pro 300ticks
                        var bpn = 3000 / ept //benötigte bodyparts um 3000 energy in 300 ticks zuverwerken
                        //console.log(bpn)
                        Memory.rooms[room].upgrader.BPneed = bpn
                        var cmem = { role: 'upgrader', spot: miningspots.id, home: room, targetroom: '', upgrading: false }
                        var cbody = [MOVE, WORK, CARRY]
                        if (maxcreepsize > 3300) { creepsize = 3300 } else { creepsize = maxcreepsize }    // Beschränkt maxcreepsize
                        var ccreep = _.filter(Game.creeps, (creep) =>
                            creep.memory.role == cmem.role
                            && creep.memory.home == cmem.home
                            //&& creep.memory.spot == cmem.spot
                            && creep.memory.targetroom == cmem.targetroom);
                        var bodyparts = 0
                        for (var i in ccreep) {
                            bodyparts = bodyparts + ccreep[i].getActiveBodyparts(CARRY)
                        }
                        Memory.rooms[room].upgrader.BPhave = bodyparts
                        //console.log(room + '  ' + ccreep.length + '   ' + upgrader)
                        if (ccreep.length < upgrader && bodyparts < bpn) {
                            creepspawn.newcreep(room, 'upgrader', creepsize, cbody, cmem)
                        }
                    }
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





        if (HomeRCL >= 6) {
            mineral.run(room, room, wait)
        }

        var xspawnr = Game.rooms[room].find(FIND_MY_STRUCTURES, {
            filter: struc => struc.structureType == STRUCTURE_SPAWN && struc.spawning != null
        })
        for (var s in xspawnr) {
            console.log(room + ' ' + xspawnr[s].name + ' spawnt:  ' + xspawnr[s].spawning.name + '  in ' + xspawnr[s].spawning.remainingTime + '/' + xspawnr[s].spawning.needTime)
        }

        //energytransfer links
        if (centerli) {
            var translinks = Memory.rooms[room].links.transfer
            var cll = Game.getObjectById(centerlinkid)
            var ull = Game.getObjectById(upgradelinkid)
            var rll
            if (upgradeli) {
                for (var i in translinks) {
                    rll = Game.getObjectById(translinks[i])
                    if (ull.energy > cll.energy) {
                        rll.transferEnergy(cll)
                    } else {
                        rll.transferEnergy(ull)
                    }
                }
                cll.transferEnergy(ull)
            } else {
                for (var i in translinks) {
                    rll = Game.getObjectById(translinks[i])
                    rll.transferEnergy(cll)
                }
            }
        }



        //build lager

        //build extensions

        //build wall

        //build road

        //build buildings
        Memory.stats['rooms.' + room + '.RCL.level'] = HomeRCL
        Memory.stats['rooms.' + room + '.RCL.progress'] = Game.rooms[room].controller.progress
        Memory.stats['rooms.' + room + '.RCL.total'] = Game.rooms[room].controller.progressTotal
        Memory.stats['rooms.' + room + '.energy.store'] = reserve
        Memory.stats['rooms.' + room + '.energy.spawnhave'] = haveenergy
        Memory.stats['rooms.' + room + '.energy.spawnmax'] = maxenergy

        var stored = 0
        var storedTotal = 0
        var storedterminal = 0
        var storedterminalCap = 0

        if (Game.rooms[room].storage) {
            stored = Game.rooms[room].storage.store[RESOURCE_ENERGY]
            storedTotal = Game.rooms[room].storage.storeCapacity[RESOURCE_ENERGY]
            if (Game.rooms[room].terminal) {
                storedterminal = Game.rooms[room].terminal.store[RESOURCE_ENERGY]
                storedterminalCap = Game.rooms[room].terminal.storeCapacity[RESOURCE_ENERGY]
            }
            else {
                storedterminal = 0
                storedterminalCap = 0
            }
        } else {
            stored = 0
            storedTotal = 0
        }

        Memory.stats['rooms.' + room + '.storedEnergy'] = stored
        Memory.stats['rooms.' + room + '.energy.terminal'] = storedterminal

        var CPUnach = Game.cpu.getUsed()
        Memory.stats['CPU.rooms.' + room] = CPUnach - CPUvor



        //subräume harvest claim attack
        Memory.Empire.rooms[room] = {}
        var subbmstr = []
        var subclaim = []
        var subboost = []
        var subharv = []
        var subkeeper = []
        var subattack = []
        var attack = []

        for (var i in subrooms) {
            if (subrooms[i].todo == 'bmstr') {
                subroombmstr.run(room, subrooms[i].targetroom, wait)
                subbmstr.push(subrooms[i].targetroom)
            }
            if (subrooms[i].todo == 'claim') {
                subroomclaim.run(room, subrooms[i].targetroom, wait)
                subclaim.push(subrooms[i].targetroom)
            }
            if (subrooms[i].todo == 'boost') {
                energyboost.run(room, subrooms[i].targetroom, wait)
                subboost.push(subrooms[i].targetroom)
            }
            if (subrooms[i].todo == 'harvest') {
                subroom.run(room, subrooms[i].targetroom, wait)
                subharv.push(subrooms[i].targetroom)
            }
            if (subrooms[i].todo == 'keeper') {
                subroomkeeper.run(room, subrooms[i].targetroom, wait)
                subkeeper.push(subrooms[i].targetroom)
            }
            if (subrooms[i].todo == 'attack') {
                subroomattack.run(room, subrooms[i].targetroom, wait, subrooms[i].type, subrooms[i].NahDD, subrooms[i].FernDD, subrooms[i].Heiler, subrooms[i].attackcontroller)
                subattack.push(subrooms[i].targetroom)
                if (Memory.Empire.Attack[subrooms[i].targetroom] == undefined) {
                    Memory.Empire.Attack[subrooms[i].targetroom] = {}
                    Memory.Empire.Attack[subrooms[i].targetroom].type = 0
                    Memory.Empire.Attack[subrooms[i].targetroom].NahDD = 0
                    Memory.Empire.Attack[subrooms[i].targetroom].FernDD = 0
                    Memory.Empire.Attack[subrooms[i].targetroom].Heiler = 0
                    Memory.Empire.Attack[subrooms[i].targetroom].from = []
                }
                Memory.Empire.Attack[subrooms[i].targetroom].type = subrooms[i].type
                Memory.Empire.Attack[subrooms[i].targetroom].NahDD += subrooms[i].NahDD
                Memory.Empire.Attack[subrooms[i].targetroom].FernDD += subrooms[i].FernDD
                Memory.Empire.Attack[subrooms[i].targetroom].Heiler += subrooms[i].Heiler
                Memory.Empire.Attack[subrooms[i].targetroom].from.push(room)
            }

        }
        Memory.Empire.rooms[room].bmstr = subbmstr
        Memory.Empire.rooms[room].claim = subclaim
        Memory.Empire.rooms[room].boost = subboost
        Memory.Empire.rooms[room].harvest = subharv
        Memory.Empire.rooms[room].keeper = subkeeper
        Memory.Empire.rooms[room].attack = subattack

    }

}





module.exports = empireroom