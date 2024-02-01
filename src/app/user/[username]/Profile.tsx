"use client";

import { cn } from "@/utils/cn";
import { Button, Flex, Text, Dialog, TextField } from "@radix-ui/themes";
import { Avatar } from "@/components/Avatar";
import { HomeIcon } from "@radix-ui/react-icons";
import { RecNetLink } from "@/components/Link";
import { useAuth } from "@/app/AuthContext";
import { FollowButton } from "@/components/FollowButton";
import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/Skeleton";
import { useState } from "react";

function EditProfileDialog() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  // TODO: implement edit profile
  // use react-hook-form to validate and add submit form api or server action

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>
        <Button className="w-full" variant="surface">
          Edit profile
        </Button>
      </Dialog.Trigger>

      <Dialog.Content style={{ maxWidth: 450 }}>
        <Dialog.Title>Edit profile</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          Make changes to your profile.
        </Dialog.Description>

        <Flex direction="column" gap="3">
          <label>
            <Text as="div" size="2" mb="1" weight="medium">
              Name
            </Text>
            <TextField.Input
              defaultValue={user?.displayName}
              placeholder="Enter your name"
            />
          </label>
          <label>
            <Text as="div" size="2" mb="1" weight="medium">
              User Handle
            </Text>
            <TextField.Input
              defaultValue={user?.username}
              placeholder="Enter user handle"
            />
          </label>
          <label>
            <Text as="div" size="2" mb="1" weight="medium">
              Affiliation
            </Text>
            <TextField.Input
              defaultValue={user?.affiliation}
              placeholder="Enter your affiliation"
            />
          </label>
        </Flex>

        <Flex gap="3" mt="4" justify="end">
          <Dialog.Close>
            <Button variant="soft" color="gray">
              Cancel
            </Button>
          </Dialog.Close>
          <Button
            variant="solid"
            color="blue"
            onClick={() => {
              setOpen(false);
            }}
          >
            Save
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}

export function Profile(props: { username: string }) {
  const router = useRouter();
  const { username } = props;
  const { user, isLoading } = useUser(username, {
    onErrorCallback: () => {
      // redirect to 404 page
      router.replace("/404");
    },
  });
  const { user: me } = useAuth();
  const isMe = !!me && !!user && me.username === user.username;

  if (isLoading) {
    return (
      <div className={cn("flex-col", "gap-y-6", "flex")}>
        <Flex className="items-center p-3 gap-x-6">
          <Flex>
            <Skeleton className="w-[80px] h-[80px] rounded-[999px]" />
          </Flex>
          <Flex className="flex-grow flex-col justify-between h-full">
            <Flex className="p-2 items-center gap-x-4 text-gray-11">
              <Skeleton className="h-fit min-w-[200px]">
                <Text size="6" weight="medium">
                  skeleton placeholder
                </Text>
              </Skeleton>
            </Flex>
            <Flex className="items-center gap-x-[10px] p-1">
              <Skeleton className="h-fit min-w-[300px]">
                <Text size="3" weight="medium">
                  skeleton placeholder
                </Text>
              </Skeleton>
            </Flex>
          </Flex>
        </Flex>
        <Flex className="w-full">
          <Button
            className="w-full p-0 overflow-hidden"
            radius="medium"
            variant="surface"
            disabled
          >
            <Skeleton className="h-full w-full" />
          </Button>
        </Flex>
      </div>
    );
  }

  if (!user) {
    router.replace("/404");
    return null;
  }

  return (
    <div className={cn("flex-col", "gap-y-6", "flex")}>
      <Flex className="items-center p-3 gap-x-6">
        <Flex>
          <Avatar user={user} className={cn("w-[80px]", "h-[80px]")} />
        </Flex>
        <Flex className="flex-grow flex-col justify-between h-full">
          <Flex className="p-2 items-center gap-x-4 text-gray-11">
            <Text size="6" weight="medium">
              {user.displayName}
            </Text>
            <Text size="4">{"@" + user.username}</Text>
          </Flex>
          <Flex className="items-center gap-x-[10px] p-1">
            {user.affiliation ? (
              <Flex className="items-center gap-x-1 text-gray-11">
                <HomeIcon width="16" height="16" />
                <Text size="3">{user.affiliation}</Text>
                <Text size="3" className="ml-[6px]">
                  /
                </Text>
              </Flex>
            ) : null}
            <Flex className="items-center gap-x-1 text-gray-11">
              <Text size="3">{`${user.followers.length} Follower${user.followers.length > 1 ? "s" : ""}`}</Text>
            </Flex>
            {isMe ? (
              <Flex className="items-center gap-x-1 text-gray-11">
                <Text size="3" className="mr-[6px]">
                  /
                </Text>
                <RecNetLink
                  href={`/user/following`}
                  radixLinkProps={{
                    underline: "always",
                  }}
                >
                  <Text size="3">{`${me.following.length} Following${me.following.length > 1 ? "s" : ""}`}</Text>
                </RecNetLink>
              </Flex>
            ) : null}
          </Flex>
        </Flex>
      </Flex>
      <Flex className="w-full">
        {isMe ? <EditProfileDialog /> : <FollowButton user={user} />}
      </Flex>
    </div>
  );
}
