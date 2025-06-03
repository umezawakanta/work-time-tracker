import * as React from 'react';
import { cn } from '@/lib/utils';

interface TimelineProps extends React.HTMLAttributes<HTMLDivElement> {
  position?: 'left' | 'right' | 'alternate';
  children: React.ReactNode;
}

// TimelineComponent型を定義して、Provider属性を追加できるようにする
type TimelineComponent = React.ForwardRefExoticComponent<
  TimelineProps & React.RefAttributes<HTMLDivElement>
> & {
  Provider: React.FC<{
    position: TimelineProps['position'];
    children: React.ReactNode;
  }>;
};

const Timeline = React.forwardRef<HTMLOListElement, React.HTMLAttributes<HTMLOListElement>>(
  ({ className, ...props }, ref) => <ol ref={ref} className={cn('', className)} {...props} />
);
Timeline.displayName = 'Timeline';

interface TimelineItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const TimelineItem = React.forwardRef<HTMLLIElement, React.HTMLAttributes<HTMLLIElement>>(
  ({ className, ...props }, ref) => <li ref={ref} className={cn('', className)} {...props} />
);
TimelineItem.displayName = 'TimelineItem';

interface TimelineSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const TimelineSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('', className)} {...props} />
);
TimelineSeparator.displayName = 'TimelineSeparator';

interface TimelineDotProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'filled' | 'outlined';
  color?: 'default' | 'primary' | 'secondary';
  children?: React.ReactNode;
}

const TimelineDot = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('', className)} {...props} />
);
TimelineDot.displayName = 'TimelineDot';

const TimelineConnector = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('', className)} {...props} />
);
TimelineConnector.displayName = 'TimelineConnector';

interface TimelineContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const TimelineContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('', className)} {...props} />
);
TimelineContent.displayName = 'TimelineContent';

interface TimelineOppositeContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const TimelineOppositeContent = React.forwardRef<HTMLDivElement, TimelineOppositeContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex-1 text-right pt-1 text-sm text-gray-500', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TimelineOppositeContent.displayName = 'TimelineOppositeContent';

// Context for Timeline position
const TimelineContext = React.createContext<TimelineProps['position']>('left');

const TimelineProvider: React.FC<{
  position: TimelineProps['position'];
  children: React.ReactNode;
}> = ({ position, children }) => {
  return <TimelineContext.Provider value={position}>{children}</TimelineContext.Provider>;
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
