var roleHarvesterR = {

    /** @param {Creep} creep **/
    run: function (creep) {
        const home = Game.getObjectById(Memory.Location.Room1.Spawn1)

        const targetroom = creep.memory.targetroom
        const targetsourceid = creep.memory.spot

        if (!creep.memory.harvesting && creep.carry.energy == 0) {
            creep.memory.harvesting = true;
            creep.say('🔄 harvest');
        }
        if (creep.memory.harvesting && creep.carry.energy == creep.carryCapacity) {
            creep.memory.harvesting = false;
            creep.say('🚧 return');
        }

        if (creep.memory.harvesting) {
            if (creep.room.name == targetroom) {

                var dropped = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 5)
                if (dropped < 0) {
                    if (creep.pickup(dropped[0]) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(dropped[0])
                    }
                } else {
                    var targetsource = creep.pos.findClosestByPath(FIND_SOURCES, {
                        filter: (s) => s.energy > 0
                    })
                    if (creep.harvest(targetsource) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targetsource, { visualizePathStyle: { stroke: '#58FA82' } });
                    }
                }
            } else {
                creep.moveTo(creep.pos.findClosestByRange(creep.room.findExitTo(targetroom)))
            }
        } else {
            if (creep.room.name == home.room.name) {
                var targets = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION ||
                            structure.structureType == STRUCTURE_SPAWN ||
                            structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
                    }
                });
                if (targets) {
                    if (creep.transfer(targets, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targets, { visualizePathStyle: { stroke: '#58FA82' } });
                    }
                } else {
                    var dropptarget = Game.getObjectById(Memory.Location.Room1.Lager)
                    if (creep.transfer(dropptarget, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(dropptarget)
                    }
                }
            } else {
                creep.moveTo(Game.getObjectById(Memory.Location.Room1.Spawn1))
            }
        }
    }
};

module.exports = roleHarvesterR;
