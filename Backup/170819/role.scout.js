var rolescout = {

    /** @param {Creep} creep **/
    run: function (creep) {
        var targetroom = creep.memory.targetroom

        if (creep.room.name == targetroom) {
            creep.moveTo(25,25,{reusePath:20})
        } else {
            creep.moveTo(creep.pos.findClosestByPath(creep.room.findExitTo(targetroom)))
        }

    }
};

module.exports = rolescout;
