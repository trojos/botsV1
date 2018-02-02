var roleClaim = {

    /** @param {Creep} creep **/
    run: function (creep) {
        const targetroom = creep.memory.targetroom

        if (creep.room.name == targetroom) {
            var target = creep.room.controller

            if (creep.memory.controll == 'reserve') {
                if (creep.reserveController(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo2(target, { maxOps: 5000, reusePath: 50, maxRooms: 1 })
                }
            } else if (creep.memory.controll == 'attack') {
                if (creep.attackController(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo2(target, { maxOps: 5000, reusePath: 50, maxRooms: 1 })
                }
            } else if (creep.memory.controll == 'claim') {
                if (creep.claimController(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo2(target, { maxOps: 5000, reusePath: 50, maxRooms: 1 })
                }
            }
        } else {
            if (Game.rooms[targetroom] == undefined) {
                targetpos = new RoomPosition(25,25, targetroom)
                creep.moveTo2(targetpos, { maxOps: 5000, reusePath: 50 })
            } else {
                var target = Game.rooms[targetroom].controller
                creep.moveTo2(target, { maxOps: 5000, reusePath: 50 })
            }
        }
    }
};

module.exports = roleClaim;
