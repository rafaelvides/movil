import { connection } from "../db.config";
import { ITypeOfTax } from "../dto/type_of_tax.dto";
import { TypeOfTax } from "../entity/type_of_tax.entity";
export async function save_type_of_tax(typeTax: ITypeOfTax) {
  const typeTaxRepository = connection.getRepository(TypeOfTax);

  const existingTypeTax = await typeTaxRepository.findOne({
    where: { typeOfTaxId: typeTax.typeOfTaxId },
  });

  if (existingTypeTax) {
    existingTypeTax.codigo = typeTax.codigo;
    existingTypeTax.valores = typeTax.valores;
    existingTypeTax.isActivated = typeTax.isActivated;

    return await typeTaxRepository.save(existingTypeTax);
  }

  const saveTypeTax = await typeTaxRepository.save(typeTax);
  return saveTypeTax;
}