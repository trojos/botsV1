var roledestruct = {

    /** @param {Creep} creep **/
    run: function (creep) {
        var xspawn = Game.rooms[creep.memory.home].find(FIND_MY_SPAWNS)[0]
        if (creep.pos.isNearTo(xspawn)) {
            xspawn.recycleCreep(creep)
        } else {
            creep.moveTo(xspawn)
        }

    }
};

module.exports = roledestruct;
