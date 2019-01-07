var circles = []; //holds all circle start locations for points
var particles = []; //holds all points that are made on circle start points

// Create a new word2vec method
const wordVectors = ml5.word2vec('https://gist.githubusercontent.com/vndrewlee/68383f3668c33d290394616fd30c9c3f/raw/d642b46d0332fbb64ff15f423a2454eedf9aee2b/wordvecs10000.json', modelLoaded);

var inc = 0.1;
var scl = 80;
var cols, rows;

var zoff = 0;

var input; //for the user input in sentence bar
var nearWord = " ";
let nearWords = [];
let words = [];

var flowField = [];

var newSentence = "";

var r;
var g;
var b;

var spd = 5;
let zVal = .0001;

var rand;

function setup() {
  	createCanvas(windowWidth, windowHeight); //create a canvas for screen
	background(255); //white background
	
	$('#typeSentence').on('input', splitText);
	
	//separate page into columsn and rows to assign vectors
	cols = floor(windowWidth/scl); 
	rows = floor(windowHeight/scl);
	
	flowField = new Array(cols * rows);
	
	for (var i = 0; i < circles.length; i++){
		for (var j = 0; j < circles[i].outsidePoints.length; j++){ //traverse through each circles outside coords array
			var particle = new Particle(circles[i].outsidePoints[j].x, circles[i].outsidePoints[j].y); //make a point for each coordinate
			particles.push(particle); //add to array
		}
	}
}

function draw() {
	background(225, .9);
	var yoff = 0;
	for (var x = 0; x < cols; x++){
		var xoff = 0;
		for (var y = 0; y < rows; y++){
			var index = x + y * cols;
			var angle = noise(xoff, yoff, zoff) * TWO_PI*4;
			var v = p5.Vector.fromAngle(angle);
			v.setMag(.5);
			flowField[index] = v;
			xoff += inc;

		}
		yoff += inc;
		zoff += zVal; //how aggressive the perlin noise is
	}
	for (var i = 0; i < particles.length; i++){
		if (particles[i].edges() === 1){
			particles.splice(i, 1);
		} else {
			particles[i].maxSpeed = spd;
			particles[i].follow(flowField);
			particles[i].update();
		}
	}
	
	for (var i = 0; i < particles.length; i++){
		for (var j = 0; j < particles.length; j++){
			var dist = calcDist(particles[i].pos.x, particles[i].pos.y, particles[j].pos.x, particles[j].pos.y);
			if (dist > 3 && dist < 10){
				stroke(r, g, b);
				strokeWeight(.01);
				line(particles[i].pos.x, particles[i].pos.y, particles[j].pos.x, particles[j].pos.y);
			}
		}
	}
}


//Circle class, holds start locations for points
function Circle(xIn, yIn, rad){
	this.x = xIn; //x location of arc
	this.y = yIn; //y location of arc
	this.radius = rad; //size of circle
	this.outsidePoints = []; //holds all points of circle
	
	this.makeOutsidePoints = function(){ //calculates the circles outside coordinates
		for (var degree = 0; degree < 360; degree++){ //credit: https://stackoverflow.com/questions/18342216/how-to-get-an-array-of-coordinates-that-make-up-a-circle-in-canvas
			var radians = degree * Math.PI/180;
			var x = this.x + this.radius * Math.cos(radians);
			var y = this.y + this.radius * Math.sin(radians);
			this.outsidePoints.push({x:x,y:y});
		}
	}
}


function makeCircle(xStart, yStart, radiusSize){ //simple function to add a new circle
	var circ = new Circle(xStart, yStart, radiusSize); //make new circle
	circ.makeOutsidePoints(); //calculate outside x and y points before adding to array
	
	for (var i = 0; i < circ.outsidePoints.length; i++){
		var particle = new Particle(circ.outsidePoints[i].x, circ.outsidePoints[i].y); //make a point for each coordinate
		particles.push(particle); //add to array
	}
	
	circles.push(circ); //add to array
}

// When the wordvec model is loaded
function modelLoaded() {
  	console.log('Model Loaded!');
}

//this function splits up the user input by spaces, saves in array
function splitText(){
	particles = [];
	circles = [];
	words = []; //reset array
	nearWrd = "";
	
	var input = $('#typeSentence').val(); //get the user input each time its changed
	
	if (input == ""){
		$("#nearWords").empty();
	}
	
	var words = input.split(" "); //split it up by spaces
	
	for (var i = 0; i < words.length; i++){ //take out empty characters
		if (words[i] === "") words.splice(i, 1);
		var nearWrd = findNearWord(words[i]);
		if (nearWrd) nearWord += nearWrd;
	}
	
    if (rand > 5) zVal = .1;
    else zVal = .0001;
    
	makeCircle(windowWidth/2, windowHeight/2, map(rand, 0, 9, 100, 200));
	
	$("#nearWords").append( '<p> ' + nearWord + '</p>');
	
	//$('#similarSentence').text(nearWord);
	
}

//function that returns a word nearest to it
function findNearWord(wrd){
	particles = [];
	circles = [];
	wordVectors.nearest(wrd, function(err, results){
		if (results){ //if there is a result
			rand = getRandomInt(0, results.length-1); //get a random value to keep
			nearWord = results[rand].word; //return a random match
			//change colors based on results
			r = (results[5].distance - results[0].distance)*getRandomInt(0, 255);
			g = (results[4].distance - results[0].distance)*getRandomInt(0, 255);
			b = (results[3].distance - results[0].distance)*getRandomInt(0, 255);
			
			//spd = map(results[rand].distance, 0, 1.2, 2, 11);
			
			return nearWord;
		}
	});
}

function makeNewSentence(wrds){
	console.log(wrds);
}

//calculate distance between two objects
function calcDist(xin, yin, x2in, y2in){
    var a = xin - x2in;
    var b = yin - y2in;

    var c = Math.sqrt(a*a + b*b);
    
    return c;
}

//random functions
function getRandomInt(min, max){ //returns random integer
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
            
function getRandomFloat(min, max){ //returns random float
    return Math.random() * (max - min) + min;
}