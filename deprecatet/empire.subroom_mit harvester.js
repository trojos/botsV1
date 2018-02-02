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

        //----------  Harvester  ----------
        //Wenn Stroge gebaut dann zwei Miner sonst nur einer (einer pro Spot)
        if (insight && !wait) {
            var miningspots = Game.rooms[subroom].find(FIND_SOURCES)
            for (var spots in miningspots) {
                //spawn miner mit spot im memory
                var cmem = { role: 'harvesterR', spot: miningspots[spots].id, home: room, targetroom: subroom }
                var cbody = [MOVE, MOVE, WORK, CARRY, CARRY, CARRY]
                if (miningspots[spots].energyCapacity > 1500) {
                    if (maxcreepsize > 1600) { creepsize = 1600 } else { creepsize = maxcreepsize }    // Beschränkt maxcreepsize
                } else {
                    if (maxcreepsize > 800) { creepsize = 800 } else { creepsize = maxcreepsize }    // Beschränkt maxcreepsize    
                }
                var ccreep = _.filter(Game.creeps, (creep) =>
                    creep.memory.role == cmem.role
                    && creep.memory.spot == cmem.spot
                    && creep.memory.home == cmem.home
                    && creep.memory.targetroom == cmem.targetroom
                    && creep.ticksToLive > 50);
                if (ccreep.length < 3) {
                    needminer = true
                    creepspawn.newcreep(room, 'harv_' + subroom, creepsize, cbody, cmem)
                }
            }
        }

        //---------- bmstr Baumeister  ----------
        if (insight && !wait) {
            var bmstrsites = Game.rooms[subroom].find(FIND_MY_CONSTRUCTION_SITES)
            var bmst = 0
            switch (true) {
                case (bmstrsites > 10):
                    bmst = 2
                    break;
                case (bmstrsites > 15):
                    bmst = 2
                    break;
                default:
                    bmst = 1
                    break;
            }
            var cmem = { role: 'bmstr', home: room, targetroom: subroom, working: false, onsite: false }
            var cbody = [MOVE, MOVE, WORK, CARRY, CARRY]
            if (maxcreepsize > 300) { creepsize = 300 } else { creepsize = maxcreepsize }    // Beschränkt maxcreepsize
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
            if (ccreep.length < 1) {
                creepspawn.newcreep(room, 'reserv_' + subroom, creepsize, cbody, cmem)
            }
        }

        //defence

        //subräume



        //build lager

        //build extensions

        //build wall

        //build road

        //build buildings



    }



}

module.exports = subroom