//This file will create the class that is used to contain the data of each instance of CNC.js 
class digitalTwin {
    //static instances = 0;
    //Hopefully each time an instance is created then the instance property which is across all classes 
    //Will increment to keep track of how many objects(cncjs connections) there are
    constructor(instanceID, instance){
        this.name = instanceID;
        this.instance = instance;
    }

    set parameters(parameters){
        this.parameters = parameters;
    }

    get parameters(){
        return this.parameters;
    }
}

module.exports = digitalTwin;
