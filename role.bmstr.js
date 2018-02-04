function findwork(creep) {
    var worksite
    //------- KRITTTARGETS -------
    //überprüfung kritische Reperatur hits < 3000 oder weniger als 50% hits
    const krittargets = creep.room.find(FIND_STRUCTURES, {
        filter: object => ((object.structureType != STRUCTURE_WALL && object.structureType != STRUCTURE_RAMPART && (object.hits / object.hitsMax < 0.50))
            || (object.structureType == STRUCTURE_RAMPART && (object.hits < 10000)))
    });
    if (krittargets.length > 0) {
        worksite = { type: 'repair', site: krittargets[0].id, pos: krittargets[0].pos }
        return worksite
    }
    //------- BUILD -------
    // Zuerst Container, Spawn und Extensions
    const targetsext = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES, {
        filter: (structure) => {
            return (structure.structureType == STRUCTURE_CONTAINER ||
                structure.structureType == STRUCTURE_SPAWN ||
                structure.structureType == STRUCTURE_EXTENSION
            )
        }
    });
    if (targetsext) {
        worksite = { type: 'build', site: targetsext.id, pos: targetsext.pos }
        return worksite
    }
    // Dann Rest
    const target = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
    if (target) {
        worksite = { type: 'build', site: target.id, pos: target.pos }
        return worksite
    }
    //------- REPAIR -------
    var reptargets = creep.room.find(FIND_STRUCTURES, {
        filter: object => (object.hits / object.hitsMax < 0.70) //object.hits < object.hitsMax - 400
    });
    if (reptargets.length > 1) {            // Wenn mehr als ein Ziel zum reparieren
        reptargets.sort((a, b) => a.hits - b.hits);     //Sortieren nach hits
        var toptargets = creep.room.find(FIND_STRUCTURES, {         //Finde alle mit den gleichen hits  ---> TODO statt find _.filter
            filter: object => object.hits == reptargets[0].hits
        });
        var closesttarget = creep.pos.findClosestByRange(toptargets)    //Das naheliegendste suchen
        worksite = { type: 'repair', site: closesttarget.id, pos: closesttarget.pos }

        return worksite
    } else if (reptargets.length == 1) {   //Wenn nur eins dann ist das die site
        worksite = { type: 'repair', site: reptargets[0].id, pos: reptargets[0].pos }

        return worksite
    }

    worksite = { type: 'wait', tick: Game.time }
    return worksite

}


