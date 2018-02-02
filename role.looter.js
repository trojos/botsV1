var rolelooter = {

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
            if (creep.room.name == creep.memory.targetroom) {

                var dropped = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES)
                if (dropped) {
                    if (creep.pickup(dropped) == ERR_NOT_IN_RANGE) {
                        creep.moveTo2(dropped, { reusePath: 50 });
                    }
                } else {
                    creep.memory.role = 'destruct'
                }
            } else {
                targetpos = new RoomPosition(25, 25, creep.memory.targetroom)
                creep.moveTo2(targetpos, { maxOps: 5000, reusePath: 100 })

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
                                structure.store.energy < 20000 && structure.isActive()) ||
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

module.exports = rolelooter;
