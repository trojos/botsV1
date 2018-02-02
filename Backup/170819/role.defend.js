function attacktarget(creep, target, hostileroom) {
    if (creep.attack(target) == ERR_NOT_IN_RANGE) {
        if (hostileroom) {
            creep.moveTo(target, { visualizePathStyle: { stroke: '#ff0000' }, ignoreDestructibleStructures: true });
        } else {
            creep.moveTo(target, { visualizePathStyle: { stroke: '#ff0000' } });
        }
    }
}

function attackt(creep) {
    if (creep.room.controller.owner != undefined && creep.room.controller.my == false) {
        var hostileroom = true
    } else {
        var hostileroom = false
    }

    var at = 0
    var targetbody = creep.room.find(FIND_HOSTILE_CREEPS, {
        filter: sa => sa.getActiveBodyparts(ATTACK) != 0
    })
    var target = creep.pos.findClosestByRange(targetbody)
    if (target) {
        attacktarget(creep, target, hostileroom)
        var at = 1
    }

    var targettower = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {
        filter: tt => tt.structureType == STRUCTURE_TOWER
    })
    if (targettower && at == 0) {
        attacktarget(creep, targettower, hostileroom)
        var at = 2
    }

    var targetstruc = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {
        filter: tt => tt.structureType != STRUCTURE_CONTROLLER
    })
    if (targetstruc && at == 0) {
        attacktarget(creep, targetstruc, hostileroom)
        var at = 3
    }

    var targetac = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS)
    if (targetac && at == 0) {
        attacktarget(creep, targetac, hostileroom)
        var at = 4
    }

    if (Game.flags['Attack'] && at < 1) {
        creep.moveTo(Game.flags['Attack'], { visualizePathStyle: { stroke: '#ff0000' } })

    }
    return at
}

var roledefend = {

    /** @param {Creep} creep **/
    run: function (creep) {
        var targetroom = creep.memory.targetroom
        var at = attackt(creep)

        if (at == 0) {
            creep.moveTo(creep.pos.findClosestByRange(creep.room.findExitTo(targetroom)), { visualizePathStyle: { stroke: '#ff0000' } })
        }
        if (at == 0 && creep.room.name == creep.memory.targetroom) {
            creep.moveTo(25, 25)
        }
    }
};

module.exports = roledefend;
