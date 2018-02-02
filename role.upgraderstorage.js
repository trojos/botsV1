var creepboost = require('creep.boost')


var roleUpgraderStorage = {
    run: function (creep) {
        //if (creep.ticksToLive > 1 || creep.ticksToLive == undefined) {
        //console.log(creep.pos.roomName, creep.name, creep.ticksToLive, creep.memory.boosted)
        //     //creep.memory.boosted = undefined
        // }

        creepboost.run(creep, creep.memory.home, WORK, 'XGH2O', 15)

        if (creep.memory.boosted == 'goto') { return; }  //Wenn Boost ausgeführt wird, wird abgebrochen bis boost fertig
        // if ((creep.memory.boosted == true && creep.ticksToLive < 500)) {
        //     creep.memory.renew = true

        // }
        // var renew = creep.memory.renew
        // if (renew) {
        //     //console.log(creep.name, 'geht zu renew')
        //     var freespawn = Game.rooms[creep.memory.home].find(FIND_MY_SPAWNS, {
        //         filter: sp => sp.spawning == null
        //     })
        //     if (freespawn.length > 0) {
        //         var nearfreespawn = creep.pos.findClosestByRange(freespawn)
        //         if (creep.pos.isNearTo(nearfreespawn)) {
        //             nearfreespawn.renewCreep(creep)
        //             console.log('renewed creep', creep.name)
        //         } else {
        //             creep.moveTo2(nearfreespawn)
        //         }
        //         if (creep.ticksToLive > 1470) {
        //             creep.memory.upgrading = false;
        //             creep.memory.renew = false
        //         }
        //         return
        //     }
        // } 

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
            if (creep.carry.energy < creep.carryCapacity / 2) {
                if (creep.room.memory.links.upgrade[0]) {
                    var link = Game.getObjectById(creep.room.memory.links.upgrade[0]);
                    creep.withdraw(link, RESOURCE_ENERGY)
                }
            }
            // if (creep.pos.isNearTo(creep.room.storage)) {
            //     creep.moveTo2(creep.room.controller)
            // }
        }
        else {
            var dropped = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 3)
            if (dropped.length > 0) {
                if (creep.pickup(dropped[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo2(dropped[0], { reusePath: 50 });
                }
                var dropp = true
            } else { var dropp = false }
            if (creep.room.memory.links.upgrade[0] && !dropp) {
                var link = Game.getObjectById(creep.room.memory.links.upgrade[0]);
                if (link.energy > 0 && creep.pos.getRangeTo(link) < 5) {
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