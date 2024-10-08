
import Header from "@/components/Header";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";
import AddDocumentBtn from '@/components/AddDocumentBtn'
import { redirect } from "next/navigation";
import { getDocuments } from "@/lib/actions/room.actions";
import Link from "next/link";
import { dateConverter } from "@/lib/utils";
import Notification from "@/components/Notification";
import DeleteModal from "@/components/DeleteModal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Documents = async ({ searchParams }) => {
  const user = await currentUser();
  if (!user) redirect('/sign-in');

  const searchTerm = searchParams?.search || ''; 
  const roomDocuments = await getDocuments(user.emailAddresses[0].emailAddress);

  // Filter documents based on search term
  const filteredDocuments = roomDocuments.data.filter((doc) =>
    doc.metadata.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="home-container bg-dark-100 min-h-screen w-full">
      <Header className="sticky left-0 top-0">
        <div className="flex items-right gap-2 lg:gap-4 mr-12">
          <Notification />
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </Header>

      {roomDocuments.data.length > 0 ? (
        <div className="document-list-container p-4">
          <div className="relative w-full flex group mb-12 justify-center">
            <h1 className="text-5xl group-hover:text-white text-center font-extralight font-italic text-white">
              Documents
            </h1>
            <div className="absolute w-1/3 border-b-2 border-transparent group-hover:border-white transition-all duration-300 mt-16"></div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-row justify-end items-center">
              <form method="get" action="/documents" className="flex items-center justify-center">
                <Input
                  name="search"
                  placeholder="Search your document"
                  className="p-2 w-1/7 bg-white"
                  defaultValue={searchTerm} 
                />
                <Button type="submit" className="items-center hover:bg-white hover:text-dark-200 text-white space-x-1 p-2 ml-2 gap-1 shadow-md">
                  Search
                </Button >
              </form>
            </div>

            <div className="m-4">
              <AddDocumentBtn userId={user.id} email={user.emailAddresses[0].emailAddress} />
            </div>

            {filteredDocuments.map(({ id, metadata, createdAt } : any) => (
              <div
                key={id}
                className="document-card flex bg-dark-500 hover:bg-white max-w-2xl text-white group group-hover hover:text-dark-100 duration-300 p-4 rounded-lg"
              >
                <Link href={`/documents/${id}`} className="flex flex-1 items-center gap-4">
                  <div className="document-icon hidden rounded-md bg-dark-500 p-2 group-hover:bg-white sm:block">
                    <Image src="/assets/icons/doc.svg" width={40} height={40} alt="" />
                  </div>
                  <div className="document-card-header line-clamp-2 text-2xl hover:text-dark-100">
                    {metadata.title}
                    <div>
                      <p className="text-sm font-light text-blue-100">Created about {dateConverter(createdAt)}</p>
                    </div>
                  </div>
                </Link>
                <DeleteModal roomId={id} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="document-list-empty flex flex-col justify-center items-center space-y-4 p-4">
          <Image
            src="/assets/icons/doc.svg"
            width={40}
            height={40}
            alt="no document"
            className="mx-auto h-1/2 w-1/2 bg-dark-100"
          />
          <AddDocumentBtn userId={user.id} email={user.emailAddresses[0].emailAddress} />
        </div>
      )}
    </main>
  );
}

export default Documents;