var roleBmstr = {

    /** @param {Creep} creep **/
    run: function (creep) {
        if (creep.room.name == creep.memory.targetroom) {

            if (creep.memory.working && creep.carry.energy == 0) {
                creep.memory.working = false;
                creep.memory.onsite = false;
                delete creep.memory.onsitetargets
            }
            if (!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
                creep.memory.working = true;
                creep.memory.onsite = false;
                delete creep.memory.onsitetargets
            }

            // var dflag = creep.room.find(FIND_FLAGS, {
            //     filter: fl => fl.name == 'dismantle'
            // })
            // if (dflag.length > 0) {
            //     var dstruc = dflag[0].pos.lookFor(LOOK_STRUCTURES)
            // }

            if (creep.memory.working) {
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

                if (!notfall) {
                    if (creep.memory.onsite) {
                        //Onsite: Creep bleibt stehen und repariert alle Ziel in Reichweite (Auch Mauern und Rampart)
                        if (creep.memory.onsitetargets == undefined) {  //Beim ersten Tick onsite werden die Ziel in Reichweite gesucht und in Memory gespeichert
                            const targets = creep.pos.findInRange(FIND_STRUCTURES, 3, {
                                filter: object => object.hits < object.hitsMax - 400
                            });
                            if (targets.length > 0) {
                                var pushtargets = []
                                targets.forEach(target => {
                                    pushtargets.push({ id: target.id, hits: target.hits, hitsMax: target.hitsMax })
                                });
                                creep.memory.onsitetargets = pushtargets
                            } else {
                                creep.memory.onsite = false
                            }
                        } else {
                            var targets = creep.memory.onsitetargets
                            //var targets = _.filter(onsitetargets, (tar) => tar.hits < tar.hitsMax)
                            if (targets.length > 0) {
                                targets.sort((a, b) => a.hits - b.hits);
                                var reptarget = Game.getObjectById(targets[0].id)
                                creep.repair(reptarget)
                                if (reptarget.hits + (creep.getActiveBodyparts(WORK) * 100) >= reptarget.hitsMax) {
                                    targets.splice(0, 1)
                                    if (targets.length > 0) {
                                        creep.memory.onsitetargets = targets
                                    } else {
                                        creep.memory.onsite = false
                                        delete creep.memory.onsitetarget
                                    }
                                } else {
                                    targets[0].hits = reptarget.hits
                                    creep.memory.onsitetargets = targets
                                }

                            } else {
                                creep.memory.onsite = false
                                delete creep.memory.onsitetargets
                            }
                        }
                        //console.log(creep.name, Game.cpu.getUsed() - CPUvor)
                    } else {
                        //delete creep.memory.worksite
                        if (creep.memory.worksite == undefined) {
                            creep.memory.worksite = findwork(creep)
                        }

                        if (creep.memory.worksite.type == 'wait') {
                            if (creep.memory.worksite.tick <= Game.time - 10) {
                                creep.memory.worksite = findwork(creep)
                            }
                            var standon = creep.pos.findInRange(FIND_STRUCTURES, 0, {       // Wenn Creep minert wird geprüft ob creep auf container steht
                                filter: stru => stru.structureType == STRUCTURE_CONTAINER
                            })
                            if (!standon) {
                                var standon = creep.pos.findInRange(FIND_CONSTRUCTION_SITES, 0, {       // Wenn kein Container dann Constructionsite für container
                                    filter: stru => stru.structureType == STRUCTURE_CONTAINER

                                })
                            }
                            if (standon.length > 0) {
                                creep.moveTo2(creep.room.controller.pos, { reusePath: 1 })                 // wenn ja, bewegt er sich richtung controller damit platz für miner frei ist
                            }
                        }

                        if (creep.memory.worksite.type == 'build') {
                            const worksite = creep.memory.worksite
                            const worksitepos = new RoomPosition(worksite.pos.x, worksite.pos.y, worksite.pos.roomName)
                            if (creep.pos.getRangeTo(worksitepos) <= 3) {
                                target = Game.getObjectById(worksite.site)
                                if (target) { creep.build(target) } else { creep.memory.worksite = findwork(creep) }
                            } else {
                                creep.moveTo2(worksitepos)
                            }
                        }

                        if (creep.memory.worksite.type == 'repair') {
                            const worksite = creep.memory.worksite

                            if (worksite.pos == undefined) {
                                //console.log(creep.name, worksite)
                                creep.memory.worksite = findwork(creep)
                            } else {
                                const worksitepos = new RoomPosition(worksite.pos.x, worksite.pos.y, worksite.pos.roomName)
                                if (creep.pos.getRangeTo(worksitepos) <= 3) {
                                    target = Game.getObjectById(worksite.site)
                                    creep.memory.onsite = true;
                                    if (target) { creep.repair(target) }
                                    delete creep.memory.worksite
                                } else {
                                    creep.moveTo2(worksitepos)
                                }
                            }
                        }
                    }
                }
            } else {
                //-------- DISMANTLE --------

                // if (dflag.length > 0) {
                //     var dstruc = dflag[0].pos.lookFor(LOOK_STRUCTURES)
                //     if (dstruc.length > 0) {
                //         console.log(creep.name + ' dismantle: ' + dstruc[0] + ' --- hits: ' + dstruc[0].hits + ' / ' + dstruc[0].hitsMax)
                //         if (creep.pos.isNearTo(dstruc[0])) {
                //             var cr = creep.dismantle(dstruc[0])
                //         } else {
                //             var er = creep.moveTo2(dstruc[0], { reusePath: 25, maxRooms: 1 });
                //         }
                //     }
                // } else {
                //-------- HARVEST ----------
                var dropped = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 15, {
                    filter: dropp => dropp.amount > 100 && dropp.resourceType == RESOURCE_ENERGY
                })
                if (dropped.length > 0) {
                    if (creep.pickup(dropped[0]) == ERR_NOT_IN_RANGE) {
                        creep.moveTo2(dropped[0], { reusePath: 25, maxRooms: 1 });
                    }
                } else {
                    var container = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                        filter: (s) => (s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 100) ||
                            (s.structureType == STRUCTURE_STORAGE && s.store[RESOURCE_ENERGY] > 5000) ||
                            (s.structureType == STRUCTURE_TERMINAL && s.store[RESOURCE_ENERGY] > 20000)
                    })
                    if (container) {
                        if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo2(container, { reusePath: 25, maxRooms: 1 })
                        }
                    } else {
                        var source = creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE)
                        if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                            creep.moveTo2(source, { reusePath: 25, maxRooms: 1 })
                        }

                        //console.log(creep.room + '  ' + creep.name + ' minert  ' + standon)
                        var miner = creep.pos.findInRange(FIND_MY_CREEPS, 3, {   // Wenn Creep minert und ein miner in der nähe ist wird geprüft ob creep auf container steht
                            filter: cr => cr.memory.role == 'miner'
                        })
                        if (miner.length > 0) {
                            var standon = creep.pos.isNearTo(FIND_STRUCTURES, {
                                filter: stru => stru.structureType == STRUCTURE_CONTAINER
                            })
                            if (!standon) {
                                var standon = creep.pos.findInRange(FIND_CONSTRUCTION_SITES, 0, {       // Wenn kein Container dann Constructionsite für container
                                    filter: stru => stru.structureType == STRUCTURE_CONTAINER
                                })
                            }
                            if (standon) {
                                creep.moveTo2(creep.room.controller.pos, { reusePath: 5 , maxRooms: 1})                // wenn ja, bewegt er sich richtung controller damit platz für miner frei ist
                            }
                        }

                        if (source == undefined) {
                            creep.memory.working = true;
                        }
                    }
                }
                //}
            }
            // if (creep.pos.x == 49 || creep.pos.x == 0 || creep.pos.y == 49 || creep.pos.y == 0) {
            //     creep.move(creep.pos.getDirectionTo(25,25) )
            // }
        } else {
            // ------ Gehe zu targetrom -------
            var targetpos = new RoomPosition(25, 25, creep.memory.targetroom)
            creep.moveTo(targetpos, { reusePath: 100 })
        }

    }
};

module.exports = roleBmstr;
