function avoidkeeper(creep, abstand) {
    if (Memory.rooms[creep.room.name].keeper.invaders) {
        var keepers = creep.pos.findInRange(FIND_HOSTILE_CREEPS, abstand)
    } else {
        var keepers = Memory.rooms[creep.room.name].keeper.keepers
    }
    var avoid = false
    var keeperrange
    for (var i in keepers) {
        keeperrange = creep.pos.getRangeTo(keepers[i].pos.x, keepers[i].pos.y)
        if (keeperrange <= abstand) {
            var fleepath = PathFinder.search(creep.pos, { pos: keepers[i].pos, range: (abstand + 3) }, { flee: true })
            var fleepos = fleepath.path[fleepath.path.length - 1]
            //creep.moveByPath(fleepath.path, { visualizePathStyle: { stroke: '#FA8258' } })
            creep.moveTo2(fleepos)
            avoid = true
            return avoid
        } else if (keeperrange == abstand + 1) {
            avoid = true
            return avoid
        }
    }
}
function avoidlair(creep, abstand) {
    var avoid = avoidkeeper(creep, abstand)
    if (!avoid) {
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
                var fleepath = PathFinder.search(creep.pos, goals, {
                    flee: true, plainCost: 2, swampCost: 10, roomCallback: function (roomName) {
                        let room = Game.rooms[roomName];
                        if (!room) return;
                        let costs = new PathFinder.CostMatrix;
                        room.find(FIND_STRUCTURES).forEach(function (struct) {
                            if (struct.structureType === STRUCTURE_ROAD) {
                                costs.set(struct.pos.x, struct.pos.y, 1);
                            }
                        });
                        for (let x = 0; x < 50; x++) {
                            costs.set(x, 0, 0xff)
                            costs.set(x, 49, 0xff)
                        }
                        for (let y = 0; y < 50; y++) {
                            costs.set(0, y, 0xff)
                            costs.set(49, y, 0xff)
                        }
                        room.find(FIND_CREEPS).forEach(function (creep) {
                            costs.set(creep.pos.x, creep.pos.y, 0xff);
                        });
                        return costs;
                    }
                })
                var fleepos = fleepath.path[fleepath.path.length - 1]
                //creep.moveByPath(fleepath.path, { visualizePathStyle: { stroke: '#FA8258' } })
                creep.moveTo2(fleepos)
            }
        }
    }
}


var roleMiner = {

    /** @param {Creep} creep **/
    run: function (creep) {

        if (creep.room.name == creep.memory.targetroom || creep.memory.targetroom == '') {
            var sources = Game.getObjectById(creep.memory.spot)
            var lairatSpawn = sources.pos.findInRange(FIND_HOSTILE_STRUCTURES, 5, {
                filter: { structureType: STRUCTURE_KEEPER_LAIR }
            })
            var tts = lairatSpawn[0].ticksToSpawn
            if (tts < 7 || tts == undefined) {
                avoidlair(creep, 5)
            } else {
                var avoid = avoidkeeper(creep, 4)
                if (!avoid) {
                    var contatsource = sources.pos.findInRange(FIND_STRUCTURES, 1, {
                        filter: struc => struc.structureType == STRUCTURE_CONTAINER
                    })
                    var constcont = sources.pos.findInRange(FIND_CONSTRUCTION_SITES, 1, {
                        filter: struc => struc.structureType == STRUCTURE_CONTAINER
                    })
                    var minepos
                    if (contatsource.length > 0) {
                        minepos = contatsource[0]
                    } else if (constcont.length > 0) {
                        minepos = constcont[0]
                    } else {
                        minepos = false
                    }
                    if (minepos) {
                        if (creep.pos.isEqualTo(minepos.pos)) {
                            var standon = creep.pos.findInRange(FIND_STRUCTURES, 0, {
                                filter: struc => struc.structureType == STRUCTURE_CONTAINER
                            })
                            if (contatsource.length > 0) {
                                if (minepos.store[RESOURCE_ENERGY] > 1988) {
                                } else {
                                    creep.harvest(sources)
                                }
                            } else if (constcont.length > 0) {
                                creep.harvest(sources)
                            }
                        } else {
                            creep.moveTo2(minepos, { reusePath: 50 }, true)
                        }
                    } else {
                        if (creep.pos.isNearTo(sources)) {
                            creep.harvest(sources)
                            creep.room.createConstructionSite(creep.pos, STRUCTURE_CONTAINER)
                        } else {
                            creep.moveTo2(sources, { reusePath: 50 }), true;
                        }
                    }
                }
            }


        } else {
            creep.moveTo2(creep.pos.findClosestByPath(creep.room.findExitTo(creep.memory.targetroom)), { reusePath: 50 })
        }

    }
};

module.exports = roleMiner;
