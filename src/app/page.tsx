import { columns } from "@/components/data-table-test/columns";
import { DataTable } from "@/components/data-table-test/data-table";
import type { Paginated } from "@/types/paginated";
import type { User } from "@/types/user";

interface Response extends Paginated{
  users: User[]
}

async function getData(limit: number, skip: number): Promise<Response> {
  const res = await fetch(
    `https://dummyjson.com/users?limit=${limit}&skip=${skip}&select=firstName,age`,
    {
      next: {tags: ["users"]},
    }
  );
  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }
  const data = await res.json();
  return data;
}

interface HomeProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams
  const limit = Number(params.limit) || 10;
  const skip = Number(params.skip) || 0;

  const data = await getData(limit, skip);

  console.log(data);
  return (
    <div className=" container mx-auto my-12 ">
      <DataTable columns={columns} data={data.users} total={data.total} />
    </div>
  );
}
