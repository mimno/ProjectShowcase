$(document).ready(function () {

    var board;
    var game = new Chess();


    // A pointer to the container
    var myContainer = $("#myContainer");
    // How many levels to show
    var LEVELS_TO_SHOW = 4;
    // How many moves are we from a normal number
    var numMovesFromBook = 0;
    // The names of moves we can reach from this node
    var movesFromNode = [];
    // The node we're currently at
    var node;
    // The root of the tree
    var topNode;
    // The path to the node
    var path;
    // Whether the move is in the sunburst graph
    var moveInSunburst = true;

    var moveDepth = 0;


    // =====================  definition for stacked bars
    var pm_legend_width = 100,
        pm_margin = {top: 30, right: 20, bottom: 20, left: 35},
        pm_width = 900 - pm_margin.left - pm_margin.right - pm_legend_width,
        pm_height = 140 - pm_margin.top - pm_margin.bottom;

    var pm_x = d3.scale.ordinal().rangeRoundBands([0, pm_width], .1),
        pm_y = d3.scale.linear().rangeRound([pm_height, 0]);

    //Red = black wins
    //Yellow = tie
    //Green = white wins
    var pm_color = d3.scale.ordinal().range(["#fc8d59", "#ffffbf", "#99d594"]);

    var pm_xAxis = d3.svg.axis().scale(pm_x).orient("bottom"),
        pm_yAxis = d3.svg.axis().scale(pm_y).orient("left")
            .tickFormat(d3.format("%"));

    var pm_svg = d3.select("#possiblemoves").append("svg")
        .attr("width", pm_width + pm_margin.left + pm_margin.right + pm_legend_width)
        .attr("height", pm_height + pm_margin.top + pm_margin.bottom)
        .append("g")
        .attr("transform", "translate(" + pm_margin.left + "," + pm_margin.top + ")");

    // =====================  definition for stacked bars end

    var setNode = function(newNode) {
        node = newNode;
        if (node.children) {
            movesFromNode = node.children.map(function (child) {
                return child.name;
            });
        } else {
            movesFromNode = [];
        }
    };


    var onDrop = function (source, target, piece) {
        var move = game.move({
            from: source,
            to: target,
            promotion: 'q'
        });

        // illegal move, snap back
        if (move == null) return 'snapback';

        handleBoardMove(move.san);
        moveDepth++;
    };

    // For en passant
    var onSnapEnd = function() {
        board.position(game.fen());
    };

    var makeAMove = function (move) {
        game.move(move);
        board.position(game.fen());
    };

    var makeMoves = function (moves) {
        var len = moves.length;
        var delay = 1500 / len;

        if (len < 5) {
            delay = 300;
        }

        // restart();
        makeMovesInner(moves);

        function makeMovesInner(moves) {
            if (moves.length == 0) return;

            var move = moves.shift();
            makeAMove(move);

            window.setTimeout(function () {
                makeMovesInner(moves);
            }, delay);
        }

    };

    var undo = function (num) {
        for (var i = 0; i < num; i++) {
            game.undo();
        }
        board.position(game.fen());
    };

    var restart = function () {
        game.reset();
        board.position('start');
        // pgn.html(game.pgn());

        handleReset();
    };

    $("#start").on("click", function () {
        restart();
    });

    $("#undo").on("click", function () {

        undo(1);
        moveDepth = Math.max(moveDepth - 1, 0);
        if (!moveInSunburst) {
            numMovesFromBook = Math.max(0, numMovesFromBook - 1);
            //console.log("moves from book " + numMovesFromBook);
            if (numMovesFromBook == 0) {
                moveInSunburst = true;
                togglePathStyle(true);
            }
        } else {
            if (moveDepth != 0) {
                setNode(node.parent);
            } else {
                setNode(topNode);
            }
            transitionPath(node);
        }
        updateChart(node.children);

    });

    $("#instruction").on("click", function() {
      $("#instructionModal").css("display", "block");
    });
    $("#close").on("click", function() {
      $("#instructionModal").css("display", "none");
    });


    board = new ChessBoard('chessboard', {
        position: 'start',
        moveSpeed: 'fast',
        draggable: true,
        onDrop: onDrop,
        onSnapEnd: onSnapEnd
    });

    var width = 400,
        height = 400,
        radius = Math.min(width, height) / 2;

    var x = d3.scale.linear()
        .range([0, 2 * Math.PI]);

    var y = d3.scale.linear()
        .domain([-1, LEVELS_TO_SHOW])
        .range([0, radius]);

    var svg = d3.select("#sunburst").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + (height / 2) + ")");

    var partition = d3.layout.partition()
        .value(function (d) {
            return d.size;
        });

    //tooltip
    var tooltip = d3.select("#sunburst")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("opacity", 0);
    

    //Red = black wins
     //Yellow = tie
     //Green = white wins
    var color = d3.scale.linear()
        .domain([0.65, .5, 0.35])
        .range(["#99d594", "#ffffbf", "#fc8d59"]);

    var colorfulFill = function (d) {
        var score = d.whiteWins + d.ties * 0.5;
        var total = d.whiteWins + d.ties + d.blackWins;
        fillColor = color(score/total);
        if (d.depth % 2 == 1) {
            return fillColor;
        } else {
            // return fillColor;
            var pattern = svg.append("defs")
                .append("pattern")
                .attr("id", "pattern" + d.moves)
                .attr("patternTransform", "rotate(45 0 0)")
                .attr("patternUnits", "userSpaceOnUse")
                .attr("height", 5)
                .attr("width", 5);

            pattern.append("line")
                    .attr("x1", "0")
                    .attr("y1", "0")
                    .attr("x2", "0")
                    .attr("y2", "10")
                    .attr("stroke", fillColor)
                    .attr("stroke-width", "3");

            return "url(#pattern" + d.moves + ")";
        }
    };

    var grayFill = function (d) {
        return "#d3d3d3";
    };

    // Which fill are we currently using?
    var sunburstFill = colorfulFill;


    var arc = d3.svg.arc()
        .startAngle(function (d) {
            return Math.max(0, Math.min(2 * Math.PI, x(d.x)));
        })
        .endAngle(function (d) {
            return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx)));
        })
        .innerRadius(function (d) {
            if (d.depth > moveDepth + LEVELS_TO_SHOW || d.depth < moveDepth - 1) {
                return 0;
            }
            return y(d.depth - moveDepth);
        })
        .outerRadius(function (d) {
            if (d.depth > moveDepth + LEVELS_TO_SHOW) {
                return 0;
            }
            return y(d.depth - moveDepth + 1);
        });


    var removeColoredSquares = function() {
        $('#chessboard .square-55d63').css('background', '');
    };

    var colorSquare = function(square, color) {
        var squareEle = $('#chessboard .square-' + square);
        //console.log(squareEle);
        squareEle.css('background', color);
        //console.log(squareEle.attr('class'));
    };

    //chess_10000G_20L_8_4_1B
    d3.json("chess_1000G_10L_6_3_1B.json", function (error, root) {
        setNode(root);
        topNode = root;

        // stacked bar chart
        updateChart(root.children);

        path = svg.selectAll("path")
            .data(partition.nodes(root))
            .enter().append("path")
            .attr("class", function (d) {
                return "ring_" + d.depth;
            })
            .attr("d", arc)
            .attr("opacity", function (d) {
                return d.depth ? 1 : 0;
            })
            .attr("display", function (d) {
                return d.depth < node.depth + LEVELS_TO_SHOW ? null : "none";
            })
            .attr("fill-rule", "evenodd")
            .style("fill", sunburstFill)
            .style("stroke", "#d3d3d3")
            .on("click", function (d) {
                removeColoredSquares();
                click(d);
            })
            .on("mouseover", function(d) {
                // Will Lee
                var currLen = node.depth;
                var nextLen = d.depth;
                var diff = nextLen - currLen;
                if (diff > 0) {
                    var newMove = d.moves.slice(-diff)[0];
                    var move = game.move(newMove);
                    if (move !== null) {
                        game.undo();
                        colorSquare(move.to, '#0099FF'); //#696969
                        colorSquare(move.from, '#246BB2'); //#868686
                    }
                }

                tooltip.html( function() {
                    if (nextLen > currLen) {
                        return d.moves.slice(currLen);
                    } else if (nextLen < currLen) {
                        return "Undo";
                    } else {
                        return "Current";
                    }
                });

                return tooltip.transition()
                    .duration(50)
                    .style("background-color", "white")
                    .style("border", "solid 2px white")
                    .style("color", "black")
                    .style("opacity", 0.9);
            })
            .on("mousemove", function(d) {
                return tooltip
                    .style("top", (d3.event.pageY-10)+"px")
                    .style("left", (d3.event.pageX+10)+"px");
            })
            .on("mouseout", function() {
                removeColoredSquares();
                return tooltip.transition()
                    .delay(0.1)
                    .duration(240)
                    .style("opacity", 0)
                    .style('pointer-events', 'none');
            });


        function click(d) {
            if (moveInSunburst) {
                var currNode = node;
                setNode(d);
                //console.log("white win: " + d.whiteWins + " black win: " + d.blackWins)

                updateChart(node.children);
                transitionPath(d);

                var currLen = currNode.depth;
                var nextLen = d.depth;

                moveDepth += nextLen - currLen;

                if (nextLen > currLen) {
                    var newMoves = d.moves.slice(currLen);
                    makeMoves(newMoves);
                } else if (nextLen < currLen) {
                    undo(1);
                }
            }
        }

    });

    function isMouseEnabled() {
        if (myContainer.css('pointer-events') === 'auto') {
            return true;
        } else if (myContainer.css('pointer-events') === 'none') {
            return false;
        }
    }

    function disableMouse() {
        console.log("disabling mouse");
        myContainer.css('pointer-events', 'none');
    }

    function enableMouse() {
        console.log("enabling mouse");
        myContainer.css('pointer-events', 'auto');
    }

    function transitionPath(node) {
        path.transition()
            .duration(750)
            .attr("display", function (d) {
                return d.depth < node.depth + LEVELS_TO_SHOW ? null : "none";
            })
            .attrTween("d", arcTween(node));
    }

    // Whether or not to use colors in the sunburst graph
    function togglePathStyle(useColors) {
        if (useColors) {
            sunburstFill = colorfulFill;
        } else {
            sunburstFill = grayFill;
        }
        path.style("fill", sunburstFill);
    }

    function handleBoardMove(move) {
        var filtered = node.children.filter(function (d) {
            return d.name == move;
        });
        // Was last move in the sunburst?
        if (moveInSunburst) {
            // If last move was ok but this one is not
            if (filtered.length == 0) {
                togglePathStyle(false);
                moveInSunburst = false;
                numMovesFromBook = 1;
                updateChart(null);
            }
            // Both are ok
            else {
                setNode(filtered[0]);
                transitionPath(node);
                updateChart(node.children);
            }
        } else {
            // Making more moves can't possibly bring you back to the sunburst
            numMovesFromBook++;
        }
    }

    function handleReset() {
        setNode(topNode);
        moveDepth = 0;
        togglePathStyle(true);
        transitionPath(node);
        moveInSunburst = true;
        numMovesFromBook = 0;
        updateChart(node.children);
    }

    d3.select(self.frameElement).style("height", height + "px");

    // Interpolate the scales!
    function arcTween(d) {
        var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
            yd = d3.interpolate(y.domain(), y.domain()),
            yr = d3.interpolate(y.range(), y.range());

        return function (d, i) {
            return i
                ? function (t) {
                return arc(d);
            }
                : function (t) {
                x.domain(xd(t));
                //y.domain(yd(t)).range(yr(t));
                return arc(d);
            };
        };
    }

    var domainElementToName = {
        'blackWins': "Num Black Wins",
        'ties': "Num Ties",
        'whiteWins': "Num White Wins"
    };

    function updateChart(nextMoves) {
        pm_svg.selectAll("*").remove();
        if (nextMoves == null) {
            pm_svg.append("text")
                .text("No more moves")
                .style("text-anchor", "middle")
                .attr("font-size", "32px")
                .attr("x", pm_width/2)
                .attr("y", pm_height/2);
            return;
        }

        if (!(nextMoves instanceof Array)) {
            nextMoves = [nextMoves];
        }


        pm_color.domain(['blackWins', 'ties', 'whiteWins']);


        nextMoves.forEach(function (d) {
            var name = d.name;
            var y0 = 0;
            d.results = pm_color.domain().map(function (status) {
                return {
                    name: name,
                    status: status,
                    y0: y0,
                    y1: y0 += d[status]
                };
            });

            d.pct = [];

            for (var i = 0; i < d.results.length; i++) {
                var y_coordinate = d.results[i].y1 / d.numGames,
                    y_height1 = d.results[i].y1 / d.numGames,
                    y_height0 = d.results[i].y0 / d.numGames,
                    y_pct = y_height1 - y_height0;

                d.pct.push({
                    y_coordinate: y_coordinate,
                    y_height1: y_height1,
                    y_height0: y_height0,
                    status: d.results[i].status,
                    name: d.name,
                    y_pct: y_pct
                });
            }

        });

        pm_x.domain(nextMoves.map(function (d) {
            return d.name;
        }));
        pm_y.domain([0, 1]);

        // xAxis
        pm_svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + pm_height + ")")
            .call(pm_xAxis);

        // yAxis
        pm_svg.append("g")
            .attr("class", "y axis")
            .call(pm_yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".4em")
            .style("text-anchor", "end")
            .text("Probability");

        // define rects
        var rect = pm_svg.selectAll(".rect")
            .data(nextMoves).enter().append("g")
            .attr("class", ".rect")
            .attr("transform", function (d) {
                return "translate(" + "0 " + ",0)";
            });

        rect.selectAll("rect")
            .data(function (d) {
                return d.pct;
            })
            .enter().append("rect")
            .attr("width", pm_x.rangeBand())
            .attr("height", function (d) {
                return pm_y(d.y_height0) - pm_y(d.y_height1);
            })
            .attr("y", function (d) {
                return pm_y(d.y_coordinate);
            })
            .attr("x", function (d) {
                return pm_x(d.name);
            })

            .attr("fill", function (d) {
                return pm_color(d.status);
            })
            .attr("stroke", "#000000")
            .attr("stroke-width", "0.1px")
            .attr("id", function (d) {
                return d.name;
            })
            .attr("class", "rect")
            .style("pointer-events", "all");

        // add tooltips
        rect.selectAll("rect")
            .on("mouseover", function (d) {
                var xPos = parseFloat(d3.select(this).attr("x"));
                var yPos = parseFloat(d3.select(this).attr("y"));
                var width = parseFloat(d3.select(this).attr("width"));
                var height = parseFloat(d3.select(this).attr("height"));

                d3.select(this).attr("stroke", "#b58863").attr("stroke-width", 1);

                pm_svg.append("text")
                    .attr("x", xPos + width / 2)
                    .attr("y", yPos + height / 2)
                    .attr("class", "tooltip")
                    .attr("text-anchor", "middle")
                    .text(Math.floor(d.y_pct.toFixed(2) * 100) + "%");
            })
            .on("mouseout", function () {
                pm_svg.select(".tooltip").remove();
                d3.select(this).attr("stroke", "#000000").attr("stroke-width", 0.1);
            });

        // adding legend
        var pm_legend = pm_svg.selectAll(".legend")
            .data(pm_color.domain().slice().reverse())
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function (d, i) {
                return "translate(0," + i * 20 + ")";
            });
        pm_legend.append("rect")
            .attr("x", pm_width - 18 + pm_legend_width)
            .attr("width", 18)
            .attr("height", 18)
            .attr("fill", pm_color)
            .attr("stroke", "#333333")
            .attr("stroke-width", "0.1px");
        pm_legend.append("text")
            .attr("x", pm_width - 24 + pm_legend_width)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(function (d) {
                return domainElementToName[d];
            });
        pm_svg.append("text")
            .attr("x", pm_width + pm_legend_width)
            .attr("y", pm_height)
            .style("text-anchor", "end")
            .text("Possible Next Moves");
    }

    colorlegend("#colorlegend", color, 'linear', {title: "Avg points accumulated by white", boxHeight: 30, boxWidth: 30, vertical: true });

});