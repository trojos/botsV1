function avoidkeeper(creep, abstand) {
    if (Memory.rooms[creep.room.name].keeper.invaders) {
        var keepers = creep.pos.findInRange(FIND_HOSTILE_CREEPS, abstand)
    } else {
        var keepers = Memory.rooms[creep.room.name].keeper.keepers
    }
    for (var i in keepers) {
        if (creep.pos.inRangeTo(keepers[i].pos, abstand)) {
            var fleepath = PathFinder.search(creep.pos, { pos: keepers[i].pos, range: (abstand + 3) }, { flee: true })
            creep.moveByPath(fleepath.path, { visualizePathStyle: { stroke: '#FA8258' } })
        }
    }
}
function avoidlair(creep, abstand) {
    var lairinRange = creep.pos.findInRange(FIND_HOSTILE_STRUCTURES, abstand, {
        filter: { structureType: STRUCTURE_KEEPER_LAIR }
    })
    var spawninRange = creep.pos.findInRange(FIND_SOURCES, 5)
    if (lairinRange.length > 0 || spawninRange.length > 0) {
        if (lairinRange[0] == undefined) { lairinRange[0] = spawninRange[0] }
        if (spawninRange[0] == undefined) { spawninRange[0] = lairinRange[0] }
        if (creep.pos.inRangeTo(lairinRange[0].pos, abstand) || creep.pos.inRangeTo(spawninRange[0].pos, abstand)) {
            var goals = []
            goals.push({ pos: lairinRange[0].pos, range: (abstand + 3) })
            goals.push({ pos: spawninRange[0].pos, range: (abstand + 3) })
            var fleepath = PathFinder.search(creep.pos, goals, { flee: true })
            creep.moveByPath(fleepath.path, { visualizePathStyle: { stroke: '#FA8258' } })
        }
    }
    avoidkeeper(creep, abstand)
}


var roleMiner = {

    /** @param {Creep} creep **/
    run: function (creep) {

        if (creep.room.name == creep.memory.targetroom || creep.memory.targetroom == '') {
            var sources = Game.getObjectById(creep.memory.spot)
            var lairatSpawn = sources.pos.findInRange(FIND_HOSTILE_STRUCTURES, 5, {
                filter: { structureType: STRUCTURE_KEEPER_LAIR }
            })
            var tts = lairatSpawn[0].ticksToSpawn
            if (tts < 7 || tts == undefined) {
                avoidlair(creep, 5)
            } else {

                var contatsource = sources.pos.findInRange(FIND_STRUCTURES, 1, {
                    filter: struc => struc.structureType == STRUCTURE_CONTAINER
                })
                var constcont = sources.pos.findInRange(FIND_CONSTRUCTION_SITES, 1, {
                    filter: struc => struc.structureType == STRUCTURE_CONTAINER
                })
                var minepos
                if (contatsource.length > 0) {
                    minepos = contatsource[0]
                } else if (constcont.length > 0) {
                    minepos = constcont[0]
                } else {
                    minepos = false
                }
                if (minepos) {
                    if (creep.pos.isEqualTo(minepos.pos)) {
                        var standon = creep.pos.findInRange(FIND_STRUCTURES, 0, {
                            filter: struc => struc.structureType == STRUCTURE_CONTAINER
                        })
                        if (contatsource.length > 0) {
                            if (minepos.store[RESOURCE_ENERGY] > 1988) {
                            } else {
                                creep.harvest(sources)
                            }
                        } else if (constcont.length > 0) {
                            creep.harvest(sources)
                        }
                    } else {
                        creep.moveTo2(minepos, { reusePath: 50 }, true)
                    }
                } else {
                    if (creep.pos.isNearTo(sources)) {
                        creep.harvest(sources)
                        creep.room.createConstructionSite(creep.pos, STRUCTURE_CONTAINER)
                    } else {
                        creep.moveTo2(sources, { reusePath: 50 }), true;
                    }
                }
            }
            avoidkeeper(creep, 4)

        } else {
            creep.moveTo2(creep.pos.findClosestByPath(creep.room.findExitTo(creep.memory.targetroom)), { reusePath: 50 })
        }

    }
};

module.exports = roleMiner;
