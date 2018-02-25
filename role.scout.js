var rolescout = {

    /** @param {Creep} creep **/
    run: function (creep) {
        var targetroom = creep.memory.targetroom
        var targetpos = new RoomPosition(25, 25, targetroom)
        if (creep.room.name == targetroom) {
            if (creep.room.controller) {
                if (Game.rooms[targetroom].controller.sign) {
                    if (Game.rooms[targetroom].controller.sign.text != Memory.signtext) {
                        creep.say(Memory.signtext)
                        if (creep.signController(creep.room.controller, Memory.signtext) == ERR_NOT_IN_RANGE) {
                            var cm = creep.moveTo2(creep.room.controller, { maxOps: 2000 });
                            if (cm == -2) {
                                var cm = creep.moveTo2(targetpos, { reusePath: 20 })
                            }
                        }
                    }
                } else {
                    var cm = creep.moveTo2(targetpos, { reusePath: 20 })
                    if (creep.room.find(FIND_MY_CREEPS).length > 2) {
                        creep.say('o7')
                        creep.suicide()
                    }

                }
            }
        } else {
            creep.moveTo2(targetpos, { reusePath: 50 })
        }

    }
};

module.exports = rolescout;
