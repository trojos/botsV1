var exportlayout = {
    run: function (room) {

        if (Memory.Layout == undefined) { Memory.Layout = {} }
        if (Memory.Layout.shard2 == undefined) { Memory.Layout.shard2 = {} }
        if (Memory.Layout.shard2[room] == undefined) { Memory.Layout.shard2[room] = {} }

        var rcl = 'rcl' + Game.rooms[room].controller.level
        var buildings = Game.rooms[room].find(FIND_STRUCTURES)

        var layout = {}
        var strtype = ''
        buildings.forEach(str => {
            if (str.structureType != STRUCTURE_RAMPART) {
                strtype = str.structureType
                if (layout[strtype] == undefined) {
                    layout[strtype] = { 'pos': [] }
                    //console.log(strtype)
                }
                layout[strtype].pos.push({ x: str.pos.x, y: str.pos.y })
            }
        })


        Memory.Layout.shard2[room][rcl] = { name: room, shard: 'shard2', rcl: Game.rooms[room].controller.level, buildings: layout }
        console.log(JSON.stringify(Memory.Layout.shard2[room][rcl]))

    }
}


module.exports = exportlayout;
