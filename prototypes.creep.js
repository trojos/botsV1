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
    }
}

module.exports = prototypescreep;