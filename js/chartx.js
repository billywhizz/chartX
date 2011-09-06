function ChartX(canvasid, options) {
	var pos = 0;

	function clearrect(context, left, top, width, height, color) {
		var oldFill = context.fillStyle;
		context.fillStyle = options.bgcolor;
		context.fillRect(left, top, width, height);
		context.fillStyle = oldFill;
	}

	function line(context, x1, y1, x2, y2) {
		context.beginPath();
		context.moveTo(x1 || 0, y1 || 0);
		context.lineTo(x2 || 0, y2 || 0);
		context.stroke();
		context.closePath();
	}

	function line2(context, x1, y1) {
		context.beginPath();
		context.moveTo(x1 || 0, y1 || 0);
		context.lineTo(x1 + 1 || 0, y1 || 0);
		context.stroke();
		context.closePath();
	}

	var divc = document.getElementById(canvasid + "div");
	if(!divc) {
		divc = document.createElement("div");
		divc.setAttribute("class", "chartc");
		divc.setAttribute("id", canvasid + "div");
		var container = document.getElementById(options.container);
		container.appendChild(divc);
		//$(options.container).append(divc);
		divc.setAttribute("display", "block");
	}
	if(options.title) divc.innerHTML = "<span>" + options.title + "</span><br />";
	if(options.onclick) {
		divc.onclick = options.onclick;
	}
	divc = document.getElementById(canvasid + "div");
	//divc = $("#" + canvasid + "div");
	var canvas = document.getElementById(canvasid);
	if(!canvas) {
		canvas = document.createElement("canvas");
		canvas.setAttribute("class", "chart");
		canvas.setAttribute("id", canvasid);
		divc.appendChild(canvas);
		canvas.setAttribute("display", "block");
		canvas.setAttribute("visibility", "visible");
	}
	canvas.setAttribute("width", options.width);
	canvas.setAttribute("height", options.height);

	var context = canvas.getContext("2d");

	context.lineWidth = options.linewidth || 1;
	this.showtable = options.showtable;
	clearrect(context, 0, 0, options.width, options.height, options.bgcolor);

	var pg = document.createElement("canvas");
	pg.setAttribute("width", options.width * options.bufferfactor);
	pg.setAttribute("height", options.height);
	var pgcontext = pg.getContext("2d");
	pgcontext.lineWidth = options.linewidth || 1;
	clearrect(pgcontext, 0, 0, options.width * options.bufferfactor, options.height, options.bgcolor);
	if(options.grid) {
		pgcontext.lineWidth = options.grid.linewidth || 1;
        pgcontext.strokeStyle = options.grid.color;
		for(i=(options.width/options.grid.hsegments); i<options.width * options.bufferfactor; i += (options.width/options.grid.hsegments)) {
			line(pgcontext, i, options.height, i, 0);
		}
		for(i=(options.height/options.grid.vsegments); i<options.height; i += (options.height/options.grid.vsegments)) {
			line(pgcontext, 0, i, options.width * options.bufferfactor, i);
		}
		pgcontext.lineWidth = options.linewidth || 1;
	}
	var prev = null;
	var count = 0;
	this.draw = function(stat) {
		count++;
		var lbuff = [];
		lbuff.push("<span style=\"display: block; float: left; padding: 2px;\">" + count + ": </span>");
		if(pos > ((options.width * options.bufferfactor) - 1)) {
			clearrect(pgcontext, 0, 0, options.width * options.bufferfactor, options.height, options.bgcolor);
			if(options.grid) {
				pgcontext.lineWidth = options.grid.linewidth || 1;
		        pgcontext.strokeStyle = options.grid.color;
				for(i=(options.width/options.grid.hsegments); i<options.width * options.bufferfactor; i += (options.width/options.grid.hsegments)) {
					line(pgcontext, i, options.height, i, 0);
				}
				for(i=(options.height/options.grid.vsegments); i<options.height; i += (options.height/options.grid.vsegments)) {
					line(pgcontext, 0, i, options.width * options.bufferfactor, i);
				}
			}
			pgcontext.drawImage(canvas, 0, 0, options.width, options.height);
			pos = options.width;
		}
		y1 = options.height;
		options.series.forEach(function(item) {
			pgcontext.lineWidth = options.linewidth || 1;
        	pgcontext.strokeStyle = item.color;
			var yinterval = options.height / item.yscale;
			var current = stat[item.name];
			if(item.cross) {
				current += item.cross;
			}
			switch(item.type) {
				case "line":
					if(prev) {
						var previous = prev[item.name];
						if(item.cross) {
							previous += item.cross;
						}
						line(pgcontext, pos, y1 - (yinterval*previous), pos + 2, y1 - (yinterval*current));
					}
					else {
						line(pgcontext, pos, y1 - (yinterval*current), pos + 2, y1 - (yinterval*current));
					}
					break;
				case "stack":
					line(pgcontext, pos, y1, pos, y1 -= (yinterval*current));
					break;
			}
		});
		if(pos > (options.width - 1)) {
			context.drawImage(pg, options.width - pos, 0);
		}
		else {
			context.drawImage(pg, 0, 0);
		}
		if(options.legend) {
			if(!this.table) {
				this.table = document.createElement("div");
				divc.appendChild(this.table);
			}
			this.table.setAttribute("class", "infoon");
			options.series.forEach(function(s) {
				lbuff.push("<span style=\"display: block; padding: 2px; float: left; text-align: right; color: " + s.color + "; color: " + s.txcolor + ";\">" + s.name + " (<strong>" + stat[s.name].toFixed(2) + "</strong>)</span>");
			});
			this.table.innerHTML = lbuff.join("");
		}
		else {
			if(this.table) {
				this.table.setAttribute("class", "infooff");
			}		
		}
		pos++;
		prev = stat;
	}
}
