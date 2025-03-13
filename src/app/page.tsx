import { columns, type Payment } from "@/components/data-table-test/columns";
import { DataTable } from "@/components/data-table-test/data-table";

async function getData(): Promise<Payment[]> {
  
  return [
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
  ]
}
export default async function Home() {
  const data = await getData()
  return (
    <div className=" container mx-auto mt-12">
      <DataTable columns={columns} data={data} />
    </div>
  );
}
