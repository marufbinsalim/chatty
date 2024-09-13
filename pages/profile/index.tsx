import { SignOutButton, useUser } from "@clerk/nextjs";
import {
  ArrowLeft,
  ArrowLeftIcon,
  ChevronLeft,
  CircleDashed,
  ClipboardEdit,
  Edit,
  Edit2Icon,
  EditIcon,
  InfoIcon,
  LucideAlignHorizontalDistributeCenter,
  Save,
  StepBack,
  XIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase/uiClient";

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
    <div className="flex flex-col flex-1 p-4">
      {imageURL && (
        <img
          src={imageURL}
          alt="profile"
          className="rounded-full h-20 w-20 mx-auto"
        />
      )}
      {firstName && lastName && (
        <p className="w-full text-center text-2xl font-bold">
          {firstName} {lastName}
        </p>
      )}
      {email && <p className="w-full text-center text-gray-700">{email}</p>}
      {bio && (
        <div className="mt-12 md:mx-auto">
          <p className="w-full text-2xl font-bold">Bio</p>
          <p className="w-max  max-w-full max-h-[300px] overflow-auto bg-fuchsia-50 py-4 px-2">
            {bio}
          </p>
        </div>
      )}
      <SignOutButton>
        <button className="bg-red-500 text-white p-2 rounded-md mt-4 w-max md:mx-auto">
          Sign Out
        </button>
      </SignOutButton>
    </div>
  );
}

function EditToggleButton({
  editing,
  setEditing,
}: {
  editing: boolean;
  setEditing: (editing: boolean) => void;
}) {
  return (
    <button
      onClick={() => {
        setEditing(!editing);
      }}
    >
      {editing ? <XIcon /> : <EditIcon />}
    </button>
  );
}

function EditInformationCard({
  user,
  setEditing,
  imageUrl,
  firstName,
  lastName,
  bio,
  setFirstName,
  setLastName,
  setBio,
  email,
}: {
  user: any;
  setEditing: (editing: boolean) => void;
  imageUrl: string | null;
  firstName: string;
  lastName: string;
  bio: string;
  setFirstName: (firstName: string) => void;
  setLastName: (lastName: string) => void;
  setBio: (bio: string) => void;
  email: string | null;
}) {
  const [image, setImage] = useState<File | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    async function updateImage() {
      setIsUpdating(true);
      await user?.setProfileImage({ file: image });
      user.reload();
      setIsUpdating(false);
    }
    if (image) {
      updateImage();
    }
  }, [image]);

  useEffect(() => {
    async function updateImageInDatabase() {
      console.log("updating image in database", user.imageUrl);
      const { error } = await supabase.from("users").upsert({
        id: user.id,
        imageUrl: user.imageUrl,
      });
    }
    if (imageUrl !== user.imageUrl) {
      updateImageInDatabase();
    }
  }, [user]);

  async function saveChanges() {
    setIsUpdating(true);
    await user?.update({
      firstName,
      lastName,
      unsafeMetadata: { bio },
    });
    const { error } = await supabase.from("users").upsert({
      id: user.id,
      firstName: firstName,
      lastName: lastName,
      bio: bio,
    });
    user.reload();
    setIsUpdating(false);
    setEditing(false);
  }

  return (
    <div className="flex flex-col items-center flex-1 p-4">
      <div className="flex flex-col items-center w-full md:w-max">
        <div className="relative">
          {/* Hidden file input */}
          <input
            type="file"
            accept="image/*"
            id="file-input"
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={(e) => {
              if (e.target.files?.[0]) setImage(e.target.files?.[0]);
            }}
          />

          {/* Custom round button styled as an image icon */}
          <label
            htmlFor="file-input"
            className="flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 cursor-pointer overflow-hidden"
          >
            <img src={imageUrl || ""} alt="Selected" className="w-20 h-20" />
          </label>
        </div>

        {email && (
          <input
            type="text"
            placeholder="Email"
            className="w-full md:w-[400px] p-2 mt-4 mb-2 bg-gray-100 border-[1px] border-gray-300 rounded-lg text-gray-500"
            value={email}
            disabled
          />
        )}
        <input
          type="text"
          placeholder="First Name"
          className="w-full md:w-[400px] p-2 my-2 bg-gray-100 border-[1px] border-gray-300 rounded-lg"
          value={firstName}
          onChange={(e) => {
            setFirstName(e.target.value);
          }}
        />
        <input
          type="text"
          placeholder="Last Name"
          className="w-full md:w-[400px] p-2 my-2 bg-gray-100 border-[1px] border-gray-300 rounded-lg"
          value={lastName}
          onChange={(e) => {
            setLastName(e.target.value);
          }}
        />

        <textarea
          value={bio}
          onChange={(e) => {
            setBio(e.target.value);
          }}
          placeholder="Bio"
          className="w-full md:w-[400px] h-32 p-2 my-2 bg-gray-100 border-[1px] border-gray-300 rounded-lg"
        ></textarea>
        <button
          className="bg-green-500 text-white p-2 rounded-md m-auto mt-4 disabled:bg-gray-300"
          onClick={saveChanges}
          disabled={isUpdating}
        >
          Save
          {isUpdating && (
            <CircleDashed className="w-6 h-6 inline ml-2 animate-spin" />
          )}
        </button>
      </div>
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
  }, [user, editing]);

  if (!isLoaded || !user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-dvh overflow-auto flex flex-col">
      <div className="flex justify-between items-center p-4">
        <Link href="/">
          <ChevronLeft size={32} />
        </Link>
        <p className="text-2xl font-bold">
          {" "}
          {editing ? "Edit Profile" : "My Profile"}
        </p>

        <EditToggleButton editing={editing} setEditing={setEditing} />
      </div>
      {editing && (
        <EditInformationCard
          user={user}
          setEditing={setEditing}
          imageUrl={imageUrl}
          firstName={firstName || ""}
          lastName={lastName || ""}
          bio={bio || ""}
          setFirstName={setFirstName}
          setLastName={setLastName}
          setBio={setBio}
          email={user.emailAddresses[0].emailAddress}
        />
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
