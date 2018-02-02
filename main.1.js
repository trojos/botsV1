//var setMemoryLocation = require('set.Memory.Location')
//var setMemorycreepneed = require('set.Memory.creepneed')

var roleMiner = require('role.miner');
var roleUpgrader = require('role.upgrader');
var roleUpgraderStorage = require('role.upgraderstorage')

var rolelooter = require('role.looter')

var rolecarry = require('role.carry.old');
var rolecarry2 = require('role.carry2');
var roleBmstr = require('role.bmstr');
var roledestruct = require('role.destruct');

var roledefend = require('role.defend')

var rolescout = require('role.scout')
//var roleattack = require('role.NahDD')
var roleClaim = require('role.claim')

var roleMinHarv = require('role.MinHarv')

var rolekeeperscout = require('role.keeper.scout')
var rolekeeperFernDD = require('role.keeper.FernDD')
var rolekeeperHeal = require('role.keeper.Heiler')
var rolekeeperNahDD = require('role.keeper.NahDD')
var rolekeepercarry = require('role.keeper.carry')
var rolekeeperbmstr = require('role.keeper.bmstr')
var rolekeeperminer = require('role.keeper.miner')
var rolekeeperMinHarv = require('role.keeper.MinHarv')

//var buildstrucwall = require('build.struc.wall');
//var buildroad = require('build.roads');

var towerattack = require('tower.attack')

var empireroom = require('empire.room')
var reactions = require('empire.reactions')
var mineralrezepte = require('mineral.rezepte')
//var creepspawn = require('creepspawn')

var squadattack = require('squadattack')


