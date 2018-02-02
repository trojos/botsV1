var creepspawn = require('creepspawn')

var subroomclaim = {
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
            var claimsuccess = Game.rooms[subroom].controller.my
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
        if (!insight && !claimsuccess) {
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
        if (insight && !wait && !claimsuccess) {
            var cmem = { role: 'claim', home: room, targetroom: subroom, controll: 'claim' }
            var cbody = [CLAIM, MOVE, MOVE, MOVE]
            if (maxcreepsize > 800) { creepsize = 800 } else { creepsize = maxcreepsize }    // Beschränkt maxcreepsize
            var ccreep = _.filter(Game.creeps, (creep) =>
                creep.memory.role == cmem.role
                && creep.memory.home == cmem.home
                && creep.memory.controll == cmem.controll
                && creep.memory.targetroom == cmem.targetroom);
            if (ccreep.length < 1) {
                creepspawn.newcreep(room, 'claim_' + subroom, creepsize, cbody, cmem)
            }
        }
        //----------   bmstr  ------------
        //---------- bmstr Baumeister  ----------  //zum Bauen des Spawns  + aufbauhilfe
        if (insight && !wait && claimsuccess) {
            var bmstrsites = Game.rooms[subroom].find(FIND_MY_CONSTRUCTION_SITES)
            var bmst = 0
            switch (true) {
                case (bmstrsites.length > 15):
                    bmst = 2
                    break;
                case (bmstrsites.length > 5):
                    bmst = 2
                    break;
                case (bmstrsites.length > 0):
                    bmst = 1
                    break;
                default:
                    bmst = 0
                    break;
            }
            var cmem = { role: 'bmstr', home: room, targetroom: subroom, working: false, onsite: false }
            var cbody = [MOVE, MOVE, WORK, CARRY, CARRY]
            if (maxcreepsize > 3000) { creepsize = 3000 } else { creepsize = maxcreepsize }    // Beschränkt maxcreepsize
            var ccreep = _.filter(Game.creeps, (creep) =>
                creep.memory.role == cmem.role
                && creep.memory.home == cmem.home
                && creep.memory.targetroom == cmem.targetroom);
            if (ccreep.length < bmst) {
                needbmstr = true
                creepspawn.newcreep(room, 'bmstr_' + subroom, creepsize, cbody, cmem)
            }
        }
        //defend
        if (insight) {
            var defender = 1
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
        }

        //subräume



        //build lager

        //build extensions

        //build wall

        //build road

        //build buildings



    }



}

module.exports = subroomclaim