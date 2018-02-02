var roleUpgraderStorage = {


    run: function (creep) {

        if (creep.memory.upgrading && creep.carry.energy == 0) {
            creep.memory.upgrading = false;
        }
        if (!creep.memory.upgrading && (creep.carry.energy == creep.carryCapacity || creep.carry.energy > 750)) {
            creep.memory.upgrading = true;
        }

        if (creep.memory.upgrading) {
            if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo2(creep.room.controller, { visualizePathStyle: { stroke: '#F4FA58' } });
            }
            if (creep.room.memory.links.upgrade[0]) {
                var link = Game.getObjectById(creep.room.memory.links.upgrade[0]);
                creep.withdraw(link, RESOURCE_ENERGY)
            }
        }
        else {
            var dropped = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 3)
            if (dropped.length > 0) {
                if (creep.pickup(dropped[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo2(dropped[0], { reusePath: 50 });
                }
                var dropp = true
            } else { var dropp = false}
            if (creep.room.memory.links.upgrade[0] && !dropp) {
                var link = Game.getObjectById(creep.room.memory.links.upgrade[0]);
                if (link.energy > 0) {
                    creep.memory.upgrading = true;
                    var target = link
                } else {
                    var target = Game.getObjectById(Memory.rooms[creep.memory.home].Lager);
                }
            } else {
                var target = Game.getObjectById(Memory.rooms[creep.memory.home].Lager);
            }
            if (target && !dropp) {
                if (creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo2(target);
                }
            }

        }
    }
}

module.exports = roleUpgraderStorage;