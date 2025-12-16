import { Footer } from "@/components/Footer";
import React from "react";
import s from "./Wrapper.module.css";

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className={s.wrapper}>
      {children}
      <Footer />
    </div>
  );
};

export default Wrapper;
