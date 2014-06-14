
var foundCollision = false;

var gameOptions = {
  height: 450,
  width: 700,
  nEnemies: 30,
  padding: 20,
  enemyInterval: 2000,
  enemyRadius: 10
};

var gameStats = {
  score: 0,
  bestScore: 0,
  collisions: 0
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

var Player = function(gameOptions) {

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
  this.transform(
    {
      x: this.gameOptions.width * 0.5,
      y: this.gameOptions.height * 0.5
    }
  );
  this.setupDragging();
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
    'translate('+this.getX()+','+this.getY()+')'
    );
};

// Player.prototype.moveAbsolute = function(x, y) {
//   this.transform({'x': x, 'y': y});
// };

Player.prototype.moveRelative = function(dx, dy) {
  this.transform({'x': this.getX()+dx, 'y': this.getY()+dy});
};

Player.prototype.setupDragging = function(dx, dy) {
  var dragMove = function() {
    this.moveRelative(d3.event.dx, d3.event.dy);
  };

  var drag = d3.behavior.drag()
                .on('drag', dragMove.bind(this));

  this.el.call(drag);
};


var players = [];
var newPlayer = new Player(gameOptions);
newPlayer.render(gameBoard);
// console.log(newPlayer);
// players.push(new Player(gameOptions).render(gameBoard));
players.push(newPlayer);


// --- - - - - - - - - - --- - - - - - - - - -



var createEnemies = function() {
  var result = _.range(0,gameOptions.nEnemies);
  return _.map(result, function(i) {
    return {
      id: i,
      x: Math.random()*100,
      y: Math.random()*100,
      r: gameOptions.enemyRadius
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
           .attr('r', 0)
          ;


  enemies.exit().remove();

  enemies
    .transition()
      .duration(500)
        .attr('r', function(enemy) {
          return enemy.r;
        })
    .transition()
      .duration(gameOptions.enemyInterval)
        .attr('cx', function(enemy) {
          return axes.x(enemy.x);
        })
        .attr('cy', function(enemy) {
          return axes.y(enemy.y);
        })
      .tween('custom', tweenWithCollisionDetection)
      ;
};

var checkCollision = function(enemy, collidedCallback) {
  // console.log(enemy.attr('r'));
  // console.log(players);
  for (var i = 0; i < players.length; i++) {
    // console.log(players[i]);
    var radiusSum =  parseFloat(enemy.attr('r')) + players[i].r;
    var xDiff = parseFloat(enemy.attr('cx')) - players[i].x;
    var yDiff = parseFloat(enemy.attr('cy')) - players[i].y;

    var separation = Math.sqrt( Math.pow(xDiff,2) + Math.pow(yDiff,2) );
    if (separation < radiusSum) {
      collidedCallback(players[i], enemy);
    }
  }
};

var onCollision = function() {
  // var addCollision = function() {
  if (foundCollision === false) {
    foundCollision = true;
    gameStats.collisions++;
    d3.select('.collisions')
      .select('span')
      .text(gameStats.collisions.toString());
  }
  // };
  // _.throttle(addCollision.bind(this), 2000);
  if (gameStats.score > gameStats.bestScore) {
    gameStats.bestScore = gameStats.score;
    d3.select('.high')
      .select('span')
      .text(gameStats.bestScore.toString());
  }
  gameStats.score = 0;
  updateScore();
};

var updateScore = function() {
  d3.select('.current')
    .select('span')
    .text(gameStats.score.toString());
};

var tweenWithCollisionDetection = function(endData) {
  // console.log(endData);
  var enemy = d3.select(this);
  // console.log(enemy);

  var startPos = {
    x: parseFloat(enemy.attr('cx')),
    y: parseFloat(enemy.attr('cy'))
  };
  var endPos = {
    x: axes.x(endData.x),
    y: axes.y(endData.y)
  };

  return function(t) {
    checkCollision(enemy, onCollision);
    var enemyNextPos = {
      x: startPos.x + (endPos.x - startPos.x)*t,
      y: startPos.y + (endPos.y - startPos.y)*t
    };
    enemy.attr('cx', enemyNextPos.x)
          .attr('cy', enemyNextPos.y);
  };
};


var play = function() {
  var gameTurn = function() {
    foundCollision = false;
    var newEnemyPositions = createEnemies();
    render(newEnemyPositions);
  };

  var increaseScore = function() {
    gameStats.score += 1;
    updateScore();
  };

  gameTurn();
  setInterval(gameTurn.bind(this), gameOptions.enemyInterval);
  setInterval(increaseScore.bind(this), 50);
};

play();

