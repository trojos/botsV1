var buildroad = {

  run: function (frompos, topos, build) {

    var noroom = false
    var xpath = PathFinder.search(frompos, topos,
      {
        // We need to set the defaults costs higher so that we
        // can set the road cost lower in `roomCallback`
        plainCost: 2,
        swampCost: 3,

        roomCallback: function (roomName) {
          let room = Game.rooms[roomName];

          // In this example `room` will always exist, but since 
          // PathFinder supports searches which span multiple rooms 
          // you should be careful!
          let costs = new PathFinder.CostMatrix;
          if (!room) {
            for (let x = 0; x < 50; x++) {
              for (let y = 0; y < 50; y++) {
                costs.set(x, y, 200)
              }
            }
            //noroom = true;
            //console.log(roomName);
            //return
          } else {
            room.find(FIND_STRUCTURES).forEach(function (struct) {
              if (struct.structureType === STRUCTURE_ROAD) {
                // Favor roads over plain tiles
                costs.set(struct.pos.x, struct.pos.y, 1);
              } else if (struct.structureType !== STRUCTURE_CONTAINER &&
                (struct.structureType !== STRUCTURE_RAMPART ||
                  !struct.my)) {
                // Can't walk through non-walkable buildings
                costs.set(struct.pos.x, struct.pos.y, 0xff);
              }
            });
            room.find(FIND_CONSTRUCTION_SITES).forEach(function (constr) {
              if (constr.structureType === STRUCTURE_ROAD) {
                // Favor roads over plain tiles
                costs.set(constr.pos.x, constr.pos.y, 1);
              } else if (constr.structureType !== STRUCTURE_CONTAINER &&
                (constr.structureType !== STRUCTURE_RAMPART ||
                  !constr.my)) {
                // Can't walk through non-walkable buildings
                costs.set(constr.pos.x, constr.pos.y, 0xff);
              }
            });
          }
          return costs;
        },
      })
    if (build == 1 && !noroom) {
      //console.log('Baue Straße von:', frompos, 'nach', topos, xpath.path.length)
      for (var steps in xpath.path) {
        var xroom = xpath.path[steps].roomName
        Game.rooms[xroom].createConstructionSite(xpath.path[steps].x, xpath.path[steps].y, STRUCTURE_ROAD)

      }
    } else if (build == 0 && !noroom) {
      //console.log('Baue Straße von:', frompos, 'nach', topos, xpath.path.length)
      for (var steps in xpath.path) {
        var xroom = xpath.path[steps].roomName
        //console.log(xpath.path[steps])
        new RoomVisual(xroom).circle(xpath.path[steps], { radius: 0.30, stroke: 'red' })

      }
    }
  }
}

module.exports = buildroad;
