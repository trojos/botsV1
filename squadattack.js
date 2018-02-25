var roleNahDD = require('role.NahDD')
var roleHeiler = require('role.Heiler')
var roleDismantler = require('role.dismantler')

var creepboost = require('creep.boost')

function createSammelpunkt(SPorigin, SPdest, targetroom) {
    //-------------- noch nicht fertig!!!   Costmatrix muss definiert werden damit Walls ignoriert und Road berücksichtigt werden
    var SammelPath = PathFinder.search(SPorigin, SPdest, { maxOps: 10000 })
    var AngriffPath = SammelPath.path.slice()
    _.remove(SammelPath.path, 'roomName', targetroom)  //Entfernt die Path Positionen im Targetroom damit der Sammelpunkt im vorherigen Raum liegt
    Memory.Attack[targetroom].Sammelpunkt = SammelPath.path[SammelPath.path.length - 5]  //Der Fünftletze Path Punkt ist der Sammelpunkt
    //Memory.Attack[targetroom].SammelPath = SammelPath
    _.remove(AngriffPath, function (pa) {
        return pa.roomName != targetroom
    })
    if (AngriffPath.length >= 3) {              //Erstellt einen Punkt der unmittelbar nach Raumeintrittt ist
        Memory.Attack[targetroom].Eintrittspunkt = AngriffPath[2]
    } else {
        Memory.Attack[targetroom].Eintrittspunkt = AngriffPath[AngriffPath.length]
    }
}


