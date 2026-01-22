import { cn } from "@/lib/utils";
import { Children } from "react";

interface FadeInGridProps {
    children: React.ReactNode;
    gridClassName?: string;
}

export default function FadeInGrid({ gridClassName, children }: FadeInGridProps) {
    return (
        <div className={cn('grid md:grid-cols-3 gap-4', gridClassName)}>
            {Children.toArray(children).map((child, idx) => (
                <div
                    key={idx}
                    style={{
                        opacity: 0,
                        animation: `fadeInUp 0.5s forwards`,
                        animationDelay: `${idx * 100}ms`,
                    }}
                >
                    {child}
                </div>
            ))}
        </div>
    );
}
