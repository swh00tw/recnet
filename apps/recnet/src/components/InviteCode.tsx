"use client";

import { Flex } from "@radix-ui/themes";
import { CopyIcon } from "@radix-ui/react-icons";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { toast } from "sonner";

export const CopiableInviteCode = (props: { inviteCode: string }) => {
  const { inviteCode } = props;
  const { copy } = useCopyToClipboard();

  return (
    <Flex
      className="gap-x-2 items-center cursor-pointer group"
      onClick={() => {
        copy(inviteCode).then(() => {
          // toast
          toast.success("Copied to clipboard!");
        });
      }}
    >
      {inviteCode}
      <CopyIcon className="text-gray-8 group-hover:text-gray-10 transition-all ease-in-out" />
    </Flex>
  );
};
