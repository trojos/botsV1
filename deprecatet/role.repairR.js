var roleBuilderR = require('role.builderNR')

var roleRepairR = {

    /** @param {Creep} creep **/
    run: function (creep) {
        const targetroom = Memory.Location[creep.memory.targetroom].name
        //const targetsourceid = Memory.Location[creep.memory.targetroom].sources.nearSpawn.id

        if (creep.memory.repairing && creep.carry.energy == 0) {
            creep.memory.repairing = false;
            creep.memory.onsite = false;
            creep.say('🔄 harvest');
        }
        if (!creep.memory.repairing && creep.carry.energy == creep.carryCapacity) {
            creep.memory.repairing = true;
            creep.say('🚧 Repair');
        }

        if (creep.room.name == targetroom) {
            if (creep.memory.repairing && !creep.memory.onsite) {
                //console.log(creep.memory.onsite)
                const targets = creep.room.find(FIND_STRUCTURES, {
                    filter: object => object.hits < object.hitsMax - 800
                });


                if (targets.length > 0) {
                    targets.sort((a, b) => a.hits - b.hits);
                    var toptargets = creep.room.find(FIND_STRUCTURES, {
                        filter: object => object.hits == targets[0].hits
                    });
                    var closesttarget = creep.pos.findClosestByRange(toptargets)
                    //console.log('closest: ' + closesttarget)
                    if (creep.repair(closesttarget) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(closesttarget, { visualizePathStyle: { stroke: '#FA8258' } });
                    } else {
                        creep.memory.onsite = true
                    }
                } else {
                    creep.memory.onsite = false
                    roleBuilderR.run(creep)
                }

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
            }
        } else {
            creep.moveTo(creep.pos.findClosestByRange(creep.room.findExitTo(targetroom)))
        }
    }
};

module.exports = roleRepairR;
