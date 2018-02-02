var rolecarry = {

    /** @param {Creep} creep **/
    run: function (creep) {

        if (!creep.memory.harvesting && creep.carry.energy == 0) {
            creep.memory.harvesting = true;
        }
        if (creep.memory.harvesting && _.sum(creep.carry) == creep.carryCapacity) {

            if (creep.memory.statistik || Memory.Statistik[creep.memory.targetroom] != undefined) {
                Memory.Statistik[creep.memory.targetroom].aktuell.energy = Memory.Statistik[creep.memory.targetroom].aktuell.energy + creep.carry.energy
            }
            creep.memory.harvesting = false;
        }

        var failsafe = false
        var source = Game.getObjectById(creep.memory.spot)  //Sourcespot oder Link!!!
        if (Memory.rooms[creep.memory.home].links.center[0]) { var centerli = true; var centerlinkid = Memory.rooms[creep.memory.home].links.center[0] } else { var centerli = false }
        if (Memory.rooms[creep.memory.home].links.upgrade[0]) { var upgradeli = true; var upgradelinkid = Memory.rooms[creep.memory.home].links.upgrade[0] } else { var upgradeli = false }


        //---------- Energy besorgen  -------------
        if (creep.memory.harvesting) {
            if (creep.room.name == creep.memory.targetroom) {
                if (creep.memory.home == creep.memory.targetroom) {
                    var container = source.pos.findInRange(FIND_STRUCTURES, 2, {
                        filter: (s) => s.structureType == STRUCTURE_CONTAINER
                            //&& s.store[RESOURCE_ENERGY] > 0 
                            && s.id != creep.room.memory.Lager
                    })
                    var link = source.pos.findInRange(FIND_STRUCTURES, 2, {
                        filter: (s) => s.structureType == STRUCTURE_LINK
                    })
                    if (link.length > 0) {
                        container.push(link[0])
                    }
                    var efterm = false
                    if (creep.room.terminal) {
                        if (creep.room.terminal.store[RESOURCE_ENERGY] > 22000) {
                            efterm = true
                        }
                    }
                } else {
                    var container = source.pos.findInRange(FIND_STRUCTURES, 2, {
                        filter: (s) => s.structureType == STRUCTURE_CONTAINER
                            && s.store[RESOURCE_ENERGY] > 100
                            && s.id != creep.room.memory.Lager
                    })
                }
                var droppedatsource = source.pos.findInRange(FIND_DROPPED_RESOURCES, 3)         //Wenn kein Resourcen bei den Spots erfolgt ein Failsafe:
                var stored = 0
                //Energy wird vom Lager gehohlt und damit Spawn/Ext/Tower bedient

                for (var i in container) {
                    if (container[i].structureType == STRUCTURE_CONTAINER) {
                        stored = stored + container[i].store[RESOURCE_ENERGY]
                    } else {
                        stored = stored + container[i].energy
                    }
                }

                if (efterm) {
                    if (creep.withdraw(creep.room.terminal, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo2(creep.room.terminal, { reusePath: 50 })
                        return;
                    }
                }
                if (stored == 0 && droppedatsource.length <= 0 && !efterm) {
                    if (Memory.rooms[creep.memory.home].Lager) {
                        failsafe = true
                    } else { failsafe = false }                                                  //Wenn kein Lager vorhanden gibts auch kein Failsafe!
                }
                if (source) {
                    if (failsafe && creep.memory.home == creep.memory.targetroom) {
                        failtarget = Game.getObjectById(Memory.rooms[creep.memory.home].Lager)
                        if (creep.withdraw(failtarget, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo2(failtarget, { reusePath: 50 })
                        }

                    } else {
                        var dropped = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 5)
                        if (dropped.length > 0) {
                            if (creep.pickup(dropped[0]) == ERR_NOT_IN_RANGE) {
                                creep.moveTo2(dropped[0], { reusePath: 50 });
                            }
                        } else if (container.length > 0) {
                            for (var c in container) {
                                if (creep.pos.isNearTo(container[c])) {
                                    if (container[c].structureType == STRUCTURE_LINK && centerli && upgradeli){
                                        var centerlink = Game.getObjectById(centerlinkid)
                                        var upgradelink = Game.getObjectById(upgradelinkid)
                                        if (upgradelink.energy >= 400) {
                                            creep.withdraw(container[c], RESOURCE_ENERGY)
                                        }
                                    } else {
                                    creep.withdraw(container[c], RESOURCE_ENERGY)
                                    }
                                } else {
                                    creep.moveTo2(container[c], { reusePath: 50 })
                                }
                                if (creep.pos.isEqualTo(container[c].pos)) {
                                    creep.memory.harvesting = false
                                }
                            }
                        } else if (droppedatsource.length > 0) {
                            creep.moveTo2(droppedatsource[0], { reusePath: 50 })
                        } else {
                            if (creep.memory.home != creep.memory.targetroom) {
                                var mineronpos = source.pos.findInRange(FIND_MY_CREEPS, 1, {
                                    filter: (cr) => (cr.memory.role == 'miner')
                                })
                                if (mineronpos.length > 0) {
                                    creep.moveTo2(mineronpos[0].pos)
                                } else {
                                    var distsource = creep.pos.getRangeTo(source)
                                    if (distsource > 5) {
                                        creep.moveTo2(source)
                                    } else if (distsource < 5) {
                                        creep.moveTo(creep.room.controller)
                                    }
                                }
                            }
                        }
                    }
                }
            } else {
                if (Game.rooms[creep.memory.targetroom] == undefined) {
                    targetpos = new RoomPosition(25, 25, creep.memory.targetroom)
                    creep.moveTo2(targetpos, { maxOps: 5000, reusePath: 100 })
                } else {
                    creep.moveTo2(source, { maxOps: 5000, reusePath: 100 })
                }
            }
        } else {        //----------- Ausliefern --------------
            if (_.sum(creep.carry) == creep.carry.energy) {
                var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return ((structure.structureType == STRUCTURE_EXTENSION ||
                            structure.structureType == STRUCTURE_SPAWN ||
                            structure.structureType == STRUCTURE_LAB) &&
                            structure.energy < structure.energyCapacity) ||
                            (structure.structureType == STRUCTURE_TERMINAL &&
                                structure.store.energy < 20000) ||
                            (structure.structureType == STRUCTURE_TOWER &&
                                structure.energy < 900)
                    }
                });

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
                if (centerli && upgradeli) {
                    var centerlink = Game.getObjectById(centerlinkid)
                    var upgradelink = Game.getObjectById(upgradelinkid)
                    if (upgradelink.energy < 400 && centerlink.energy < 800 - upgradelink.energy) {
                        targets.push(centerlink)
                    }
                }

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
                if (creep.room.terminal) {
                    if (creep.pos.isNearTo(creep.room.terminal)) {
                        for (const res in creep.carry) {
                            creep.transfer(creep.room.terminal, res) == ERR_NOT_IN_RANGE
                        }
                    } else {
                        creep.moveTo2(creep.room.terminal)
                    }
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
        }

    }
};

module.exports = rolecarry;
