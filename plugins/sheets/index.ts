import { SheetDefinition, registerSheet } from "react-native-actions-sheet";
import SheetSalesFilters from "./SheetSalesFilters";
import { Dispatch, SetStateAction } from "react";
import SheetCustomerFilters from "./SheetCustomerFilters";
import SheetNote from "./SheetNote";
import SheetExpenseFilters from "./SheetExpense";
import SheetMapRealTimeFiters from "./SheetMapRealTimeFiters";
import { MapType } from "react-native-maps";
import { IBranch } from "@/types/branch/branch.types";
import SheetMapRouterFilters from "./SheetMapRouterFilters";
import SheetRoutesDestinationFilters from "./SheetRoutesDestinationFilters";
import { ICustomer } from "@/types/customer/customer.types";
import SheetRouteBranchClientFilters from "./SheetRouteBranchClientFilters";
//===========================offline==========================================
import SheetCustomerOfflineFilters from "./offlineSheetFilter/SheetCustomerOfflineFilters";
import SheetProductOfflineFilters from "./offlineSheetFilter/SheetProductOfflineFilters";
import SheetSaleOfflineFilters from "./offlineSheetFilter/SheetSaleOfflineFilters";
import { ICat002TipoDeDocumento } from "@/types/billing/cat-002-tipo-de-documento.types";
registerSheet("customer-offline-filters-sheet", SheetCustomerOfflineFilters);
registerSheet("product-offline-filters-sheet", SheetProductOfflineFilters);
registerSheet("sale-offline-filters-sheet", SheetSaleOfflineFilters);
//============================================================================
registerSheet("sales-filters-sheet", SheetSalesFilters);
registerSheet("customer-filters-sheet", SheetCustomerFilters);
registerSheet("note-sheet", SheetNote);
registerSheet("expense-filters-sheet", SheetExpenseFilters);
registerSheet("map-real-time-filters-sheet", SheetMapRealTimeFiters);
registerSheet("map-router-filters-sheet", SheetMapRouterFilters);
registerSheet(
  "routes-destination-filters-sheet",
  SheetRoutesDestinationFilters
);
registerSheet(
  "routes-branch-client-filters-sheet",
  SheetRouteBranchClientFilters
);

declare module "react-native-actions-sheet" {
  interface Sheets {
    "sales-filters-sheet": SheetDefinition<{
      payload: {
        startDate: string;
        setStartDate: Dispatch<SetStateAction<string>>;
        endDate: string;
        setEndDate: Dispatch<SetStateAction<string>>;
        handleConfirm: (startDate: string, endDate: string) => void;
      };
    }>;
    "customer-filters-sheet": SheetDefinition<{
      payload: {
        name: string;
        onChangeValueName: (text: string) => void;
        correo: string;
        onChangeValueCorreo: (text: string) => void;
        handleConfirm: () => void;
      };
    }>;
    "expense-filters-sheet": SheetDefinition<{
      payload: {
        limit: number;
        setLimit: Dispatch<SetStateAction<number>>;
        category: string;
        setCategory: Dispatch<SetStateAction<string>>;
        handleConfirm: (limit: number, category: string) => void;
      };
    }>;
    "note-sheet": SheetDefinition<{
      payload: {
        handleConfirm: (note: string) => void;
      };
    }>;
    "map-real-time-filters-sheet": SheetDefinition<{
      payload: {
        setSelectedOptionMap: Dispatch<SetStateAction<MapType>>;
        selectedOptionMap: MapType;
        setSelectedBranch: Dispatch<SetStateAction<IBranch | undefined>>;
        selectedBranch: IBranch | undefined;
        handleConfirm: (
          selectedOptionMap: MapType,
          selectedBranch: IBranch
        ) => void;
      };
    }>;
    "map-router-filters-sheet": SheetDefinition<{
      payload: {
        startDate: string;
        setStartDate: Dispatch<SetStateAction<string>>;
        setSelectedOptionMap: Dispatch<SetStateAction<MapType>>;
        selectedOptionMap: MapType;
        setSelectedBranch: Dispatch<SetStateAction<IBranch | undefined>>;
        selectedBranch: IBranch | undefined;
        setChecked: Dispatch<SetStateAction<boolean>>;
        checked: boolean;
        handleConfirm: (
          selectedOptionMap: MapType,
          selectedBranch: IBranch,
          startDate: string,
          cached: boolean
        ) => void;
      };
    }>;
    "routes-destination-filters-sheet": SheetDefinition<{
      payload: {
        setSelectedOptionMap: Dispatch<SetStateAction<MapType>>;
        selectedOptionMap: MapType;
        setSelectedCustomer: Dispatch<SetStateAction<ICustomer | undefined>>;
        selectedCustomer: ICustomer | undefined;
        setChecked: Dispatch<SetStateAction<boolean>>;
        checked: boolean;
        handleConfirm: (
          selectedOptionMap: MapType,
          selectedCustomer: ICustomer,
          cached: boolean
        ) => void;
      };
    }>;
    "routes-branch-client-filters-sheet": SheetDefinition<{
      payload: {
        startDate: string;
        setStartDate: Dispatch<SetStateAction<string>>;
        setSelectedOptionMap: Dispatch<SetStateAction<MapType>>;
        selectedOptionMap: MapType;
        setSelectedCustomer: Dispatch<SetStateAction<ICustomer | undefined>>;
        selectedCustomer: ICustomer | undefined;
        setSelectedBranch: Dispatch<SetStateAction<IBranch | undefined>>;
        selectedBranch: IBranch | undefined;
        setChecked: Dispatch<SetStateAction<boolean>>;
        checked: boolean;
        handleConfirm: (
          selectedOptionMap: MapType,
          selectedCustomer: ICustomer,
          selectedBranch: IBranch,
          startDate: string,
          cached: boolean
        ) => void;
      };
    }>;
    "customer-offline-filters-sheet": SheetDefinition<{
      payload: {
        name: string;
        onChangeValueName: (text: string) => void;
        esContribuyente: boolean;
        setEsContribuyente: Dispatch<SetStateAction<boolean>>;
        numDocumento: string;
        onChangeValueNuD: (text: string) => void;
        handleConfirm: (esContribuyente: boolean) => void;
      };
    }>;
    "product-offline-filters-sheet": SheetDefinition<{
      payload: {
        name: string;
        onChangeValueName: (text: string) => void;
        code: string;
        onChangeValueCode: (text: string) => void;
        handleConfirm: () => void;
      };
    }>;
    "sale-offline-filters-sheet": SheetDefinition<{
      payload: {
        startDate: string;
        setStartDate: Dispatch<SetStateAction<string>>;
        typeDTE: ICat002TipoDeDocumento;
        setTypeDTE: Dispatch<SetStateAction<ICat002TipoDeDocumento>>;
        totalP: string;
        onChangeValueTotalP: (text: string) => void;
        handleConfirm: (
          startDate: string,
          typeDTE: ICat002TipoDeDocumento
        ) => void;
      };
    }>;
  }
}
