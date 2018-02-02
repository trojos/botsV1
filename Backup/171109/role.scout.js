var rolescout = {

    /** @param {Creep} creep **/
    run: function (creep) {
        var targetroom = creep.memory.targetroom
        var targetpos = new RoomPosition(25, 25, targetroom)

        if (creep.room.name == targetroom) {
            if (creep.room.controller) {
                if (Game.rooms[targetroom].controller.sign.text != Memory.signtext) {
                    if (creep.signController(creep.room.controller, Memory.signtext) == ERR_NOT_IN_RANGE) {
                        creep.moveTo2(creep.room.controller);
                    }
                } else {
                    creep.moveTo2(targetpos, { reusePath: 20 })
                }
            }
        } else {
            creep.moveTo2(targetpos, { maxOps: 5000, reusePath: 50 }) == ERR_NO_PATH
        }

    }
};

module.exports = rolescout;
