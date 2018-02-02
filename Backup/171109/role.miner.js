var roleMiner = {

    /** @param {Creep} creep **/
    run: function (creep) {
        //Überprüfen ob ein resourcelink vorhanden ist
        if (creep.memory.resourcelink == undefined || creep.memory.resourcelink == '') {
            var havelink = false
        } else {
            var havelink = true
            var linkid = creep.memory.resourcelink
        }


        if (creep.getActiveBodyparts(CARRY) > 0 && havelink) {      //wenn resourcelink vorhanden und carrybodypart vorhanden, dann wird in carry geminert und in link abgelegt
            if (!creep.memory.harvesting && creep.carry.energy == 0) {
                creep.memory.harvesting = true;
            }
            if (creep.memory.harvesting && (creep.carry.energy >= creep.carryCapacity - 12)) {
                creep.memory.harvesting = false;
            }

            if (creep.memory.harvesting) {
                if (creep.room.name == creep.memory.targetroom) {
                    var spot = Game.getObjectById(creep.memory.spot)
                    var target = Game.getObjectById(linkid)
                    if (creep.pos.isNearTo(spot)) {
                        creep.harvest(spot)
                        if(creep.carry.energy > 12){
                        creep.transfer(target, RESOURCE_ENERGY)
                        }
                    } else {
                        creep.moveTo2(spot, { reusePath: 50 });
                    }
                } else {
                    creep.moveTo2(creep.pos.findClosestByRange(creep.room.findExitTo(targetroom)))
                }
            } else {
                if (creep.room.name == creep.memory.home) {
                    var target = Game.getObjectById(linkid)
                    if (target) {
                        if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(target);
                        } else {
                            creep.memory.harvesting = true;
                        }
                    }
                }
            }
        } else {                //Wenn kein Link
            if (creep.room.name == creep.memory.targetroom || creep.memory.targetroom == '') {
                var sources = Game.getObjectById(creep.memory.spot)
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
                    console.log(sources)
                    if (creep.pos.isNearTo(sources)) {
                        creep.harvest(sources)
                        creep.room.createConstructionSite(creep.pos, STRUCTURE_CONTAINER)
                    } else {
                        creep.moveTo2(sources, { reusePath: 50 });
                    }
                }
            } else {
                creep.moveTo2(creep.pos.findClosestByPath(creep.room.findExitTo(creep.memory.targetroom)), { reusePath: 50 })
            }
        }
    }
};

module.exports = roleMiner;
