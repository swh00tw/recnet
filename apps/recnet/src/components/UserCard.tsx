import { User } from "@/types/user";
import { cn } from "@/utils/cn";
import { Flex, Text } from "@radix-ui/themes";
import { RecNetLink } from "./Link";
import { HomeIcon, PersonIcon } from "@radix-ui/react-icons";
import { Avatar } from "@/components/Avatar";
import { FollowButton } from "./FollowButton";

export function UserCard({ user }: { user: User }) {
  return (
    <div
      className={cn(
        "rounded-4",
        "border-slate-6",
        "shadow-2",
        "p-3",
        "flex",
        "flex-col",
        "gap-4"
      )}
    >
      <Avatar user={user} />
      <Flex className="flex-col gap-y-1">
        <RecNetLink href={`/${user.username}`}>
          <Text>{user.displayName}</Text>
        </RecNetLink>
        <Text size="1" className="text-gray-12">
          {"@" + user.username}
        </Text>
      </Flex>
      <Flex className="items-center gap-x-1">
        {user.affiliation ? (
          <Flex className="items-center gap-x-1 text-gray-11">
            <HomeIcon width="16" height="16" />
            <Text size="1">{user.affiliation}</Text>
            <Text size="1" className="ml-[6px]">
              /
            </Text>
          </Flex>
        ) : null}
        <Flex className="items-center gap-x-1 text-gray-11">
          <PersonIcon width="16" height="16" />
          <Text size="1">{user.followers.length}</Text>
        </Flex>
      </Flex>
      <FollowButton user={user} />
    </div>
  );
}