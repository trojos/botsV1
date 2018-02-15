var rolecarry = {

    /** @param {Creep} creep **/
    run: function (creep) {

        if (!creep.memory.harvesting && creep.carry.energy == 0) {
            creep.memory.harvesting = true;
        }
        if (creep.memory.harvesting && _.sum(creep.carry) == creep.carryCapacity) {
            creep.memory.harvesting = false;
        }
        //---------- Energy besorgen  -------------
        if (creep.memory.harvesting) {
            if (creep.memory.spotpos == undefined) {
                var source = Game.getObjectById(creep.memory.spot)
                if (source) {
                    var sourcepos = source.pos
                    creep.memory.spotpos = source.pos
                } else {
                    var sourcepos = new RoomPosition(25, 25, creep.memory.targetroom)
                }
            } else {
                var sourcepos = new RoomPosition(creep.memory.spotpos.x, creep.memory.spotpos.y, creep.memory.spotpos.roomName)
            }
            if (creep.room.name == creep.memory.targetroom) {
                //var source = Game.getObjectById(creep.memory.spot)  //Sourcespot oder Link!!!
                var container = sourcepos.findInRange(FIND_STRUCTURES, 2, {
                    filter: (s) => s.structureType == STRUCTURE_CONTAINER
                        && s.store[RESOURCE_ENERGY] > 100
                        && s.id != creep.room.memory.Lager
                })

                var droppedatsource = sourcepos.findInRange(FIND_DROPPED_RESOURCES, 3)
                var stored = 0
                var dropped = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 5)

                if (dropped.length > 0) {
                    if (creep.pickup(dropped[0]) == ERR_NOT_IN_RANGE) {
                        creep.moveTo2(dropped[0], { reusePath: 50 });
                    }
                    return;
                } else if (container.length > 0) {
                    for (var c in container) {
                        if (creep.pos.isNearTo(container[c])) {
                            creep.withdraw(container[c], RESOURCE_ENERGY)
                        } else {
                            creep.moveTo2(container[c], { reusePath: 50 })
                        }
                        if (creep.pos.isEqualTo(container[c].pos)) {
                            creep.memory.harvesting = false
                        }
                    }
                    return;
                } else if (droppedatsource.length > 0) {
                    creep.moveTo2(droppedatsource[0], { reusePath: 50 })
                    return;
                } else {
                    var mineronpos = sourcepos.findInRange(FIND_MY_CREEPS, 1, {
                        filter: (cr) => (cr.memory.role == 'miner')
                    })
                    if (mineronpos.length > 0) {
                        creep.moveTo2(mineronpos[0].pos)
                    } else {
                        var distsource = creep.pos.getRangeTo(sourcepos)
                        if (distsource > 5) {
                            creep.moveTo2(sourcepos)
                        } else if (distsource < 5) {
                            creep.moveTo(creep.room.controller)
                        }
                    }
                }
            } else {
                if (Game.rooms[creep.memory.targetroom] == undefined) {
                    targetpos = new RoomPosition(25, 25, creep.memory.targetroom)
                    creep.moveTo2(targetpos, { maxOps: 5000, reusePath: 100 })
                } else {
                    //var source = Game.getObjectById(creep.memory.spot)
                    creep.moveTo2(sourcepos, { maxOps: 5000, reusePath: 100 })
                }
            }
        } else {        //----------- Ausliefern --------------
            if (creep.room.name == creep.memory.home) {
                if (_.sum(creep.carry) == creep.carry.energy) {

                    var targets = []
                    // var targets = creep.room.find(FIND_STRUCTURES, {
                    //     filter: (structure) => {
                    //         return ((structure.structureType == STRUCTURE_EXTENSION ||
                    //             structure.structureType == STRUCTURE_SPAWN ||
                    //             structure.structureType == STRUCTURE_LAB) &&
                    //             structure.energy < structure.energyCapacity) ||
                    //             (structure.structureType == STRUCTURE_TERMINAL &&
                    //                 structure.store.energy < 20000 && structure.isActive()) ||
                    //             (structure.structureType == STRUCTURE_TOWER &&
                    //                 structure.energy < 900)
                    //     }
                    // });
                    if (Memory.rooms[creep.memory.home].links.center[0]) { var centerli = true; var centerlinkid = Memory.rooms[creep.memory.home].links.center[0] } else { var centerli = false }
                    if (Memory.rooms[creep.memory.home].links.upgrade[0]) { var upgradeli = true; var upgradelinkid = Memory.rooms[creep.memory.home].links.upgrade[0] } else { var upgradeli = false }

                    var links = creep.pos.findInRange(FIND_STRUCTURES, 3, {
                        filter: (structure) => {
                            return (structure.structureType == STRUCTURE_LINK) &&
                                structure.energy < structure.energyCapacity - 100 &&
                                structure.id != Memory.rooms[creep.room.name].links.center;
                        }
                    });
                    if (links.length > 0) {
                        targets.push(links[0])
                    }
                    // if (centerli && upgradeli) {
                    //     var centerlink = Game.getObjectById(centerlinkid)
                    //     var upgradelink = Game.getObjectById(upgradelinkid)
                    //     if (upgradelink.energy < 400 && centerlink.energy < 800 - upgradelink.energy) {
                    //         targets.push(centerlink)
                    //     }
                    // }

                    var target = creep.pos.findClosestByRange(targets)
                    if (target) {
                        if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo2(target);
                        }
                        return;
                    } else if (Memory.rooms[creep.memory.home].Lager) {
                        dropptarget = Game.getObjectById(Memory.rooms[creep.memory.home].Lager)
                        if (creep.transfer(dropptarget, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo2(dropptarget, { reusePath: 50 })
                        }
                        return;
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
                    if (creep.room.terminal) {
                        if (creep.pos.isNearTo(creep.room.terminal)) {
                            for (const res in creep.carry) {
                                creep.transfer(creep.room.terminal, res) == ERR_NOT_IN_RANGE
                            }
                        } else {
                            creep.moveTo2(creep.room.terminal)
                        }
                        return;
                    } else if (Memory.rooms[creep.memory.home].Lager) {
                        dropptarget = Game.getObjectById(Memory.rooms[creep.memory.home].Lager)
                        if (creep.pos.isNearTo(dropptarget)) {
                            for (const res in creep.carry) {
                                creep.transfer(dropptarget, res) == ERR_NOT_IN_RANGE
                            }
                        } else {
                            creep.moveTo2(dropptarget)
                        }
                    }
                }
            } else {

                if (Game.rooms[creep.memory.home].storage) {
                    creep.moveTo2(Game.rooms[creep.memory.home].storage)
                } else {
                    creep.moveTo2(Game.getObjectById(Memory.rooms[creep.memory.home].Spawn))
                }
            }
        }

    }
};

module.exports = rolecarry;
