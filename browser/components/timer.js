// Functions for a personal timer.

var Timer = function (timer, fn, intervalFn) {

    if(typeof timer === 'array'){
         this.mins = timer[0];
         this.secs = timer[1]
     } else if (typeof timer === 'string'){
         timer = timer.split(/\D/);
         return new Timer(timer, fn, intervalFn);
     }

    this.mins = 0;
    this.secs = timer;
    //this.secs = 10
    this.running = true;

    while (this.secs > 59) {
        this.mins++;
        this.secs -= 60;
    }

    this.interval = setInterval(
        (function () {
            if (this.secs === 0) {
                if (this.mins === 0) {
                    if (!fn || typeof fn !== 'function') {
                        console.warn("Timer up. No function or invalid function passed for invokation");
                    }
                    else {
                        fn();
                    }
                    clearInterval(this.interval);
                    this.running = false;
                    return;
                } else {
                    this.mins--;
                    this.secs = 59;
                }
            }
            else {
                this.secs--;
            }
            if(intervalFn) intervalFn();
        }).bind(this),
        1000);

    this.stop = () => {
        clearInterval(this.interval);
        this.running = false;
    }
};
Timer.prototype.getSecs = function(){
    return this.secs < 10 ? '0' + this.secs : this.secs;
};
Timer.prototype.getMins = function(){
    return this.mins < 1 ? '' : this.mins;
};
Timer.prototype.getTotal = function(){
     return this.mins * 60 + this.secs;
 };
