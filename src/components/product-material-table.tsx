import { RawMaterialUsageModel } from "@/models/DataModel";



type ProductMaterialTableProps = {
  data: RawMaterialUsageModel[];
  tableMeta: TableMeta
};

type TableMeta = {
  updateData: (rowIndex: number, columnId: string, value: unknown) => void;
};

export function ProductMaterialTable({ data: initialData, tableMeta: TableMeta } : ProductMaterialTableProps) {
    return(
        <></>
    );
}