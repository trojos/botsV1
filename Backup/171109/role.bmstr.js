var roleBmstr = {

    /** @param {Creep} creep **/
    run: function (creep) {
        if (creep.room.name == creep.memory.targetroom) {

            if (creep.memory.working && creep.carry.energy == 0) {
                creep.memory.working = false;
                creep.memory.onsite = false;
            }
            if (!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
                creep.memory.working = true;
                creep.memory.onsite = false;
            }
            var dflag = creep.room.find(FIND_FLAGS, {
                filter: fl => fl.name == 'dismantle'
            })
            if (dflag.length > 0) {
                var dstruc = dflag[0].pos.lookFor(LOOK_STRUCTURES)
            }

            if (creep.memory.working) {
                var targets = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);

                var targetsext = creep.room.find(FIND_CONSTRUCTION_SITES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_CONTAINER ||
                            structure.structureType == STRUCTURE_SPAWN ||
                            structure.structureType == STRUCTURE_EXTENSION
                        )
                    }
                });
                var notfall = false
                if (creep.room.memory.notfall) {    //Wenn der Raum im Notfallmodus wird statt bauen oder reparieren zuerst der Spawn beliefert
                    console.log('bmstr in ' + creep.room.name + ' im Notfallmodus!')
                    notfall = true
                    var targets = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return (structure.structureType == STRUCTURE_EXTENSION ||
                                structure.structureType == STRUCTURE_SPAWN) && structure.energy < structure.energyCapacity;
                        }
                    });
                    if (targets) {
                        if (creep.transfer(targets, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo2(targets, { visualizePathStyle: { stroke: '#58FA82' }, reusePath: 25 });
                        }
                    } else { notfall = false }
                }
                if (notfall == false) {
                    //------- BUILD ---------
                    //überprüfung kritische Reperatur hits < 3000 oder weniger als 70% hits
                    const krittargets = creep.room.find(FIND_STRUCTURES, {
                        filter: object => ((object.structureType != STRUCTURE_WALL && object.structureType != STRUCTURE_RAMPART && (object.hits / object.hitsMax < 0.70))
                            || (object.structureType == STRUCTURE_RAMPART && (object.hits < 10000))) //&& object.pos != flags[dismantle].pos)
                    });
                    //console.log(Game.flags.dismantle.pos)
                    //console.log(creep.room.name + ' : ' + krittargets)

                    if (krittargets.length > 0 && !creep.memory.onsite) {
                        if (creep.repair(krittargets[0]) == ERR_NOT_IN_RANGE) {
                            creep.moveTo2(krittargets[0], { visualizePathStyle: { stroke: '#FA8258' }, reusePath: 25 });
                        } else {
                            creep.memory.onsite = true
                        }
                        //zuerst container/spawn und extensions 
                    } else if (targetsext.length && krittargets.length == 0 && !creep.memory.onsite) {
                        if (creep.build(targetsext[0]) == ERR_NOT_IN_RANGE) {
                            creep.moveTo2(targetsext[0], { visualizePathStyle: { stroke: '#FA8258' }, reusePath: 25 });
                        }
                    }
                    else {
                        //dann Rest
                        if (targets != undefined && krittargets.length == 0 && !creep.memory.onsite) {
                            if (creep.build(targets) == ERR_NOT_IN_RANGE) {
                                creep.moveTo2(targets, { visualizePathStyle: { stroke: '#FA8258' }, reusePath: 25 });
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
                                        creep.moveTo2(closesttarget, { visualizePathStyle: { stroke: '#FA8258' }, reusePath: 25 });
                                    } else {
                                        creep.memory.onsite = true
                                    }
                                } else {
                                    var standon = creep.pos.lookFor(LOOK_STRUCTURES, {       // Wenn nichts zu tun wird geprüft ob creep auf container steht
                                        filter: stru => stru.structureType == STRUCTURE_CONTAINER
                                    })
                                    if (standon.length > 0) {
                                        //console.log(creep.room + '  ' + creep.name + ' nichts zu tun ' + standon)
                                        creep.moveTo(creep.room.controller.pos)                 // wenn ja, bewegt er sich richtung controller damit platz für miner frei ist
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
                                        creep.moveTo2(targets[0], { visualizePathStyle: { stroke: '#FA8258' }, reusePath: 25 });
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
            }
            else {
                //-------- DISMANTLE --------

                if (dflag.length > 0) {
                    var dstruc = dflag[0].pos.lookFor(LOOK_STRUCTURES)
                    if (dstruc.length > 0) {
                        console.log(creep.name + ' dismantle: ' + dstruc[0] + ' --- hits: ' + dstruc[0].hits + ' / ' + dstruc[0].hitsMax)
                        if (creep.pos.isNearTo(dstruc[0])) {
                            var cr = creep.dismantle(dstruc[0])
                        } else {
                            var er = creep.moveTo2(dstruc[0], { reusePath: 25, maxRooms: 1 });
                        }
                    }
                } else {
                    //-------- HARVEST ----------
                    var dropped = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 5, {
                        filter: dropp => dropp.amount > 24
                    })
                    if (dropped.length > 0) {
                        if (creep.pickup(dropped[0]) == ERR_NOT_IN_RANGE) {
                            creep.moveTo2(dropped[0], { reusePath: 25 });
                        }
                    } else {
                        var container = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                            filter: (s) => (s.structureType == STRUCTURE_CONTAINER || s.structureType == STRUCTURE_STORAGE)
                                && s.store[RESOURCE_ENERGY] > 50
                        })
                        if (container) {
                            if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                creep.moveTo2(container, { reusePath: 25 })
                            }
                        } else {
                            var source = creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE)
                            if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                                creep.moveTo2(source, { reusePath: 25 })
                            }
                            var standon = creep.pos.isNearTo(FIND_STRUCTURES, {       // Wenn Creep minert wird geprüft ob creep auf container steht
                                filter: stru => stru.structureType == STRUCTURE_CONTAINER
                            })
                            //console.log(creep.room + '  ' + creep.name + ' minert  ' + standon)
                            if (standon) {
                                creep.moveTo(creep.room.controller.pos)                 // wenn ja, bewegt er sich richtung controller damit platz für miner frei ist
                            }
                            if (source == undefined) {
                                creep.memory.working = true;
                            }
                        }
                    }
                }
            }
        } else {
            // ------ Gehe zu targetrom -------
            targetpos = new RoomPosition(25, 25, creep.memory.targetroom)
            creep.moveTo(targetpos, { maxOps: 5000, reusePath: 50 })
        }
    }
};

module.exports = roleBmstr;
