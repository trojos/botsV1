var towerattack = {

    run: function () {
        targets = {}
        for (var name in Game.rooms) {
            if (Game.rooms[name].controller && Game.rooms[name].controller.my) {
                var towers = Game.rooms[name].find(FIND_STRUCTURES, {
                    filter: (tower) => { return (tower.structureType == STRUCTURE_TOWER && tower.isActive() == true && tower.energy >= 10) }
                });
                var alltowers = Game.rooms[name].find(FIND_STRUCTURES, {
                    filter: (tower) => { return (tower.structureType == STRUCTURE_TOWER && tower.isActive() == true) }
                });
                targets[name] = { enemyattack: {}, enemycreeps: {}, healcreeps: {} }
                if (towers.length > 0) {
                    var count = 0
                    var targetattack = Game.rooms[name].find(FIND_HOSTILE_CREEPS, {                 // ATTACK
                        filter: sa => (sa.getActiveBodyparts(ATTACK) || sa.getActiveBodyparts(RANGED_ATTACK) || sa.getActiveBodyparts(HEAL)) != 0 && sa.owner.username != 'SteveTrov'
                    })
                    targetattack.forEach(target => {
                        targets[name].enemyattack[target.id] = { type: 'enemyattack', id: target.id, hits: target.hits, hitsMax: target.hitsMax, pos: target.pos }
                        count += 1
                        //targets.push({ type: 'enemyattack', id: target.id, pos: target.pos })
                    });
                    var targetcreeps = Game.rooms[name].find(FIND_HOSTILE_CREEPS, {                 // Andere Creeps
                        filter: sa => sa.owner.username != 'SteveTrov'
                    })
                    targetcreeps.forEach(target => {
                        targets[name].enemycreeps[target.id] = { type: 'enemycreeps', id: target.id, hits: target.hits, hitsMax: target.hitsMax, pos: target.pos }
                        count += 1
                        //targets.push({ type: 'enemycreeps', id: target.id, pos: target.pos })
                    });
                    var healcreeps = Game.rooms[name].find(FIND_CREEPS, {                       // Heilen eigener creeps
                        filter: hc => hc.hits < hc.hitsMax && (hc.owner.username == 'zapziodon' || hc.owner.username == 'SteveTrov')
                    })
                    healcreeps.forEach(target => {
                        targets[name].healcreeps[target.id] = { type: 'healcreeps', id: target.id, hits: target.hits, hitsMax: target.hitsMax, pos: target.pos }
                        count += 1
                        //targets.push({ type: 'healcreeps', id: target.id, pos: target.pos })
                    });
                    //Memory.rooms[name].Defend.targets = targets[name]
                    if (count > 0) {
                        console.log('TOWERDEFENSE in ', name, ' / ', count, 'Ziele')
                    }
                    // }
                    if (count < 1) {
                        var defence = Memory.rooms[name].Bmstr.Defence     //Wenn die schwächste Defence (Mauer oder Rampart) weniger als 75% des Durchschnittes hat soll diese Repaiert werden
                        if (defence) {
                            if (defence.minhits < defence.averagehits * 0.75) {
                                var defrep = Game.getObjectById(defence.minid)
                                console.log('Notfallreparatur Defence', name, '  Def hat', Math.floor(defence.minhits / defence.averagehits * 100 * 10) / 10, '% von average')
                            }
                        }
                    }
                }

                var at = 0
                //Attacking Creeps angreifen
                if (towers.length >= alltowers.length * 0.75 && 1 == 1) {
                    if (Object.keys(targets[name].enemyattack).length > 0) {
                        var enemyattack = targets[name].enemyattack
                        //enemyattacks = _.pluck(_.sortBy(enemyattack, 'hits'), 'id')
                        enemyattacks = _.pluck(enemyattack, 'id')
                        // die erste zwei Türme greifen Ziele 2 und 3 an, der Rest erstes Ziel, Damit feindliche Heiler beschäftigt sind!!
                        for (i = 0; i < towers.length; i++) {
                            switch (i) {
                                case 0:
                                    if (enemyattacks.length > 1) {       // Wenn nur ein Ziel dann dann diese angreifen
                                        towers[i].attack(Game.getObjectById(enemyattacks[1])); break;
                                    } else {
                                        towers[i].attack(Game.getObjectById(enemyattacks[0])); break;
                                    }
                                case 1:
                                    if (enemyattacks.length > 2) {       // Wenn weniger als drei Ziele dann erstes angreufen
                                        towers[i].attack(Game.getObjectById(enemyattacks[2])); break;
                                    } else {
                                        towers[i].attack(Game.getObjectById(enemyattacks[0])); break;
                                    }
                                default:
                                    towers[i].attack(Game.getObjectById(enemyattacks[0])); break;
                            }
                        }
                        at = 1
                    }
                    //Andere feindliche Creeps angreifen
                    if (at == 0 && Object.keys(targets[name].enemycreeps).length > 0) {
                        var enemycreeps = targets[name].enemycreeps
                        enemycreepss = _.pluck(_.sortBy(enemycreeps, 'hits'), 'id')
                        // Wenn Ziel zerstört dann aus Array löschen damit die andren Türme nicht mehr angreifen
                        for (i = 0; i < towers.length; i++) {
                            var targett = Game.getObjectById(enemycreepss[0])
                            if (targett) {
                                towers[i].attack(targett)
                                targets[name].enemycreeps[enemycreepss[0]].hits -= 300
                                if (targets[name].enemycreeps[enemycreepss[0]].hits <= 0) {
                                    enemycreepss.splice(0, 1)
                                }
                            } else {
                                enemycreepss.splice(0, 1)
                            }
                        }
                        at = 1
                    }
                }
                //freundliche Creeps heilen
                if (at == 0 && Object.keys(targets[name].healcreeps).length > 0) {
                    var healcreeps = targets[name].healcreeps
                    healcreepss = _.pluck(_.sortBy(healcreeps, 'hits'), 'id')
                    for (i = 0; i < towers.length; i++) {
                        var healt = Game.getObjectById(healcreepss[0])
                        if (healt) {
                            towers[i].heal(healt)
                            targets[name].healcreeps[healcreepss[0]].hits += 200
                            // Wenn Ziel geheilt dann aus Array löschen, damit die anderen Türem nicht mehr heilen
                            if (targets[name].healcreeps[healcreepss[0]].hits >= targets[name].healcreeps[healcreepss[0]].hitsMax) {
                                healcreepss.splice(0, 1)
                            }
                        } else {
                            healcreepss.splice(0, 1)
                        }
                    }
                    at = 1
                }
                //Wenn nichts zum angreifen oder heilen wird Defence repariert falls erforderlich!
                if (defrep) {
                    for (i = 0; i < towers.length; i++) {
                        var rangetodef = towers[i].pos.getRangeTo(defrep)
                        if (rangetodef <= 7) {
                            towers[i].repair(defrep)
                        }
                    }
                }


                //Wenn sonst nichts ist, Structuren in der umgebung reparieren
                // if (at == 0) {
                //     for (i = 0; i < towers.length; i++) {
                //         var needRepair = towers[i].pos.findInRange(FIND_STRUCTURES, 10, {           //Reperatur in einem Umkreis von 10
                //             filter: (torepair) => torepair.hits < torepair.hitsMax - 800 && torepair.structureType != STRUCTURE_WALL && torepair.structureType != STRUCTURE_RAMPART
                //         });
                //         var closestRepair = towers[i].pos.findClosestByRange(needRepair)
                //         if (closestRepair) {
                //             towers[i].repair(closestRepair)
                //         }
                //     }
                // }
            }
        }
    }
}

module.exports = towerattack;