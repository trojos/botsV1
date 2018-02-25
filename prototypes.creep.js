var prototypescreep = {
    run: function () {
        //
        // MOVETO2
        //
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
                if (this.memory._move2 == undefined) { this.memory._move2 = {} }
                if (this.memory._move2.tile == undefined) {
                    this.memory._move2.tile = this.pos
                    this.memory._move2.ontile = 0
                } else {
                    if (this.pos.isEqualTo(new RoomPosition(this.memory._move2.tile.x, this.memory._move2.tile.y, this.memory._move2.tile.roomName))) {
                        if (this.fatigue == 0) {
                            this.memory._move2.ontile += 1
                        }
                    } else {
                        this.memory._move2.tile = this.pos
                        this.memory._move2.ontile = 0
                    }
                    if (this.memory._move2.ontile >= 2) {
                        this.memory._move = {}
                        //this.memory._move2 = {}
                        opts.reusePath = 5
                        opts.ignoreCreeps = false
                        delete opts.costCallback
                        me = this.moveTo(target, opts);

                    }
                    // else {
                    //     this.memory._move2.tile = this.pos
                    // }
                }
            }

            //var cpunach = Game.cpu.getUsed()
            //Memory.CPUMove2 += cpunach - cpuvor
            return me
        }

        //
        // OUTPUTLOG
        //
        Creep.prototype.outputlog = function (name) {
            if (name == undefined || this.name == name) {
                console.log('-----')
                console.log(this.name, this.pos)
                console.log(JSON.stringify(this.memory))
                console.log('-----')
            }
        }

        //
        // Pathfinder Kosten visualiesieren
        //
        PathFinder.CostMatrix.prototype.visual = function (room) {
            console.log('Viusal CM in', room)
            for (var x = 0; x < 49 + 1; x++) {
                for (var y = 0; y < 49 + 1; y++) {
                    var cost = parseInt(this.get(x, y))
                    var colorc = 'rgb(' + (cost).toString() + ',' + (255 - cost).toString() + ', 000)'
                    new RoomVisual(room).circle(x, y, { fill: colorc })
                }
            }
        }

        //
        // Is KEEPERROOM 
        Room.prototype.isKeeperroom = function (croom) {
            if (croom == undefined) { croom = this.name }
            if (croom.indexOf('S') != -1) {
                var EW = croom.substring(1, croom.indexOf('S'))
                var SN = croom.substring(croom.indexOf('S') + 1)
            } else {
                var EW = croom.substring(1, croom.indexOf('N'))
                var SN = croom.substring(croom.indexOf('N') + 1)
            }
            EW = EW - Math.floor(EW / 10) * 10
            SN = SN - Math.floor(SN / 10) * 10
            if (EW >= 4 && EW <= 6 && SN >= 4 && SN <= 6) {
                return true
            } else { return false }
        }
        Room.prototype.isCenter = function (croom) {
            if (croom == undefined) { croom = this.name }
            if (croom.indexOf('S') != -1) {
                var EW = croom.substring(1, croom.indexOf('S'))
                var SN = croom.substring(croom.indexOf('S') + 1)
            } else {
                var EW = croom.substring(1, croom.indexOf('N'))
                var SN = croom.substring(croom.indexOf('N') + 1)
            }
            if ((EW / 5) % 2 == 1) { var EWcenter = true } else { var EWcenter = false }
            if ((SN / 5) % 2 == 1) { var SNcenter = true } else { var SNcenter = false }

            if (EWcenter && SNcenter) { return true; } else { return false; }
        }


        //
        // CONSTANT PRODUCTS
        //

        global.PRODUCTS = {
            // Base
            OH: ['O', 'H'],
            ZK: ['Z', 'K'],
            UL: ['U', 'L'],
            G: ['ZK', 'UL'],
            // Tier 1
            UH: ['U', 'H'],
            UO: ['U', 'O'],
            KH: ['K', 'H'],
            KO: ['K', 'O'],
            LH: ['L', 'H'],
            LO: ['L', 'O'],
            ZH: ['Z', 'H'],
            ZO: ['Z', 'O'],
            GH: ['G', 'H'],
            GO: ['G', 'O'],
            // Tier 2
            UH2O: ['UH', 'OH'],
            UHO2: ['UO', 'OH'],
            KH2O: ['KH', 'OH'],
            KHO2: ['KO', 'OH'],
            LH2O: ['LH', 'OH'],
            LHO2: ['LO', 'OH'],
            ZH2O: ['ZH', 'OH'],
            ZHO2: ['ZO', 'OH'],
            GH2O: ['GH', 'OH'],
            GHO2: ['GO', 'OH'],
            // Tier 2
            XUH2O: ['UH2O', 'X'],
            XUHO2: ['UHO2', 'X'],
            XKH2O: ['KH2O', 'X'],
            XKHO2: ['KHO2', 'X'],
            XLH2O: ['LH2O', 'X'],
            XLHO2: ['LHO2', 'X'],
            XZH2O: ['ZH2O', 'X'],
            XZHO2: ['ZHO2', 'X'],
            XGH2O: ['GH2O', 'X'],
            XGHO2: ['GHO2', 'X'],
        }

    }
}

module.exports = prototypescreep;