import { SignOutButton, UserButton, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

const USERS_PER_PAGE = 2;

export default function Home() {
  const [page, setPage] = useState<number>(0);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalPages, setTotalPages] = useState<number>(0);

  const { user, isLoaded: isLoggedInUserLoaded } = useUser();

  useEffect(() => {
    async function fetchUsers(page: number) {
      const limit = USERS_PER_PAGE;
      let offset = page * limit;
      setLoading(true);
      const response = await fetch(
        `/api/users?offset=${offset}&limit=${limit}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      setLoading(false);
      const responseData = await response.json();
      console.log(responseData);
      let filteredUsers = responseData.data.filter(
        (listUser: any) => listUser.id !== user?.id,
      );
      setUsers(filteredUsers);
      setTotalPages(Math.ceil(responseData.totalCount / limit));
    }
    fetchUsers(page);
  }, [page]);

  return (
    <div>
      {isLoggedInUserLoaded && user && (
        <div className="flex bg-red-300">
          <img
            src={user ? user.imageUrl : ""}
            alt="user"
            className="rounded-full h-8"
          />
          <div>
            <p>{`Hello, ${user.fullName}`}</p>
            <p> {`Email : ${user.emailAddresses[0].emailAddress}`}</p>
          </div>
        </div>
      )}
      {loading && <div>Loading...</div>}
      {!loading && (
        <div>
          {users.map((user) => (
            <div key={user.id}>
              <img
                src={user.imageUrl}
                alt="user"
                className="rounded-full h-8"
              />
              <div>
                {user.firstName} {user.lastName}
              </div>
              <div>{user.emailAddresses[0].emailAddress}</div>
            </div>
          ))}
        </div>
      )}

      <br />

      {JSON.stringify({
        currentPage: page + 1,
        totalPages: totalPages,
      })}
      <br />
      <button
        onClick={() => {
          setPage((prev) => prev - 1);
        }}
        disabled={page === 0}
      >
        Previous
      </button>
      <button
        onClick={() => {
          setPage((prev) => prev + 1);
        }}
        disabled={page === totalPages - 1}
      >
        Next
      </button>

      <button
        onClick={() =>
          user
            ?.setProfileImage({ file: null })
            .then(() => {
              user.reload();
            })
            .catch((e) => console.log(e))
        }
      >
        remove user picture
      </button>
    </div>
  );
}
