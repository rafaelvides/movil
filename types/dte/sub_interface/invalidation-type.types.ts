export interface InvalidationType {
  id: number;
  codigo: string;
  valores: string;
}
export interface Invalidation {
  nameResponsible: string
  nameApplicant: string
  docNumberResponsible: string
  docNumberApplicant: string
  typeDocResponsible: string
  typeDocApplicant: string
}