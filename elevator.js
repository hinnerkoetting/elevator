{          
    init: function(elevators, floors) {
        
        function Elevator(reference, numberFloors) {
            this.floorWasPressed = new Array(numberFloors);
            this.idle = true;   
            this.goingUp = true;
            this.ele = reference;
            for (var i = 0; i < numberFloors; i++)
                this.floorWasPressed[i] = false;
        }
        
        Elevator.prototype.getObject = function() {
            return this.ele;
        };
        
        Elevator.prototype.goToFloor = function(florNum) {            
            this.idle = false;
            var that = this;           
            that.ele.goToFloor(florNum);                        
            
        }
        
        Elevator.prototype.moveUp = function() {              
            this.goToFloor(this.ele.currentFloor() + 1);           
        }
        
        Elevator.prototype.moveDown = function() {            
            this.goToFloor(this.ele.currentFloor() - 1);            
        }
        
        Elevator.prototype.currentFloor = function() {            
             return this.ele.currentFloor();
        }
        
        Elevator.prototype.goToNextFloorUp = function() {            
            for (var i = this.currentFloor(); i < floors.length; i++) {
                if (this.floorWasPressed[i]) {
                    this.goToFloor(i);           
                    return;
                }    
            }                
        }
        
        Elevator.prototype.goToNextFloorDown = function() {            
            for (var i = this.currentFloor(); i >= 0; i--) {
                if (this.floorWasPressed[i]) {
                    this.goToFloor(i);           
                    return;
                }    
            }     
        }
     
         Elevator.prototype.isAtLeastOneFloorPressed = function() {              
            for (var i = 0; i < floors.length; i++) {                
                if (this.floorWasPressed[i]) {                   
                    return true;
                }    
            }     
            return false;
        }
             
         Elevator.prototype.maxPressedFloor = function() {
            for (var i = floors.length - 1; i >= 0 ; i--) {                   
                if (this.floorWasPressed[i]) {
                    return i;
                }
            }             
            return 0;
         }
             
         Elevator.prototype.minPressedFloor = function() {
            for (i = 0; i < floors.length ; i++) {
                if (this.floorWasPressed[i]) 
                    return i;
            }             
            return floors.length - 1;
         }    
         
        Elevator.prototype.goToNextFloor = function() {            
            if (this.idle) {                
                if (this.isAtLeastOneFloorPressed()) {                    
                    if (this.goingUp) {
                        if (this.currentFloor() >= this.maxPressedFloor()) {                            
                            this.goingUp = false;                            
                            this.goToNextFloorDown();
                        }
                        else 
                            this.goToNextFloorUp();
                    } else {
                        if (this.currentFloor() <= this.minPressedFloor()) {                             
                            this.goingUp = true;
                            this.goToNextFloorUp();
                        } else 
                            this.goToNextFloorDown();
                    }                    
                }
            }
        }
        
        Elevator.prototype.personPressedFloor = function(floorNumber) {                       
             this.floorWasPressed[floorNumber] = true;                         
             this.goToNextFloor();       
        }
        
        Elevator.prototype.isBelow = function(floorNumber) {        
            return this.currentFloor() < floorNumber;
        }
        
        Elevator.prototype.isOver = function(floorNumber) {        
            return this.currentFloor() > floorNumber;
        }
        
        Elevator.prototype.distanceToFloor = function(floorNumber) {        
            if (this.idle) {
                return Math.abs(floorNumber - this.currentFloor());
            } else {
                if (this.goingUp) {
                    if (this.isBelow(floorNumber)) {
                        return floorNumber -  this.currentFloor();
                    } else {
                        return (floors.length - 1 -  this.currentFloor()) + (floors.length - 1 - floorNumber);
                    }
                } else {
                    if (this.isOver(floorNumber)) {
                        return - floorNumber +  this.currentFloor();
                    } else {
                        return (this.currentFloor()) + (floorNumber);
                    }
                }
            }
        }
        
        var myElevators = new Array(elevators.length);
        for (var i = 0; i < elevators.length; i++) {
            var elevator = elevators[i];
            myElevators[i] = new Elevator(elevator, floors.length);
        }
       
        
        function floorDownPressed(floor, floorNumber) {
            return function() {
                var minDist = 999999;
                var targetElevator;
                for (var i = 0; i < myElevators.length; i++) {
                    var elevator = myElevators[i];
                    if (elevator.distanceToFloor(floorNumber) < minDist) {
                        minDist = elevator.distanceToFloor(floorNumber);
                        targetElevator = elevator;
                    }
                }
                targetElevator.personPressedFloor(floorNumber);
            };
        }
        
         function floorUpPressed(floor, floorNumber) {
            return function() {               
                var minDist = 999999;
                var targetElevator;
                for (var i = 0; i < myElevators.length; i++) {
                    var elevator = myElevators[i];
                    if (elevator.distanceToFloor(floorNumber) < minDist) {
                        minDist = elevator.distanceToFloor(floorNumber);
                        targetElevator = elevator;
                    }
                }
                targetElevator.personPressedFloor(floorNumber);
            };
        }
        
        function onIdleElevator(elevator) {            
            return function() {                     
                 elevator.idle = true;
                 elevator.goToNextFloor();         
            };        
        }
        
        function onStoppedElevator(elevator) {
            return function(floorNum) {
               elevator.floorWasPressed[floorNum] = false;
            };
        }                              
        
        function onFloorButtonPressed(elevator) {
            return function(floorNum) {                       
                elevator.personPressedFloor(floorNum);   
                elevator.goToNextFloor();       
            };
        }
        
         function onFloorPassing(elevator) {
             return function(floorNum, direction) {                 
                 if (elevator.floorWasPressed[floorNum]) 
                     elevator.goToFloor(floorNum);
            };
            
         }
        
        function distributeElevators(elevators, floors) {
            for (var i = 1; i < elevators.length; i++) {
                var elevator = elevators[i];
                var targetFloor = Math.floor(i / elevators.length * floors.length);
                elevator.goToFloor(targetFloor);
            }
        }
             
           
        for (var i = 0; i < myElevators.length; i++) {               
            var ele = myElevators[i];
            ele.getObject().on("idle", onIdleElevator(ele));
            ele.getObject().on("stopped_at_floor", onStoppedElevator(ele));
            ele.getObject().on("floor_button_pressed", onFloorButtonPressed(ele));
            ele.getObject().on("passing_floor", onFloorPassing(ele));            
        }
        
        for (i = 0; i < floors.length; i++) {
            floor = floors[i];
            floor.on("down_button_pressed", floorDownPressed(floor, i));
            floor.on("up_button_pressed", floorUpPressed(floor, i));
        }
        
        distributeElevators(myElevators, floors);
    },
    update: function(dt, elevators, floors) {
        // We normally don't need to do anything here
    }
    
}