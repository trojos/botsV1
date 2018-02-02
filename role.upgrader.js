

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
        
        if (creep.memory.targetroom == undefined) {
            var targetroom = creep.memory.home
        } else {
            var targetroom = creep.memory.targetroom
            var targetpos = new RoomPosition(25, 25, targetroom)
        }
        if (creep.room.name == targetroom) {
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
                var cont = target.pos.findInRange(FIND_STRUCTURES, 2, {
                    filter: (s) => s.structureType == STRUCTURE_CONTAINER
                        && s.store[RESOURCE_ENERGY] > 100
                })
                var droppedatsource = target.pos.findInRange(FIND_DROPPED_RESOURCES, 3)
                if (droppedatsource.length > 0) {
                    if (creep.pickup(droppedatsource[0]) == ERR_NOT_IN_RANGE) {
                        creep.moveTo2(droppedatsource[0], { reusePath: 50, ignoreCreeps: false });
                    }
                } else if (cont.length > 0) {
                    if (creep.withdraw(cont[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo2(cont[0], { reusePath: 50, ignoreCreeps: false });
                    }
                } else {
                    if (creep.harvest(target) == ERR_NOT_IN_RANGE) {
                        creep.moveTo2(target, { reusePath: 50, ignoreCreeps: false });
                    }

                }
            }
        } else {
            creep.moveTo2(targetpos, { reusePath: 50 })
        }
    }
}

module.exports = roleUpgrader;