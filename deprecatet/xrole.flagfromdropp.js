var roleBuilder = require('role.builder');

var roleflagfd = {

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

        if (creep.memory.harvesting) { //< creep.carryCapacity) {

            if (creep.room.storage != undefined) {
                if (creep.withdraw(creep.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.storage)
                }
            } else {
                var container = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (s) => s.structureType == STRUCTURE_CONTAINER
                        && s.store[RESOURCE_ENERGY] > 0
                })
                if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(container)
                }
            }


            /**
             var dropped = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES)	       
             if (dropped != undefined) {
                 if(creep.pickup(dropped) == ERR_NOT_IN_RANGE) {
                     creep.moveTo(dropped, {visualizePathStyle: {stroke: '#58FA82'}});
                 }	            
             } else {
                 if(creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                     creep.moveTo(container)
                 }    	        
             }
             **/
        }
        else {
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION ||
                        structure.structureType == STRUCTURE_SPAWN ||
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

module.exports = roleflagfd;
