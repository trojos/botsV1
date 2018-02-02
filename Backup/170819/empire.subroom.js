var creepspawn = require('creepspawn')

var subroom = {
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
        //---------- Scout -----------------
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
        //----------  Miner + Carry  ----------
        //Je Miner 2 Carrier
        if (insight && !wait) {
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
                    creepspawn.newcreep(room, 'miner_' + subroom, creepsize, cbody, cmem)
                }
                //spawn carrier mit spot im Memory
                if (!needminer) {
                    var cmem = { role: 'carry', spot: miningspots[spots].id, home: room, targetroom: subroom, harvesting: true }
                    var cbody = [CARRY, CARRY, MOVE]
                    if (maxcreepsize > 800) { creepsize = 800 } else { creepsize = maxcreepsize }    // Beschränkt maxcreepsize
                    var ccreep = _.filter(Game.creeps, (creep) =>
                        creep.memory.role == cmem.role
                        && creep.memory.spot == cmem.spot
                        && creep.memory.home == cmem.home
                        && creep.memory.targetroom == cmem.targetroom);
                    if (ccreep.length < 3) {
                        needcarry = true
                        creepspawn.newcreep(room, 'carry_' + subroom, creepsize, cbody, cmem)
                    }
                }
            }
        }

        //---------- bmstr Baumeister  ----------
        if (insight && !wait) {
            var bmstrsites = Game.rooms[subroom].find(FIND_MY_CONSTRUCTION_SITES)
            var bmst = 0
            switch (true) {
                case (bmstrsites.length > 15):
                    bmst = 3
                    break;
                case (bmstrsites.length > 1):
                    bmst = 2
                    break;
                default:
                    bmst = 1
                    break;
            }
            var cmem = { role: 'bmstr', home: room, targetroom: subroom, working: false, onsite: false }
            var cbody = [MOVE, MOVE, WORK, CARRY, CARRY]
            if (maxcreepsize > 600) { creepsize = 600 } else { creepsize = maxcreepsize }    // Beschränkt maxcreepsize
            var ccreep = _.filter(Game.creeps, (creep) =>
                creep.memory.role == cmem.role
                && creep.memory.home == cmem.home
                && creep.memory.targetroom == cmem.targetroom);
            if (ccreep.length < bmst) {
                needbmstr = true
                creepspawn.newcreep(room, 'bmstr_' + subroom, creepsize, cbody, cmem)
            }
        }
        //----------   claim    ----------
        if (insight && !wait) {
            var cmem = { role: 'claim', home: room, targetroom: subroom, controll: 'reserve' }
            var cbody = [CLAIM, MOVE, MOVE]
            if (maxcreepsize > 1450) { creepsize = 1450 } else { creepsize = maxcreepsize }    // Beschränkt maxcreepsize
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
                    creepspawn.newcreep(room, 'reserv_' + subroom, creepsize, cbody, cmem)
                    break;
                case 1:
                    creepspawn.newcreep(room, 'reserv_' + subroom, 700, cbody, cmem)
                    break;
            }
        }

        //defence
        if (insight) {
            var defender = 0
            var hostile = Game.rooms[subroom].find(FIND_HOSTILE_CREEPS)
            if (hostile.length > 0) {
                var defender = 3
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
                    creepspawn.newcreep(room, 'def_' + subroom, creepsize, cbody, cmem)
                    needdef = true
                }
            }
            if (hostile.length < 1) {                //Wenn Bedrohung vorbei wird die Rolle der Defender auf destruct gesetzt
                var cmem = { role: 'defend', home: room, targetroom: subroom }
                var ccreep = _.filter(Game.creeps, (creep) =>
                    creep.memory.role == cmem.role
                    && creep.memory.home == cmem.home
                    && creep.memory.targetroom == cmem.targetroom);
                if (ccreep.length > 0) {
                    for (var i in ccreep) {
                        var creepi = ccreep[i]
                        //Game.creeps[creepi].memory.role = 'destruct'
                    }
                }
            }
        }

        //subräume



        //build lager

        //build extensions

        //build wall

        //build road

        //build buildings



    }



}

module.exports = subroom