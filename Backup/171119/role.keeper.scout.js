function avoidkeeper(creep, abstand) {
    if (Memory.rooms[creep.room.name]) {
        if (Memory.rooms[creep.room.name].keeper.invaders) {
            var keepers = creep.pos.findInRange(FIND_HOSTILE_CREEPS, abstand)
        } else {
            var keepers = Memory.rooms[creep.room.name].keeper.keepers
        }
        for (var i in keepers) {
            if (creep.pos.inRangeTo(keepers[i].pos, abstand)) {
                var fleepath = PathFinder.search(creep.pos, { pos: keepers[i].pos, range: (abstand + 2) }, { flee: true })
                creep.moveByPath(fleepath.path, { visualizePathStyle: { stroke: '#FA8258' } })
            }
        }
    }
}

var rolescout = {

    /** @param {Creep} creep **/
    run: function (creep) {
        var targetroom = creep.memory.targetroom
        var targetpos = new RoomPosition(25, 25, targetroom)

        if (creep.room.name == targetroom) {
            creep.moveTo2(targetpos, { reusePath: 20 }, true)
            avoidkeeper(creep, 3)
        } else {
            creep.moveTo2(targetpos, { maxOps: 5000, reusePath: 50 })
        }

    }
};

module.exports = rolescout;
