import { columns } from "@/components/data-table-test/columns";
import { DataTable } from "@/components/data-table-test/data-table";
import type { Paginated } from "@/types/paginated";
import type { User } from "@/types/user";


interface Response extends Paginated{
  users: User[]
}
async function getData(): Promise<Response> {
  const res = await fetch('https://dummyjson.com/users?limit=5&skip=10&select=firstName,age')

  if (!res.ok) {
    throw new Error('Failed to fetch data')
  }

  const data = await res.json() 
  return data

}
export default async function Home() {
  const data = await getData()

  console.log(data);
  return (
    <div className=" container mx-auto mt-12">
      <DataTable columns={columns} data={data.users} />
    </div>
  );
}
