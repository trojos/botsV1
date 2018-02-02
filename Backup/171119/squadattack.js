var roleNahDD = require('role.NahDD')
var roleHeiler = require('role.Heiler')

function createSammelpunkt(SPorigin, SPdest, targetroom) {
    //-------------- noch nicht fertig!!!   Costmatrix muss definiert werden damit Walls ignoriert und Road berücksichtigt werden
    var SammelPath = PathFinder.search(SPorigin, SPdest, { maxOps: 10000 })
    _.remove(SammelPath.path, 'roomName', targetroom)  //Entfernt die Path Positionen im Targetroom damit der Sammelpunkt im vorherigen Raum liegt
    Memory.Attack[targetroom].Sammelpunkt = SammelPath.path[SammelPath.path.length - 5]  //Der Fünftletze Path Punkt ist der Sammelpunkt
    Memory.Attack[targetroom].SammelPath = SammelPath
}


/* wird von ??? aufgerufen
param: targetroom
steuert jeden creep mir der rolle NahDD, FernDD und heiler mit dem entsprechenden targetroom 

Zwei Zustände:
'wait': Der Creep bewegt sich zum berechneten Sammelpunkt und wartet bis genügend da sind
'attack': Wenn genügend Creeps am Sammelpunkt wird der Status auf 'attack' gesetzt. Die Creeps greifen an.

*/
var squadattack = {
    run: function (targetroom) {
        //console.log('savemode: ' +Game.rooms[targetroom].controller.safeMode)
        var abbruch = false                           //<<================================ Wenn was schiefgeht: händisch auf true setzen
        //Memoryobjekte erstellen falls nicht bestehen
        if (Memory.Attack == undefined) {
            Memory.Attack = {}
        }
        if (Memory.Attack[targetroom] == undefined) {
            Memory.Attack[targetroom] = {}
            Memory.Attack[targetroom].Sammelpunkt = ''
        }
        if (Memory.Attack[targetroom].Angriffspunkt == undefined) {
            Memory.Attack[targetroom].Angriffspunkt = {}
            Memory.Attack[targetroom].Angriffspunkt.tick = 0
        }
        if (Game.rooms[targetroom] == undefined) {
            var insight = false
        } else {
            var insight = true
        }

        //Erstelle Array mit den zu steuernden Creeps
        var arAlle = []
        var arNahDD = []
        var arFernDD = []
        var arHeiler = []
        var arNahDDwait = []
        var arFernDDwait = []
        var arHeilerwait = []
        var arNahDDattack = []
        var arFernDDattack = []
        var arHeilerattack = []


        for (var name in Game.creeps) {                //Creeps ohne Status wird wait zugewiesen ---- Wemm Anbruch dann alle auf wait
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
        }

        if (arAlle.length == 0) {
            //console.log('keine Angriffscreeps für ' + targetroom)
            // wenn keine creeps dann ende, sonst:
        } else {
            //console.log('Angriffscreeps für ' + targetroom)
            //Erstellen Sammelpunkt falls keiner besteht
            if (Memory.Attack[targetroom].Sammelpunkt == undefined || Memory.Attack[targetroom].Sammelpunkt == '') {
                var SPorigin = Game.rooms[arAlle[0].memory.home].controller.pos
                var SPdest = new RoomPosition(25, 25, targetroom) // Game.rooms[targetroom].getPositionAt(25, 25)
                createSammelpunkt(SPorigin, SPdest, targetroom)

            }
            const erp = new RoomPosition(Memory.Attack[targetroom].Sammelpunkt.x, Memory.Attack[targetroom].Sammelpunkt.y, Memory.Attack[targetroom].Sammelpunkt.roomName)
            //Creeps zum Sammelpunkt schicken
            for (var i in arAlle) {
                if (arAlle[i].memory.status == 'wait') {
                    var creep = arAlle[i];
                    creep.moveTo2(erp, {
                        reusePath: 50, visualizePathStyle: { stroke: '#ff0000' }, costCallback: function (roomName, costMatrix) {
                            //console.log('route')
                            if (Game.rooms[roomName]) {
                                Game.rooms[roomName].find(FIND_STRUCTURES).forEach(function (struct) {
                                    //console.log('found')
                                    if (struct.structureType === STRUCTURE_ROAD) {
                                        // Favor roads over plain tiles
                                        costMatrix.set(struct.pos.x, struct.pos.y, 1);
                                    } else if (struct.structureType !== STRUCTURE_CONTAINER &&
                                        (struct.structureType !== STRUCTURE_RAMPART ||
                                            !struct.my)) {
                                        // Can't walk through non-walkable buildings
                                        costMatrix.set(struct.pos.x, struct.pos.y, 0xff);
                                    }
                                });
                                console.log(creep.name, roomName)
                            }

                        }
                    })
                }
            }

            //Überprüfen ob genung creeps am Sammelpunkt inklusive die gerade Angreifen
            //NahDD
            if (Game.rooms[Memory.Attack[targetroom].Sammelpunkt.roomName] == undefined) {
                var azNahDD = 0
                var azFernDD = 0
                var azHeiler = 0
            } else {
                var spNahDD = erp.findInRange(FIND_MY_CREEPS, 3, {
                    filter: nd => nd.memory.role == "NahDD"
                })
                var azNahDD = spNahDD.length + arNahDDattack.length

                //FernDD
                var spFernDD = erp.findInRange(FIND_MY_CREEPS, 3, {
                    filter: nd => nd.memory.role == "FernDD"
                })
                var azFernDD = spFernDD.length + arFernDDattack.length
                //Heiler
                var spHeiler = erp.findInRange(FIND_MY_CREEPS, 3, {
                    filter: nd => nd.memory.role == "Heiler"
                })
                var azHeiler = spHeiler.length + arHeilerattack.length
            }
            console.log('nah: ' + azNahDD + ' Fern: ' + azFernDD + ' Heiler: ' + azHeiler)
            //angreifen

            if (insight) {                                  //<---------- Anzahl der Creeps die für einen Angriff erforderlich sind
                var hostile = Game.rooms[targetroom].find(FIND_HOSTILE_CREEPS)
                if (hostile.length < 1) {
                    //sammeln:
                    var mcNahDD = 0; var mcFernDD = 0; var mcHeiler = 0; //Wenn Raumsicht und keine feindlichen Creeps dann andere Anzahl
                    //im Kampf:
                    var fcNahDD = 5; var fcFernDD = 5; var fcHeiler = 5;
                } else {
                    //sammeln:
                    var mcNahDD = 1; var mcFernDD = 0; var mcHeiler = 4; //<--- Normaler Angriff
                    //im Kampf:
                    var fcNahDD = 5; var fcFernDD = 0; var fcHeiler = 8;
                }
            } else {
                //sammeln:
                var mcNahDD = 1; var mcFernDD = 0; var mcHeiler = 4;
                //im Kampf:
                var fcNahDD = 5; var fcFernDD = 0; var fcHeiler = 4;
            }
            azFernDD = 0
            //console.log(azFernDD + ' ' + mcFernDD)
            // Wenn genügend Creeps wird diesen der Status 'attack' zugewiesen, außer wenn noch genügend in angriff sind
            if (azNahDD >= mcNahDD && azFernDD >= mcFernDD && azHeiler >= mcHeiler) {

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
            }


            for (var l in arAlle) {                                     //Ausführen der Rollen
                var creepat = arAlle[l]
                if (creepat.memory.status == 'attack') {
                    if (creepat.memory.role == 'NahDD') {
                        roleNahDD.run(creepat)
                    }
                    if (creepat.memory.role == 'Heiler') {
                        roleHeiler.run(creepat)
                    }
                } else {
                    if (creepat.memory.role == 'Heiler') {
                        roleHeiler.run(creepat)
                    }
                }
            }
        }
    }
}

module.exports = squadattack;