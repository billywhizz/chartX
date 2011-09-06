function ChartX(canvasid, options) {
	var pos = 0;
	var divc;
	var canvas;
	var context;
	var pg;
	var pgcontext;
	var prev;
	var count = 0;

	this.table = null;
	
	this.clear = function() {
		clearrect(context, 0, 0, options.width, options.height, options.bgcolor);
		clearrect(pgcontext, 0, 0, options.width * options.bufferfactor, options.height, options.bgcolor);
		pos = 0;
		prev = null;
		count = 0;
	}
	
	this.toggleLegend = function() {
		if(options.legend) {
			this.table.setAttribute("display", "block");
		}
		else {
			this.table.setAttribute("display", "none");
		}
		options.legend = !options.legend;
	}
	
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

	function drawGrid() {
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
	
	divc = document.getElementById(canvasid + "div");
	if(!divc) {
		divc = document.createElement("div");
		divc.setAttribute("class", "cx-chart");
		divc.setAttribute("id", canvasid + "div");
		var container = document.getElementById(options.container);
		container.appendChild(divc);
		divc.setAttribute("display", "block");
	}
	if(options.title) divc.innerHTML = "<span>" + options.title + "</span><br />";
	if(options.onclick) {
		divc.onclick = options.onclick;
	}
	divc = document.getElementById(canvasid + "div");
	canvas = document.getElementById(canvasid);
	if(!canvas) {
		canvas = document.createElement("canvas");
		canvas.setAttribute("class", "cx-canvas");
		canvas.setAttribute("id", canvasid);
		divc.appendChild(canvas);
		canvas.setAttribute("display", "block");
		canvas.setAttribute("visibility", "visible");
	}
	canvas.setAttribute("width", options.width);
	canvas.setAttribute("height", options.height);
	context = canvas.getContext("2d");
	context.lineWidth = options.linewidth || 1;
	clearrect(context, 0, 0, options.width, options.height, options.bgcolor);
	pg = document.createElement("canvas");
	pg.setAttribute("width", options.width * options.bufferfactor);
	pg.setAttribute("height", options.height);
	pgcontext = pg.getContext("2d");
	pgcontext.lineWidth = options.linewidth || 1;
	clearrect(pgcontext, 0, 0, options.width * options.bufferfactor, options.height, options.bgcolor);
	if(options.grid) drawGrid();
	prev = null;
	count = 0;
	this.draw = function(stat) {
		count++;
		var lbuff = [];
		lbuff.push("<span class=\"cx-legend-label\" style=\"display: block; float: left; padding: 2px;\">" + count + ": </span>");
		if(pos > ((options.width * options.bufferfactor) - 1)) {
			clearrect(pgcontext, 0, 0, options.width * options.bufferfactor, options.height, options.bgcolor);
			if(options.grid) drawGrid();
			pgcontext.drawImage(canvas, 0, 0, options.width, options.height);
			pos = options.width;
		}
		var y1 = options.height;
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
			this.table.setAttribute("display", "block");
			this.table.setAttribute("class", "cx-legend");
			this.table.setAttribute("width", options.width);
			options.series.forEach(function(s) {
				lbuff.push("<span class=\"cx-legend-indicator\" style=\"display: block; padding: 2px; float: left; text-align: right; color: " + s.color + "; color: " + s.txcolor + ";\">" + s.name + " (<strong>" + stat[s.name].toFixed(2) + "</strong>)</span>");
			});
			this.table.innerHTML = lbuff.join("");
		}
		else {
			if(this.table) {
				this.table.setAttribute("display", "none");
			}		
		}
		pos++;
		prev = stat;
	}
}
