let bubbles = [];
const TOTAL_BUBBLES = 60;
const GROW_TIME = 1000; // 1 second in milliseconds
const BACKGROUND_COLOR = 0; // Black background
let systemStart;
let lastCoralTime = 0; // Track when coral was last drawn
const CORAL_GENERATION_INTERVAL = 3600000; // 1 hour in milliseconds
let initialCorals = []; // Array to store initial coral positions
const BASE_Y = 390; // Fixed y-coordinate for corals (near bottom)

function setup() {
  createCanvas(400, 400);
  systemStart = new Date();
	
  // Initialize the drawing with corals equal to the current hour
	//let currentHour = 23;
  let currentHour = systemStart.getHours();
  for (let i = 0; i < currentHour; i++) {
    initialCorals.push({
      x: (i+2) * width / 26,
      y: BASE_Y, // Position grounded at the bottom
      size: random(30, 90),
      color: [random(100, 255), random(50, 200), random(100, 255)],
			scale: random(100, 400)// Generate unique color for each coral
    });
  }
}

function draw() {
  background(BACKGROUND_COLOR);
  
  let elapsed = millis();
  let currentTime = new Date(systemStart.getTime() + elapsed);
  let hours = currentTime.getHours();
  let mins = currentTime.getMinutes();
  let secs = currentTime.getSeconds();
  let millisecs = currentTime.getMilliseconds();
	
	
	noFill();
	// draw minute curves
	for (let m = 0; m < mins; m++){
		beginShape();
		for (let x = 0; x < width; x += 5) {
			stroke(100);
			let y = 110 + -m * height / 80 + 200 + sin(TWO_PI * (x / width) * 3) * 10; // Calculate y based on sine function
			vertex(x, y); // Plot each point along the curve
		}
		endShape();
	}
	stroke(255);
  // Ensure we always have the correct number of bubbles
  while (bubbles.length < secs && bubbles.length < TOTAL_BUBBLES) {
    bubbles.push(new Bubble(random(width), random(height)));
  }
  
  // Create a new bubble at the start of each second if needed
  if (bubbles.length <= secs && secs !== 59 && millisecs > 100) {
    if (bubbles.length === secs) {
      bubbles.push(new Bubble(random(width), random(100)));
    }
  }
  
  // Burst all bubbles at the end of the minute
  if (secs == 0 && millisecs < 500 && bubbles.length >= 50) {
    for (let bubble of bubbles) {
      if (!bubble.bursting) {
        bubble.burst();
      }
    }
  }
  
  // Update and display bubbles
  for (let i = bubbles.length - 1; i >= 0; i--) {
    let bubble = bubbles[i];
    bubble.update();
    bubble.display();
    
    // Remove the bubble if it has finished bursting
    if (!bubble.bursting && bubble.radius === 0) {
      bubbles.splice(i, 1);
    }
  }

  // Check if an hour has passed to draw new coral
  if (millis() - lastCoralTime > CORAL_GENERATION_INTERVAL) {
    for (let i = 0; i < 10; i++) {
      drawCoral(random(width), BASE_Y, random(20, 100), random(100, 300));
    }
    lastCoralTime = millis(); // Reset the timer
  }

  // Draw initial corals with unique colors
  for (let coral of initialCorals) {
    drawCoral(coral.x, BASE_Y, coral.size, coral.color, coral.scale);
  }

  // Display current time and bubble count
  //fill(255);
  //textSize(16);
  //text(`${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`, 10, 20);
  //text(`Bubbles: ${bubbles.length}`, 10, 40);
}

function drawCoral(x, y, size, color, scale) {
  fill(color[0], color[1], color[2]);
	strokeWeight(0.5);
  beginShape();
  // Use the color values to create unique wave effects
  for (let j = 0; j < TWO_PI; j += 0.1) {
    let waveFactor = noise(cos(j) * 0.5 + color[0] * 0.01, sin(j) * 0.5 + color[1] * 0.01); // Modify noise input with color
    let r = size * waveFactor; // Create a wavy effect
    let xOffset = r * cos(j) * 0.5;
    let yOffset = r * sin(j) * scale / 100.0;
    vertex(x + xOffset, y + yOffset);
  }
  
  endShape(CLOSE);
}

class Bubble {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 0;
    this.maxRadius = random(5, 20); 
    this.burstMaxRadius = 35;
    this.growing = true;
    this.bursting = false;
    this.startTime = millis();
    this.velocity = createVector(random(-0.5, 0.5), random(-0.5, 0.5)); // Slow movement
    this.burstDelay = random(0, 3000); // Random delay for bursting
    this.burstStartTime = null; // Track when bursting starts
  }

  update() {
    if (this.growing) {
      let growthTime = millis() - this.startTime;
      if (growthTime < GROW_TIME) {
        this.radius = map(growthTime, 0, GROW_TIME, 0, this.maxRadius);
      } else {
        this.growing = false;
        this.radius = this.maxRadius;
      }
    }

    if (this.bursting) {
      this.radius += 5;
      if (this.radius > this.burstMaxRadius) {
        this.radius = 0;
        this.bursting = false;
      }
    }

    // Move the bubble
    if (!this.growing && !this.bursting) {
      this.x += this.velocity.x;
      this.y += this.velocity.y;
      
      // Bounce off edges
      if (this.x < 0 || this.x > width) this.velocity.x *= -1;
      if (this.y < 0 || this.y > 200) this.velocity.y *= -1;
    }
  }
  
  burst() {
    this.bursting = true;
    this.radius = this.maxRadius; // Start bursting from the current size
    this.burstStartTime = millis(); // Record when bursting starts
  }

  shouldBurst() {
    return this.burstStartTime !== null && millis() - this.burstStartTime > this.burstDelay;
  }
  
  display() {
    stroke(255);
    strokeWeight(0.7);
    fill(BACKGROUND_COLOR);
    ellipse(this.x, this.y, this.radius * 2);
  }
  
  burst() {
    this.bursting = true;
    this.radius = this.maxRadius; // Start bursting from the current size
  }
}
