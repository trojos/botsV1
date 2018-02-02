var roleBuilder = require('role.builder');

var roleflag = {

    /** @param {Creep} creep **/
    run: function (creep, flag) {

        if (!creep.memory.harvesting && creep.carry.energy == 0) {
            creep.memory.harvesting = true;
            creep.say('harvest');
        }
        if (creep.memory.harvesting && creep.carry.energy == creep.carryCapacity) {
            creep.memory.harvesting = false;
            creep.say('go');
        }

        //creep.say('hi')

        if (creep.memory.harvesting) { //< creep.carryCapacity) {
            //creep.say('harvest')
            if (flag == undefined) {
                var flagsource = creep.pos.findClosestByRange(FIND_SOURCES)
            } else {
                var flagsource = Game.flags[flag].pos.findClosestByRange(FIND_SOURCES)
            }
            if (creep.harvest(flagsource) == ERR_NOT_IN_RANGE) {
                creep.moveTo(flagsource, { visualizePathStyle: { stroke: '#58FA82' } });
            }

        }
        else {
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (//structure.structureType == STRUCTURE_EXTENSION ||
                        //structure.structureType == STRUCTURE_SPAWN ||
                        structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
                }
            });
            if (targets.length > 0) {
                if (creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#58FA82' } });
                }
            }
            else {
                //creep.moveTo(Game.flags.wait)
                roleBuilder.run(creep)
            }
        }
    }
};

module.exports = roleflag;
