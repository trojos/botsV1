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

var rolekeeperFernDD = {

    /** @param {Creep} creep **/
    run: function (creep) {
        var targetroom = creep.memory.targetroom
        var targetpos = new RoomPosition(25, 25, targetroom)
        var targetkeeper = Memory.rooms[targetroom].keeper.targetkeeper
        if (targetkeeper) { targetkeeper = Game.getObjectById(Memory.rooms[targetroom].keeper.targetkeeper) }

        var tts = Memory.rooms[targetroom].keeper.tts

        if (creep.room.name == targetroom) {
            if (Memory.rooms[targetroom].keeper.invaders) {
                invaders = Game.rooms[targetroom].find(FIND_HOSTILE_CREEPS, {
                    filter: { owner: { username: 'Invader' } }
                })
                invader = creep.pos.findClosestByPath(invaders)
                if (invader) {
                    var rangetotarget = creep.pos.getRangeTo(invader.pos.x, invader.pos.y)
                } else {
                    Memory.rooms[targetroom].keeper.invaders = false
                }

                if (rangetotarget >= 5) {
                    creep.moveTo2(invader, { reusePath: 20 }, false)
                } else if (rangetotarget < 5) {
                    creep.moveTo2(invader, { reusePath: 0 }, false)
                } else if (rangetotarget <= 1) {
                    var at = 1
                    creep.moveTo2(invader, { reusePath: 0 }, false)
                    creep.attack(invader)
                }
                var inRange = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 1)
                if (inRange.length > 0) {
                    at = 1
                    creep.attack(inRange[0])
                }
                console.log(inRange)
            } else {

                if (targetkeeper) {
                    var rangetotarget = creep.pos.getRangeTo(targetkeeper.pos.x, targetkeeper.pos.y)
                    if (rangetotarget >= 5) {
                        creep.moveTo2(targetkeeper, { reusePath: 20 }, false)
                    } else if (rangetotarget < 5) {
                        creep.moveTo2(targetkeeper, { reusePath: 0 }, false)
                    } else if (rangetotarget <= 1) {
                        var at = 1
                        creep.moveTo2(targetkeeper, { reusePath: 0 }, false)
                        creep.attack(targetkeeper)
                    }
                } else {
                    var nextlair = Game.getObjectById(Memory.rooms[targetroom].keeper.nextlair)
                    //var nextlair = new RoomPosition(waitpoint.x, waitpoint.y, waitpoint.roomName)
                    creep.moveTo2(nextlair, { reusePath: 20 }, true)
                    if (creep.ticksToLive < tts) {
                        creep.memory.role = 'destruct'
                    }
                }
            }

            if (at == 1) {
            } else {
                var healtars = creep.pos.findInRange(FIND_MY_CREEPS, 6, { filter: sa => sa.hits < sa.hitsMax })
                var healtar = _.min(healtars, 'hits')
                creep.rangedHeal(healtar)
                creep.heal(healtar)
            }

        } else {
            creep.moveTo2(targetpos, { maxOps: 5000, reusePath: 50 })
        }

    }
};

module.exports = rolekeeperFernDD;
