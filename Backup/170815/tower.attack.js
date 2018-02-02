var towerattack = {

    run: function () {
        for (var name in Game.rooms) {
            var towers = Game.rooms[name].find(FIND_STRUCTURES, {
                filter: (tower) => { return (tower.structureType == STRUCTURE_TOWER) }
            });
            for (var tower in towers) {                                                         // ANGRIFFSREIHENFOLGE:
                var targetbody = towers[tower].room.find(FIND_HOSTILE_CREEPS, {                 // HEAL
                    filter: sa => sa.getActiveBodyparts(HEAL) != 0
                })
                if (targetbody.length > 0) {
                    towers[tower].attack(targetbody[0]);
                    var at = 1
                }
                var targetbody = towers[tower].room.find(FIND_HOSTILE_CREEPS, {                 // ATTACK
                    filter: sa => sa.getActiveBodyparts(ATTACK) != 0
                })
                if (targetbody.length > 0) {
                    towers[tower].attack(targetbody[0]);
                    var at = 2
                }
                var closestHostile = towers[tower].pos.findClosestByRange(FIND_HOSTILE_CREEPS); // Andere Creeps
                if (closestHostile && (at != 1) || at != 2) {
                    towers[tower].attack(closestHostile);
                    var at = 3
                }
                var healcreep = towers[tower].room.find(FIND_MY_CREEPS, {                       // Heilen eigener creeps
                    filter: hc => hc.hits < hc.hitsMax
                })
                if (healcreep.length > 0 && (at != 1 || at != 2 || at != 3)) {
                    towers[tower].heal(healcreep[0])
                    var at = 4
                }
                var needRepair = towers[tower].pos.findInRange(FIND_STRUCTURES, 10, {           //Reperatur in einem Umkreis von 10
                    filter: (torepair) => torepair.hits < torepair.hitsMax - 800
                });

                var closestRepair = towers[tower].pos.findClosestByRange(needRepair)
                if (closestRepair && (at != 1 || at != 2 || at != 3 || at != 4)) {
                    towers[tower].repair(closestRepair)
                }
            }

        }
    }
}

module.exports = towerattack;