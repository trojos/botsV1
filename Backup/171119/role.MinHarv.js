var roleMinHarv = {

    /** @param {Creep} creep **/
    run: function (creep) {

        const targetroom = creep.memory.targetroom
        const targetsource = Game.getObjectById(creep.memory.spot)

        if (!creep.memory.harvesting && _.sum(creep.carry) == 0) {
            creep.memory.harvesting = true;
        }
        if (creep.memory.harvesting && _.sum(creep.carry) == creep.carryCapacity) {
            creep.memory.harvesting = false;
        }
        if (creep.ticksToLive < 150){               //Wenn Bald tot dann wird ausgeleert und dann destruct damit nix liegenbleibt!
            creep.memory.harvesting = false           //TODO --> Länge minerspot - terminal ermitteln, in memory speichern und tickstolive aufgrund dessen ermitteln
            if (_.sum(creep.carry) == 0){
                creep.memory.role = 'destruct'
            }
        }

        if (creep.memory.harvesting) {
            if (creep.room.name == targetroom) {
                if (creep.harvest(targetsource) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targetsource, { reusePath: 25 });
                }
            } else {
                if (Game.rooms[targetroom] == undefined) {
                    var targetpos = new RoomPosition(25, 25, targetroom)
                    creep.moveTo(targetpos, { maxOps: 5000, reusePath: 50 })
                } else {
                    creep.moveTo(targetsource, { maxOps: 5000, reusePath: 50 })
                }
            }
        } else {
            var target = Game.rooms[creep.memory.home].terminal
            if (creep.room.name == creep.memory.home) {
                if (target) {
                    if (creep.pos.isNearTo(target)) {
                        for (var i in creep.carry) {
                            creep.transfer(target, i)
                        }
                    } else {
                        //if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {   //<---- ermitteln was transportiert wird und das ausladen!
                        creep.moveTo(target, { maxOps: 5000, reusePath: 50 });
                        //}
                    }
                }
            } else {
                creep.moveTo(target, { maxOps: 5000, reusePath: 50 })
            }
        }
    }
};

module.exports = roleMinHarv;
