import React from "react";
import { isArray } from "util";


// High level typescript representation of the python project.
export class Project {
    project: any;
    actors: ProjectActor[];

    constructor(project: any){
        this.project = project;
        this.actors = project.actors.map((currentValue:any, index: number) => new ProjectActor(currentValue, index));
    }

    updateProjectIfModified(project: any, Sk: any) {
        let modified = false;
        for(var index in project.actors) {
            modified = this.actors[parseInt(index)]?.updateProjectIfModified(project.actors[index], Sk) || modified;
        }
        return modified;
    }

    display(updateProjectVars : any) {
        const test = () => {updateProjectVars(this)};
        return <div>{this.actors.map(a => a.display(test))}</div>
    }

}

// Typescript representation of python actors.
class ProjectActor {
    actor: any;
    instances: ActorInstance[];
    showContent: boolean;
    index: number;

    constructor(actor: any, actorIndex: number) {
        this.actor = actor;
        this.index = actorIndex;
        this.instances = [];
        for(var index in actor.instances){
            this.instances.push(new ActorInstance(actor.instances[index], parseInt(index)));
        }
        this.showContent = false;
    }

    changeContentState(updateProjectVars: Function) {
        this.showContent = !this.showContent;
        updateProjectVars();
    }

    updateProjectIfModified(actor: any, Sk: any) {
        let modified = false;
        for(var index in actor.instances) {
            modified = this.instances[parseInt(index)].updateProjectIfModified(actor.instances[index], Sk) || modified;
        }
        return modified;
    }
    
    display(updateProjectVars: Function) {
        return <div>
                    <button className="DebuggerVariable" type="button" onClick={() => this.changeContentState(updateProjectVars) }>
                             {(this.index === 0)? "Backdrop: " : "Sprite: "} {this.actor.py_cls.__name__.v} 
                    </button>
                    {this.showContent? this.instances.map(i => i.display(updateProjectVars)) : null}
                </div>;
    }
}

// Typescript representation of python actor instances.
class ActorInstance {
    index: number;
    instance: any;
    variables: InstanceVariable[];
    showContent: boolean;

    constructor(instance: any, instanceIndex: number) {
        this.index = instanceIndex;
        this.instance = instance;
        this.variables = [];
        for (var key in this.instance.py_object.$d.entries) {
            this.variables.push(new InstanceVariable(this.instance.py_object.$d.entries[key]));
        }
        this.showContent = false;
    }

    changeContentState(updateProjectVars: Function) { 
        this.showContent = !this.showContent; 
        updateProjectVars();
    }

    updateProjectIfModified(instance: any, Sk: any) {
        let modified = false;
        let i = 0;
        for(var index in instance.py_object.$d.entries) {
            modified = this.variables[i++]?.updateProjectIfModified(instance.py_object.$d.entries[index], Sk) || modified;
        }
        return modified;
    }

    display(updateProjectVars: Function) {
        const title = (this.index === 0)? "Original Instance" :  "Instance: " + this.index.toString();
        return  <div>
                    <button className="DebuggerVariable" type="button" onClick={() => this.changeContentState(updateProjectVars) }>{title}</button>
                    {this.showContent? this.variables.map(v => v.display(updateProjectVars)) : null}
                </div>;
    }
}

// Wrapper class that represents a variable of any type.
// Turns variables into their correct type for display.
class InstanceVariable {
    variable: any;
    item: DebuggerItem;

    constructor(variable: any) {
        this.variable = variable;
        this.item = this.createDebuggerItemFromVariable(this.variable);
    }

    updateProjectIfModified(variable: any, Sk: any){
        return this.item.updateProjectIfModified(variable, Sk);
    }

    createDebuggerItemFromVariable(variable: any) {
        const rhs : any = variable.rhs.v;
        if(Array.isArray(rhs)) {
          return new ListItem(this.variable);
        } else if(!isNaN(parseFloat(rhs))) {
          return new NumberItem(this.variable);
        } else {
          return new StringItem(this.variable);
        }
    }

    display(updateProjectVars: Function) {
        return this.item.display(updateProjectVars);
    }
}

// Which variables should the debugger ignore when displaying the class variables.
const variablesToNotDisplay = [
    "_appearance_index",
    "_speech",
]

class DebuggerItem {
    variableName: string;
    hasModified: boolean;
    shouldDisplay: boolean;