/* wird von ??? aufgerufen
param: targetroom
steuert jeden creep mir der rolle NahDD, FernDD und heiler mit dem entsprechenden targetroom 

Zwei Zustände:
'wait': Der Creep bewegt sich zum berechneten Sammelpunkt und wartet bis genügend da sind
'attack': Wenn genügend Creeps am Sammelpunkt wird der Status auf 'attack' gesetzt. Die Creeps greifen an.

*/
var squadattack = {
    run: function (home, targetroom, anzahl, type, NahDD, FernDD, Heiler, Dismantler, boost) {
        //console.log('Angriff auf Raum ', targetroom, ' wird durchgeführt')
        //console.log('savemode: ' +Game.rooms[targetroom].controller.safeMode)
        var abbruch = false                           //<<================================ Wenn was schiefgeht: händisch auf true setzen
        if (boost == undefined) {
            boost = false
        }

        //Memoryobjekte erstellen falls nicht bestehen
        if (Memory.Attack[targetroom].Angriffspunkt == undefined) {
            Memory.Attack[targetroom].Angriffspunkt = {}
            Memory.Attack[targetroom].Angriffspunkt.tick = 0
        }

        if (Game.rooms[targetroom] == undefined) {
            var insight = false
        } else {
            var insight = true
            var tarroom = Game.rooms[targetroom]
        }

        // Erstelle Sammel und Eintrittspunkt
        if (Memory.Attack[targetroom].Sammelpunkt == undefined || Memory.Attack[targetroom].Sammelpunkt == '') {
            var SPorigin = Game.getObjectById(Memory.rooms[home].Spawn).pos
            var SPdest = new RoomPosition(25, 25, targetroom)
            createSammelpunkt(SPorigin, SPdest, targetroom)
        }

        if (insight) {  // Target definieren damit alle das selbe Ziel angreifen
            var hostilecreeps = tarroom.find(FIND_HOSTILE_CREEPS, {
                filter: sa => sa.owner.username != 'SteveTrov'
            })
            var hcNdd = _.filter(hostilecreeps, function (object) { return object.getActiveBodyparts(ATTACK) != 0; })
            var hcFdd = _.filter(hostilecreeps, function (object) { return object.getActiveBodyparts(RANGED_ATTACK) != 0; })
            var hcHeal = _.filter(hostilecreeps, function (object) { return object.getActiveBodyparts(HEAL) != 0; })

            var flag = tarroom.find(FIND_FLAGS, { filter: { name: 'Attack' } })

            if (flag.length > 0) {                                  //Wenn Flagge Attack dann wird nächster creep zur Flagge angegriffen
                var spot = new RoomPosition(flag[0].pos.x, flag[0].pos.y, flag[0].pos.roomName)
                var iswall = spot.findInRange(FIND_STRUCTURES, 0, {   //Wenn mit der Flagge eine Wall oder Rampart markiert ist, ist das das Ziel
                    filter: stru => stru.structureType == STRUCTURE_WALL || stru.structureType == STRUCTURE_RAMPART
                        || stru.structureType == STRUCTURE_EXTENSION || stru.structureType == STRUCTURE_STORAGE
                        || stru.structureType == STRUCTURE_SPAWN
                })
                if (iswall.length > 0) {
                    var target = iswall[0]
                }
            } else {                                                    //Ansonsten vom berechneten Eintrittspunkt, wenn keiner berechnet dann Raummitte
                if (Memory.Attack[targetroom].Eintrittspunkt == undefined) {
                    var spot = new RoomPosition(25, 25, targetroom)
                } else {
                    var EP = Memory.Attack[targetroom].Eintrittspunkt
                    var spot = new RoomPosition(EP.x, EP.y, EP.roomName)
                }
            }

            if (!target) {
                if (hcNdd.length > 0) {                                 //Suche naheliegenstes Ziel in der Reihenfolge:
                    var target = spot.findClosestByRange(hcNdd)         //NahDD
                } else if (hcFdd.length > 0) {
                    var target = spot.findClosestByRange(hcFdd)         //FernDD
                } else if (hcHeal.length > 0) {
                    var target = spot.findClosestByRange(hcHeal)        //Heiler
                }
            }

            if (!target) {                                          //Wenn kein Creep dann wird mit Structuren weitergemacht
                var strucs = tarroom.find(FIND_HOSTILE_STRUCTURES, {
                    filter: struc => struc.structureType != STRUCTURE_CONTROLLER
                })
                var hstower = _.filter(strucs, { structureType: STRUCTURE_TOWER })
                var hsspawn = _.filter(strucs, { structureType: STRUCTURE_SPAWN })
                var hsstore = _.filter(strucs, { structureType: STRUCTURE_STORAGE })
                // Türme
                if (hstower.length > 0) {
                    var target = spot.findClosestByRange(hstower)
                } else if (hsspawn.length > 0) {
                    var target = spot.findClosestByRange(hsspawn)
                } else if (hsstore.length > 0) {
                    var target = spot.findClosestByRange(hsstore)
                }
            }
            if (!target) {                                          //Wenn noch immer kein Target dann restliche creeps
                var target = spot.findClosestByRange(hostilecreeps)
            }

            if (!target) {                                          //Wenn keine Creeps mehr vorhanden dann die restlichen structures
                var target = spot.findClosestByRange(strucs)
            }

            if (target) {
                Memory.Attack[targetroom].target = target.id
                console.log('Angriff auf ' + targetroom + ': ' + target)
            } else {
                Memory.Attack[targetroom].target = false
                console.log('Angriff auf ' + targetroom + ': Keine Ziele vorhanden')
            }
        }

        //Erstelle Array mit den zu steuernden Creeps
        var arAlle = []
        var arNahDD = []; var arFernDD = []; var arHeiler = []; var arDismantler = []
        var arNahDDwait = []; var arFernDDwait = []; var arHeilerwait = []; var arDismantlerwait = []
        var arNahDDattack = []; var arFernDDattack = []; var arHeilerattack = []; var arDismantlerattack = []

        for (var name in Game.creeps) {                //Creeps ohne Status wird wait zugewiesen ---- Wenn Anbruch dann alle auf wait
            var creep = Game.creeps[name];
            if (creep.memory.role == 'NahDD' && creep.memory.targetroom == targetroom) {
                if (creep.memory.status == undefined || creep.memory.status == 'wait' || abbruch) {
                    creep.memory.status = 'wait'
                    arNahDDwait.push(creep);
                } else {
                    creep.memory.status = 'attack'
                    arNahDDattack.push(creep)
                }
                arNahDD.push(creep)
                arAlle.push(creep)
            }
            if (creep.memory.role == 'FernDD' && creep.memory.targetroom == targetroom) {
                if (creep.memory.status == undefined || creep.memory.status == 'wait' || abbruch) {
                    creep.memory.status = 'wait'
                    arFernDDwait.push(creep);
                } else {
                    creep.memory.status = 'attack'
                    arFernDDattack.push(creep)
                }
                arFernDD.push(creep)
                arAlle.push(creep)
            }
            if (creep.memory.role == 'Heiler' && creep.memory.targetroom == targetroom) {
                if (creep.memory.status == undefined || creep.memory.status == 'wait' || abbruch) {
                    creep.memory.status = 'wait'
                    arHeilerwait.push(creep);
                } else {
                    creep.memory.status = 'attack'
                    arHeilerattack.push(creep)
                }
                arHeiler.push(creep)
                arAlle.push(creep)
            }
            if (creep.memory.role == 'Dismantler' && creep.memory.targetroom == targetroom) {
                if (creep.memory.status == undefined || creep.memory.status == 'wait' || abbruch) {
                    creep.memory.status = 'wait'
                    arDismantlerwait.push(creep);
                } else {
                    creep.memory.status = 'attack'
                    arDismantlerattack.push(creep)
                }
                arDismantler.push(creep)
                arAlle.push(creep)
            }
        }

        if (arAlle.length == 0) {
            //console.log('keine Angriffscreeps für ' + targetroom)
            // wenn keine creeps dann ende, sonst:
            return;
        } else {

            //Creeps zum Sammelpunkt schicken
            const erp = new RoomPosition(Memory.Attack[targetroom].Sammelpunkt.x, Memory.Attack[targetroom].Sammelpunkt.y, Memory.Attack[targetroom].Sammelpunkt.roomName)
            new RoomVisual(erp.roomName).circle(erp.x, erp.y, { fill: '#df0000', radius: .5, opacity: 1 });
            for (var i in arAlle) {
                if (targetroom == 'W2S23') {
                    //arAlle[i].memory.role = 'wait'
                    //arAlle[i].memory.status = 'attack'
                }
                if (arAlle[i].memory.status == 'wait') {
                    var creep = arAlle[i];
                    //Boost hohlen
                    if (boost == 'standart') {
                        if (creep.memory.role == 'Heiler') {
                            var cboost = [{ BP: HEAL, mineral: 'XLHO2', max: 20 }]
                            creepboost.run(creep, creep.memory.home, cboost)
                        }
                        if (creep.memory.role == 'FernDD') {
                            var cboost = [{ BP: RANGED_ATTACK, mineral: 'XKHO2', max: 25 }]
                            creepboost.run(creep, creep.memory.home, cboost)
                        }
                        if (creep.memory.role == 'Dismantler') {
                            var cboost = [{ BP: WORK, mineral: 'XZH2O', max: 25 }]
                            creepboost.run(creep, creep.memory.home, cboost)
                        }
                    } else if (boost == 'full') {
                        if (creep.memory.role == 'Heiler') {
                            var cboost = [{ BP: HEAL, mineral: 'XLHO2', max: 25 }, { BP: TOUGH, mineral: 'XGHO2', max: 13 }]
                            creepboost.run(creep, creep.memory.home, cboost)
                        }
                        if (creep.memory.role == 'FernDD') {
                            var cboost = [{ BP: RANGED_ATTACK, mineral: 'XKHO2', max: 25 }, { BP: TOUGH, mineral: 'XGHO2', max: 13 }]
                            creepboost.run(creep, creep.memory.home, cboost)
                        }
                        if (creep.memory.role == 'Dismantler') {
                            var cboost = [{ BP: WORK, mineral: 'XZH2O', max: 25 }, { BP: TOUGH, mineral: 'XGHO2', max: 13 }]
                            creepboost.run(creep, creep.memory.home, cboost)
                        }
                    }
                    if (creep.memory.boosted == 'goto') { } else {
                        if (!creep.pos.inRangeTo(erp, 2)) {
                            //console.log(creep.pos.inRangeTo(erp, 4))
                            creep.moveTo2(erp, { reusePath: 150 })
                        }
                    }
                }
            }

            //Überprüfen ob genung creeps am Sammelpunkt inklusive die gerade Angreifen
            if (Game.rooms[Memory.Attack[targetroom].Sammelpunkt.roomName] == undefined) {
                var azNahDD = 0
                var azFernDD = 0
                var azHeiler = 0
                var azDismantler = 0
            } else {
                //NahDD
                var spNahDD = erp.findInRange(FIND_MY_CREEPS, 4, {
                    filter: nd => nd.memory.role == "NahDD" && nd.memory.targetroom == targetroom
                })
                var azNahDD = spNahDD.length + arNahDDattack.length
                //FernDD
                var spFernDD = erp.findInRange(FIND_MY_CREEPS, 4, {
                    filter: nd => nd.memory.role == "FernDD" && nd.memory.targetroom == targetroom
                })
                var azFernDD = spFernDD.length + arFernDDattack.length
                //Heiler
                var spHeiler = erp.findInRange(FIND_MY_CREEPS, 4, {
                    filter: nd => nd.memory.role == "Heiler" && nd.memory.targetroom == targetroom
                })
                var azHeiler = spHeiler.length + arHeilerattack.length
                //Dismantler
                var spDismantler = erp.findInRange(FIND_MY_CREEPS, 4, {
                    filter: nd => nd.memory.role == "Dismantler" && nd.memory.targetroom == targetroom
                })
                var azDismantler = spDismantler.length + arDismantlerattack.length
            }


            //angreifen
            if (insight) {                                  //<---------- Anzahl der Creeps die für einen Angriff erforderlich sind
                var hostile = Game.rooms[targetroom].find(FIND_HOSTILE_CREEPS)
                if (hostile.length < 1) {
                    //sammeln:
                    var mcNahDD = 0; var mcFernDD = 0; var mcHeiler = 0; var mcDismantler = 0 //Wenn Raumsicht und keine feindlichen Creeps dann andere Anzahl
                    //im Kampf:
                    var fcNahDD = NahDD; var fcFernDD = FernDD; var fcHeiler = Heiler; var fcDismantler = Dismantler
                } else {
                    //sammeln:
                    var mcNahDD = NahDD; var mcFernDD = FernDD; var mcHeiler = Heiler; var mcDismantler = Dismantler //<--- Normaler Angriff
                    //im Kampf:
                    var fcNahDD = NahDD + 2; var fcFernDD = FernDD + 2; var fcHeiler = Heiler + 2; var fcDismantler = Dismantler + 1
                }
            } else {
                //sammeln:
                var mcNahDD = NahDD; var mcFernDD = FernDD; var mcHeiler = Heiler; var mcDismantler = Dismantler
                //im Kampf:
                var fcNahDD = NahDD + 2; var fcFernDD = FernDD + 2; var fcHeiler = Heiler + 2; var fcDismantler = Dismantler
            }
            console.log('nah: ' + azNahDD + '/' + mcNahDD + ' Fern: ' + azFernDD + '/' + mcFernDD + ' Heiler: ' + azHeiler + '/' + mcHeiler + ' Dismantler: ' + azDismantler + '/' + mcDismantler)
            //azFernDD = 0
            //console.log(azFernDD + ' ' + mcFernDD)
            // Wenn genügend Creeps wird diesen der Status 'attack' zugewiesen, außer wenn noch genügend in angriff sind
            if (azNahDD >= mcNahDD && azFernDD >= mcFernDD && azHeiler >= mcHeiler && azDismantler >= mcDismantler) {

                if (arNahDDattack.length < fcNahDD) {
                    for (var creepNahDD in spNahDD) {
                        spNahDD[creepNahDD].memory.status = 'attack'
                    }
                }
                if (arFernDDattack.length < fcFernDD) {
                    for (var creepFernDD in spFernDD) {
                        spFernDD[creepFernDD].memory.status = 'attack'
                    }
                }
                if (arHeilerattack.length < fcHeiler) {
                    for (var creepHeiler in spHeiler) {
                        spHeiler[creepHeiler].memory.status = 'attack'
                    }
                }

                if (arDismantlerattack.length < fcDismantler) {
                    for (var creepDis in spDismantler) {
                        spDismantler[creepDis].memory.status = 'attack'
                    }
                }
            }


            for (var l in arAlle) {                                     //Ausführen der Rollen
                var creepat = arAlle[l]
                if (creepat.memory.boosted != 'goto') {
                    if (creepat.memory.role == 'NahDD' || creepat.memory.role == 'FernDD') {
                        roleNahDD.run(creepat)
                    }
                    if (creepat.memory.role == 'Heiler') {
                        roleHeiler.run(creepat)
                    }
                    if (creepat.memory.role == 'Dismantler') {
                        roleDismantler.run(creepat)
                    }
                }
            }
        }

    }
}

module.exports = squadattack;