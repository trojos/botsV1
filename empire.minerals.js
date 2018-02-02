var creepspawn = require('creepspawn')

var minerals = {
    run: function (room, subroom, wait) {
        //raumvariablen
        if (Game.rooms[room].controller.level < 6) {             //Wenn Kontroller level kleiner als 6 kann kein Terminal sein, daher wird abgebrochen
            return;
        }
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

        if (Game.rooms[room].terminal == undefined) {
            console.log('In Raum ' + room + ' muss ein Terminal gebaut werden!!!')
            var haveterm = false
        } else {
            var haveterm = true
        }

        // //Labs definieren
        // if (Memory.rooms[room].Labs == undefined) {
        //     Memory.rooms[room].Labs = {}
        //     Memory.rooms[room].Labs.prod = 7
        // }
        // var prodlabs = Memory.rooms[room]
        // if (Memory.rooms[room].Labs.tick == undefined || Memory.rooms[room].Labs.tick < Game.time - 0) {
        //     Memory.rooms[room].Labs.tick = Game.time
        //     var Labs = Game.rooms[room].find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_LAB } })
        //     //console.log(room,Labs.length)
        // }


        //extractor bauen
        var mineralspot = Game.rooms[subroom].find(FIND_MINERALS)[0]
        var extractstr = mineralspot.pos.findInRange(FIND_STRUCTURES, 1, {
            filter: ext => ext.structureType == STRUCTURE_EXTRACTOR
        })
        if (extractstr.length > 0) { var haveextr = true } else {
            var haveextr = false
            Game.rooms[subroom].createConstructionSite(mineralspot.pos.x, mineralspot.pos.y, STRUCTURE_EXTRACTOR)
        }

        //var haveextr = false
        if (room == subroom) { var home = true } else { var home = false }
        if (mineralspot.mineralAmount == 0) { var mempty = true } else { var mempty = false }

        //----------creeps------------------
        //size
        if (haveenergy + reserve < maxenergy) { var maxcreepsize = haveenergy + reserve } else { var maxcreepsize = maxenergy }
        var creepsize

        //----------  Harvester  ----------
        if (!wait && haveextr && !mempty && haveterm) {
            //spawn harvester mit spot im memory
            var cmem = { role: 'min_harv', spot: mineralspot.id, home: room, targetroom: subroom }
            var cbody = [WORK, WORK, MOVE, CARRY]
            if (maxcreepsize > 3700) { creepsize = 3700 } else { creepsize = maxcreepsize }    // Beschränkt maxcreepsize
            var ccreep = _.filter(Game.creeps, (creep) =>
                creep.memory.role == cmem.role
                && creep.memory.spot == cmem.spot
                && creep.memory.home == cmem.home
                && creep.memory.targetroom == cmem.targetroom
                && (creep.ticksToLive > 50 || creep.ticksToLive == undefined));
            if (ccreep.length < 1) {
                needminer = true
                creepspawn.newcreep(room, 'min_harv_' + subroom, creepsize, cbody, cmem)
            }
        }

        return (false)
    }



}

module.exports = minerals