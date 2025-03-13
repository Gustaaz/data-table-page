import { Skeleton } from "@/components/ui/skeleton"
export default function Loading() {

  return (
    <div className=" container mx-auto my-18 ">

      <Skeleton className="w-[1000px] h-[500px] rounded-md" />
    </div>
  )
}