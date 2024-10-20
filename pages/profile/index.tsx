import { supabase } from "@/utils/supabase/uiClient";
import { SignOutButton, useUser } from "@clerk/nextjs";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
  LogOut,
  LucideAlignHorizontalDistributeCenter,
  Save,
  Share2Icon,
  ShareIcon,
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
  username,
}: {
  imageURL: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  bio: string | null;
  username: string | null;
}) {
  return (
    <div className="flex flex-col flex-1 p-4 items-center">
      {imageURL && (
        <img
          src={imageURL}
          alt="profile"
          className="rounded-full h-20 w-20 mb-4 border-4 border-gray-200"
        />
      )}
      <p className="text-center text-xl font-bold text-gray-800 mb-2">
        {firstName} {lastName}
      </p>
      <p className="text-center font-bold text-gray-600 mb-4">@{username}</p>

      {email && <p className="text-center text-gray-600 mb-4">{email}</p>}
      {bio && (
        <div className="w-full mt-8 max-w-lg">
          <p className="text-xl font-semibold text-gray-800 mb-2">Bio</p>
          <p className="border border-gray-200 shadow-sm p-4 rounded-lg text-gray-700">
            {bio}
          </p>
        </div>
      )}

      <div className="flex items-center justify-center w-full max-w-lg space-x-2 space-y-2 flex-wrap bg-gray-200 rounded-lg p-4 mt-4">
        <p className="text-center text-gray-600 text-wrap break-all">
          <span>
            {process.env.NODE_ENV === "development"
              ? `http://localhost:3000/share/${username}`
              : `https://chattypals.vercel.app/share/${username}`}
          </span>
          )
        </p>
        <Share2Icon
          className="text-blue-500 cursor-pointer"
          onClick={() => {
            navigator.clipboard.writeText(
              process.env.NODE_ENV === "development"
                ? `http://localhost:3000/share/${username}`
                : `https://chattypals.vercel.app/share/${username}`,
            );
            toast.success("Link copied to clipboard", {
              position: "bottom-center",
              style: {
                margin: "auto",
                marginBottom: "1rem",
                maxWidth: "90%",
              },
            });
          }}
          size={24}
        />
      </div>

      <SignOutButton>
        <button className="flex bg-red-500 text-white p-2 rounded-md mt-4 hover:bg-red-600 transition-colors duration-300 gap-2">
          <p>Sign Out</p>
          <LogOut size={24} />
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
  username,
  setUsername,
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
  username: string;
  setUsername: (username: string) => void;
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

    if (!firstName || firstName.trim() === "") {
      toast.error("First name cannot be empty", {
        position: "bottom-center",
        style: {
          margin: "auto",
          marginBottom: "1rem",
          maxWidth: "90%",
        },
      });
      setIsUpdating(false);
      return;
    }

    if (!username || username.trim() === "") {
      toast.error("Username cannot be empty", {
        position: "bottom-center",
        style: {
          margin: "auto",
          marginBottom: "1rem",
          maxWidth: "90%",
        },
      });
      setIsUpdating(false);
      return;
    }

    // username has changed
    if (user.unsafeMetadata.username !== username) {
      // search for username in database
      const { data, error } = await supabase
        .from("users")
        .select("id")
        .eq("username", username);

      let isUsernameTaken = data?.length !== 0;

      if (isUsernameTaken) {
        toast.error("Username is already taken", {
          position: "bottom-center",
          style: {
            margin: "auto",
            marginBottom: "1rem",
            maxWidth: "90%",
          },
        });
        setIsUpdating(false);
        return;
      }
    }

    // update the first name, last name and bio in the clerk database
    await user?.update({
      firstName,
      lastName,
      unsafeMetadata: { bio, username },
    });

    const { error } = await supabase.from("users").upsert({
      id: user.id,
      firstName: firstName || "",
      lastName: lastName || "",
      bio: bio,
      username: username,
    });
    user.reload();
    setIsUpdating(false);
    setEditing(false);
    toast.success("Profile updated successfully", {
      position: "bottom-center",
      style: {
        margin: "auto",
        marginBottom: "1rem",
        maxWidth: "90%",
      },
    });
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

          <label
            htmlFor="file-input"
            className="flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 cursor-pointer overflow-hidden"
          >
            <img
              src={imageUrl || ""}
              alt="Selected"
              className="rounded-full h-20 w-20 border-4 border-gray-200"
            />
          </label>
        </div>

        {email && (
          <div className="w-full">
            <h1 className="text-xl font-bold text-gray-800 mt-4">Email</h1>
            <input
              type="text"
              placeholder="Email"
              className="w-full md:w-96 p-2 mt-4 mb-2 bg-white border border-gray-300 rounded-lg text-gray-600 shadow-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-300 disabled:bg-gray-100"
              value={email}
              disabled
            />
          </div>
        )}

        <div className="w-full">
          <h1 className="text-xl font-bold text-gray-800 mt-4">Username</h1>
          <input
            type="text"
            placeholder="Username"
            className="w-full md:w-96 p-2 my-2 bg-white border border-gray-300 rounded-lg text-gray-800 shadow-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        {
          <div className="w-full">
            <h1 className="text-xl font-bold text-gray-800 mt-4">First Name</h1>

            <input
              type="text"
              placeholder="First Name"
              className="w-full md:w-96 p-2 my-2 bg-white border border-gray-300 rounded-lg text-gray-800 shadow-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
        }
        {
          <div className="w-full">
            <h1 className="text-xl font-bold text-gray-800 mt-4">Last Name</h1>
            <input
              type="text"
              placeholder="Last Name"
              className="w-full md:w-96 p-2 my-2 bg-white border border-gray-300 rounded-lg text-gray-800 shadow-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        }
        <div className="w-full">
          <h1 className="text-xl font-bold text-gray-800 mt-4">Bio</h1>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Bio"
            className="w-full md:w-96 h-32 p-2 my-2 bg-white border border-gray-300 rounded-lg text-gray-800 shadow-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
          ></textarea>
        </div>

        <button
          className="bg-blue-500 text-white p-2 rounded-md mt-4 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed"
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
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      return;
    }
    setFirstName(user.firstName);
    setLastName(user.lastName);
    // @ts-ignore
    setBio(user.unsafeMetadata["bio"]);
    setImageUrl(user.imageUrl);
    // @ts-ignore
    setUsername(user.unsafeMetadata["username"]);
  }, [user, editing]);

  if (!isLoaded || !user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-dvh flex flex-col overflow-hidden">
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
      <div className="overflow-auto">
        {editing && (
          <EditInformationCard
            user={user}
            setEditing={setEditing}
            imageUrl={imageUrl}
            firstName={firstName || ""}
            lastName={lastName || ""}
            bio={bio || ""}
            username={username || ""}
            setFirstName={setFirstName}
            setLastName={setLastName}
            setBio={setBio}
            email={user.emailAddresses[0].emailAddress}
            setUsername={setUsername}
          />
        )}
        {!editing && (
          <ProfileInfoCard
            imageURL={imageUrl}
            firstName={firstName}
            lastName={lastName}
            email={user.emailAddresses[0].emailAddress}
            bio={bio}
            username={username}
          />
        )}
      </div>
      <ToastContainer />
    </div>
  );
}
