function avoidkeeper(creep, abstand) {
    if (Memory.rooms[creep.memory.targetroom].keeper.invaders) {
        var keepers = creep.pos.findInRange(FIND_HOSTILE_CREEPS, abstand)
    } else {
        var keepers = Memory.rooms[creep.memory.targetroom].keeper.keepers
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
                var fleepath = PathFinder.search(creep.pos, goals, { flee: true })
                var fleepos = fleepath.path[fleepath.path.length - 1]
                //creep.moveByPath(fleepath.path, { visualizePathStyle: { stroke: '#FA8258' } })
                creep.moveTo2(fleepos)
            }
        }
    }
}

var rolecarry = {

    /** @param {Creep} creep **/
    run: function (creep) {

        if (!creep.memory.harvesting && creep.carry.energy == 0) {
            creep.memory.harvesting = true;
        }
        if (creep.memory.harvesting && creep.carry.energy == creep.carryCapacity) {

            if (creep.memory.statistik || Memory.Statistik[creep.memory.targetroom] != undefined) {
                Memory.Statistik[creep.memory.targetroom].aktuell.energy = Memory.Statistik[creep.memory.targetroom].aktuell.energy + creep.carry.energy
            }
            creep.memory.harvesting = false;
        }

        var source = Game.getObjectById(creep.memory.spot)  //Sourcespot oder Link!!!

        if (Game.rooms[creep.memory.targetroom] == undefined) {
            creep.moveTo2(creep.room.findExitTo(creep.memory.targetroom), { reusePath: 50 })
        } else {
            //---------- Energy besorgen  -------------
            if (creep.memory.harvesting) {
                if (creep.room.name == creep.memory.targetroom) {
                    var avoid = avoidkeeper(creep, 4)
                    if (!avoid) {
                        var sources = Game.getObjectById(creep.memory.spot)
                        var lairatSpawn = sources.pos.findInRange(FIND_HOSTILE_STRUCTURES, 5, {
                            filter: { structureType: STRUCTURE_KEEPER_LAIR }
                        })

                        // var tts = lairatSpawn[0].ticksToSpawn
                        // var atsource = false
                        // if (creep.pos.inRangeTo(lairatSpawn[0], 8)) { atsource = true }
                        // if (atsource && (tts < 8 || tts == undefined)) {
                        //     avoidlair(creep, 6)
                        // } else {

                        if (lairatSpawn.length > 0) {
                            var tts = lairatSpawn[0].ticksToSpawn
                            var atsource = false
                            if (creep.pos.inRangeTo(lairatSpawn[0], 8)) { atsource = true }
                            if (atsource && (tts < 8 || tts == undefined)) {
                                avoidlair(creep, 6)
                                var avoidl = true
                            } else { var avoidl = false }
                        } else { avoidl = false }

                        if (avoidl) {
                        } else {

                            var container = source.pos.findInRange(FIND_STRUCTURES, 2, {
                                filter: (s) => s.structureType == STRUCTURE_CONTAINER
                                    && s.store[RESOURCE_ENERGY] > 100
                            })
                            var droppedatsource = source.pos.findInRange(FIND_DROPPED_RESOURCES, 3)
                            if (source) {
                                var dropped = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 5)
                                if (dropped.length > 0) {
                                    if (creep.pickup(dropped[0]) == ERR_NOT_IN_RANGE) {
                                        creep.moveTo2(dropped[0], { reusePath: 50 }, true);
                                    }
                                } else if (container.length > 0) {
                                    for (var c in container) {
                                        if (creep.withdraw(container[c], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE || ERR_NOT_ENOUGH_RESOURCES) {
                                            creep.moveTo2(container[c], { reusePath: 50 }, true)
                                        }
                                        if (creep.pos.isEqualTo(container[c].pos)) {
                                            creep.memory.harvesting = false
                                        }
                                    }
                                } else if (droppedatsource.length > 0) {
                                    creep.moveTo2(droppedatsource[0], { reusePath: 50 }, true)
                                } else {
                                    var mineronpos = source.pos.findInRange(FIND_MY_CREEPS, 1, {
                                        filter: (cr) => (cr.memory.role == 'miner')
                                    })
                                    if (mineronpos.length > 0) {
                                        creep.moveTo2(mineronpos[0].pos, { reusePath: 50 }, true)
                                    } else {
                                        var distsource = creep.pos.getRangeTo(source)
                                        if (distsource > 5) {
                                            creep.moveTo2(source, { reusePath: 5 }, true)
                                        } else if (distsource < 4) {
                                            creep.moveTo2(Game.rooms[creep.memory.home].controller, { reusePath: 1 }, true)
                                        }
                                    }

                                }
                            }
                        }
                    }
                } else {
                    creep.moveTo2(Game.getObjectById(creep.memory.spot), { reusePath: 50 })
                }
            } else {
                //----------- Ausliefern --------------
                if (creep.room.name == creep.memory.home) {
                    var targets = creep.room.find(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return (structure.structureType == STRUCTURE_SPAWN &&
                                structure.energy < structure.energyCapacity)
                        }
                    });

                    var target = creep.pos.findClosestByRange(targets)

                    if (target) {
                        if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo2(target);
                        }

                    } else if (Memory.rooms[creep.memory.home].Lager) {
                        dropptarget = Game.getObjectById(Memory.rooms[creep.memory.home].Lager)
                        if (creep.transfer(dropptarget, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo2(dropptarget, { reusePath: 50 })
                        }
                    } else {
                        var xspawn = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                            filter: (structure) => {
                                return (structure.structureType == STRUCTURE_SPAWN);
                            }
                        });
                        if (xspawn) {
                            if (xspawn.length > 0) {
                                creep.moveTo2(xspawn[0], { reusePath: 50 })
                            }
                        }
                    }
                } else {
                    var avoid = avoidkeeper(creep, 4)
                    if (!avoid) {
                        var xspawn = Game.rooms[creep.memory.home].find(FIND_STRUCTURES, {
                            filter: (structure) => {
                                return (structure.structureType == STRUCTURE_SPAWN);
                            }
                        });
                        creep.moveTo2(xspawn[0], { maxOps: 5000, reusePath: 100 })
                    }
                }
            }
        }
    }
};

module.exports = rolecarry;
