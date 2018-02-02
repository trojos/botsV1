var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function (creep) {

        /**
                var strupos = creep.pos.lookFor('structure').structureType
                var conpos = creep.pos.lookFor('constructionSite').structureType
                if (strupos = 'undefined' && conpos != 'road') {
                    creep.room.createConstructionSite(creep.pos,STRUCTURE_ROAD)
                    //console.log ('baue straße')
                }
        **/
        if (creep.memory.upgrading && creep.carry.energy == 0) {
            creep.memory.upgrading = false;
            creep.say('🔄 harvest');
        }
        if (!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
            creep.memory.upgrading = true;
            creep.say('⚡ upgrade');
        }

        if (creep.memory.upgrading) {
            if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: '#F4FA58' } });
            }
        }
        else {
            const target = creep.room.controller.pos.findClosestByRange(FIND_SOURCES_ACTIVE);
            if (target) {
                if (creep.harvest(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, { visualizePathStyle: { stroke: '#F4FA58' } });
                }
            }
        }
    }
}

module.exports = roleUpgrader;