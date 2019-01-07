function Particle(xin, yin){
	this.pos = createVector(xin,yin); //create vector for position
	this.vel = createVector(0,0); //create vector for velocity
	this.acc = createVector(0,0); //create vector for acceleration
	this.maxSpeed = 5;
	
	this.update = function(){
		this.vel.add(this.acc);
		this.vel.limit(this.maxSpeed);
		this.pos.add(this.vel);
		this.acc.mult(0);
	}
	
	this.applyForce = function(force){
		this.acc.add(force);
	}
	
	this.show = function(){
		//stroke('rgb(20, 10, 155)');
		//point(this.pos.x, this.pos.y);
	}
	
	this.edges = function(){
		if(this.pos.x > windowWidth) return 1;
		if(this.pos.x < 0) return 1;
		if(this.pos.y > windowHeight) return 1;
		if(this.pos.y < 0) return 1;
	}
	
	this.follow = function(vectors){
		var x = floor(this.pos.x/scl);
		var y = floor(this.pos.y/scl);
		var index = x + y * cols;
		var force = vectors[index];
		this.applyForce(force);
	}
}