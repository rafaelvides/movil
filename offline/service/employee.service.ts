import { connection } from "../db.config";
import { IEmployeeCreateDto } from "../dto/employee.dto";
import { Employee } from "../entity/employee.entity";

export async function save_employees(employee: IEmployeeCreateDto) {
  const employeeRepository = connection.getRepository(Employee);

  const existingEmployee = await employeeRepository.findOne({
    where: {
      phone: employee.phone,
      fullName: employee.fullName,
    },
  });

  if (existingEmployee) {
    existingEmployee.branchId = employee.branchId;
    existingEmployee.fullName = employee.fullName;
    existingEmployee.phone = employee.phone;

    return await employeeRepository.save(existingEmployee);
  }

  const save_employee = await employeeRepository.save(employee);
  return save_employee;
}
export async function get_employees(): Promise<Employee[]> {
  const employeeRepository = connection.getRepository(Employee);
  return await employeeRepository.find();
}