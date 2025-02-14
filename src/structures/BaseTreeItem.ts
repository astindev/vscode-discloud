import { TreeItem, TreeItemCollapsibleState, TreeItemLabel } from "vscode";
import { Constructor } from "../@types";

interface BaseTreeItem<T extends TreeItem> {
  constructor: Constructor<T>
}

abstract class BaseTreeItem<T> extends TreeItem {
  readonly children = new Map<string, T>();
  declare data: unknown;

  constructor(label: string | TreeItemLabel, collapsibleState?: TreeItemCollapsibleState) {
    super(label, collapsibleState);
  }

  contextValue = "TreeItem";

  protected _clone(): this {
    return Object.assign(Object.create(this), this);
  }

  protected _patch(data: unknown): this {
    if (typeof data === "object")
      Object.assign(<any>this.data, data);

    return this;
  }

  protected _update(data: unknown): this {
    const clone = this._clone();
    this._patch(data);
    return clone;
  }
}

export default BaseTreeItem;
