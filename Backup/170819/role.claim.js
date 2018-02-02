var roleClaim = {

    /** @param {Creep} creep **/
    run: function (creep) {
        const targetroom = creep.memory.targetroom

        if (creep.room.name == targetroom) {

            var target = creep.room.controller
            if (creep.memory.controll == 'reserve') {
                if (creep.reserveController(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target)
                }
            } else if (creep.memory.controll == 'attack') {
                if (creep.attackController(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target)
                }
            } else if (creep.memory.controll == 'claim') {
                if (creep.claimController(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target)
                }
            }
        } else {
            creep.moveTo(creep.pos.findClosestByRange(creep.room.findExitTo(targetroom)))
        }
    }
};

module.exports = roleClaim;
