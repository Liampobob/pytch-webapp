import React from "react";

export enum DataType {
    string,
    number,
    list
  }

export class DebuggerItem {
type: DataType;

constructor(type:DataType) {
    this.type = type;
}

display() {
    return <p className="variable">  </p>;
};
}
  
export class StringItem extends DebuggerItem {
value: string;

constructor(val: string) {
    super(DataType.string);
    this.value = val;
}

display() {
    return <p className="variable"> {this.value} </p>;
}
}

export class NumberItem extends DebuggerItem {
value: number;

constructor(val: number) {
    super(DataType.number);
    this.value = val;
}

display() {
    return <p className="variable"> {this.value} </p>;
}
}

export class ListItem extends DebuggerItem {
value: any[];

constructor(val: any[]) {
    super(DataType.list);
    this.value = val;
}

display() {
    return <p className="variable"> {this.value} </p>;
}
}
