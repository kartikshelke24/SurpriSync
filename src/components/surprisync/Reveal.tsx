import { useReveal } from "@/hooks/useReveal";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "article";
}

export const Reveal = ({ children, delay = 0, className = "", as = "div" }: Props) => {
  const { ref, shown } = useReveal<HTMLDivElement>();
  const Tag: any = as;
  return (
    <Tag
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
        shown ? "opacity-100 translate-y-0 blur-0" : "opacity-0 translate-y-10 blur-[6px]"
      } ${className}`}
    >
      {children}
    </Tag>
  );
};
