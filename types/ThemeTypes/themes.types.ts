export interface ThemePayload{
    name:string
    context:"light" | "dark"
    colors:Color[]
}

export interface Color{
    color:string
    name:string
}

export interface ColorTheme{
    id:number
    name:string
    color:string
    isActive:boolean
    themeId:number
}

export interface ITheme{
id:number
name:string
context:"light" | "dark"
isActive: boolean
color:ColorTheme[]
}

export interface IGetPaginatedThemes{
    ok:boolean
    themes:ITheme[]
    total:number
    totalPag:number
    currentPag:number
    nextPag:number
    prevPag:number
    status:number
}