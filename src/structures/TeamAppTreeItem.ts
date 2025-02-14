import { t } from "@vscode/l10n";
import { ApiStatusApp, ApiTeamApps, ModPermissionsBF, ModPermissionsResolvable } from "discloud.app";
import { TreeItemCollapsibleState } from "vscode";
import { TeamAppTreeItemData } from "../@types";
import { JSONparse, calculatePercentage, getIconName, getIconPath } from "../util";
import BaseTreeItem from "./BaseTreeItem";
import TeamAppChildTreeItem from "./TeamAppChildTreeItem";

const totalModPerms = ModPermissionsBF.All.toArray().length;

export default class TeamAppTreeItem extends BaseTreeItem<TeamAppChildTreeItem> {
  declare iconName?: string;
  declare appId?: string;
  declare appType?: string;
  declare isOnline: boolean;
  permissions = new ModPermissionsBF();

  constructor(public data: Partial<TeamAppTreeItemData & ApiTeamApps & ApiStatusApp>) {
    data.label ??= typeof data.name === "string" ?
      `${data.name}`
      + (data.name?.includes(`${data.id}`) ? "" : ` (${data.id})`) :
      `${data.id}`;

    super(data.label, data.collapsibleState);

    this._patch(data);
  }

  protected _patch(data: Partial<TeamAppTreeItemData & ApiTeamApps & ApiStatusApp>): this {
    if (!data) data = {};

    super._patch(data);

    this.appId ??= data.appId ?? data.id;

    this.label = data.label ??= "name" in data || "name" in this.data ?
      `${data.name ?? this.data.name}`
      + (data.name?.includes(`${data.id}`) ? "" : ` (${data.id})`) :
      `${data.id}`;

    this.appType = data.appType ?? "name" in data ?
      (data.name?.includes(`${data.id}`) ? "site" : "bot") :
      this.appType;

    this.iconName = getIconName(data) ?? data.iconName ?? this.iconName ?? "off";
    this.iconPath = getIconPath(this.iconName);
    this.isOnline = this.iconName === "on";

    this.tooltip = t(`app.status.${this.iconName}`) + " - " + this.label;

    if ("memory" in data) {
      const matched = data.memory?.match(/[\d.]+/g) ?? [];
      this.data.memoryUsage = calculatePercentage(matched[0]!, matched[1]);
    }

    if ("startedAt" in data) {
      this.data.startedAtTimestamp = new Date(data.startedAt!).valueOf();
    }

    if (data.children instanceof Map) {
      for (const [id, child] of data.children) {
        this.children.set(id, child);
      }
    }

    if ("container" in data)
      this.children.set("container", new TeamAppChildTreeItem({
        label: data.container!,
        description: t("container"),
        iconName: "container",
        appId: this.appId,
      }));

    if ("memory" in data)
      this.children.set("memory", new TeamAppChildTreeItem({
        label: data.memory!,
        description: t("label.ram"),
        iconName: "ram",
        appId: this.appId,
      }));

    if ("cpu" in data)
      this.children.set("cpu", new TeamAppChildTreeItem({
        label: data.cpu!,
        description: t("label.cpu"),
        iconName: "cpu",
        appId: this.appId,
      }));

    if ("ssd" in data)
      this.children.set("ssd", new TeamAppChildTreeItem({
        label: data.ssd!,
        description: t("label.ssd"),
        iconName: "ssd",
        appId: this.appId,
      }));

    if ("netIO" in data)
      this.children.set("netIO", new TeamAppChildTreeItem({
        label: `⬇${data.netIO?.down} ⬆${data.netIO?.up}`,
        description: t("network"),
        iconName: "network",
        appId: this.appId,
      }));

    if ("last_restart" in data)
      this.children.set("last_restart", new TeamAppChildTreeItem({
        label: data.last_restart!,
        description: t("last.restart"),
        iconName: "uptime",
        appId: this.appId,
      }));

    if ("perms" in data && data.perms) {
      this.permissions = new ModPermissionsBF(<ModPermissionsResolvable>data.perms);

      const values = this.contextValue.match(/([^\W]+)(?:\W(.*))?/) ?? [];
      const json = values[2] ? JSONparse(values[2]) : null;

      this.contextValue = `${values[1]}.${JSON.stringify(Object.assign({}, json, { perms: data.perms }))}`;

      this.children.set("perms", new TeamAppChildTreeItem({
        label: t("permissions{s}", { s: `[${data.perms?.length}/${totalModPerms}]` }),
        children: data.perms?.map(perm => new TeamAppChildTreeItem({
          label: t(`permission.${perm}`),
          appId: this.appId,
        })),
        appId: this.appId,
        collapsibleState: TreeItemCollapsibleState.Collapsed,
      }));
    }

    this.collapsibleState =
      this.children.size ?
        this.data.collapsibleState ??
        TreeItemCollapsibleState.Collapsed :
        TreeItemCollapsibleState.None;

    return this;
  }
}
