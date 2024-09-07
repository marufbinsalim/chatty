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

function ProfileInfoCard({
  imageURL,
  firstName,
  lastName,
  email,
  bio,
}: {
  imageURL: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  bio: string | null;
}) {
  return (
    <div className="flex flex-col items-center bg-red-300 flex-1 p-4">
      {imageURL && (
        <img
          src={imageURL}
          alt="profile"
          className="rounded-full h-20 mx-auto"
        />
      )}
      {firstName && lastName && (
        <p className="w-full text-center">
          {firstName} {lastName}
        </p>
      )}
      {email && <p className="w-full text-center">{email}</p>}
      {bio && <p className="w-full text-center">{bio}</p>}
      <SignOutButton>
        <button className="bg-red-500 text-white p-2 rounded-md mt-auto">
          Sign Out
        </button>
      </SignOutButton>
    </div>
  );
}

export default function Profile() {
  const { user, isLoaded } = useUser();

  const [firstName, setFirstName] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);
  const [bio, setBio] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [editing, setEditing] = useState<boolean>(false);

  useEffect(() => {
    if (!user) {
      return;
    }
    setFirstName(user.firstName);
    setLastName(user.lastName);
    // @ts-ignore
    setBio(user.unsafeMetadata["bio"]);
    setImageUrl(user.imageUrl);
  }, [user]);

  if (!isLoaded || !user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-dvh overflow-auto flex flex-col">
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
        <ProfileInfoCard
          imageURL={imageUrl}
          firstName={firstName}
          lastName={lastName}
          email={user.emailAddresses[0].emailAddress}
          bio={bio}
        />
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
