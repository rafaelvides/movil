import { IBranch } from "./branch.types";

export interface IBranchStore {
    branches: IBranch[];
    OnGetBranchList(): void;
}