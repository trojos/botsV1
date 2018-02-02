//var roleBuilder = require('role.builder');

var roleRepair = {

    /** @param {Creep} creep **/
    run: function (creep) {
        if (creep.memory.repairing && creep.carry.energy == 0) {
            creep.memory.repairing = false;
            creep.memory.onsite = false;
            creep.say('🔄 harvest');
        }
        if (!creep.memory.repairing && creep.carry.energy == creep.carryCapacity) {
            creep.memory.repairing = true;
            creep.say('🚧 Repair');
        }

        if (creep.memory.repairing && !creep.memory.onsite) {
            //console.log(creep.memory.onsite)
            const targets = creep.room.find(FIND_STRUCTURES, {
                filter: object => object.hits < object.hitsMax - 800
            });

            targets.sort((a, b) => a.hits - b.hits);
            if (targets[0] == undefined) {
                creep.memory.repairing = false
            }
            var toptargets = creep.room.find(FIND_STRUCTURES, {
                filter: object => object.hits == targets[0].hits
            });
            var closesttarget = creep.pos.findClosestByRange(toptargets)
            //console.log('closest: ' + closesttarget)
            if (targets.length > 0) {
                if (creep.repair(closesttarget) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(closesttarget, { visualizePathStyle: { stroke: '#FA8258' } });
                } else {
                    creep.memory.onsite = true
                }
            } else {
                creep.memory.onsite = false
                //roleBuilder.run(creep)
            }

            /**
            if (targets.length > 10) {
                var toptargets = targets.slice(0,10)
            }
            var closesttarget = creep.pos.findClosestByRange(toptargets)
            
            console.log(closesttarget)
            if(targets.length > 0) {
                if(creep.repair(closesttarget) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(closesttarget, {visualizePathStyle: {stroke: '#FA8258'}});
                }
            } else {
                roleBuilder.run(creep)    
            }
            **/
        }
        else if (creep.memory.repairing && creep.memory.onsite) {
            creep.say('onsite')
            const targets = creep.pos.findInRange(FIND_STRUCTURES, 3, {
                filter: object => object.hits < object.hitsMax
            });
            targets.sort((a, b) => a.hits - b.hits);
            if (targets.length > 0) {
                if (creep.repair(targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#FA8258' } });
                } else {
                    creep.memory.onsite = true
                }
            } else {
                creep.memory.onsite = false
            }
        }
        else {
            var container = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (s) => s.structureType == STRUCTURE_CONTAINER
                    && s.store[RESOURCE_ENERGY] > 0
            })
            if (container != undefined) {
                if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(container)
                }
            } else {
                var dropped = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES)
                if (creep.pickup(dropped) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(dropped, { visualizePathStyle: { stroke: '#58FA82' } });
                }
            }
        }
    }
}

module.exports = roleRepair;