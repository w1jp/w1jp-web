// 171105 ©2017 W1JP, Gatorbot LLC
// 

// used to create symbol elements on the tick-scale
// 0 = end
// 1 = dit
// 2 = dah
const symbolTable = [
	[' ',[5,0]],
	['A',[1,2,0]],
	['B',[1,1,1,2,0]],
	['C',[2,1,2,1,0]],
	['D',[2,1,1,0]],
	['E',[1,0]],
	['F',[1,1,2,1,0]],
	['G',[2,2,1,0]],
	['H',[1,1,1,1,0]],
	['I',[1,1,0]],
	['J',[1,2,2,2,0]],
	['K',[2,1,2,0]],
	['L',[1,2,1,1,0]],
	['M',[2,2,0]],
	['N',[2,1,0]],
	['O',[2,2,2,0]],
	['P',[1,2,2,1,0]],
	['Q',[2,2,1,2,0]],
	['R',[1,2,1,0]],
	['S',[1,1,1,0]],
	['T',[2,0]],
	['U',[1,1,2,0]],
	['V',[1,1,1,2,0]],
	['W',[1,2,2,0]],
	['X',[2,1,1,2,0]],
	['Y',[2,1,2,2,0]],
	['Z',[2,2,1,1,0]],
	['1',[1,2,2,2,2,0]],
	['2',[1,1,2,2,2,0]],
	['3',[1,1,1,2,2,0]],
	['4',[1,1,1,1,2,0]],
	['5',[1,1,1,1,1,0]],
	['6',[2,1,1,1,1,0]],
	['7',[2,2,1,1,1,0]],
	['8',[2,2,2,1,1,0]],
	['9',[2,2,2,2,1,0]],
	['0',[2,2,2,2,2,0]],
	['.',[1,2,1,2,1,2,0]],
	[',',[2,2,1,1,2,2,0]],
	['?',[1,1,2,2,1,1,0]],
	['/',[2,1,1,2,1,0]],
	['+',[1,2,1,2,1,2,0]],
	['=',[1,1,1,2,1,2,0]]
];

class Beacon {
	constructor (tx=(type)=>{}, 
		opts={
			default: 'W1JP',
			wpm: 12,
			farnsworth: 20,
			endDelay: 2000,
			playing: false,
		}) 
	{
		this.tx = tx
		this.opts = opts
		this.queue = []
		this.iChar = 0
		this.iSym = 0
		this.state = 0 // 0: reset, 1: play, 2: pause

		// Do the setup calcs
		const wpmPeriod = 60000/this.opts.wpm
		const farnsPeriod = 60000/this.opts.farnsworth
		this.tickPeriod = farnsPeriod/50 // ms
		this.spacePeriod = (wpmPeriod-farnsPeriod)/19 + this.tickPeriod
		this.morse = new Map(symbolTable)
		this.reset()
	}
	// setDefaultMsg()
	// deQueue()
	// enQueue()
	// play()
	play() {
		if (this.state == 1) return
		if (this.queue.length==0) this.queue.push(this.opts.default)
		this.state = 1
		this.timer = window.setTimeout(() => {this.tick()},this.tickPeriod)
	}
	// pause()
	pause () {
		if (!this.playing) return
		window.clearTimeout(this.timer)
		this.playing = false
	}
	// reset()
	reset () {
		if (this.queue.length==0) this.queue.push(this.opts.default)
		this.iChar = 0
		this.iSym = 0
		if (this.state == 1 && this.timer == 0) 
			this.timer = window.setTimeout(() => {this.tick()},this.tickPeriod)
	}
	// getOpts()
	// setOpts()
	// tick()
	tick ()  {
		// handle tick
		if (this.state != 1) return
		let char = this.queue[0][this.iChar]
		let symbol = this.morse.get(char)[this.iSym]
		let delay = 0 // used to set next timer
		if (char == ' ') {
			delay = 7 * this.wordPeriod - this.tickPeriod

		}
		else switch (symbol) {
			case 0 :
				// end symbol space (2 * wordPeriod + (workPeriod-tickPeriod))
				delay = 3 * this.spacePeriod - this.tickPeriod
				// get next work
				if (this.queue[0][++this.iChar]==undefined) { // message done
					this.queue.splice(0,1) // remove it
					if (this.queue.length == 0) this.queue.push(this.opts.default) // queue done use default message
					this.iChar = 0
					delay = 7 * this.spacePeriod // end of word space
				}
				this.iSym = 0
				break
			case 1 :
				// dit 
				this.tx(1)
				delay = this.tickPeriod * 2
				++this.iSym
				break
			case 2 :
				// dah
				this.tx(2)
				delay = this.tickPeriod * 4
				++this.iSym
				break
			default :
				throw ('I am confused')
		}
		// set next up timer
		this.timer = window.setTimeout(() => {this.tick()}, delay)
	}
}

//export default Beacon
