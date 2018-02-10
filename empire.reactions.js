
var reactions = {
    run: function (room, Auftragrezept) {
        // ------ RAUMVARIABLEN und ABBRUCH
        if (Memory.rooms[room].Labs == undefined) {
            Memory.rooms[room].Labs = {}
            Memory.rooms[room].Labs.Boosts = {}
            Memory.rooms[room].Labs.prod = 0
        }

        var HOMERCL = Game.rooms[room].controller.level
        if (HOMERCL < 6) { return; }                    //Wenn Kontroller level kleiner als 6 dann wird nix produziert, daher wird abgebrochen

        var terminal = Game.rooms[room].terminal
        if (terminal == undefined) { return; }          // Ohne Terminal wird abgebrochen

        var boosterprod
        var labs = Game.rooms[room].find(FIND_MY_STRUCTURES, { filter: str => str.structureType == STRUCTURE_LAB && str.isActive() })

        if (labs.length < 10) {                 // Wenn weniger als 10 Labore vorhanden erfolgt keine Produktion
            boosterprod = false
        } else {
            if (Memory.rezepte[Auftragrezept] == undefined) {
                console.log('Rezept ' + Auftragrezept + ' in Raum ' + room + ' nicht definiert!')
                boosterprod = false
            } else {
                var rezept = Memory.rezepte[Auftragrezept]
                boosterprod = true
            }
        }

        if (!boosterprod) {
            if (labs.length >= 1) {             // Jedoch wird ab einem Labor ein Booster bereitgestellt
                Memory.rooms[room].Labs.Boosts.XGH2O = { type: 'XGH2O', id: labs[0].id, pos: labs[0].pos }
            }
        }

        if (boosterprod) {
            // ----- LABS definieren
            
            Memory.rooms[room].Labs.produkt = Auftragrezept
            if (rezept.prod != Memory.rooms[room].Labs.prod || 1 == 2) {  //Wenn sich die Anzahl der benötigten Labs ändert muss neu berechnet werden
                Memory.rooms[room].Labs.Labs = {}
                Memory.rooms[room].Labs.Boosts = {}
                alllabs = []
                labs.forEach(lab => {
                    alllabs.push(lab)
                });
                var found = false
                var startlab = 0
                switch (true) {                     //Je Anzahl an benötigten labs wird eine andere Prozedur aufgerufen
                    case rezept.prod == 7:             // 7: C <= A + B  -- A <= A1 + A2  -- B <= B1 + B2
                        while (!found && startlab < 10) {
                            var labC = alllabs[startlab]
                            alllabs.splice(_.findIndex(alllabs, { 'id': labC.id }), 1)
                            var labIRC = labC.pos.findInRange(alllabs, 2)
                            var labA = labIRC[0]
                            alllabs.splice(_.findIndex(alllabs, { 'id': labA.id }), 1)
                            var labB = labIRC[1]
                            alllabs.splice(_.findIndex(alllabs, { 'id': labB.id }), 1)
                            var labIRA = labA.pos.findInRange(alllabs, 2)
                            var labA1 = labIRA[0]
                            alllabs.splice(_.findIndex(alllabs, { 'id': labA1.id }), 1)
                            var labA2 = labIRA[1]
                            alllabs.splice(_.findIndex(alllabs, { 'id': labA2.id }), 1)
                            var labIRB = labB.pos.findInRange(alllabs, 2)
                            var labB1 = labIRB[0]
                            alllabs.splice(_.findIndex(alllabs, { 'id': labB1.id }), 1)
                            var labB2 = labIRB[1]
                            alllabs.splice(_.findIndex(alllabs, { 'id': labB2.id }), 1)
                            if (labC && labA && labA1 && labA2 && labB && labB1 && labB2) {
                                found = true  //Wenn LAB Konfiguration gefunden dann found = true und While wird abgebrochen
                                Memory.rooms[room].Labs.Labs.C = { type: 'C', id: labC.id, pos: labC.pos }
                                Memory.rooms[room].Labs.Labs.A = { type: 'A', id: labA.id, pos: labA.pos }
                                Memory.rooms[room].Labs.Labs.B = { type: 'B', id: labB.id, pos: labB.pos }
                                Memory.rooms[room].Labs.Labs.A1 = { type: 'A1', id: labA1.id, pos: labA1.pos }
                                Memory.rooms[room].Labs.Labs.A2 = { type: 'A2', id: labA2.id, pos: labA2.pos }
                                Memory.rooms[room].Labs.Labs.B1 = { type: 'B1', id: labB1.id, pos: labB1.pos }
                                Memory.rooms[room].Labs.Labs.B2 = { type: 'B2', id: labB2.id, pos: labB2.pos }
                                Memory.rooms[room].Labs.prod = rezept.prod
                                Memory.rooms[room].Labs.Boosts.XGHO2 = { type: 'XGHO2', id: alllabs[0].id, pos: alllabs[0].pos }
                                Memory.rooms[room].Labs.Boosts.XLHO2 = { type: 'XLHO2', id: alllabs[1].id, pos: alllabs[1].pos }
                                Memory.rooms[room].Labs.Boosts.XKHO2 = { type: 'XKHO2', id: alllabs[2].id, pos: alllabs[2].pos }
                            }
                            startlab += 1
                        }

                        break;
                    case rezept.prod == 6:          // 6: C <= A + B  -- A <= A1 + A2  -- B <= B1 + A2
                        while (!found && startlab < 10) {
                            var labC = alllabs[startlab]
                            alllabs.splice(_.findIndex(alllabs, { 'id': labC.id }), 1)
                            var labIRC = labC.pos.findInRange(alllabs, 2)
                            var labA = labIRC[0]
                            alllabs.splice(_.findIndex(alllabs, { 'id': labA.id }), 1)
                            var labB = labIRC[1]
                            alllabs.splice(_.findIndex(alllabs, { 'id': labB.id }), 1)
                            var labIRA = labA.pos.findInRange(alllabs, 2)
                            var labA2
                            labIRA.forEach(lab => {
                                console.log(lab.pos.inRangeTo(labB, 2))
                                if (lab.pos.inRangeTo(labB, 2)) {
                                    labA2 = lab
                                }
                            })
                            alllabs.splice(_.findIndex(labIRA, { 'id': labA2.id }), 1)
                            alllabs.splice(_.findIndex(alllabs, { 'id': labA2.id }), 1)
                            var labA1 = labIRA[0]
                            alllabs.splice(_.findIndex(alllabs, { 'id': labA1.id }), 1)
                            var labIRB = labB.pos.findInRange(alllabs, 2)
                            var labB1 = labIRB[0]
                            alllabs.splice(_.findIndex(alllabs, { 'id': labB1.id }), 1)
                            if (labC && labA && labA1 && labA2 && labB && labB1) {
                                found = true  //Wenn LAB Konfiguration gefunden dann found = true und While wird abgebrochen
                                Memory.rooms[room].Labs.Labs.C = { type: 'C', id: labC.id, pos: labC.pos }
                                Memory.rooms[room].Labs.Labs.A = { type: 'A', id: labA.id, pos: labA.pos }
                                Memory.rooms[room].Labs.Labs.B = { type: 'B', id: labB.id, pos: labB.pos }
                                Memory.rooms[room].Labs.Labs.A1 = { type: 'A1', id: labA1.id, pos: labA1.pos }
                                Memory.rooms[room].Labs.Labs.A2 = { type: 'A2', id: labA2.id, pos: labA2.pos }
                                Memory.rooms[room].Labs.Labs.B1 = { type: 'B1', id: labB1.id, pos: labB1.pos }
                                Memory.rooms[room].Labs.prod = rezept.prod
                                Memory.rooms[room].Labs.Boosts.XGHO2 = { type: 'XGHO2', id: alllabs[0].id, pos: alllabs[0].pos }
                                Memory.rooms[room].Labs.Boosts.XLHO2 = { type: 'XLHO2', id: alllabs[1].id, pos: alllabs[1].pos }
                                Memory.rooms[room].Labs.Boosts.XKHO2 = { type: 'XKHO2', id: alllabs[2].id, pos: alllabs[2].pos }
                            }
                            startlab += 1
                        }
                        break;
                    case rezept.prod == 5:          // 5: C <= A + B  -- A <= A1 + A2  -- B <= B1 + A2
                        while (!found && startlab < 10) {
                            var labA2 = alllabs[startlab]
                            alllabs.splice(_.findIndex(alllabs, { 'id': labA2.id }), 1)
                            var labIRA2 = labA2.pos.findInRange(alllabs, 2)
                            var labA = labIRA2[0]
                            alllabs.splice(_.findIndex(alllabs, { 'id': labA.id }), 1)
                            var labB = labIRA2[1]
                            alllabs.splice(_.findIndex(alllabs, { 'id': labB.id }), 1)
                            var labIRA = labA.pos.findInRange(alllabs, 2)
                            var labA1 = labIRA[0]
                            alllabs.splice(_.findIndex(alllabs, { 'id': labA1.id }), 1)
                            var labIRB = labB.pos.findInRange(alllabs, 2)
                            var labB1 = labIRB[0]
                            alllabs.splice(_.findIndex(alllabs, { 'id': labB1.id }), 1)
                            if (labA && labA1 && labA2 && labB && labB1) {
                                found = true  //Wenn LAB Konfiguration gefunden dann found = true und While wird abgebrochen
                                Memory.rooms[room].Labs.Labs.A = { type: 'A', id: labA.id, pos: labA.pos }
                                Memory.rooms[room].Labs.Labs.B = { type: 'B', id: labB.id, pos: labB.pos }
                                Memory.rooms[room].Labs.Labs.A1 = { type: 'A1', id: labA1.id, pos: labA1.pos }
                                Memory.rooms[room].Labs.Labs.A2 = { type: 'A2', id: labA2.id, pos: labA2.pos }
                                Memory.rooms[room].Labs.Labs.B1 = { type: 'B1', id: labB1.id, pos: labB1.pos }
                                Memory.rooms[room].Labs.prod = rezept.prod
                                Memory.rooms[room].Labs.Boosts.XGHO2 = { type: 'XGHO2', id: alllabs[0].id, pos: alllabs[0].pos }
                                Memory.rooms[room].Labs.Boosts.XLHO2 = { type: 'XLHO2', id: alllabs[1].id, pos: alllabs[1].pos }
                                Memory.rooms[room].Labs.Boosts.XKHO2 = { type: 'XKHO2', id: alllabs[2].id, pos: alllabs[2].pos }
                                Memory.rooms[room].Labs.Boosts.XGHO2 = { type: 'XGHO2', id: alllabs[3].id, pos: alllabs[3].pos }
                            }
                            startlab += 1
                        }
                        break;
                }
            }
        }
        // ----- LABs Liefer und Abhohlaufträge erstellen
        Memory.rooms[room].Labs.Minerals = {}
        Memory.rooms[room].Labs.Minerals.have = {}
        Memory.rooms[room].Labs.Minerals.need = {}
        Memory.rooms[room].Labs.Minerals.Terminal = { id: terminal.id, type: 'terminal', res: '', amount: 50000, pos: terminal.pos }
        minneed = []
        minhave = []
        if (boosterprod) {                                //Wenn keine Produktion (weniger als 10 Labs oder kein Rezept), dann gibts keine Produktionslabore, daher keine Lieferaufträge!
            //Produktionslabore:
            for (const labtype of Object.keys(rezept.rezept)) {
                var lab = Game.getObjectById(Memory.rooms[room].Labs.Labs[labtype].id)
                if (lab.mineralType == rezept.rezept[labtype].mineral || lab.mineralType == null) {  //Überprüfen ob Minerals im Lab sind die nicht hineingehören, falls ja dann Auftrag für räumen erteilen
                    if (rezept.rezept[labtype].type == 'source') {
                        if (lab.mineralAmount < 2000) {
                            minneed.push({ id: lab.id, type: 'lab', res: rezept.rezept[labtype].mineral, amount: lab.mineralCapacity - lab.mineralAmount, pos: lab.pos })
                            if (terminal.store[rezept.rezept[labtype].mineral] != undefined) {
                                if (terminal.store[rezept.rezept[labtype].mineral] > lab.mineralCapacity - lab.mineralAmount) {
                                    minhave.push({ id: terminal.id, type: 'terminal', res: rezept.rezept[labtype].mineral, amount: lab.mineralCapacity - lab.mineralAmount, pos: terminal.pos })
                                } else {
                                    minhave.push({ id: terminal.id, type: 'terminal', res: rezept.rezept[labtype].mineral, amount: terminal.store[rezept.rezept[labtype].mineral], pos: terminal.pos })
                                }
                            }
                        }
                    } else if (rezept.rezept[labtype].type == 'prod') {
                        if (_.sum(terminal.store) < 290000) {
                            if (lab.mineralAmount > 500) {
                                minhave.push({ id: lab.id, type: 'lab', res: rezept.rezept[labtype].mineral, amount: lab.mineralAmount, pos: lab.pos })
                            }
                        }
                    }
                } else {
                    minhave.push({ id: lab.id, type: 'lab', res: lab.mineralType, amount: lab.mineralAmount, pos: lab.pos })
                }
            }
        }
        //Boost Labore: 
        for (var blab in Memory.rooms[room].Labs.Boosts) {
            var blabm = Memory.rooms[room].Labs.Boosts[blab]
            var blabo = Game.getObjectById(blabm.id)
            //console.log(blabo.mineralType)
            if (blabo.mineralType == blabm.type || blabo.mineralType == null) {
                //console.log (room,'auffüllen',blabm.type,blabo.mineralAmount)
                if (blabo.mineralAmount < 2000) {
                    minneed.push({ id: blabo.id, type: 'lab', res: blabm.type, amount: blabo.mineralCapacity - blabo.mineralAmount, pos: blabo.pos })
                    if (terminal.store[blabm.type] != undefined) {
                        if (terminal.store[blabm.type] > blabo.mineralCapacity - blabo.mineralAmount) {
                            minhave.push({ id: terminal.id, type: 'terminal', res: blabm.type, amount: blabo.mineralCapacity - blabo.mineralAmount, pos: terminal.pos })
                        } else {
                            minhave.push({ id: terminal.id, type: 'terminal', res: blabm.type, amount: terminal.store[blabm.type], pos: terminal.pos })
                        }
                    }
                }
            } else {
                //console.log(room,'leeren')
                minhave.push({ id: blabo.id, type: 'lab', res: blabo.mineralType, amount: blabo.mineralAmount, pos: blabo.pos })
            }
        }
        minhave.forEach(have => {
            Memory.rooms[room].Labs.Minerals.have[have.id] = have
            Memory.rooms[room].Labs.Minerals.have[have.id].Art = 'get'
        });
        minneed.forEach(need => {
            Memory.rooms[room].Labs.Minerals.need[need.id] = need
            Memory.rooms[room].Labs.Minerals.need[need.id].Art = 'push'
        });


        // ----- Lagerwerte in Memory schreiben
        Memory.rooms[room].Labs.Lager = {}
        // Memory.rooms[room].Labs.Lager[mineral].stored
        // Memory.rooms[room].Labs.Lager[mineral].Lagerneed
        // Memory.rooms[room].Labs.Lager[mineral].Lagerhave

        //Produktionslabore:
        if (boosterprod) {
            for (const labtype of Object.keys(rezept.rezept)) {
                var mineral = rezept.rezept[labtype].mineral

                if (Memory.Empire.Minerals[mineral] != undefined) {
                    if (rezept.rezept[labtype].type == 'source') {
                        if (Memory.Empire.Minerals[mineral].type == 'Ausgangsmaterial') {
                            Memory.rooms[room].Labs.Lager[mineral] = {}
                            Memory.rooms[room].Labs.Lager[mineral].Lagerneed = 0.9
                            Memory.rooms[room].Labs.Lager[mineral].Lagerhave = 3
                        } else if (Memory.Empire.Minerals[mineral].type == 'Zwischenprodukte') {
                            Memory.rooms[room].Labs.Lager[mineral] = {}
                            Memory.rooms[room].Labs.Lager[mineral].Lagerneed = 0.9
                            Memory.rooms[room].Labs.Lager[mineral].Lagerhave = 3
                        }
                    } else if (rezept.rezept[labtype].type == 'prod') {
                        if (Memory.Empire.Minerals[mineral] != undefined) {
                            if (Memory.Empire.Minerals[mineral].type == 'Zwischenprodukte') {
                                Memory.rooms[room].Labs.Lager[mineral] = {}
                                Memory.rooms[room].Labs.Lager[mineral].Lagerneed = 0
                                Memory.rooms[room].Labs.Lager[mineral].Lagerhave = 0.2
                            } else if (Memory.Empire.Minerals[mineral].type == 'Endprodukte') {
                                Memory.rooms[room].Labs.Lager[mineral] = {}
                                Memory.rooms[room].Labs.Lager[mineral].Lagerneed = 0
                                Memory.rooms[room].Labs.Lager[mineral].Lagerhave = 0.2
                            } else {
                                Memory.rooms[room].Labs.Lager[mineral].Lagerneed = 0.9
                                Memory.rooms[room].Labs.Lager[mineral].Lagerhave = 3
                            }
                        }
                    }
                }
            }
        }
        //Boost Labore: 
        for (var blab in Memory.rooms[room].Labs.Boosts) {
            var mineral = Memory.rooms[room].Labs.Boosts[blab].type
            Memory.rooms[room].Labs.Lager[mineral] = {}
            Memory.rooms[room].Labs.Lager[mineral].Lagerneed = 0.8
            Memory.rooms[room].Labs.Lager[mineral].Lagerhave = 1.2
        }

        if (boosterprod) {
            // LAB reactions durchführen
            for (const labtype of Object.keys(rezept.rezept)) {
                //console.log(Memory.Empire.Minerals[rezept.rezept[labtype].mineral].all)     
                var prodstop; var storeges
                if (rezept.rezept[labtype].type == 'prod') {
                    if (Memory.Empire.Minerals[rezept.rezept[labtype].mineral] == undefined) { prodstop = 1; storeges = 0 }
                    else {
                        prodstop = Memory.Empire.Minerals[rezept.rezept[labtype].mineral].prodstop;
                        storeges = Memory.Empire.Minerals[rezept.rezept[labtype].mineral].all
                    }

                    if (storeges < prodstop) {
                        var lab = Game.getObjectById(Memory.rooms[room].Labs.Labs[labtype].id)
                        //console.log(rezept.rezept[labtype].mineral,(Memory.Empire.Minerals[rezept.rezept[labtype].mineral] && lab.mineralAmount < 2000) < 2000 , (Memory.Empire.Minerals[rezept.rezept[labtype].mineral] == undefined && lab.mineralAmount < 100))
                        if ((Memory.Empire.Minerals[rezept.rezept[labtype].mineral] && lab.mineralAmount < 2000) || (Memory.Empire.Minerals[rezept.rezept[labtype].mineral] == undefined && lab.mineralAmount < 100)) {
                            var lab1 = Game.getObjectById(Memory.rooms[room].Labs.Labs[rezept.rezept[labtype].source1].id)
                            var lab2 = Game.getObjectById(Memory.rooms[room].Labs.Labs[rezept.rezept[labtype].source2].id)
                            if (lab1.mineralType == rezept.rezept[rezept.rezept[labtype].source1].mineral && lab2.mineralType == rezept.rezept[rezept.rezept[labtype].source2].mineral) {
                                lab.runReaction(lab1, lab2)
                            }
                        }
                    } else {
                        console.log('Produktionsstop für ' + rezept.rezept[labtype].mineral + ' in ' + room + ' -- ' + storeges + ' / ' + prodstop)
                    }
                }
            }
        }




        return;
    }
}

module.exports = reactions