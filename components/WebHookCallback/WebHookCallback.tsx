"use client";

import styles from "../AdvertiseFlow.module.css";
import { HiSparkles } from "react-icons/hi2";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { useEffect, useState } from "react";
import { FaRegCircleXmark } from "react-icons/fa6";

export const WebHookCallback = ({ type }: { type: "success" | "cancel" }) => {
  const { width, height } = useWindowSize();
  const [windowProperties, setWindowProperties] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    setWindowProperties({ width, height });
  }, []);

  return (
    <div className={styles.page_container}>
      {type === "success" && (
        <div className={styles.confettiContainer}>
          <Confetti
            width={windowProperties.width}
            height={windowProperties.height}
          />
        </div>
      )}

      <div className={styles.successStep}>
        {type === "success" ? (
          <div className={styles.successIcon}>
            <HiSparkles />
          </div>
        ) : (
          <div className={styles.cancelIcon}>
            <FaRegCircleXmark />
          </div>
        )}

        <h2 className={styles.successTitle}>
          {type === "success" ? "Payment Successful!" : "Payment Cancelled"}
        </h2>
        <p className={styles.successDescription}>
          {type === "success"
            ? "Your program is now featured on the leaderboard. Get ready for some serious traffic!"
            : "Your payment was cancelled. No charges were made. You can try again whenever you're ready."}
        </p>
        <button
          onClick={() => (window.location.href = "/")}
          className={styles.primaryButton}
        >
          Go to Leaderboard
        </button>
      </div>
    </div>
  );
};
