"use client";

import Wrapper from "@/app/layout/Wrapper/Wrapper";
import { WebHookCallback } from "@/components/WebHookCallback/WebHookCallback";

export default function AdvertiseSuccessPage() {
  return (
    <Wrapper>
      <WebHookCallback type="success" />
    </Wrapper>
  );
}
