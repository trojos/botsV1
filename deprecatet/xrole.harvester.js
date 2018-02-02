var roleHarvester = {

    /** @param {Creep} creep **/
    run: function (creep) {
        var home
        var sources = creep.room.find(FIND_SOURCES)
        if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
            creep.moveTo(sources[0], { visualizePathStyle: { stroke: '#58FA82' } });
        } else {
            creep.room.createConstructionSite(creep.pos, STRUCTURE_CONTAINER)
        }

    }
};

module.exports = roleHarvester;
