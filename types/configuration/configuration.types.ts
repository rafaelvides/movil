
export interface IConfiguration {
  id?: number
  logo: string
  ext: string
  name: string
  themeId: number
  transmitterId: number
  isActive?: boolean
}

export interface ConfigurationPayload{
    logo:string
    ext:string
    name:string
    themeId:number
    transmitterId:number
}

export interface IGetConfiguration extends ICreateConfiguration{
    file?: File | Blob | null | undefined
}

export interface ICreateConfiguration{
    name:string
    themeId:number
    transmitterId:number
    file?: File | Blob | null
}

export interface GetByTransmitter {
    personalization: IConfiguration
    ok: boolean
    messages: string
  }

 export interface IGetTheme{
    ok:boolean
    personalization: Personalization
    status:number
}

 interface Personalization{
    id:number
    name:string
    context:string
    colors:Color
 }


 interface Color{
    danger:string
    primary:string
    secondary:string
    third:string
    warning:string
    dark:string
 }