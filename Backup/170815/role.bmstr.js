var roleBmstr = {

    /** @param {Creep} creep **/
    run: function (creep) {
        if (creep.room.name == creep.memory.targetroom) {

            if (creep.memory.working && creep.carry.energy == 0) {
                creep.memory.working = false;
                creep.memory.onsite = false;
                creep.say('🔄 harvest');
            }
            if (!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
                creep.memory.working = true;
                creep.memory.onsite = false;
                creep.say('🚧 working');
            }

            if (creep.memory.working) {
                var targets = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);

                var targetsext = creep.room.find(FIND_CONSTRUCTION_SITES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_CONTAINER)
                    }
                });
                //------- BUILD ---------
                //überprüfung kritische Reperatur hits < 3000
                const krittargets = creep.room.find(FIND_STRUCTURES, {
                    filter: object => object.hits < 3000
                });

                //zuerst container
                if (targetsext.length && krittargets.lenght == null) {
                    if (creep.build(targetsext[0]) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targetsext[0], { visualizePathStyle: { stroke: '#FA8258' } });
                    }
                }
                else {
                    //dann Rest
                    if (targets != undefined && krittargets.lenght == null) {
                        if (creep.build(targets) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(targets, { visualizePathStyle: { stroke: '#FA8258' } });
                        }
                    } else {
                        // wenn nichts zu bauen:
                        // ------- REPAIR -------
                        if (creep.memory.working && !creep.memory.onsite) {
                            const targets = creep.room.find(FIND_STRUCTURES, {
                                filter: object => object.hits < object.hitsMax - 800
                            });

                            targets.sort((a, b) => a.hits - b.hits);
                            if (targets[0] == undefined) {  /// ???
                                creep.memory.working = false
                            }
                            if (targets.length > 0) {
                                var toptargets = creep.room.find(FIND_STRUCTURES, {
                                    filter: object => object.hits == targets[0].hits
                                });
                                var closesttarget = creep.pos.findClosestByRange(toptargets)
                                if (creep.repair(closesttarget) == ERR_NOT_IN_RANGE) {
                                    creep.moveTo(closesttarget, { visualizePathStyle: { stroke: '#FA8258' } });
                                } else {
                                    creep.memory.onsite = true
                                }
                            } else {
                                creep.memory.onsite = false
                            }
                        }
                        else if (creep.memory.working && creep.memory.onsite) {
                            creep.say('onsite')
                            const targets = creep.pos.findInRange(FIND_STRUCTURES, 3, {
                                filter: object => object.hits < object.hitsMax
                            });
                            targets.sort((a, b) => a.hits - b.hits);
                            if (targets.length > 0) {
                                if (creep.repair(targets[0]) == ERR_NOT_IN_RANGE) {
                                    creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#FA8258' } });
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
            }
            else {
                //-------- harvest ----------
                    var dropped = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 5, {
                        filter: dropp => dropp.amount > 100
                    })
                    if (dropped.length > 0) {
                        if (creep.pickup(dropped[0]) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(dropped[0], { visualizePathStyle: { stroke: '#58FA82' } });
                        }
                    } else {
                        var container = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                            filter: (s) => (s.structureType == STRUCTURE_CONTAINER || s.structureType == STRUCTURE_STORAGE)
                                && s.store[RESOURCE_ENERGY] > 0
                        })
                        if (container) {
                            if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(container)
                            }
                        } else {
                            var source = creep.pos.findClosestByRange(FIND_SOURCES)
                            if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(source)
                            }
                        }
                    }
            }
        } else {
            // ------ Gehe zu targetrom -------
            creep.moveTo(creep.pos.findClosestByPath(creep.room.findExitTo(creep.memory.targetroom)))
        }
    }
};

module.exports = roleBmstr;
