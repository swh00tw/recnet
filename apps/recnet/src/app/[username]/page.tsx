import { cn } from "@/utils/cn";
import { Profile } from "./Profile";
import { getUserByUsername } from "@/server/user";
import { notFound } from "next/navigation";
import { getRecsByUserId, getRecsWithUsers } from "@/server/rec";
import { RecCard } from "@/components/RecCard";
import { Text } from "@radix-ui/themes";

export default async function UserProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const { username } = params;
  const user = await getUserByUsername(username).then((user) => {
    if (!user) {
      // redirect to 404 page
      notFound();
    }
    return user;
  });
  const recs = await getRecsByUserId(user.id);
  const recsWithUsers = await getRecsWithUsers(recs);

  return (
    <div
      className={cn(
        "w-full",
        "lg:w-[50%]",
        `min-h-[90svh]`,
        "flex",
        "flex-col",
        "p-8",
        "gap-y-6"
      )}
    >
      <Profile username={username} />
      {recsWithUsers.length > 0 ? (
        recsWithUsers.map((recWithUser, idx) => {
          return (
            <RecCard
              key={`${recWithUser.title}-${recWithUser.userId}-${idx}`}
              recsWithUsers={[recWithUser]}
              showDate
            />
          );
        })
      ) : (
        <div className="h-[150px] w-full flex justify-center items-center">
          <Text size="3" className="text-gray-10">
            No recommendations yet.
          </Text>
        </div>
      )}
    </div>
  );
}