import { IBox, IBoxPayload } from "../box/box.types"

export interface IBoxStore {
    box_list: IBox[]
    OnPostBox: (box: IBoxPayload, token: string) => void
    OnRemoveBox:() => void
    OnCloseBox:(idBox: number) => void
    
}