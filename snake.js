;(function($) {
	$.fn.snake = function(boardWidth, boardHeight) {
		var parent = $(this);
		var canvas=document.createElement("canvas");
		canvas.width=parent.width();
		canvas.height=parent.height();
		parent.empty();
		parent.append(canvas);			
		$(canvas).attr('style', 'border: 1px solid black;');

		var GameStatus = { IN_PROGRESS : "in_progress", PAUSE : "pause", GAME_OVER : "game_over" };

		var game = new Object();
  
		function initGame() {
			game.s = new Array(); 
			game.boardWidth = boardWidth ? boardWidth : 20; 
			game.boardHeight = boardHeight ? boardHeight : 20;
			game.s[0] = { x : Math.floor((Math.random() * (game.boardWidth - 1))), y : Math.floor((Math.random() * (game.boardHeight - 1))) }
			game.direction = { x : 0, y : 0 };
			game.nextEl = new nextEl();
			game.status = GameStatus.IN_PROGRESS;
			game.skipMove = false;
			
		}
		initGame();

		function paintSnake() {
			var ctx = canvas.getContext("2d");
			ctx.fillStyle="#000000";
			ctx.fillRect(0,0,canvas.width,canvas.height);

			var sizex = Math.floor((canvas.width / game.boardWidth));
			var sizey = Math.floor((canvas.height / game.boardHeight));

			if (game.nextEl != undefined) {
				ctx.fillStyle="#0066FF";
				ctx.fillRect(sizex * game.nextEl.x, sizey * game.nextEl.y, sizex, sizey);
			}

			ctx.fillStyle="#009933";
			for (var i = 0; i < game.s.length - 1; i++) {
				ctx.fillRect(sizex * game.s[i].x + 1, sizey * game.s[i].y + 1, sizex - 2, sizey - 2);
			}

			ctx.fillStyle="#FF9900";
			ctx.fillRect(sizex * game.s[game.s.length - 1].x + 1, sizey * game.s[game.s.length - 1].y + 1, sizex - 2, sizey - 2);

			ctx.fillStyle="#FF9900";
			ctx.font="12px Arial";
			ctx.fillText(game.s.length, 3, 14);

			if (game.status == GameStatus.GAME_OVER) {
				ctx.fillStyle="#FF9900";
				ctx.font="30px Arial";
				ctx.fillText("GAME OVER. Press Space to start new game", canvas.width / 2 - 150, canvas.height / 2 - 15, 300);
			} else if (game.status == GameStatus.PAUSE) {
				ctx.fillStyle="#FF9900";
				ctx.font="30px Arial";
				ctx.fillText("GAME PAUSED. Press Space to continue", canvas.width / 2 - 150, canvas.height / 2 - 15, 300);
			}
		}

		function move() {
			if ((game.direction.x || game.direction.y) && game.status == GameStatus.IN_PROGRESS && !game.skipMove) {
				if (game.s[game.s.length - 1].x + game.direction.x == game.nextEl.x &&
					game.s[game.s.length - 1].y + game.direction.y == game.nextEl.y) {
					game.s[game.s.length] = game.nextEl;
					game.nextEl = new nextEl();
				} 

				for (var i = 0; i < game.s.length - 1; i++) {
					game.s[i].x = game.s[i + 1].x;
					game.s[i].y = game.s[i + 1].y;
				}

				if (game.direction.x) {
					if (game.s[game.s.length - 1].x + game.direction.x < 0) {
						game.s[game.s.length - 1].x = game.boardWidth - 1;
					} else if (game.s[game.s.length - 1].x + game.direction.x >= game.boardWidth) {
						game.s[game.s.length - 1].x = 0;
					} else {
						game.s[game.s.length - 1].x += game.direction.x;
					}
				} else if (game.direction.y) {
					if (game.s[game.s.length - 1].y + game.direction.y < 0) {
						game.s[game.s.length - 1].y = game.boardHeight - 1;
					} else if (game.s[game.s.length - 1].y + game.direction.y >= game.boardHeight) {
						game.s[game.s.length - 1].y = 0;
					} else {
						game.s[game.s.length - 1].y += game.direction.y;
					}
				}

				if (hasCollision()) {
					game.status = GameStatus.GAME_OVER;
					game.direction.x = 0;
					game.direction.y = 0;
				}
			}

			game.skipMove = false;
		}

		function hasCollision() {
			for (var i = 0; i < game.s.length - 1; i++) {
				if (game.s[game.s.length - 1].x == game.s[i].x &&
					game.s[game.s.length - 1].y == game.s[i].y) {
					return true;
				}
			}

			return false;
		}

		function nextEl() {
			outer_loop:
			while (true) {
				this.x = Math.floor((Math.random() * (game.boardWidth - 1)));
				this.y = Math.floor((Math.random() * (game.boardHeight - 1)));

				for (var i = 0; i < game.s.length; i++) {
					if (this.x == game.s[i].x && this.y == game.s[i].y) {
						continue outer_loop;
					}
				}

				break;
			}
		}

		if (!localStorage.speed) {
			localStorage.speed = 2;
		}

		var timingFunction = function () {
			move();
			paintSnake();
		}; 

		function updateInterval() {
			clearInterval(timingFunction);
			setInterval(timingFunction, localStorage.speed * 40);
		}
		updateInterval();

		// speed settings
		parent.append('<form title="Speed" id="speed_form" style="display:none"><input type="range" id="speed" name="speed" min="1" max="5" value="' + localStorage.speed + '" /></form')

		$(window).keydown(function(event) {
            switch (event.keyCode) {
                case 37: // left
                	if (!game.direction.x) {
                		game.direction.x = -1;
                		game.direction.y = 0;
                		move();
                		game.skipMove = true;
                	}

            		break;
                case 38: // up
                	if (!game.direction.y) {
                		game.direction.y = -1;
                		game.direction.x = 0;
                		move();
                		game.skipMove = true;
                	}

            		break;
                case 39: // right
		        	if (!game.direction.x) {
                		game.direction.x = 1;
                		game.direction.y = 0;
                		move();
                		game.skipMove = true;
                	}

            		break;
                case 40: // down
                	if (!game.direction.y) {
                		game.direction.y = 1;
                		game.direction.x = 0;
                		move();
                		game.skipMove = true;
                	}

            		break;
            	case 32:
            		if (game.status == GameStatus.IN_PROGRESS) {
            			game.status = GameStatus.PAUSE;
            		} else if (game.status == GameStatus.PAUSE) {
            			game.status = GameStatus.IN_PROGRESS;
            		} else if (game.status == GameStatus.GAME_OVER) {
            			initGame();
            			paintSnake();
            		}
            		break;
				case 27:
					game.status = GameStatus.PAUSE;
					$("#speed_form").css("display", "");
					$("#speed_form").dialog({
			            modal: true,
			            buttons: {
            			    "Submit": function() {
            			    	localStorage.speed = $("#speed").val();
            			    	updateInterval();
            			    	game.status = GameStatus.IN_PROGRESS;
            			    	$("#speed_form").css("display", "none");
            			    	$(this).dialog("close");
            			    }
						}
					});
					break;
            }
		});

		$(window).resize(function() {
			canvas.width=parent.width();
			canvas.height=parent.height();
			paintSnake();
		});
	};
})(jQuery);
