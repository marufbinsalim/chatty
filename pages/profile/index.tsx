import { SignOutButton, useUser } from "@clerk/nextjs";
import {
  ArrowLeft,
  ArrowLeftIcon,
  ChevronLeft,
  ClipboardEdit,
  Edit,
  Edit2Icon,
  EditIcon,
  LucideAlignHorizontalDistributeCenter,
  Save,
  StepBack,
  XIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Profile() {
  const { user, isLoaded } = useUser();

  const [firstName, setFirstName] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);
  const [bio, setBio] = useState<string | null>(null);
  const [editing, setEditing] = useState<boolean>(false);

  useEffect(() => {
    if (!user) {
      return;
    }
    setFirstName(user.firstName);
    setLastName(user.lastName);
    // @ts-ignore
    setBio(user.unsafeMetadata["bio"]);
  }, [user]);

  if (!isLoaded || !user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-dvh overflow-auto">
      <div className="flex justify-between items-center p-4">
        <Link href="/">
          <ChevronLeft size={32} />
        </Link>
        <p> My Profile</p>
        {editing ? (
          <XIcon
            onClick={() => {
              setEditing(false);
            }}
            size={24}
          />
        ) : (
          <EditIcon
            onClick={() => {
              setEditing(true);
            }}
            size={24}
          />
        )}
      </div>
      {editing && (
        <p className="bg-red-300 p-4"> You are editing your profile </p>
      )}
      {!editing && (
        <div>
          <img
            src={user.imageUrl}
            alt="profile"
            className="rounded-full h-20 mx-auto"
          />
          <p className="w-full text-center">
            {user.firstName} {user.lastName}
          </p>
          <p className="w-full text-center">
            {user.emailAddresses[0].emailAddress}
          </p>
          {/* @ts-ignore */}
          <p className="w-full text-center">{bio}</p>

          <SignOutButton>
            <p className="w-full text-center">Sign Out</p>
          </SignOutButton>
        </div>
      )}
    </div>
  );
}

// <button
//   onClick={() => {
//     user
//       .update({
//         firstName: "John",
//         lastName: "Doe",
//         unsafeMetadata: {
//           bio: "oh no!",
//         },
//       })
//       .then(() => {
//         console.log("First name updated");
//         user.reload();
//       })
//       .catch((error) => {
//         console.error("Error updating first name:", error);
//       });
//   }}
// >
//   {"Change first name to John"}
// </button>
