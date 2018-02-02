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

        var failsafe = false
        var source = Game.getObjectById(creep.memory.spot)  //Sourcespot oder Link!!!

        if (Game.rooms[creep.memory.targetroom] == undefined) {
            creep.moveTo2(creep.room.findExitTo(creep.memory.targetroom), { reusePath: 50 })
        } else {


            //---------- Energy besorgen  -------------
            if (creep.memory.harvesting) {
                if (creep.memory.home == creep.memory.targetroom) {
                    var container = source.pos.findInRange(FIND_STRUCTURES, 2, {
                        filter: (s) => s.structureType == STRUCTURE_CONTAINER || s.structureType == STRUCTURE_LINK
                            //&& s.store[RESOURCE_ENERGY] > 0 
                            && s.id != creep.room.memory.Lager
                    })
                } else {
                    var container = source.pos.findInRange(FIND_STRUCTURES, 2, {
                        filter: (s) => s.structureType == STRUCTURE_CONTAINER
                            && s.store[RESOURCE_ENERGY] > 100
                            && s.id != creep.room.memory.Lager
                    })
                }
                var droppedatsource = source.pos.findInRange(FIND_DROPPED_RESOURCES, 3)         //Wenn kein Resourcen bei den Spots erfolgt ein Failsafe:
                var stored = 0                                                                  //Energy wird vom Lager gehohlt und damit Spawn/Ext/Tower bedient
                for (var i in container) {
                    if (container[i].structureType == STRUCTURE_CONTAINER) {
                        stored = stored + container[i].store[RESOURCE_ENERGY]
                    } else {
                        stored = stored + container[i].energy
                    }
                }
                if (stored == 0 && droppedatsource.length <= 0) {
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
                                if (creep.withdraw(container[c], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE || ERR_NOT_ENOUGH_RESOURCES) {
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
                                var mineronpos = source.pos.findInRange(FIND_MY_CREEPS, 1 ,{
                                    filter: (cr) => (cr.memory.role == 'miner')
                                })
                                if (mineronpos.length > 0) { 
                                    creep.moveTo2(mineronpos)
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
            } else {        //----------- Ausliefern --------------

                var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return ((structure.structureType == STRUCTURE_EXTENSION ||
                            structure.structureType == STRUCTURE_SPAWN ||
                            structure.structureType == STRUCTURE_LAB) &&
                            structure.energy < structure.energyCapacity) ||
                            (structure.structureType == STRUCTURE_TERMINAL &&
                                structure.store.energy < 10000) ||
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
            }
        }
    }
};

module.exports = rolecarry;
