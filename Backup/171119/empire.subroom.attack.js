var creepspawn = require('creepspawn')
var squadattack = require('squadattack')

var subroomattack = {
    run: function (room, subroom, wait) {
       
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
        if (insight && !wait) {
            if (hostile.length < 1 && hostilestr.length < 2 && hcl > 0) {
                var cmem = { role: 'claim', home: room, targetroom: subroom, controll: 'attack' }
                var cbody = [CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, MOVE, MOVE, MOVE, MOVE, MOVE]
                if (maxcreepsize > 3500) { creepsize = 3500 } else { creepsize = maxcreepsize }    // Beschränkt maxcreepsize
                var ccreep = _.filter(Game.creeps, (creep) =>
                    creep.memory.role == cmem.role
                    && creep.memory.home == cmem.home
                    && creep.memory.controll == cmem.controll
                    && creep.memory.targetroom == cmem.targetroom
                    && (creep.ticksToLive > 25 || creep.ticksToLive == undefined));
                    //
                if (ccreep.length < 1) {
                    creepspawn.newcreep(room, 'ca_' + subroom, creepsize, cbody, cmem)
                }
            }
        }

        //----------Nahkampf-----------
        if (!wait) {
            var nahdd = 3           //Regelanzahl  (teils angriff, teils warten, daher ca. das doppelte das gleichzeitig angreifen soll)
            if (insight) {          //Wenn Raumsicht und keine feindlichen Creeps oder Strukturen dann andere Anzahl
                if (hostile.length < 1 && hostilestr.length < 4) {
                    var nahdd = 1
                }
            }
            if (nahdd > 0) {
                var cmem = { role: 'NahDD', home: room, targetroom: subroom, status: 'wait' }
                var cbody = [TOUGH, MOVE, MOVE, ATTACK]
                if (maxcreepsize > 2300) { creepsize = 2300 } else { creepsize = maxcreepsize }    // Beschränkt maxcreepsize
                var ccreep = _.filter(Game.creeps, (creep) =>
                    creep.memory.role == cmem.role
                   // && creep.memory.home == cmem.home
                    && creep.memory.targetroom == cmem.targetroom
                    && (creep.ticksToLive > 100 || creep.ticksToLive == undefined));
                //&& creep.memory.status == cmem.status);
                if (ccreep.length < nahdd) {
                    creepspawn.newcreep(room, 'NahDD_' + subroom, creepsize, cbody, cmem)
                    needdef = true
                }
            }
        }
        //----------Fernkampf-----------
        if (!wait) {
            var ferndd = 0          //Regelanzahl
            if (insight) {          //Wenn Raumsicht und keine feindlichen Creeps dann andere Anzahl
                var hostile = Game.rooms[subroom].find(FIND_HOSTILE_CREEPS)
                if (hostile.length < 1) {
                    var ferndd = 0
                }
            }
            if (ferndd > 0) {
                var cmem = { role: 'FernDD', home: room, targetroom: subroom, status: 'wait' }
                var cbody = [TOUGH, MOVE, MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK]
                if (maxcreepsize > 1530) { creepsize = 1530 } else { creepsize = maxcreepsize }    // Beschränkt maxcreepsize
                var ccreep = _.filter(Game.creeps, (creep) =>
                    creep.memory.role == cmem.role
                    //&& creep.memory.home == cmem.home
                    && creep.memory.targetroom == cmem.targetroom);
                //&& creep.memory.status == cmem.status);
                if (ccreep.length < ferndd) {
                    creepspawn.newcreep(room, 'FernDD_' + subroom, creepsize, cbody, cmem)
                    needdef = true
                }
            }
        }
        //---------Heiler-------------
        if (!wait) {
            var heiler = 12          //Regelanzahl
            if (insight) {          //Wenn Raumsicht und keine feindlichen Creeps dann andere Anzahl
                var hostile = Game.rooms[subroom].find(FIND_HOSTILE_CREEPS)
                if (hostile.length < 1) {
                    var heiler = 0
                }
            }
            if (heiler > 0) {
                var cmem = { role: 'Heiler', home: room, targetroom: subroom, status: 'wait' }
                var cbody = [TOUGH, MOVE, MOVE, MOVE, HEAL, HEAL]
                if (maxcreepsize > 5000) { creepsize = 5000 } else { creepsize = maxcreepsize }    // Beschränkt maxcreepsize
                var ccreep = _.filter(Game.creeps, (creep) =>
                    creep.memory.role == cmem.role
                    //&& creep.memory.home == cmem.home
                    && creep.memory.targetroom == cmem.targetroom);
                //&& creep.memory.status == cmem.status);
                if (ccreep.length < heiler) {
                    creepspawn.newcreep(room, 'Heiler_' + subroom, creepsize, cbody, cmem)
                    needdef = true
                }
            }
        }
        squadattack.run(subroom)

    }



}

module.exports = subroomattack