    constructor(name: string, shouldDisplay: boolean) {
        this.variableName = name;
        this.hasModified = false;
        this.shouldDisplay = shouldDisplay;
    }

    updateProjectIfModified(variable: any, Sk: any) {
        return this.hasModified;
    }

    display(updateProjectVars: Function) {
        return <p className="variable"></p>;
    };
}
  
class StringItem extends DebuggerItem {
    value: string;

    constructor(val: any) {
        super(val.lhs.v, !variablesToNotDisplay.includes(val.lhs.v));
        this.value = (val.rhs.v != null)? val.rhs.v : ""; 
    
    }

    updateProjectIfModified(variable: any, Sk: any) {
        if(this.hasModified && this.value !== ""){
            // To handle the different variable types continued within python lists.
            if(variable.rhs != null) variable.rhs = Sk.ffi.remapToPy(this.value);
            else variable.v = this.value;
        }
        return this.hasModified;
    }

    display(updateProjectVars: Function) {
        if(this.shouldDisplay) {
            return  <div className="DebuggerVariable">
                        <p className="DebuggerVariableComponent"> {this.variableName} = </p> 
                        <input className="DebuggerVariableComponent" type="text" value={this.value} onChange={(e) => {this.value = e.target.value; updateProjectVars(); this.hasModified = true;}}/>
                    </div>;
        } else {
            return <div></div>;
        }
    }
}

class NumberItem extends DebuggerItem {
    value: number;

    constructor(val: any) {
        super(val.lhs.v, !variablesToNotDisplay.includes(val.lhs.v));
        this.value = parseFloat(val.rhs.v);
    }

    updateProjectIfModified(variable: any, Sk: any) {
        if(this.hasModified && !isNaN(this.value)) {
            // To handle the different variable types continued within python lists.
            if(variable.rhs != null) variable.rhs = Sk.ffi.remapToPy(this.value);
            else variable.v = this.value;
        }
        return this.hasModified;
    }

    display(updateProjectVars: Function) {
        if(this.shouldDisplay) {
            return  <div className="DebuggerVariable">
                        <p className="DebuggerVariableComponent"> {this.variableName} =  </p> 
                        <input className="DebuggerVariableComponent" type="number" value={this.value} onChange={(e) => {this.value = parseFloat(e.target.value); updateProjectVars(); this.hasModified = true;}}/>
                    </div>;
        } else {
            return <div></div>;
        }
    }
}

class ListItem extends DebuggerItem {
    showContent: boolean;
    values: InstanceVariable[];
    displayValues : string;

    constructor(val: any) {
        super(val.lhs.v, true);
        this.values = val.rhs.v.map((v: any, index: number) => this.createItem(v, index));
        this.displayValues =  JSON.stringify(val.rhs.v.map((v : any) => this.getJS(v)), null, ' ');
        this.showContent = false;
    }

    // Turns Python array into a JS array for pretty stringification
    getJS(val: any){
        if(Array.isArray(val.v)){
            return val.v.map((v:any) => this.getJS(v))
        } else {
            return val.v
        }
    }

    createItem(val: any, index: number) {
        if(Array.isArray(val.v)) {
            return new ListItem({'rhs': {'v': val.v}, 'lhs': {'v': index}});
          } else if(!isNaN(parseFloat(val.v))) {
            return new NumberItem({'rhs': {'v': val.v}, 'lhs': {'v': index}});
          } else {
            return new StringItem({'rhs': {'v': val.v}, 'lhs': {'v': index}});
          }
    }

    changeContentState(updateProjectVars: Function) { 
        this.showContent = !this.showContent; 
        updateProjectVars();
    }

    updateProjectIfModified(val: any, Sk: any) {
        let modified = false;
        let i = 0;
        let list = val.rhs;
        // to account for nested arrays
        if (list == null) list = val;
        for(var index in list.v) {
            modified = this.values[i++]?.updateProjectIfModified(list.v[index], Sk) || modified;
        }
        return modified;
    }

    display(updateProjectVars: Function) {
        return  <div>
                    <button className="DebuggerVariable" type="button" onClick={() => this.changeContentState(updateProjectVars) }>{this.variableName} = {this.displayValues}</button>
                    {this.showContent? this.values.map(v => v.display(updateProjectVars)) : null}
                </div>;
    }
}


