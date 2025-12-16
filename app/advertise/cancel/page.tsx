"use client";

import Wrapper from "@/app/layout/Wrapper/Wrapper";
import { WebHookCallback } from "@/components/WebHookCallback/WebHookCallback";

export default function AdvertiseCancelPage() {
  return (
    <Wrapper>
      <WebHookCallback type="cancel" />
    </Wrapper>
  );
}
