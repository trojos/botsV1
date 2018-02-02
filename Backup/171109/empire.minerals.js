var creepspawn = require('creepspawn')

var minerals = {
    run: function (room, subroom, wait) {
        //raumvariablen
        if (Game.rooms[room].controller.level < 6) {             //Wenn Kontroller level kleiner als 6 kann kein Terminal sein, daher wird abgebrochen
            return;
        }

        const xspawns = Game.rooms[room].find(FIND_MY_STRUCTURES, {
            filter: struc => struc.structureType == STRUCTURE_SPAWN
        });
        const xspawn = xspawns[0]
        const maxenergy = Game.rooms[room].energyCapacityAvailable
        const haveenergy = Game.rooms[room].energyAvailable

        if (Game.rooms[room].storage == undefined) {
            var havestore = false
            var reserve = 0
        } else {
            var havestore = true
            var reserve = Game.rooms[room].storage.store[RESOURCE_ENERGY]
        }
        var roomcontroll = false
        if (Game.rooms[room].terminal == undefined) {
            console.log('In Raum ' + room + ' muss ein Terminal gebaut werden!!!')
            var haveterm = false
        } else {
            var haveterm = true
        }


        if (Game.rooms[subroom] == undefined) {
            var insight = false
        } else {
            var insight = true
            if (Game.rooms[subroom].controller.owner == undefined || Game.rooms[subroom].controller.owner != 'zapZiodon') {
                if (Game.rooms[subroom].controller.reservation == undefined) {
                    roomcontroll = true
                } else if (Game.rooms[subroom].controller.reservation.username == 'zapziodon') {
                    roomcontroll = true
                }
            }
        }


        //extractor bauen
        if (insight) {
            var mineralspot = Game.rooms[subroom].find(FIND_MINERALS)[0]
            var extractstr = mineralspot.pos.findInRange(FIND_STRUCTURES, 1, {
                filter: ext => ext.structureType == STRUCTURE_EXTRACTOR
            })
            if (extractstr.length > 0) { var haveextr = true } else {
                var haveextr = false
                Game.rooms[subroom].createConstructionSite(mineralspot.pos.x, mineralspot.pos.y, STRUCTURE_EXTRACTOR)
            }
        }

        //var haveextr = false
        if (room == subroom) { var home = true } else { var home = false }
        if (mineralspot.mineralAmount == 0) { var mempty = true } else { var mempty = false }

        //----------creeps------------------
        //size
        if (haveenergy + reserve < maxenergy) { var maxcreepsize = haveenergy + reserve } else { var maxcreepsize = maxenergy }
        var creepsize
        var needminer = false
        var needcarry = false
        var needbmstr = false
        var needdef = false

        //----------  Harvester  ----------
        if (insight && !wait && roomcontroll && haveextr && !mempty && haveterm) {
            //spawn harvester mit spot im memory
            var cmem = { role: 'min_harv', spot: mineralspot.id, home: room, targetroom: subroom }
            var cbody = [WORK, MOVE, CARRY]
            if (maxcreepsize > 2500) { creepsize = 2500 } else { creepsize = maxcreepsize }    // Beschränkt maxcreepsize
            var ccreep = _.filter(Game.creeps, (creep) =>
                creep.memory.role == cmem.role
                && creep.memory.spot == cmem.spot
                && creep.memory.home == cmem.home
                && creep.memory.targetroom == cmem.targetroom
                && (creep.ticksToLive > 50 || creep.ticksToLive == undefined));
            if (ccreep.length < 1) {
                needminer = true
                creepspawn.newcreep(room, 'min_harv_' + subroom, creepsize, cbody, cmem)
            }
        }

        if (needminer) {
            var wait = false
        } else { var wait = false }


        //Terminal voll --> an Market verkaufen
        if (Game.rooms[room].terminal) {
            if (Game.rooms[room].terminal.cooldown == 0) {
                var mstore
                var mstores
                mstore = (Game.rooms[room].terminal.store)

                if (_.sum(mstore) > 50000) {
                    var amount
                    var maxres
                    amount = 0
                    for (var re in mstore) {
                        if (mstore[re] > amount && re != 'energy') {
                            amount = mstore[re]
                            maxres = re
                        }
                    }
                }
                if (maxres) {
                    var orders
                    orders = Game.market.getAllOrders(order => order.type == ORDER_BUY && order.resourceType == maxres && order.remainingAmount > 100)
                    orders = _.sortByOrder(orders, 'price', 'desc')
                    //console.log(JSON.stringify(orders))
                    console.log(JSON.stringify(orders[0]))
                    var tradeamount
                    if (orders[0].remainingAmount > 10000) { tradeamount = 10000 } else { tradeamount = orders[0].remainingAmount }
                    var cost = Game.market.calcTransactionCost(tradeamount, room, orders[0].roomName)
                    var ant
                    if (Game.rooms[room].terminal.store.energy >= cost) {
                        ant = Game.market.deal(orders[0].id, tradeamount, room)
                    } else { ant = 'Zu wenig Energy' }
                    if (ant == 0) {
                        console.log(room + ' verkaufte ' + tradeamount + ' ' + maxres + ' um ' + orders[0].price)
                    } else {
                        console.log('Fehler beim verkaufen in ' + room + ' Code: ' + ant)
                    }
                }
                //ant = Game.market.deal('58bc4fc53751622a41f77ee5',10000,'E99S83')
                //ant = Game.market.createOrder(ORDER_SELL, RESOURCE_HYDROGEN, 0.29, 1000, 'E98S81')
                //ant = Game.market.calcTransactionCost(5000,'E98S81', 'W0N50')
                //console.log(ant)
            }
        }


        //subräume



        //build lager

        //build extensions

        //build wall

        //build road

        //build buildings


        return (wait)
    }



}

module.exports = minerals