module.exports.loop = function () {
    if (Memory.stats == undefined) { Memory.stats = {} }
    Memory.stats['CPU.maininit'] = Game.cpu.getUsed()
    console.log('Init Main ' + Memory.stats['CPU.maininit'])

    mineralrezepte.run()

    //Protoype für moveTo2 festlegen
    //Memory.CPUMove2 = 0
    Creep.prototype.moveTo2 = function (target, opts, keeperroom) {
        if (opts == undefined) { opts = {} }
        if (opts.reusePath == undefined) { opts.reusePath = 100 }
        if (opts.ignoreCreeps == undefined) { opts.ignoreCreeps = true }
        if (keeperroom) {
            var rn = this.room.name
            if (Memory.rooms[rn]) {
                opts.costCallback = function (roomName) { return PathFinder.CostMatrix.deserialize(Memory.rooms[rn].savetravel) }
            }
        }
        var me = this.moveTo(target, opts);
        if (me == -2) { delete this.memory._move }
        //var cpuvor = Game.cpu.getUsed()
        if (this.memory._move == undefined) {
        } else {
            if (this.memory._move.tile == undefined) {
                this.memory._move.tile = this.pos
                this.memory._move.ontile = 0
            } else {
                if (this.pos.isEqualTo(new RoomPosition(this.memory._move.tile.x, this.memory._move.tile.y, this.memory._move.tile.roomName))) {
                    this.memory._move.ontile += 1
                } else {
                    this.memory._move.ontile = 0
                }
                if (this.memory._move.ontile >= 3) {
                    this.memory._move = {}
                    opts.reusePath = 5
                    opts.ignoreCreeps = false
                    delete opts.costCallback
                    this.moveTo(target, opts);
                } else {
                    this.memory._move.tile = this.pos
                }
            }
        }
        //var cpunach = Game.cpu.getUsed()
        //Memory.CPUMove2 += cpunach - cpuvor
        return me
    }

    // Text für Controller.sign 
    Memory.signtext = "Hallo"

    // Nicht vorhandene Creeps aus Memory löschen
    for (var name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }

    if (Game.time % 1 === 0) {

    }

    // REACTIONS ausführen   -- vor Räume damit in RaumInit die Carry Auftrage berücksichtigt und bearbeitet werden können
    // Rezepte: G, LHO2, KHO2, GHO2, GH2O, XLHO2_XKHO2, XGH2O_XGHO2
    if (1 == 1) {
        var reactionsvor = Game.cpu.getUsed()
        reactions.run('W2S18', 'LHO2')
        reactions.run('W2S19', 'KHO2')
        reactions.run('W7S15', 'GHO2')
        //reactions.run('W7S17', 'LHO2');
        reactions.run('W4S17', 'G')
        //reactions.run('W3S18', 'GHO2');
        reactions.run('W1S17', 'XLHO2_XKHO2')
        //('reaction CPU: ' + (Game.cpu.getUsed() - reactionsvor))
    }

    Memory.Empire = {}
    Memory.Empire.rooms = {}
    Memory.Empire.Attack = {}
    Memory.Empire.Minerals = {}

    // ------------- SUBRÄUME  Subräume ausführen
    //{ targetroom: 'W1S18', todo: 'harvest' },
    //{ targetroom: 'W4S16', todo: 'keeper' },
    //{ targetroom: 'W8S16', todo: 'claim' },
    //{ targetroom: 'W8S16', todo: 'bmstr' },
    // Anzahl der Creeps in attack ist die GESAMTANZAHL der Creeps die angreifen sollen, auch wenn Angriff von mehreren Räumen gestartet wird
    //{ targetroom: 'W5S18', todo: 'attack', type: 1, NahDD: 2, FernDD: 2, Heiler: 2, Dismantler: 0, attackcontroller: false, boost: true},
    empireroom.run('W2S18', [
        { targetroom: 'W1S18', todo: 'harvest' },
    ])
    empireroom.run('W2S19', [
        { targetroom: 'W3S19', todo: 'harvest' },
        { targetroom: 'W1S19', todo: 'harvest' },
        { targetroom: 'W6S18', todo: 'claim' },
    ])
    empireroom.run('W1S17', [
        { targetroom: 'W1S16', todo: 'harvest' },
        { targetroom: 'W2S17', todo: 'harvest' },
        { targetroom: 'W2S16', todo: 'harvest' },
    ])
    empireroom.run('W4S17', [
        { targetroom: 'W3S17', todo: 'harvest' },
        { targetroom: 'W5S17', todo: 'harvest' },
        { targetroom: 'W4S16', todo: 'keeper' },
        { targetroom: 'W6S18', todo: 'claim' },
    ])
    empireroom.run('W7S17', [
        { targetroom: 'W6S17', todo: 'harvest' },
        { targetroom: 'W7S16', todo: 'harvest' },
        //{ targetroom: 'W6S16', todo: 'keeper' },
    ])
    empireroom.run('W3S18', [
        { targetroom: 'W4S18', todo: 'harvest' },
        { targetroom: 'W4S19', todo: 'harvest' },
    ])
    empireroom.run('W7S15', [
        { targetroom: 'W8S15', todo: 'harvest' },
        { targetroom: 'W6S15', todo: 'keeper' },
        { targetroom: 'W7S14', todo: 'attack', type: 1, NahDD: 0, FernDD: 1, Heiler: 1, Dismantler: 0, attackcontroller: false, boost: false },
    ])
    empireroom.run('W8S16', [
        { targetroom: 'W9S17', todo: 'harvest' },
        { targetroom: 'W8S17', todo: 'harvest' },
    ])
    empireroom.run('W6S18', [
        //{ targetroom: 'W9S17', todo: 'harvest' },
        //{ targetroom: 'W8S17', todo: 'harvest' },
    ])

    // ------------- SQUADATTACK Ausführen von squadattack
    var targetrooms = Memory.Empire.Attack
    for (const target in targetrooms) {
        var attackrooms = targetrooms[target].from.length
        squadattack.run(targetrooms[target].from[0], target, targetrooms[target].from.length, targetrooms[target].type,
            targetrooms[target].NahDD / attackrooms,
            targetrooms[target].FernDD / attackrooms,
            targetrooms[target].Heiler / attackrooms,
            targetrooms[target].Dismantler / attackrooms,
            targetrooms[target].boost)
    }

    // ------------- ENERGIE Durchführen Energieausgleich
    //Memory.Empire.rooms.W3S18.Energie.min = 1.2    //Manuelles Ändern der Caps für einzelne Räume
    //Memory.Empire.rooms.W3S18.Energie.max = 1.5    //Standart ist min 0.9 und max 1.1
    //Memory.Empire.rooms.W7S15.Energie.min = 1.5
    //Memory.Empire.rooms.W7S15.Energie.max = 1.7
    var Empire = Memory.Empire.rooms                 //Unter min wird angefordert (need), Über max (have) wird an need gesendet
    var AllEnergyRooms = []
    var GesamteEnergie = 0
    var Durchschnitt = 0
    for (const room in Empire) {
        if (Empire[room].Energie == undefined) { } else {
            GesamteEnergie += Empire[room].Energie.store
            //console.log(room,Empire[room].Energie.store)
            AllEnergyRooms.push(room)
        }
    }
    Durchschnitt = Math.floor(GesamteEnergie / AllEnergyRooms.length)
    var HaveEnergyrooms = []
    var NeedEnergyrooms = {}
    AllEnergyRooms.forEach(room => {
        if (Empire[room].Energie.store < Durchschnitt * Empire[room].Energie.min) {
            NeedEnergyrooms[room] = { room: room, store: Empire[room].Energie.store }
        } else if (Empire[room].Energie.store > Durchschnitt * Empire[room].Energie.max) {
            HaveEnergyrooms.push(room)
        }
    });

    if (HaveEnergyrooms.length > 0 && _.size(NeedEnergyrooms) > 0) {
        HaveEnergyrooms.forEach(haveroom => {
            const mstore = (Game.rooms[haveroom].terminal.store[RESOURCE_ENERGY]) - 5000
            const amount = 15000
            //console.log(haveroom, JSON.stringify(Game.rooms[haveroom].terminal.store))
            //console.log (Game.rooms[haveroom].terminal.store[RESOURCE_ENERGY], amount)
            if (Game.rooms[haveroom].terminal.cooldown == 0 && mstore >= amount) {
                if (_.size(NeedEnergyrooms) > 0) {
                    var needroom = _.min(NeedEnergyrooms, 'store');

                    if (Game.rooms[needroom.room].terminal.store[RESOURCE_ENERGY] < 30000) {
                        ant = Game.rooms[haveroom].terminal.send(RESOURCE_ENERGY, amount, needroom.room)
                        if (ant == 0) {
                            console.log(haveroom + ' hat ' + needroom.room + ' ' + amount + ' gesendet')
                        } else {
                            console.log('Fehler beim senden von energy in  ' + haveroom + ' Code: ' + ant)
                        }
                        delete NeedEnergyrooms[needroom.room]
                    }
                }
            }
        })
    }
    Memory.stats['stored.energy.gesamt'] = GesamteEnergie
    Memory.stats['stored.energy.rooms'] = AllEnergyRooms.length
    Memory.stats['stored.energy.durchschnitt'] = Durchschnitt
    Memory.stats['stored.energy.need'] = _.size(NeedEnergyrooms)
    Memory.stats['stored.energy.have'] = HaveEnergyrooms.length

    // ------------- MINERAL - Lagerverwaltung
    //Definition Standartmengen  und thresholds
    var MinCPUvor = Game.cpu.getUsed()
    var Ausgangsmaterial = { H: 10000, O: 10000, X: 5000, Z: 5000, K: 5000, U: 5000, L: 5000 }
    var AMthresholds = { sell: 3, buy: 1, Lagerneed: 1, Lagerhave: 1.5 }
    var Zwischenprodukte = { G: 5000, LHO2: 5000, KHO2: 5000, GH2O: 5000, GHO2: 5000 }
    var ZPthresholds = { Lagerneed: 1, Lagerhave: 1.1 }
    var Endprodukte = { XLHO2: 10000, XKHO2: 10000, XGH2O: 5000, XGHO2: 10000, XZH2O: 5000 }
    var EPthresholds = { Lagerneed: 0.8, Lagerhave: 1.2 }
    var AlleProdukte = {}
    Object.assign(AlleProdukte, Ausgangsmaterial, Zwischenprodukte, Endprodukte)
    //Abfrage und Summierung Lagerstände für Minerals
    var Empire = Memory.Empire.rooms
    var AllMineralRooms = {}
    var MinGesamt = {}
    for (const mineral in AlleProdukte) {
        Memory.Empire.Minerals[mineral] = {}
        MinGesamt[mineral] = 0
    }
    for (const mineral in Ausgangsmaterial) { Memory.Empire.Minerals[mineral].type = 'Ausgangsmaterial' }
    for (const mineral in Zwischenprodukte) { Memory.Empire.Minerals[mineral].type = 'Zwischenprodukte' }
    for (const mineral in Endprodukte) { Memory.Empire.Minerals[mineral].type = 'Endprodukte' }
    for (const room in Empire) {
        if (Empire[room].Minerals == undefined) { } else {
            for (const mineral in AlleProdukte) {
                if (Empire[room].Minerals[mineral] == undefined) { } else {
                    MinGesamt[mineral] += Empire[room].Minerals[mineral]
                }
            }
            AllMineralRooms[room] = { room: room }
        }
    }
    if (Memory.Empire.Minerals == undefined) { Memory.Empire.Minerals = {} }
    Memory.Empire.Minerals.rooms = _.size(AllMineralRooms)
    for (const mineral in AlleProdukte) {
        Memory.Empire.Minerals[mineral].all = MinGesamt[mineral]
        Memory.Empire.Minerals[mineral].prodstop = _.size(AllMineralRooms) * AlleProdukte[mineral] * 2               // Hier fehlt code damit produktionsstop dynamisch anhand threshold berechnet wird! 
        //console.log(Memory.Empire.Minerals[mineral].prodstop)
        var storepfad = 'stored.mineral.gesamt.' + mineral      //in stats Speichern
        Memory.stats[storepfad] = MinGesamt[mineral]
    }
    //Überschuß verkaufen, Mangel zukaufen
    for (const mineral in Ausgangsmaterial) {
        //Verkaufen
        if (MinGesamt[mineral] > Ausgangsmaterial[mineral] * _.size(AllMineralRooms) * AMthresholds.sell) {
            var MinGesamtsell = (Ausgangsmaterial[mineral] * _.size(AllMineralRooms) * AMthresholds.sell - MinGesamt[mineral]) * -1
            var myorders = _.filter(Game.market.orders, { type: ORDER_SELL, resourceType: mineral })
            if (myorders) {
                MinGesamtsell -= _.sum(myorders, 'remainingAmount')
            }
            if (MinGesamtsell > 0) {
                var MinGesamtmax = _.findKey(Empire, _.max(Empire, function (rooms) { if (rooms.Minerals) { return rooms.Minerals[mineral] } }))
                if (1 == 1) {
                    var sellorders = Game.market.getAllOrders(order => order.type == ORDER_SELL && order.resourceType == mineral && order.remainingAmount > 100)
                    var buyorders = Game.market.getAllOrders(order => order.type == ORDER_BUY && order.resourceType == mineral && order.remainingAmount > 100)
                    buyorders = _.sortByOrder(buyorders, 'price', 'desc')
                    sellorders = _.sortByOrder(sellorders, 'price', 'asc')
                    console.log('buyorder: ' + buyorders[0].price + ' -- sellorder: ' + sellorders[0].price)
                    if (buyorders[0].price - 0.002 > sellorders[0].price) {  //Wenn Buyorder.price größer dann direkt verkaufen
                        var tradeamount
                        if (buyorders[0].remainingAmount < MinGesamtsell + 5000) { tradeamount = buyorders[0].remainingAmount } else { tradeamount = MinGesamtsell + 5000 }
                        console.log(buyorders[0].id, tradeamount, MinGesamtmax)
                        ant = Game.market.deal(buyorders[0].id, tradeamount, MinGesamtmax)
                        if (ant == 0) {
                            console.log(MinGesamtmax + ' verkaufte ' + mineral + ' um ' + buyorders[0].price)
                        } else {
                            console.log('Fehler beim verkaufen in ' + MinGesamtmax + ' Code: ' + ant)
                        }
                    } else {
                        var tradeprice = sellorders[0].price - 0.002
                        ant = Game.market.createOrder(ORDER_SELL, mineral, tradeprice, MinGesamtsell + 5000, MinGesamtmax)
                        //ant = 0
                        if (ant == 0) {
                            console.log(MinGesamtmax + ' erstelle Sell Order für  ' + mineral + ' um ' + tradeprice)
                        } else {
                            console.log('Fehler beim erstellen einer SellOrder in ' + MinGesamtmax + ' Code: ' + ant)
                        }
                    }
                }
            }
            //Kaufen
        } else if (MinGesamt[mineral] < Ausgangsmaterial[mineral] * _.size(AllMineralRooms) * AMthresholds.buy) {
            var MinGesamtbuy = Ausgangsmaterial[mineral] * _.size(AllMineralRooms) * AMthresholds.buy - MinGesamt[mineral]
            var myorders = _.filter(Game.market.orders, { type: ORDER_BUY, resourceType: mineral })
            if (myorders) {
                MinGesamtbuy -= _.sum(myorders, 'remainingAmount')
            }
            if (MinGesamtbuy > 0) {
                var MinGesamtmin = _.findKey(Empire, _.min(Empire, function (rooms) { if (rooms.Minerals) { return rooms.Minerals[mineral] } }))
                if (MinGesamtmin == undefined) {    //Wenn in keinen Raum etwas ist dann wäre undefined, daher einfach beim ersten im Array
                    MinGesamtmin = Object.keys(AllMineralRooms)[0]
                }
                if (1 == 1) {
                    var sellorders = Game.market.getAllOrders(order => order.type == ORDER_SELL && order.resourceType == mineral && order.remainingAmount > 100)
                    var buyorders = Game.market.getAllOrders(order => order.type == ORDER_BUY && order.resourceType == mineral && order.remainingAmount > 100)
                    buyorders = _.sortByOrder(buyorders, 'price', 'desc')
                    sellorders = _.sortByOrder(sellorders, 'price', 'asc')
                    //console.log('buyorder: ' + buyorders[0].price + ' -- sellorder: ' + sellorders[0].price)
                    if (buyorders.length < 1) {         // Wenn keine Buyorders vorhanden sind wird eine Dummy Order erstellte. Wenn die Sellorder unter dem Preis liegt dann wird gekauft, ansonsten eine neue Buyorder mit dem Preis erstellt
                        var buyorders = []
                        buyorders[0] = { price: 1 }
                    }
                    if (sellorders.length < 1) {        // Wenn keine Sellorder dann ähnlich wie oben!
                        var sellorders = []
                        sellorders[0] = { price: 100 }
                    }

                    if (buyorders.length + 0.002 > 0 && sellorders.length > 0) {
                        if (buyorders[0].price > sellorders[0].price) {  //Wenn Sellorder.price kleiner dann direkt kaufen
                            var tradeamount
                            if (sellorders[0].remainingAmount < MinGesamtbuy + 5000) { tradeamount = sellorders[0].remainingAmount } else { tradeamount = MinGesamtbuy + 5000 }
                            ant = Game.market.deal(sellorders[0].id, tradeamount, MinGesamtmin)
                            //ant = 0
                            if (ant == 0) {
                                console.log(MinGesamtmin + ' kaufte ' + mineral + ' um ' + sellorders[0].price)
                            } else {
                                console.log('Fehler beim Kaufen in ' + MinGesamtmin + ' Code: ' + ant)
                            }
                        } else {
                            var tradeprice = buyorders[0].price + 0.002
                            ant = Game.market.createOrder(ORDER_BUY, mineral, tradeprice, MinGesamtbuy + 5000, MinGesamtmin)
                            //ant = 0
                            if (ant == 0) {
                                console.log(MinGesamtmin + ' erstelle Buy Order für  ' + mineral + ' um ' + tradeprice)
                            } else {
                                console.log('Fehler beim erstellen einer BuyOrder in ' + MinGesamtmin + ' Code: ' + ant)
                            }
                        }
                    }
                }
            }
        }
    }
    //Endprodukte kaufen
    var buyEnd = { XLHO2: 10000, XKHO2: 10000, XZH2O: 10000 }
    for (const mineral in buyEnd) {
        //if (MinGesamt[mineral] == undefined ){ MinGesamt[mineral] = 0}
        //console.log(mineral, MinGesamt[mineral], buyEnd[mineral])
        if (MinGesamt[mineral] < buyEnd[mineral]) {
            var MinGesamtbuy = 20000 - MinGesamt[mineral]
            var myorders = _.filter(Game.market.orders, { type: ORDER_BUY, resourceType: mineral })
            if (myorders) {
                MinGesamtbuy -= _.sum(myorders, 'remainingAmount')
            }
            if (MinGesamtbuy > 0) {
                var MinGesamtmin = _.findKey(Empire, _.min(Empire, function (rooms) { if (rooms.Minerals) { return rooms.Minerals[mineral] } }))
                if (MinGesamtmin == undefined) {    //Wenn in keinen Raum etwas ist dann wäre undefined, daher einfach beim ersten im Array
                    MinGesamtmin = Object.keys(AllMineralRooms)[0]
                }
                if (1 == 1) {
                    var sellorders = Game.market.getAllOrders(order => order.type == ORDER_SELL && order.resourceType == mineral && order.remainingAmount > 100)
                    var buyorders = Game.market.getAllOrders(order => order.type == ORDER_BUY && order.resourceType == mineral && order.remainingAmount > 100)
                    buyorders = _.sortByOrder(buyorders, 'price', 'desc')
                    sellorders = _.sortByOrder(sellorders, 'price', 'asc')
                    if (buyorders.length < 1) {         // Wenn keine Buyorders vorhanden sind wird eine Dummy Order erstellte. Wenn die Sellorder unter dem Preis liegt dann wird gekauft, ansonsten eine neue Buyorder mit dem Preis erstellt
                        var buyorders = []
                        buyorders[0] = { price: 4 }
                    }
                    if (sellorders.length < 1) {        // Wenn keine Sellorder dann ähnlich wie oben!
                        var sellorders = []
                        sellorders[0] = { price: 100 }
                    }
                    if (buyorders.length > 0 && sellorders.length > 0) {
                        if (buyorders[0].price + 0.002 > sellorders[0].price) {  //Wenn Sellorder.price kleiner dann direkt kaufen
                            var tradeamount
                            if (sellorders[0].remainingAmount < MinGesamtbuy + 5000) { tradeamount = sellorders[0].remainingAmount } else { tradeamount = MinGesamtbuy + 5000 }
                            ant = Game.market.deal(sellorders[0].id, tradeamount, MinGesamtmin)
                            //ant = 0
                            if (ant == 0) {
                                console.log(MinGesamtmin + ' kaufte ' + mineral + ' um ' + sellorders[0].price)
                            } else {
                                console.log('Fehler beim Kaufen in ' + MinGesamtmin + ' Code: ' + ant)
                            }
                        } else {
                            var tradeprice = buyorders[0].price + 0.002
                            ant = Game.market.createOrder(ORDER_BUY, mineral, tradeprice, MinGesamtbuy + 5000, MinGesamtmin)
                            //ant = 0
                            if (ant == 0) {
                                console.log(MinGesamtmin + ' erstelle Buy Order für  ' + mineral + ' um ' + tradeprice)
                            } else {
                                console.log('Fehler beim erstellen einer BuyOrder in ' + MinGesamtmin + ' Code: ' + ant)
                            }
                        }
                    }
                }
            }
        }


    }

    var myorders = _.filter(Game.market.orders)
    if (_.size(myorders) > 0) {
        console.log('Marktorders:')
        for (const order in myorders) {
            if (myorders[order].remainingAmount == 0) {
                Game.market.cancelOrder(myorders[order].id)
            } else if (Game.time - myorders[order].created > 5000) {
                Game.market.cancelOrder(myorders[order].id)
            } else {
                console.log(myorders[order].type, myorders[order].resourceType, myorders[order].remainingAmount, '/', myorders[order].totalAmount, 'um', myorders[order].price, ',Seit', Game.time - myorders[order].created)
            }
        }
    }

    //Ermittlung der Durchschnittswerte für die Endeprodukte. Damit in allen Räumen etwa gleichviel ist und nicht zuerst bei einem das Cap gefüllt wird und dann beim nächsten
    var MinEndDurchschnitt = {}
    for (const mineral in Endprodukte) {
        MinEndDurchschnitt[mineral] = 0
        MinEndDurchschnitt[mineral] = Math.floor(MinGesamt[mineral] / _.size(AllMineralRooms))
        Memory.Empire.Minerals[mineral].average = MinEndDurchschnitt[mineral]
    }
    //Ermittlung in welchen Räumen Überschuß und in welchen need
    for (const room in AllMineralRooms) {
        if (Memory.rooms[room].Labs.Lager == undefined) { } else {
            for (const mineral in Ausgangsmaterial) {
                AllMineralRooms[room][mineral] = {}
                if (Empire[room].Minerals[mineral] == undefined) {
                    Empire[room].Minerals[mineral] = 0
                    AllMineralRooms[room][mineral].store = 0
                } else {
                    AllMineralRooms[room][mineral].store = Empire[room].Minerals[mineral]
                }
                if (Memory.rooms[room].Labs.Lager[mineral] == undefined) {
                    var Lagerneed = 0
                    var Lagerhave = 0
                } else {
                    var Lagerneed = Memory.rooms[room].Labs.Lager[mineral].Lagerneed
                    var Lagerhave = Memory.rooms[room].Labs.Lager[mineral].Lagerhave
                }
                if (Empire[room].Minerals[mineral] < Ausgangsmaterial[mineral] * Lagerneed) {
                    AllMineralRooms[room][mineral].need = true
                    AllMineralRooms[room][mineral].have = false
                } else if (Empire[room].Minerals[mineral] > Ausgangsmaterial[mineral] * Lagerhave) {
                    AllMineralRooms[room][mineral].need = false
                    AllMineralRooms[room][mineral].have = true
                } else {
                    AllMineralRooms[room][mineral].need = false
                    AllMineralRooms[room][mineral].have = false
                }
            }
            for (const mineral in Zwischenprodukte) {
                AllMineralRooms[room][mineral] = {}
                if (Empire[room].Minerals[mineral] == undefined) {
                    Empire[room].Minerals[mineral] = 0
                    AllMineralRooms[room][mineral].store = 0
                } else {
                    AllMineralRooms[room][mineral].store = Empire[room].Minerals[mineral]
                }
                if (Memory.rooms[room].Labs.Lager[mineral] == undefined) {
                    var Lagerneed = 0
                    var Lagerhave = 0
                } else {
                    var Lagerneed = Memory.rooms[room].Labs.Lager[mineral].Lagerneed
                    var Lagerhave = Memory.rooms[room].Labs.Lager[mineral].Lagerhave
                }
                if (Empire[room].Minerals[mineral] < Zwischenprodukte[mineral] * Lagerneed) {
                    AllMineralRooms[room][mineral].need = true
                    AllMineralRooms[room][mineral].have = false
                } else if (Empire[room].Minerals[mineral] > Zwischenprodukte[mineral] * Lagerhave) {
                    AllMineralRooms[room][mineral].need = false
                    AllMineralRooms[room][mineral].have = true
                } else {
                    AllMineralRooms[room][mineral].need = false
                    AllMineralRooms[room][mineral].have = false
                }
            }
            for (const mineral in Endprodukte) {
                AllMineralRooms[room][mineral] = {}
                if (Empire[room].Minerals[mineral] == undefined) {
                    Empire[room].Minerals[mineral] = 0
                    AllMineralRooms[room][mineral].store = 0
                } else {
                    AllMineralRooms[room][mineral].store = Empire[room].Minerals[mineral]
                }
                if (Memory.rooms[room].Labs.Lager[mineral] == undefined) {
                    var Lagerneed = 0
                    var Lagerhave = 0
                } else {
                    var Lagerneed = Memory.rooms[room].Labs.Lager[mineral].Lagerneed
                    var Lagerhave = Memory.rooms[room].Labs.Lager[mineral].Lagerhave
                }
                if (Empire[room].Minerals[mineral] < MinEndDurchschnitt[mineral] * Lagerneed) {
                    AllMineralRooms[room][mineral].need = true
                    AllMineralRooms[room][mineral].have = false
                } else if (Empire[room].Minerals[mineral] > MinEndDurchschnitt[mineral] * Lagerhave) {
                    AllMineralRooms[room][mineral].need = false
                    AllMineralRooms[room][mineral].have = true
                } else {
                    AllMineralRooms[room][mineral].need = false
                    AllMineralRooms[room][mineral].have = false
                }
            }
        }
    }
    for (const mineral in AlleProdukte) {
        for (const room in AllMineralRooms) {
            if (AllMineralRooms[room][mineral] == undefined) { } else {
                if (Game.rooms[room].terminal.cooldown == 0) {
                    if (AllMineralRooms[room][mineral].have) {
                        var MinGesendet = false
                        for (const roomneed in AllMineralRooms) {
                            if (AllMineralRooms[roomneed][mineral] == undefined) { } else {
                                if (AllMineralRooms[roomneed][mineral].need && !MinGesendet) {
                                    var amount
                                    if (Endprodukte[mineral]) {
                                        //amount = Math.floor(MinEndDurchschnitt[mineral] * (EPthresholds.Lagerhave - EPthresholds.Lagerneed) / 2)
                                        amount = Math.floor(MinEndDurchschnitt[mineral] - AllMineralRooms[roomneed][mineral].store)
                                    } else {
                                        amount = AlleProdukte[mineral] - AllMineralRooms[roomneed][mineral].store
                                    }
                                    if (amount > AllMineralRooms[room][mineral].store ){ amount = AllMineralRooms[room][mineral].store}
                                    if (amount > 100) {
                                        ant = Game.rooms[room].terminal.send(mineral, amount, roomneed)
                                        //ant = 1
                                        if (ant == 0) {
                                            console.log(amount + ' ' + mineral + ' von ' + room + ' nach ' + roomneed + ' senden')
                                            AllMineralRooms[roomneed][mineral].need = false
                                            var MinGesendet = true
                                        } else {
                                            //console.log(mineral, amount, roomneed)
                                            console.log('Fehler beim senden von ' + amount, mineral + ' von ' + room + ' nach ' + roomneed + ' Code: ' + ant)
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    //console.log(JSON.stringify(AllMineralRooms))

    //console.log('mineral CPU: ', Game.cpu.getUsed() - MinCPUvor)


    // ------------- TOWER Tower Code ausführen
    var CPUtowervor = Game.cpu.getUsed()
    towerattack.run()
    Memory.stats['CPU.tower'] = Game.cpu.getUsed() - CPUtowervor

    //  -------------  CREEPS
    Memory.stats['CPU.role.destruct'] = 0
    Memory.stats['CPU.role.miner'] = 0
    Memory.stats['CPU.role.carry'] = 0
    Memory.stats['CPU.role.bmstr'] = 0
    Memory.stats['CPU.role.upgrader'] = 0
    Memory.stats['CPU.role.upgraderstorage'] = 0
    Memory.stats['CPU.role.scout'] = 0
    Memory.stats['CPU.role.defend'] = 0
    Memory.stats['CPU.role.claim'] = 0
    Memory.stats['CPU.role.min_harv'] = 0
    Memory.stats['CPU.role.keeperscout'] = 0
    Memory.stats['CPU.role.keeperheal'] = 0
    Memory.stats['CPU.role.keeperFernDD'] = 0
    Memory.stats['CPU.role.keeper_carry'] = 0
    Memory.stats['CPU.role.keeperbmstr'] = 0
    Memory.stats['CPU.role.keeper_miner'] = 0
    Memory.stats['CPU.role.keeper_NahDD'] = 0
    Memory.stats['CPU.role.keeper_MinHarv'] = 0
    Memory.stats['CPU.role.looter'] = 0

    Memory.stats['creeps.role.destruct'] = 0
    Memory.stats['creeps.role.miner'] = 0
    Memory.stats['creeps.role.carry'] = 0
    Memory.stats['creeps.role.bmstr'] = 0
    Memory.stats['creeps.role.upgrader'] = 0
    Memory.stats['creeps.role.upgraderstorage'] = 0
    Memory.stats['creeps.role.scout'] = 0
    Memory.stats['creeps.role.defend'] = 0
    Memory.stats['creeps.role.claim'] = 0
    Memory.stats['creeps.role.min_harv'] = 0
    Memory.stats['creeps.role.keeperscout'] = 0
    Memory.stats['creeps.role.keeperheal'] = 0
    Memory.stats['creeps.role.keeperFernDD'] = 0
    Memory.stats['creeps.role.keeper_carry'] = 0
    Memory.stats['creeps.role.keeperbmstr'] = 0
    Memory.stats['creeps.role.keeper_miner'] = 0
    Memory.stats['creeps.role.keeper_NahDD'] = 0
    Memory.stats['creeps.role.keeper_MinHarv'] = 0
    Memory.stats['CPU.role.carry2'] = 0
    Memory.stats['creeps.role.carry2'] = 0
    Memory.stats['creeps.role.looter'] = 0

    // for (var name in Game.creeps) {
    //     var creep = Game.creeps[name];
    //     if (creep.memory.role == 'carry' && creep.memory.home == creep.memory.targetroom) {
    //         if (creep.ticksToLive > 1450) {
    //             creep.memory.role = "destruct"
    //             console.log('umgewandelt')
    //         }
    //         //creep.memory.role = 'carry2'

    //     }
    // }

    for (var name in Game.creeps) {
        var creep = Game.creeps[name];
        var ccpuvor = Game.cpu.getUsed()
        if (creep.memory.role == 'carry2') {
            rolecarry2.run(creep);
            Memory.stats['CPU.role.carry2'] += Game.cpu.getUsed() - ccpuvor
            Memory.stats['creeps.role.carry2'] += 1
        } else if (creep.memory.role == 'carry') {
            rolecarry.run(creep);
            Memory.stats['CPU.role.carry'] += Game.cpu.getUsed() - ccpuvor
            Memory.stats['creeps.role.carry'] += 1
        } else if (creep.memory.role == 'miner') {
            roleMiner.run(creep);
            Memory.stats['CPU.role.miner'] += Game.cpu.getUsed() - ccpuvor
            Memory.stats['creeps.role.miner'] += 1
        } else if (creep.memory.role == 'bmstr') {
            roleBmstr.run(creep);
            Memory.stats['CPU.role.bmstr'] += Game.cpu.getUsed() - ccpuvor
            Memory.stats['creeps.role.bmstr'] += 1
        } else if (creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
            Memory.stats['CPU.role.upgrader'] += Game.cpu.getUsed() - ccpuvor
            Memory.stats['creeps.role.upgrader'] += 1
        } else if (creep.memory.role == 'upgraderstorage') {
            roleUpgraderStorage.run(creep)
            Memory.stats['CPU.role.upgraderstorage'] += Game.cpu.getUsed() - ccpuvor
            Memory.stats['creeps.role.upgraderstorage'] += 1
        } else if (creep.memory.role == 'scout') {
            rolescout.run(creep)
            Memory.stats['CPU.role.scout'] += Game.cpu.getUsed() - ccpuvor
            Memory.stats['creeps.role.scout'] += 1
        } else if (creep.memory.role == 'claim') {
            roleClaim.run(creep);
            Memory.stats['CPU.role.claim'] += Game.cpu.getUsed() - ccpuvor
            Memory.stats['creeps.role.claim'] += 1
        } else if (creep.memory.role == 'min_harv') {
            roleMinHarv.run(creep);
            Memory.stats['CPU.role.min_harv'] += Game.cpu.getUsed() - ccpuvor
            Memory.stats['creeps.role.min_harv'] += 1
        } else if (creep.memory.role == 'keeperscout') {
            rolekeeperscout.run(creep);
            Memory.stats['CPU.role.keeperscout'] += Game.cpu.getUsed() - ccpuvor
            Memory.stats['creeps.role.keeperscout'] += 1
        } else if (creep.memory.role == 'keeperheal') {
            rolekeeperHeal.run(creep);
            Memory.stats['CPU.role.keeperheal'] += Game.cpu.getUsed() - ccpuvor
            Memory.stats['creeps.role.keeperheal'] += 1
        } else if (creep.memory.role == 'keeperFernDD') {
            rolekeeperFernDD.run(creep);
            Memory.stats['CPU.role.keeperFernDD'] += Game.cpu.getUsed() - ccpuvor
            Memory.stats['creeps.role.keeperFernDD'] += 1
        } else if (creep.memory.role == 'keeper_carry') {
            rolekeepercarry.run(creep);
            Memory.stats['CPU.role.keeper_carry'] += Game.cpu.getUsed() - ccpuvor
            Memory.stats['creeps.role.keeper_carry'] += 1
        } else if (creep.memory.role == 'keeperbmstr') {
            rolekeeperbmstr.run(creep);
            Memory.stats['CPU.role.keeperbmstr'] += Game.cpu.getUsed() - ccpuvor
            Memory.stats['creeps.role.keeperbmstr'] += 1
        } else if (creep.memory.role == 'keeper_miner') {
            rolekeeperminer.run(creep);
            Memory.stats['CPU.role.keeper_miner'] += Game.cpu.getUsed() - ccpuvor
            Memory.stats['creeps.role.keeper_miner'] += 1
        } else if (creep.memory.role == 'keeper_NahDD') {
            rolekeeperNahDD.run(creep);
            Memory.stats['CPU.role.keeper_NahDD'] += Game.cpu.getUsed() - ccpuvor
            Memory.stats['creeps.role.keeper_NahDD'] += 1
        } else if (creep.memory.role == 'keeper_MinHarv') {
            rolekeeperMinHarv.run(creep);
            Memory.stats['CPU.role.keeper_MinHarv'] += Game.cpu.getUsed() - ccpuvor
            Memory.stats['creeps.role.keeper_MinHarv'] += 1
        } else if (creep.memory.role == 'defend') {
            roledefend.run(creep);
            Memory.stats['CPU.role.defend'] += Game.cpu.getUsed() - ccpuvor
            Memory.stats['creeps.role.defend'] += 1
        } else if (creep.memory.role == 'destruct') {
            roledestruct.run(creep);
            Memory.stats['CPU.role.destruct'] += Game.cpu.getUsed() - ccpuvor
            Memory.stats['creeps.role.destruct'] += 1
        } else if (creep.memory.role == 'looter') {
            rolelooter.run(creep);
            Memory.stats['CPU.role.looter'] += Game.cpu.getUsed() - ccpuvor
            Memory.stats['creeps.role.looter'] += 1
        }

    }


    //var monroom = 'W7S15'
    //console.log(monroom + ': RCL' + Game.rooms[monroom].controller.level, Game.rooms[monroom].controller.progress + ' / ' + Game.rooms[monroom].controller.progressTotal + ' --> ' + (Game.rooms[monroom].controller.progressTotal - Game.rooms[monroom].controller.progress) + ' left')
    var GCLvor = Memory.GCL
    var GCLnach = Math.ceil(Game.gcl.progress)
    var GCLdif = GCLnach - GCLvor
    Memory.GCL = GCLnach

    var tt = Game.time - (Math.floor(Game.time / 100) * 100)
    if (Memory.CPU == undefined) { Memory.CPU = {} }
    Memory.CPU[tt] = Game.cpu.getUsed()
    var cpusumme = _.sum(Memory.CPU) / 100

    Memory.stats['gcl.progress'] = Game.gcl.progress
    Memory.stats['gcl.progressTotal'] = Game.gcl.progressTotal
    Memory.stats['gcl.level'] = Game.gcl.level
    Memory.stats['gcl.gain'] = GCLdif

    Memory.stats['cpu.bucket'] = Game.cpu.bucket
    Memory.stats['cpu.limit'] = Game.cpu.limit
    Memory.stats['cpu.getUsed'] = Game.cpu.getUsed()


    console.log('--- Energie: ---  Gesamt: ' + GesamteEnergie + ' in ' + AllEnergyRooms.length + ' Räumen. -- Durchschnitt: ' + Durchschnitt + ', Überschuß: ' + HaveEnergyrooms.length + '  Need: ' + _.size(NeedEnergyrooms))

    console.log('-----------  tick:  ' + Game.time + '   cpu d100:  ' + Math.floor(cpusumme * 100) / 100 + '   cpu limit: ' + Game.cpu.limit + '   bucket: ' + Game.cpu.bucket + '   GCLGain: ' + GCLdif + '  ----------')


}
