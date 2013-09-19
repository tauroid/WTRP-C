function ValueAnimator(setValueCallback,initialValue,targetValue,timeToTake) {
    var self = this;
    this.initialValue = initialValue;
    this.value = initialValue;
    this.targetValue = targetValue;
    this.startTime = new Date();
    this.setValueCallback = setValueCallback;
    this.timeToTake = timeToTake;
    this.finished = false;
    this.increasing = self.targetValue - self.initialValue > 0;
    this.finish = null;
    
    self.update = update;
    function update(delta) {
        if(!self.finished && self.value != self.targetValue) {
            self.value += delta/self.timeToTake*(self.targetValue-self.initialValue);
            self.setValueCallback(self.value);
        }
        
        if((self.increasing && self.value >= self.targetValue) ||
           (!self.increasing && self.value <= self.targetValue)) {
            this.finished = true;
            self.setValueCallback(self.targetValue);
            if(self.finish) self.finish();
        }
    }
    
    self.setFinishCallback = setFinishCallback;
    function setFinishCallback(callback) {
        self.finish = callback;
    }
}
