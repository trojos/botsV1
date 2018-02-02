

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
        }
        if (!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
            creep.memory.upgrading = true;
        }

        //--------- upgrading --------------
        if (creep.memory.upgrading) {
            if (creep.pos.inRangeTo(creep.room.controller, 3)) {
                creep.upgradeController(creep.room.controller)
                Memory.standon = 0
                var cpuvor = Game.cpu.getUsed()
                standon = creep.pos.lookFor(LOOK_CONSTRUCTION_SITES)
                standon2 = creep.pos.lookFor(LOOK_STRUCTURES)
                if (standon.length > 0 || standon2.length > 0) {
                    //console.log('standon')
                    creep.moveTo(creep.room.controller);
                }
                var cpunach = Game.cpu.getUsed()
                Memory.standon += cpunach - cpuvor
            } else {
                creep.moveTo2(creep.room.controller, { reusePath: 50 });
            }
        }
        else {              //------------- Harvesting

            if (creep.memory.spot.id == undefined) {
                var target = Game.getObjectById(creep.memory.spot)
            } else {
                var target = Game.getObjectById(creep.memory.spot.id)
            }
            if (target) {
                if (creep.harvest(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo2(target, { reusePath: 50, ignoreCreeps: false });
                }

            }
        }
    }
}

module.exports = roleUpgrader;