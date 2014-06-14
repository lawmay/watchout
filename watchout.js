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
                  .attr('width', gameOptions.width)
                  .attr('height', gameOptions.height)
                  ;

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
  setInterval(gameTurn.bind(this), gameOptions.enemyInterval);
};

play();
