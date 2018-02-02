var roleClaim = {

    /** @param {Creep} creep **/
    run: function (creep) {
        const targetroom = creep.memory.targetroom

        if (creep.room.name == targetroom) {

            var target = creep.room.controller
            if (creep.memory.controll == 'reserve') {
                switch (true) {
                    case target.owner == undefined:
                        if (creep.reserveController(target) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(target)
                        }
                        break;
                    case target.owner != undefined && target.my == false:
                        if (creep.claimController(target) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(target)
                        }
                        break;
                }
            } else if (creep.memory.controll == 'attack') {
                if (creep.attackController(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target)
                }
            }
        } else {
            creep.moveTo(creep.pos.findClosestByRange(creep.room.findExitTo(targetroom)))
        }
    }
};

module.exports = roleClaim;
