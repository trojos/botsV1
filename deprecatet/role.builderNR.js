var roleBuilderR2 = {

    /** @param {Creep} creep **/
    run: function (creep) {
        const targetroom = Memory.Location[creep.memory.targetroom].name
        //const targetsourceid = Memory.Location[creep.memory.targetroom].sources.nearSpawn.id

        if (!creep.memory.harvesting && creep.carry.energy == 0) {
            creep.memory.harvesting = true;
            creep.say('🔄 harvest');
        }
        if (creep.memory.harvesting && creep.carry.energy == creep.carryCapacity) {
            creep.memory.harvesting = false;
            creep.say('🚧 build');
        }

        if (creep.memory.harvesting) {
            if (creep.room.name == targetroom) {

                //var targetsource = Game.getObjectById(targetsourceid)
                var targetsource = creep.pos.findClosestByPath(FIND_SOURCES, {
                    filter: (s) => s.energy > 0
                })
                var dropped = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 5)
                if (dropped < 0) {
                    if (creep.pickup(dropped[0]) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(dropped[0])
                    }
                } else {
                    if (creep.harvest(targetsource) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targetsource, { visualizePathStyle: { stroke: '#58FA82' } });
                    }
                }
            } else {
                creep.moveTo(creep.pos.findClosestByRange(creep.room.findExitTo(targetroom)))
            }
        } else {
            var targets = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
            if (targets != undefined) {
                if (creep.build(targets) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets, { visualizePathStyle: { stroke: '#FA8258' } });
                }
            }
        }
    }
};

module.exports = roleBuilderR2;
