import * as React from "react";
import { cn } from "@/lib/utils";

interface TimelineProps extends React.HTMLAttributes<HTMLDivElement> {
  position?: "left" | "right" | "alternate";
  children: React.ReactNode;
}

// TimelineComponent型を定義して、Provider属性を追加できるようにする
type TimelineComponent = React.ForwardRefExoticComponent<
  TimelineProps & React.RefAttributes<HTMLDivElement>
> & {
  Provider: React.FC<{
    position: TimelineProps["position"];
    children: React.ReactNode;
  }>;
};

const Timeline = React.forwardRef<HTMLDivElement, TimelineProps>(
  ({ position = "left", className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("relative", className)}
        data-position={position}
        {...props}
      >
        {children}
      </div>
    );
  }
) as TimelineComponent; // TimelineComponentとして型キャスト

Timeline.displayName = "Timeline";

interface TimelineItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const TimelineItem = React.forwardRef<HTMLDivElement, TimelineItemProps>(
  ({ className, children, ...props }, ref) => {
    const position = React.useContext(TimelineContext);
    
    return (
      <div
        ref={ref}
        className={cn(
          "relative flex mb-6 last:mb-0",
          position === "alternate" ? "even:flex-row-reverse" : "",
          position === "left" ? "flex-row" : "",
          position === "right" ? "flex-row-reverse" : "",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TimelineItem.displayName = "TimelineItem";

interface TimelineSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const TimelineSeparator = React.forwardRef<HTMLDivElement, TimelineSeparatorProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex flex-col items-center mx-4", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TimelineSeparator.displayName = "TimelineSeparator";

interface TimelineDotProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "filled" | "outlined";
  color?: "default" | "primary" | "secondary";
  children?: React.ReactNode;
}

const TimelineDot = React.forwardRef<HTMLDivElement, TimelineDotProps>(
  ({ variant = "filled", color = "default", className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center rounded-full w-8 h-8",
          variant === "filled" && color === "default" && "bg-gray-200",
          variant === "filled" && color === "primary" && "bg-blue-500 text-white",
          variant === "filled" && color === "secondary" && "bg-purple-500 text-white",
          variant === "outlined" && color === "default" && "border-2 border-gray-200",
          variant === "outlined" && color === "primary" && "border-2 border-blue-500",
          variant === "outlined" && color === "secondary" && "border-2 border-purple-500",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TimelineDot.displayName = "TimelineDot";

const TimelineConnector = React.forwardRef<
  HTMLDivElement, 
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex-1 w-0.5 bg-gray-200 my-1", className)}
      {...props}
    />
  );
});
TimelineConnector.displayName = "TimelineConnector";

interface TimelineContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const TimelineContent = React.forwardRef<HTMLDivElement, TimelineContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex-1 pt-1", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TimelineContent.displayName = "TimelineContent";

interface TimelineOppositeContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const TimelineOppositeContent = React.forwardRef<HTMLDivElement, TimelineOppositeContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex-1 text-right pt-1 text-sm text-gray-500", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TimelineOppositeContent.displayName = "TimelineOppositeContent";

// Context for Timeline position
const TimelineContext = React.createContext<TimelineProps["position"]>("left");

const TimelineProvider: React.FC<{
  position: TimelineProps["position"];
  children: React.ReactNode;
}> = ({ position, children }) => {
  return (
    <TimelineContext.Provider value={position}>
      {children}
    </TimelineContext.Provider>
  );
};

Timeline.Provider = TimelineProvider;

export {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineDot,
  TimelineConnector,
  TimelineContent,
  TimelineOppositeContent,
};