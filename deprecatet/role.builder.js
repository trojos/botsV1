var roleBuilder = {

    /** @param {Creep} creep **/
    run: function (creep) {

        if (creep.memory.building && creep.carry.energy == 0) {
            creep.memory.building = false;
            creep.say('🔄 harvest');
        }
        if (!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
            creep.memory.building = true;
            creep.say('🚧 build');
        }

        if (creep.memory.building) {
            var targets = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);

            var targetsext = creep.room.find(FIND_CONSTRUCTION_SITES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION)
                }
            });

            if (targetsext.length) {
                if (creep.build(targetsext[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targetsext[0], { visualizePathStyle: { stroke: '#FA8258' } });
                }
            }
            else {
                if (targets != undefined) {
                    if (creep.build(targets) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targets, { visualizePathStyle: { stroke: '#FA8258' } });
                    }
                }
            }
        }
        else {
            const target = creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE);
            if (target) {
                if (creep.harvest(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, { visualizePathStyle: { stroke: '#FA8258' } });
                }
            }
        }
    }
};

module.exports = roleBuilder;