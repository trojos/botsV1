var roleMiner = {

    /** @param {Creep} creep **/
    run: function (creep) {
        //Überprüfen ob ein resourcelink vorhanden ist
        if (creep.memory.linkminer == undefined) {
            if (creep.memory.resourcelink == undefined || creep.memory.resourcelink == '') {
                var havelink = false
            } else {
                var havelink = true
            }
            if (creep.getActiveBodyparts(CARRY) > 0 && havelink) {
                creep.memory.linkminer = true
            } else {
                creep.memory.linkminer = false
            }
        }

        if (creep.memory.linkminer) {      //wenn resourcelink vorhanden und carrybodypart vorhanden, dann wird in carry geminert und in link abgelegt
            if (!creep.memory.harvesting && creep.carry.energy == 0) {
                creep.memory.harvesting = true;
            }
            if (creep.memory.harvesting && (creep.carry.energy > creep.carryCapacity - 12)) {
                creep.memory.harvesting = false;
            }
            //var linkid = creep.memory.resourcelink
            if (creep.memory.harvesting) {
                if (creep.room.name == creep.memory.targetroom) {
                    var spot = Game.getObjectById(creep.memory.spot)
                    if (creep.pos.isNearTo(spot)) {
                        creep.harvest(spot)
                        //if (creep.carry.energy >= creep.carryCapacity - 24) {
                        //    creep.transfer(Game.getObjectById(creep.memory.resourcelink), RESOURCE_ENERGY)
                        //}
                    } else {
                        creep.moveTo2(spot, { reusePath: 50 });
                    }
                } else {
                    creep.moveTo2(creep.pos.findClosestByRange(creep.room.findExitTo(targetroom)))
                }
            } else {

                if (creep.room.name == creep.memory.home) {
                    var target = Game.getObjectById(creep.memory.resourcelink)
                    if (target) {
                        var erg = creep.transfer(target, RESOURCE_ENERGY)
                        //console.log(creep.memory.targetroom, erg)
                        if (erg == ERR_NOT_IN_RANGE) {
                            creep.moveTo(target);
                        } else if (erg == ERR_FULL) {
                            creep.drop(RESOURCE_ENERGY)
                            creep.memory.harvesting = true;
                        } else {
                            creep.memory.harvesting = true;
                        }
                    }
                }
            }
        } else {                //Wenn kein Link
            if (creep.room.name == creep.memory.targetroom || creep.memory.targetroom == '') {
                var sources = Game.getObjectById(creep.memory.spot)
                if (creep.pos.isNearTo(sources)) {
                    if (creep.getActiveBodyparts(WORK) < 6) {   //Wenn ein Bmstr mit mehr Work Bodyparts minern will, dann wird Platz gemacht
                        var spots = sources.room.lookForAtArea(LOOK_TERRAIN, sources.pos.y - 1, sources.pos.x - 1, sources.pos.y + 1, sources.pos.x + 1, true)
                        var freespots = _.filter(spots, { terrain: 'plain' })
                        if (freespots.length < 2) {
                            var othercreep = sources.pos.findInRange(FIND_MY_CREEPS, 2, {
                                filter: cr => cr.getActiveBodyparts(WORK) > creep.getActiveBodyparts(WORK)
                                    && cr.memory.role == 'bmstr' && cr.memory.working == false
                            })
                            if (othercreep.length > 0) {
                                creep.moveTo2(othercreep[0])
                            }
                        }
                    }
                }

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
                        creep.moveTo2(minepos, { reusePath: 50 })
                    }
                } else {
                    if (creep.pos.isNearTo(sources)) {
                        creep.harvest(sources)
                        creep.room.createConstructionSite(creep.pos, STRUCTURE_CONTAINER)
                    } else {
                        creep.moveTo2(sources, { reusePath: 50 });
                    }
                }
            } else {
                creep.moveTo2(Game.getObjectById(creep.memory.spot), { reusePath: 50 })
            }
        }
    }
};

module.exports = roleMiner;
