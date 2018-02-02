var roleMiner = {

    /** @param {Creep} creep **/
    run: function (creep) {
        if (creep.room.name == creep.memory.targetroom || creep.memory.targetroom == '') {
            var sources = Game.getObjectById(creep.memory.spot)
            if (creep.pos.isNearTo(sources)) {
                var standon = creep.pos.findInRange(FIND_STRUCTURES, 0, {
                    filter: struc => struc.structureType == STRUCTURE_CONTAINER
                })
                if (standon.length > 0) {
                    if (standon[0].store[RESOURCE_ENERGY] == 2000) {
                    } else {
                        creep.harvest(sources)
                    }
                } else {
                    creep.harvest(sources)
                    creep.room.createConstructionSite(creep.pos, STRUCTURE_CONTAINER)
                }

            } else {
                var contatsource = sources.pos.findInRange(FIND_STRUCTURES, 1, {
                    filter: struc => struc.structureType == STRUCTURE_CONTAINER
                })
                if (contatsource.length > 0) {
                    creep.moveTo(contatsource[0])
                } else {
                    creep.moveTo(sources, { visualizePathStyle: { stroke: '#58FA82' } });
                }
            }
        } else {
            creep.moveTo(creep.pos.findClosestByPath(creep.room.findExitTo(creep.memory.targetroom)))
        }

    }
};

module.exports = roleMiner;
