function avoidkeeper(creep, abstand) {
    if (Memory.rooms[creep.room.name].keeper.invaders) {
        var keepers = creep.pos.findInRange(FIND_HOSTILE_CREEPS, abstand)
    } else {
        var keepers = Memory.rooms[creep.room.name].keeper.keepers
    }
    for (var i in keepers) {
        if (creep.pos.inRangeTo(keepers[i].pos, abstand)) {
            var fleepath = PathFinder.search(creep.pos, { pos: keepers[i].pos, range: (abstand + 3) }, { flee: true })
            creep.moveByPath(fleepath.path, { visualizePathStyle: { stroke: '#FA8258' } })
        }
    }
}
function avoidlair(creep, abstand) {
    var lairinRange = creep.pos.findInRange(FIND_HOSTILE_STRUCTURES, abstand, {
        filter: { structureType: STRUCTURE_KEEPER_LAIR }
    })
    var spawninRange = creep.pos.findInRange(FIND_SOURCES, 5)
    if (lairinRange.length > 0 || spawninRange.length > 0) {
        if (lairinRange[0] == undefined) { lairinRange[0] = spawninRange[0] }
        if (spawninRange[0] == undefined) { spawninRange[0] = lairinRange[0] }
        if (creep.pos.inRangeTo(lairinRange[0].pos, abstand) || creep.pos.inRangeTo(spawninRange[0].pos, abstand)) {
            var goals = []
            goals.push({ pos: lairinRange[0].pos, range: (abstand + 3) })
            goals.push({ pos: spawninRange[0].pos, range: (abstand + 3) })
            var fleepath = PathFinder.search(creep.pos, goals, { flee: true })
            creep.moveByPath(fleepath.path, { visualizePathStyle: { stroke: '#FA8258' } })
        }
    }
    avoidkeeper(creep, abstand)
}

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
        var weg = Memory.rooms[targetroom].Wege[creep.memory.spot].Spawn.cost
        if (creep.ticksToLive < weg * 2) {               //Wenn Bald tot dann wird ausgeleert und dann destruct damit nix liegenbleibt!
            creep.memory.harvesting = false           //TODO --> Länge minerspot - terminal ermitteln, in memory speichern und tickstolive aufgrund dessen ermitteln
            if (_.sum(creep.carry) == 0) {
                creep.memory.role = 'destruct'
            }
        }

        if (creep.memory.harvesting) {
            if (creep.room.name == targetroom) {
                var lairatSpawn = targetsource.pos.findInRange(FIND_HOSTILE_STRUCTURES, 5, {
                    filter: { structureType: STRUCTURE_KEEPER_LAIR }
                })
                var tts = lairatSpawn[0].ticksToSpawn
                if (tts < 7 || tts == undefined) {
                    avoidlair(creep, 5)
                } else {
                    if (creep.harvest(targetsource) == ERR_NOT_IN_RANGE) {
                        creep.moveTo2(targetsource, { reusePath: 25 }), true;
                    }
                }
                avoidkeeper(creep, 4)
            } else {
                if (Game.rooms[targetroom] == undefined) {
                    var targetpos = new RoomPosition(25, 25, targetroom)
                    creep.moveTo2(targetpos, { maxOps: 5000, reusePath: 50 })
                } else {
                    creep.moveTo2(targetsource, { maxOps: 5000, reusePath: 50 })
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
                        creep.moveTo2(target, { maxOps: 5000, reusePath: 50 });
                        //}
                    }
                }
            } else {
                creep.moveTo2(target, { maxOps: 5000, reusePath: 50 })
                avoidkeeper(creep, 4)
            }
        }
    }
};

module.exports = roleMinHarv;
