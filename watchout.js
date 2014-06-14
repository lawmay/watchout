var gameOptions = {
  height: 450,
  width: 700,
  nEnemies: 30,
  padding: 20,
  enemyInterval: 2000
};

var gameStats = {
  score: 0,
  bestScore: 0
};

var axes = {
  x: d3.scale.linear().domain([0,100]).range([0,gameOptions.width]),
  y: d3.scale.linear().domain([0,100]).range([0,gameOptions.height])
};

var gameBoard = d3.select('.gameboard')
                  .append('svg:svg')
                  .attr('class', 'svg')
                  .attr('width', gameOptions.width)
                  .attr('height', gameOptions.height)
                  ;

// --- - - - - - - - - - --- - - - - - - - - -

var Player = function() {

  this.path= 'm-7.5,1.62413c0,-5.04095 4.08318,-9.12413 9.12414,-9.12413c5.04096,0 9.70345,5.53145 11.87586,9.12413c-2.02759,2.72372 -6.8349,9.12415 -11.87586,9.12415c-5.04096,0 -9.12414,-4.08318 -9.12414,-9.12415z';
  this.fill = '#ff6600';
  this.x = 0;
  this.y = 0;
  this.angle = 0;
  this.r = 5;

  this.gameOptions = gameOptions;

  this.el;
};

Player.prototype.render = function(to) {
  this.el = to.append('svg:path')
              .attr('d', this.path)
              .attr('fill', this.fill)
              ;
  // console.log(this.el);
  this.transform(
    {
      x: this.gameOptions.width * 0.5,
      y: this.gameOptions.height * 0.5
    }
  );
  // this.setupDragging();
};

Player.prototype.getX = function() { return this.x; };
Player.prototype.getY = function() { return this.y; };

// keep player in bounds
Player.prototype.setX = function(x) {
  var minX = this.gameOptions.padding;
  var maxX = this.gameOptions.width - this.gameOptions.padding;
  if (x <= minX) {
    x = minX;
  }
  if (x >= maxX) {
    x = maxX;
  }
  this.x = x;
};

// keep player in bounds
Player.prototype.setY = function(y) {
  minY = this.gameOptions.padding;
  maxY = this.gameOptions.height - this.gameOptions.padding;
  if (y <= minY) {
    y = minY;
  }
  if (y >= maxY) {
    y = maxY;
  }
  this.y = y;
};

Player.prototype.transform = function(opts) {
  // this.angle = opts.angle || this.angle;
  this.setX(opts.x || this.x);
  this.setY(opts.y || this.y);
  // return _this.el
  this.el.attr('transform',
    'translate('+this.getX()+','+this.getY()+')');


  // this.el.attr =
}

// Player.prototype.moveAbsolute = function(x, y) {
//   this.transform({'x': x, 'y': y});
// }

// Player.prototype.moveRelative = function(dx, dy) {
//   this.transform({'x': this.getX()+dx, 'y': this.getY()+dy});
// }

// Player.prototype.setupDragging = function(dx, dy) {
//   var dragMove = function() {
//     console.log(d3.event.dx);
//     console.log(d3.event.dy);
//     this.moveRelative(d3.event.dx, d3.event.dy);
//   };

//   var drag = d3.behavior.drag()
//                 .on('drag', dragMove);

//   this.el.call(drag);
// }


var players = [];
players.push(new Player(gameOptions).render(gameBoard));


// --- - - - - - - - - - --- - - - - - - - - -



var createEnemies = function() {
  var result = _.range(0,gameOptions.nEnemies);
  return _.map(result, function(i) {
    return {
      id: i,
      x: Math.random()*100,
      y: Math.random()*100
    };
  });
};


var render = function(enemyData) {
  console.log("=== entering render ===");
  var enemies = gameBoard.selectAll('circle.enemy')
         .data(enemyData, function(d) { return d.id; });

  enemies.enter()
          .append('svg:circle')
          .attr('class', 'enemy')
          .attr('cx', function(enemy) {
            return axes.x(enemy.x);
          })
          .attr('cy', function(enemy) {
            return axes.y(enemy.y);
          })
           .attr('r',0)
          ;


  enemies.exit().remove();

  enemies
    .transition()
      .duration(500)
        .attr('r', 10)
    .transition()
      .duration(gameOptions.enemyInterval)
        .attr('cx', function(enemy) {
          return axes.x(enemy.x);
        })
        .attr('cy', function(enemy) {
          return axes.y(enemy.y);
        })
      // .tween('custom', tweenWithCollisionDetection)}
      ;
};

var play = function() {
  console.log('===== entering play =====');
  var gameTurn = function() {
    console.log('=== executing game turn ===');
    var newEnemyPositions = createEnemies();
    render(newEnemyPositions);
  };

  gameTurn();
  // setInterval(gameTurn.bind(this), gameOptions.enemyInterval);
};

play();


