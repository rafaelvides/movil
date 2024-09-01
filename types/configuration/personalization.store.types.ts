import { IConfiguration, IGetConfiguration } from "./configuration.types";

export interface IConfigurationStore {
    personalization: IConfiguration[]
    logo_name: Promise<{ logo: string; name: string; }>;
    OnCreateConfiguration: (payload:IGetConfiguration) => void
    // GetConfigurationByTransmitter: (id: number) => void
    GetConfiguration: (id: number) => void;
}