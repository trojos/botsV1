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


var roleBmstr = {

    /** @param {Creep} creep **/
    run: function (creep) {
        if (creep.room.name == creep.memory.targetroom) {
            var lairatSpawn = creep.pos.findInRange(FIND_HOSTILE_STRUCTURES, 5, {
                filter: { structureType: STRUCTURE_KEEPER_LAIR }
            })
            if (lairatSpawn.length > 0) { var tts = lairatSpawn[0].ticksToSpawn } else { var tts = 10 }
            if (tts < 9) {
                avoidlair(creep, 8)
            } else {

                if (creep.memory.working && creep.carry.energy == 0) {
                    creep.memory.working = false;
                    creep.memory.onsite = false;
                }
                if (!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
                    creep.memory.working = true;
                    creep.memory.onsite = false;
                }

                if (creep.memory.working) {
                    var targets = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);

                    var targetsext = creep.room.find(FIND_CONSTRUCTION_SITES, {
                        filter: (structure) => {
                            return (structure.structureType == STRUCTURE_CONTAINER)
                        }
                    });

                    //------- BUILD ---------
                    //überprüfung kritische Reperatur hits < 3000 oder weniger als 70% hits
                    const krittargets = creep.room.find(FIND_STRUCTURES, {
                        filter: object => ((object.structureType != STRUCTURE_WALL && object.structureType != STRUCTURE_RAMPART && (object.hits / object.hitsMax < 0.70))
                            || (object.structureType == STRUCTURE_RAMPART && (object.hits < 10000))) //&& object.pos != flags[dismantle].pos)
                    });
                    if (krittargets.length > 0 && !creep.memory.onsite) {
                        if (creep.repair(krittargets[0]) == ERR_NOT_IN_RANGE) {
                            creep.moveTo2(krittargets[0], { visualizePathStyle: { stroke: '#FA8258' }, reusePath: 25 }, true);
                        } else {
                            creep.memory.onsite = true
                        }
                        //zuerst container/spawn und extensions 
                    } else if (targetsext.length && krittargets.length == 0 && !creep.memory.onsite && 1 == 2) {
                        if (creep.build(targetsext[0]) == ERR_NOT_IN_RANGE) {
                            creep.moveTo2(targetsext[0], { visualizePathStyle: { stroke: '#FA8258' }, reusePath: 25 }, true);
                        }
                    }
                    else {
                        //dann Rest
                        if (targets != undefined && krittargets.length == 0 && !creep.memory.onsite) {
                            if (creep.build(targets) == ERR_NOT_IN_RANGE) {
                                creep.moveTo2(targets, { visualizePathStyle: { stroke: '#FA8258' }, reusePath: 25 }, true);
                            }
                        } else {
                            // wenn nichts zu bauen:
                            // ------- REPAIR -------
                            if (creep.memory.working && !creep.memory.onsite) {
                                const targets = creep.room.find(FIND_STRUCTURES, {
                                    filter: object => object.hits < object.hitsMax - 400
                                });

                                targets.sort((a, b) => a.hits - b.hits);
                                if (targets[0] == undefined) {  /// ???
                                    if (creep.carry.energy == creep.carryCapacity) {
                                        creep.memory.working = true
                                    } else {
                                        creep.memory.working = false
                                    }
                                }
                                if (targets.length > 0) {
                                    var toptargets = creep.room.find(FIND_STRUCTURES, {
                                        filter: object => object.hits == targets[0].hits
                                    });
                                    var closesttarget = creep.pos.findClosestByRange(toptargets)
                                    if (creep.repair(closesttarget) == ERR_NOT_IN_RANGE) {
                                        creep.moveTo2(closesttarget, { visualizePathStyle: { stroke: '#FA8258' }, reusePath: 25 }, true);
                                    } else {
                                        creep.memory.onsite = true
                                    }
                                } else {
                                    var standon = creep.pos.lookFor(LOOK_STRUCTURES, {       // Wenn nichts zu tun wird geprüft ob creep auf container steht
                                        filter: stru => stru.structureType == STRUCTURE_CONTAINER
                                    })
                                    //console.log(creep.pos.roomName)
                                    if (standon.length > 0) {
                                        //console.log(creep.room + '  ' + creep.name + ' nichts zu tun ' + standon)
                                        creep.moveTo2(creep.room.controller.pos, { reusePath: 5 }, true)                 // wenn ja, bewegt er sich richtung controller damit platz für miner frei ist
                                    }
                                }
                            }
                            else if (creep.memory.working && creep.memory.onsite) {
                                const targets = creep.pos.findInRange(FIND_STRUCTURES, 3, {
                                    filter: object => object.hits < object.hitsMax
                                });
                                targets.sort((a, b) => a.hits - b.hits);
                                if (targets.length > 0) {
                                    if (creep.repair(targets[0]) == ERR_NOT_IN_RANGE) {
                                        creep.moveTo2(targets[0], { visualizePathStyle: { stroke: '#FA8258' }, reusePath: 25 }, true);
                                    } else {
                                        creep.memory.onsite = true
                                    }
                                } else {
                                    creep.memory.onsite = false

                                }
                            }
                            /// ----- repair ende -----
                        }
                    }
                    avoidkeeper(creep, 4)

                }
                else {
                    //-------- HARVEST ----------
                    /*                     var harvesttarget = []
                                        var dropped = creep.room.find(FIND_DROPPED_RESOURCES)
                                        dropped.forEach(drop => {
                                            harvesttarget.push({ id: drop.id, type: 'drop', amount: drop.amount, pos: drop.pos, dist: creep.pos.getRangeTo(drop.pos) })
                                        })
                                        var container = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                                            filter: (s) => (s.structureType == STRUCTURE_CONTAINER || s.structureType == STRUCTURE_STORAGE)
                                                && s.store[RESOURCE_ENERGY] > 50
                                        })
                                        container.forEach(drop => {
                                            harvesttarget.push({ id: drop.id, type: 'struc', amount: drop.store[RESOURCE_ENERGY], pos: drop.pos, dist: creep.pos.getRangeTo(drop.pos) })
                                        })
                                        console.log(JSON.stringify(harvesttarget)) */

                    var dropped = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 4, {
                        filter: dropp => dropp.amount > 60 && dropp.resourceType == RESOURCE_ENERGY
                    })
                    if (dropped.length < 1) {
                        var container = creep.pos.findInRange(FIND_STRUCTURES, 10, {
                            filter: (s) => s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 1000
                        })
                        if (container.length > 0) {
                            if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                creep.moveTo2(container, { reusePath: 25 }, true)
                            }
                        } else {
                            var dropped = creep.room.find(FIND_DROPPED_RESOURCES, {
                                filter: dropp => dropp.amount > (creep.carryCapacity * 1.1) && dropp.resourceType == RESOURCE_ENERGY
                            })
                        }
                    }
                    if (dropped.length > 0) {
                        if (creep.pickup(dropped[0]) == ERR_NOT_IN_RANGE) {
                            creep.moveTo2(dropped[0], { reusePath: 25 }, true);
                        }
                    } else {
                        var container = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                            filter: (s) => (s.structureType == STRUCTURE_CONTAINER || s.structureType == STRUCTURE_STORAGE)
                                && s.store[RESOURCE_ENERGY] > 50
                        })
                        if (container) {
                            if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                creep.moveTo2(container, { reusePath: 25 }, true)
                            }
                        } else {
                            var source = creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE)
                            if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                                creep.moveTo2(source, { reusePath: 25 }, true)
                            }

                            var miner = creep.pos.findInRange(FIND_MY_CREEPS, 3, {   // Wenn Creep minert wird geprüft ob creep auf container steht
                                filter: cr => cr.memory.role == 'miner'
                            })
                            if (miner.length > 0) {
                                var standon = creep.pos.isNearTo(FIND_STRUCTURES, {
                                    filter: stru => stru.structureType == STRUCTURE_CONTAINER
                                })
                                if (standon) {
                                    creep.moveTo2(creep.room.controller.pos, { reusePath: 5 }, true)                // wenn ja, bewegt er sich richtung controller damit platz für miner frei ist
                                }
                            }
                            if (source == undefined) {
                                creep.memory.working = true;
                            }
                        }

                    }
                    avoidkeeper(creep, 4)
                }
            }

        } else {
            // ------ Gehe zu targetrom -------
            targetpos = new RoomPosition(25, 25, creep.memory.targetroom)
            creep.moveTo2(targetpos, { maxOps: 5000, reusePath: 100 })
        }
    }
};

module.exports = roleBmstr;
