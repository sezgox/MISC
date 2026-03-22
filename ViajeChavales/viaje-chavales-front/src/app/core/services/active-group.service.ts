import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { LOCAL_STORAGE_KEYS } from '../consts/local-storage-key';
import { UserGroupMembership } from '../interfaces/user.interface';

@Injectable({
  providedIn: 'root',
})
export class ActiveGroupService {
  readonly groups = signal<UserGroupMembership[]>([]);
  readonly activeGroup = signal<UserGroupMembership | null>(null);
  readonly changed$ = new Subject<string>();

  getActiveGroupId(): string | null {
    return this.activeGroup()?.groupId ?? null;
  }

  getActiveGroupName(): string {
    return this.activeGroup()?.groupName ?? '';
  }

  setGroups(groups: UserGroupMembership[]) {
    this.groups.set(groups);

    const storedGroupId =
      typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_KEYS.GROUP_DATA) : null;
    const selected =
      groups.find((group) => group.groupId === storedGroupId) ??
      groups.find((group) => group.isActive) ??
      groups[0] ??
      null;

    this.setActiveGroup(selected, false);
  }

  setActiveGroupById(groupId: string, emit = true) {
    const selected = this.groups().find((group) => group.groupId === groupId) ?? null;
    this.setActiveGroup(selected, emit);
  }

  private setActiveGroup(group: UserGroupMembership | null, emit: boolean) {
    this.activeGroup.set(group);

    if (typeof window !== 'undefined') {
      if (group?.groupId) {
        localStorage.setItem(LOCAL_STORAGE_KEYS.GROUP_DATA, group.groupId);
      } else {
        localStorage.removeItem(LOCAL_STORAGE_KEYS.GROUP_DATA);
      }
    }

    if (emit && group?.groupId) {
      this.changed$.next(group.groupId);
    }
  }
}
