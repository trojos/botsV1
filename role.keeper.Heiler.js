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

function attackt(creep) {

    var at = 0

    var mycreeps = creep.pos.findInRange(FIND_MY_CREEPS, 10, {
        filter: sa => sa.hits < sa.hitsMax
    })
    var target = creep.pos.findClosestByRange(mycreeps)

    if (!creep.pos.isNearTo(target) && target) {
        //Es wird eine Position rund ums target gesucht die frei ist und nicht auf einen ExitBereich liegt
        if (target.pos.y - 1 < 0) { var ltop = 0 } else { var ltop = target.pos.y - 1 }
        if (target.pos.y + 1 > 49) { var lbottom = 49 } else { var lbottom = target.pos.y + 1 }
        if (target.pos.x - 1 < 0) { var lleft = 0 } else { var lleft = target.pos.x - 1 }
        if (target.pos.x + 1 > 49) { var lright = 49 } else { var lright = target.pos.x + 1 }
        var neartarget = target.room.lookAtArea(ltop, lleft, lbottom, lright, true)
        //
        _.remove(neartarget, 'x', 49)
        _.remove(neartarget, 'x', 0)
        _.remove(neartarget, 'y', 49)
        _.remove(neartarget, 'y', 0)

        for (j in neartarget) {
            if (neartarget[j].type == 'creep' || neartarget[j].type == 'structure') {
                _.remove(neartarget, function (n) {
                    return n.y == neartarget[j].y && n.x == neartarget[j].x

                })
            }
        }
        //

        //_.remove(neartarget, 'type', 'creep')       //wird rausgefiltert, aber nur creep, wenn an selber stelle was anderes ist beleibts
        //_.remove(neartarget, 'type', 'structure')  //da hats was, wird nicht rausgefilter!

        var freepos = []
        var rp

        for (var i in neartarget) {
            rp = new RoomPosition(neartarget[i].x, neartarget[i].y, creep.room.name)
            freepos.push(rp)
        }

        var healtarget = creep.pos.findClosestByRange(freepos)
        //console.log('moveto: ' + healtarget + ' heal: ' + target)
        var er = creep.moveTo(healtarget, { visualizePathStyle: { stroke: '#ff0000' } })
        creep.rangedHeal(target)
        creep.heal(target)
        var at = 1
    } else if (target) {
        creep.heal(target)
        var at = 1
    }
    return at
}

var roleHeiler = {

    /** @param {Creep} creep **/
    run: function (creep) {
        var targetroom = creep.memory.targetroom
        var targetkeeper = Memory.rooms[targetroom].keeper.targetkeeper
        if (targetkeeper) { targetkeeper = Game.getObjectById(Memory.rooms[targetroom].keeper.targetkeeper) }

        if (creep.room.name != creep.memory.targetroom) {
            creep.moveTo(creep.pos.findClosestByRange(creep.room.findExitTo(targetroom)), { visualizePathStyle: { stroke: '#ff0000' } })
        }
        var nextlair = Game.getObjectById(Memory.rooms[targetroom].keeper.nextlair)

        var targetpos = new RoomPosition(25, 25, targetroom)

        var tts = Memory.rooms[targetroom].keeper.tts

        if (creep.room.name == targetroom) {
            var at = attackt(creep)
            if (at != 1) {

                var fernDD = creep.room.find(FIND_MY_CREEPS, {
                    filter: (cr) => cr.memory.role == 'keeperFernDD'
                })
                if (fernDD.length > 10) {
                    creep.moveTo2(fernDD[0], { reusePath: 20 }, true)
                    if (tts < 8) {
                        avoidlair(creep, 4)
                    }
                } else if (targetkeeper) {
                    creep.moveTo2(targetkeeper, { reusePath: 20 }, true)
                } else {
                    var waitpoint = Memory.rooms[targetroom].spots[Memory.rooms[targetroom].keeper.nextspot].waitpoint
                    var waitpoint = new RoomPosition(waitpoint.x, waitpoint.y, waitpoint.roomName)
                    creep.moveTo2(waitpoint, { reusePath: 20 }, true)
                    if (creep.ticksToLive < tts) {
                        creep.memory.role = 'destruct'
                    }
                }
            }
            if (creep.hits < 1000) {
                avoidkeeper(creep, 4)
            }
        } else {
            creep.moveTo2(targetpos, { maxOps: 5000, reusePath: 50 })
        }


    }
};

module.exports = roleHeiler;
