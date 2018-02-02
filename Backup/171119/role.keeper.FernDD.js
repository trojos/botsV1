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
            //goals.push({ pos: spawninRange[0].pos, range: (abstand + 3) })
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
        var targetkeeper = Memory.rooms[targetroom].keeper.targetkeeper
        if (targetkeeper) { targetkeeper = Game.getObjectById(Memory.rooms[targetroom].keeper.targetkeeper) }
        var nextlair = Game.getObjectById(Memory.rooms[targetroom].keeper.nextlair)
        var targetpos = new RoomPosition(25, 25, targetroom)

        var tts = Memory.rooms[targetroom].keeper.tts

        if (creep.room.name == targetroom) {

            var healtars = creep.pos.findInRange(FIND_MY_CREEPS, 1, { filter: sa => sa.hits < sa.hitsMax })
            var healtar = _.min(healtars, 'hits')
            creep.heal(healtar)

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
                if (rangetotarget >= 7) {
                    creep.moveTo2(invader, { reusePath: 20 }, false)
                } else if (rangetotarget < 7 && rangetotarget > 3) {
                    creep.moveTo2(invader, { reusePath: 0 }, false)
                } else if (rangetotarget <= 3) {
                    var at = 1
                    creep.rangedAttack(invader)
                    avoidkeeper(creep, 2)
                }

            } else {
                if (targetkeeper) {
                    var rangetotarget = creep.pos.getRangeTo(targetkeeper.pos.x, targetkeeper.pos.y)
                    if (rangetotarget >= 7) {
                        creep.moveTo2(targetkeeper, { reusePath: 20 }, false)
                    } else if (rangetotarget < 7 && rangetotarget > 3) {
                        creep.moveTo2(targetkeeper, { reusePath: 0 }, false)
                    } else if (rangetotarget <= 3) {
                        var at = 1
                        creep.rangedAttack(targetkeeper)
                        avoidkeeper(creep, 2)
                    }
                } else {
                    var waitpoint = Memory.rooms[targetroom].spots[Memory.rooms[targetroom].keeper.nextspot].waitpoint
                    var waitpoint = new RoomPosition(waitpoint.x, waitpoint.y, waitpoint.roomName)
                    creep.moveTo2(waitpoint, { reusePath: 20 }, true)
                    if (creep.ticksToLive < tts) {
                        creep.memory.role = 'destruct'
                    }
                }
                if (creep.hits < 1700) {
                    heals = creep.pos.findInRange(FIND_MY_CREEPS, 10, {
                        filter: { role: 'keeperheal' }
                    })
                    heal = heals[0]
                    if (heal) {
                        creep.moveTo(heal)
                    } else {
                        avoidkeeper(creep, 5)
                    }
                }
            }



        } else {
            creep.moveTo2(targetpos, { maxOps: 5000, reusePath: 50 })
        }

    }
};

module.exports = rolekeeperFernDD;
