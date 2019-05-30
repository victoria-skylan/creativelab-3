function randomInteger(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

Vue.component("letter-button", {
	props: ["letter", "gameOver", "twoPlayers"],
	template: "<button class='keyboard-row-letter' :id='letter' :disabled='disabled' @click='clicked()'>{{ letter }}</button>",
	data: function() {
		return {
			disabled: false
		};
	},
	// disable button on click, and send 'check' event to run check() in main vue instance
	methods: {
		clicked: function() {
			this.disabled = true;
			this.$emit("check");
		}
	},
	watch: {
		// disable all buttons on game over; re-enable all buttons on restart
		gameOver: function(newValue) {
			this.disabled = newValue;
		},
		// re-enable all buttons when a new two-player game is started
		twoPlayers: function(newValue) {
			this.disabled = false;
		}
	}
});

let app = new Vue({
	el: "#app",
	data: {
		// keyboard letters
		letters: [
			["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
			["A", "S", "D", "F", "G", "H", "J", "K", "L"],
			["Z", "X", "C", "V", "B", "N", "M"]
		],
		currentWord: "",
		wordDivs: [],
		guesses: 0,
		gameOver: false,
		lose: false,
		solved: false,
		twoPlayers: false,
		canvas: "",
		// will be set to the canvas 2d context
		ctx: "",
		
		
		// the stuff that is not hangman
		loading: false,
		examples: [],
		definitions: [],
		date: '',
		note: '',
		message: "start guessing letters to find out the word of the day!"
	},
	// identify the canvas element and initialize it, draw the gallows, choose a word, and draw the blanks.
	mounted: function() {
		this.canvas = document.getElementById("board-canvas");
		this.canvas.width = document.getElementById("board").offsetWidth;
		this.canvas.height = document.getElementById("board").offsetHeight;
		this.ctx = this.canvas.getContext("2d");
		this.ctx.lineWidth = 2;
		this.drawGallows(this.ctx);
		this.findWord();
	},
	watch: {
		lose() {
			if (this.lose) {
				this.message = "the best way to learn is to solve, try again!";
			}
		},
		solved() {
			console.log("we know the game is over")
			this.message = "Good Job! now scroll down to learn more!";
			if(this.solved) {
				document.getElementById("results").style.display = "block";
				document.getElementById("buttons").style.display = "none";
			}
		}
	},
	methods: {
		async findWord() {
		  try {
			this.loading = true;
			const response = await axios.get('http://api.wordnik.com/v4/words.json/wordOfTheDay?api_key=cyoblpeh0891xj555analwg2eyovh5g6bc4urqculmrf6ejgz');
			this.currentWord = response.data.word.toUpperCase();
			this.date = response.data.pdd;
			this.note = response.data.note;
			  for (var i=0; i< response.data.definitions.length; i++){
				  this.definitions.push(response.data.definitions[i].text);
			  }
			  for (var i=0; i< response.data.examples.length; i++){
				  this.examples.push(response.data.examples[i].text);
			  }
			this.loading = false;
			this.makeBlanks();
			  
		  } catch (error) {
			console.log(error);
			this.number = this.max;
		  }
		},
		// draws the gallows
		drawGallows: function(ctx) {
			ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
			ctx.fillStyle = "#FF9800";
			ctx.strokeStyle = "#FF9800";
			ctx.beginPath();
			// left side
			ctx.moveTo(this.canvas.width / 10, this.canvas.height / 10);
			ctx.lineTo(this.canvas.width / 10, this.canvas.height * 0.95);
			// bottom side
			ctx.lineTo(this.canvas.width * 0.8, this.canvas.height * 0.95);
			// top side
			ctx.moveTo(this.canvas.width / 10, this.canvas.height / 10);
			ctx.lineTo(this.canvas.width * 0.4, this.canvas.height / 10);
			// hanging notch
			ctx.lineTo(this.canvas.width * 0.4, this.canvas.height / 5);
			ctx.stroke();
			ctx.closePath();
		},
		// fill this.wordDivs with empty strings to create the orange blanks
		makeBlanks: function() {
			for (var i = 0; i < this.currentWord.length; i++) {
				this.wordDivs.push("");
			}
		},
		// draws the appropriate part of the hanging man and/or 'game over'
		updateCanvas: function(ctx) {
			// this.drawGallows(ctx);
			// draw the head
			if (this.guesses === 0) {
				ctx.beginPath();
				ctx.arc(this.canvas.width * 0.4, (this.canvas.height / 5) + 20, 20, 0, 2 * Math.PI);
				ctx.stroke();
				ctx.closePath();
			} 
			// draw the torso
			else if (this.guesses === 1) {
				ctx.beginPath();
				ctx.moveTo(this.canvas.width * 0.4, (this.canvas.height / 5) + 40);
				ctx.lineTo(this.canvas.width * 0.4, this.canvas.height / 2);
				ctx.stroke();
				ctx.closePath();
			}
			// draw the right leg
			else if (this.guesses === 2) {
				ctx.beginPath();
				ctx.moveTo(this.canvas.width * 0.4, this.canvas.height / 2);
				ctx.lineTo((this.canvas.width * 0.4) + 30, this.canvas.height * 0.7);
				ctx.stroke();
				ctx.closePath();
			}
			// draw the left leg
			else if (this.guesses === 3) {
				ctx.beginPath();
				ctx.moveTo(this.canvas.width * 0.4, this.canvas.height / 2);
				ctx.lineTo((this.canvas.width * 0.4) - 30, this.canvas.height * 0.7);
				ctx.stroke();
				ctx.closePath();
			}
			// draw the right arm
			else if (this.guesses === 4) {
				ctx.beginPath();
				ctx.moveTo(this.canvas.width * 0.4, (this.canvas.height / 5) + 55);
				ctx.lineTo((this.canvas.width * 0.4) + 35, (this.canvas.height / 2) + 10);
				ctx.stroke();
				ctx.closePath();
			} 
			// draw the left arm and handle game over
			else if (this.guesses === 5) {
				ctx.beginPath();
				ctx.moveTo(this.canvas.width * 0.4, (this.canvas.height / 5) + 55);
				ctx.lineTo((this.canvas.width * 0.4) - 35, (this.canvas.height / 2) + 10);
				ctx.stroke();
				ctx.closePath();
				// game over
				ctx.font = "24px Roboto, sans-serif";
				ctx.fillText("Game Over... try again", this.canvas.width * 0.4 - 30, this.canvas.height * 0.9);
				this.gameOver = true;
				this.lose = true;
			}
			this.guesses++
		},
		// check the chosen letter when a letter component emits 'check'
		check: function(letter) {
			if (!this.gameOver) {
				var guessCorrect = false;
				// check if the letter is in the word, if so, fill it in
				for (var i = 0; i < this.currentWord.length; i++) {
					if (letter == this.currentWord[i]) {
						Vue.set(this.wordDivs, i, letter);
						guessCorrect = true;
					}
				}
				// if there are no more blanks in the word, you win
				if (!this.wordDivs.some(function(value) {return value == ""})) {
					this.gameOver = true;
					this.solved = true;
					this.ctx.font = "22px sans-serif";
					this.ctx.fillText("You Win!", this.canvas.width * 0.4 - 30, this.canvas.height * 0.9);
				}
				// if they guess wrong, draw the man
				if (!guessCorrect) {
					this.updateCanvas(this.ctx);
				}
			}
		},
		// re-initializes the game
		restart: function() {
			this.gameOver = false;
			this.lose = false;
			this.guesses = 0;
			this.wordDivs.splice(0);
			this.drawGallows(this.ctx);
			this.makeBlanks();
		},
		// resets the game to one-player mode and chooses a new word
		onePlayer: function() {
			if (this.twoPlayers) {
				this.twoPlayers = false;
				this.currentWord = this.words[randomInteger(0, this.words.length - 1)];
				this.restart();
			}
		},
		// chooses a new word and resets the game when 'play again' is clicked
		playAgain: function() {
			this.restart();
		}
	}
});
