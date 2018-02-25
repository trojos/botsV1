var creepspawn = require('creepspawn')
//var squadattack = require('squadattack')

var subroomattack = {
    run: function (room, subroom, wait, type, NDD, FDD, HEI, DIS, attackcontroller, boost) {
        // Wenn keine Werte übergeben:
        if (type == undefined) { type = 1 }
        if (NDD == undefined) { NDD = 2 }
        if (FDD == undefined) { FDD = 2 }
        if (HEI == undefined) { HEI = 2 }
        if (attackcontroller == undefined) { attackcontroller = false }

        if (Memory.Attack == undefined) {
            Memory.Attack = {}
        }
        if (Memory.Attack[subroom] == undefined) {
            Memory.Attack[subroom] = {}
        }
        if (Memory.Attack[subroom][room] == undefined) {
            Memory.Attack[subroom][room] = {}
        }
        Memory.Attack[subroom][room].type = type
        Memory.Attack[subroom][room].attackcontroller = attackcontroller
        Memory.Attack[subroom][room].boost = boost
        var HomeRCL = Game.rooms[room].controller.level
        if (HomeRCL < 6) {
            console.log(subroom + ": Kein Angriff ausgehend von Räumen unter lvl 6")
            return
        }

        //raumvariablen
        // const xspawns = Game.rooms[room].find(FIND_MY_STRUCTURES, {
        //     filter: struc => struc.structureType == STRUCTURE_SPAWN
        // });
        // const xspawn = xspawns[0]
        const maxenergy = Game.rooms[room].energyCapacityAvailable
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
            var hostile = Game.rooms[subroom].find(FIND_HOSTILE_CREEPS)
            var hostilestr = Game.rooms[subroom].find(FIND_HOSTILE_STRUCTURES, {
                filter: struc => struc.structureType !== STRUCTURE_RAMPART &&
                    struc.structureType !== STRUCTURE_WALL &&
                    struc.structureType !== STRUCTURE_ROAD
            });
            var hcl = Game.rooms[subroom].controller.level
        }

        //----------creeps------------------
        //size
        if (haveenergy + reserve < maxenergy) {
            var maxcreepsize = haveenergy + reserve
        } else {
            var maxcreepsize = maxenergy
        }
        var creepsize
        //Game.creeps[]

        //----------Scout-----------
        if (!insight) {
            var cmem = { role: 'scout', home: room, targetroom: subroom }
            var cbody = [MOVE]
            if (maxcreepsize > 50) { creepsize = 50 } else { creepsize = maxcreepsize }    // Beschränkt maxcreepsize
            var ccreep = _.filter(Game.creeps, (creep) =>
                creep.memory.role == cmem.role
                && creep.memory.home == cmem.home
                && creep.memory.targetroom == cmem.targetroom);
            if (ccreep.length < 1) {
                creepspawn.newcreep(room, 'scout_' + subroom, creepsize, cbody, cmem)
            }
        }
        //----------   claim    ----------
        if (insight && !wait && attackcontroller) {
            if (hostile.length < 1 && hostilestr.length < 2 && hcl > 0 && Game.rooms[subroom].controller.owner.username != 'zapziodon') {
                var cmem = { role: 'claim', home: room, targetroom: subroom, controll: 'attack' }
                var cbody = [CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, MOVE, MOVE, MOVE, MOVE, MOVE]
                if (maxcreepsize > 3500) { creepsize = 3500 } else { creepsize = maxcreepsize }    // Beschränkt maxcreepsize
                var ccreep = _.filter(Game.creeps, (creep) =>
                    creep.memory.role == cmem.role
                    && creep.memory.controll == cmem.controll
                    && creep.memory.targetroom == cmem.targetroom
                    && (creep.ticksToLive > 25 || creep.ticksToLive == undefined));
                if (ccreep.length < 1) {
                    creepspawn.newcreep(room, 'ca_' + subroom, creepsize, cbody, cmem)
                }
            }
        }

        //----------   Looter    ----------
        if (insight && !wait) {
            if ((hostile.length < 1 && hostilestr.length < 15) || subroom == 'W6S13') {
                var hostiletower
                var looter = 1
                dropped = Game.rooms[subroom].find(FIND_DROPPED_RESOURCES)
                if (_.sum(dropped, 'amount') > 20000) {
                    looter = Math.floor(_.sum(dropped, 'amount') / 10000)
                }
                if (looter > 5) { looter = 5 }
                if (_.sum(dropped, 'amount') > 2000) {
                    console.log('LOOTER:', subroom, _.sum(dropped, 'amount'), looter)
                    var cmem = { role: 'looter', spot: 'loot', home: room, targetroom: subroom, harvesting: true }
                    var ccreep = _.filter(Game.creeps, (creep) =>
                        creep.memory.role == cmem.role
                        && creep.memory.spot == cmem.spot
                        && creep.memory.targetroom == cmem.targetroom);
                    if (ccreep.length < looter) {
                        var cbody = [CARRY, CARRY, MOVE, MOVE]
                        if (maxcreepsize > 2500) { creepsize = 2500 } else { creepsize = maxcreepsize }    // Beschränkt maxcreepsize
                        creepspawn.newcreep(room, 'looter_' + subroom, creepsize, cbody, cmem)
                    }
                }
            }
        }

        //----------Nahkampf-----------
        if (!wait) {
            var nahdd = NDD           //Regelanzahl  (teils angriff, teils warten, daher ca. das doppelte das gleichzeitig angreifen soll)
            if (insight) {          //Wenn Raumsicht und keine feindlichen Creeps oder Strukturen dann andere Anzahl
                if (hostile.length < 1 && hostilestr.length < 4) {
                    var nahdd = NDD
                }
            }
            if (nahdd > 0) {
                var cmem = { role: 'NahDD', home: room, targetroom: subroom, status: 'wait' }
                if (boost == 'full') {
                    var cbody = [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE]
                } else {
                    if (HomeRCL < 7) {
                        var cbody = [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE]
                    } else {
                        var cbody = [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE]
                    }
                }
                var ccreep = _.filter(Game.creeps, (creep) =>
                    creep.memory.role == cmem.role
                    && creep.memory.targetroom == cmem.targetroom
                    && (creep.ticksToLive > 200 || creep.ticksToLive == undefined));
                //&& creep.memory.status == cmem.status);
                if (ccreep.length < nahdd) {
                    creepspawn.newcreep(room, 'NahDD_' + subroom, creepsize, cbody, cmem)
                    needdef = true
                }
            }
        }
        //----------Fernkampf-----------
        if (!wait) {
            var ferndd = FDD       //Regelanzahl
            if (insight) {          //Wenn Raumsicht und keine feindlichen Creeps dann andere Anzahl
                var hostile = Game.rooms[subroom].find(FIND_HOSTILE_CREEPS)
                if (hostile.length < 1) {
                    var ferndd = FDD
                }
            }
            if (ferndd > 0) {
                var cmem = { role: 'FernDD', home: room, targetroom: subroom, status: 'wait' }
                if (boost == 'full') {
                    var cbody = [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE, MOVE]
                } else {
                    if (HomeRCL < 7) {
                        var cbody = [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE, MOVE]
                    } else {
                        var cbody = [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE, MOVE]
                    }
                }
                var ccreep = _.filter(Game.creeps, (creep) =>
                    creep.memory.role == cmem.role
                    && creep.memory.targetroom == cmem.targetroom
                    && (creep.ticksToLive > 200 || creep.ticksToLive == undefined));
                //&& creep.memory.status == cmem.status);
                if (ccreep.length < ferndd) {
                    creepspawn.newcreep(room, 'FernDD_' + subroom, creepsize, cbody, cmem)
                    needdef = true
                }
            }
        }
        //---------Heiler-------------
        if (!wait) {
            var heiler = HEI        //Regelanzahl
            if (insight) {          //Wenn Raumsicht und keine feindlichen Creeps dann andere Anzahl
                var hostile = Game.rooms[subroom].find(FIND_HOSTILE_CREEPS)
                if (hostile.length < 1) {
                    var heiler = HEI
                }
            }
            if (heiler > 0) {
                var cmem = { role: 'Heiler', home: room, targetroom: subroom, status: 'wait' }
                if (boost == 'full') {
                    var cbody = [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, MOVE, MOVE, MOVE]
                } else {
                    if (HomeRCL < 7) {
                        var cbody = [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, MOVE, MOVE]
                    } else {
                        var cbody = [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, MOVE, MOVE, MOVE]
                    }
                }
                var ccreep = _.filter(Game.creeps, (creep) =>
                    creep.memory.role == cmem.role
                    && creep.memory.targetroom == cmem.targetroom
                    && (creep.ticksToLive > 300 || creep.ticksToLive == undefined));
                //&& creep.memory.status == cmem.status);
                if (ccreep.length < heiler) {
                    creepspawn.newcreep(room, 'Heiler_' + subroom, creepsize, cbody, cmem)
                    needdef = true
                }
            }
        }
        //---------Dismantler-------------
        if (!wait) {
            var Dismantler = DIS        //Regelanzahl
            if (insight) {          //Wenn Raumsicht und keine feindlichen Creeps dann andere Anzahl
                var hostile = Game.rooms[subroom].find(FIND_HOSTILE_STRUCTURES)
                if (hostile.length < 1) {
                    var Dismantler = 0
                }
            }
            if (Dismantler > 0) {
                var cmem = { role: 'Dismantler', home: room, targetroom: subroom, status: 'wait' }
                if (boost == 'full') {
                    var cbody = [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE]
                } else {
                    if (HomeRCL < 7) {
                        var cbody = [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE]
                    } else {
                        var cbody = [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE]
                    }
                }
                var ccreep = _.filter(Game.creeps, (creep) =>
                    creep.memory.role == cmem.role
                    && creep.memory.targetroom == cmem.targetroom
                    && (creep.ticksToLive > 200 || creep.ticksToLive == undefined));
                //&& creep.memory.status == cmem.status);
                if (ccreep.length < Dismantler) {
                    creepspawn.newcreep(room, 'Dis_' + subroom, creepsize, cbody, cmem)
                    needdef = true
                }
            }
        }

        //squadattack.run(room, subroom)
    }
}

module.exports = subroomattack